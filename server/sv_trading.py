
from server.services.ccxt_service import get_ccxt_ohlcv, fetch_bulk_update, get_similar_ohlcv
import uvicorn
from server.services.analysis_mt5 import analyze_mt5
import server.services.ccxt_service as ccxt_service
from server.services.coinmaketcap_service import fetch_quote_cmc, fetch_listing_cmc
from datetime import datetime
from collections import deque
from typing import Dict
import json
import redis.asyncio as redis
import aiohttp
from datetime import datetime, timedelta

from zoneinfo import ZoneInfo
from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
import os
# Add the project root to the Python path
path = sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')))
# from fastapi_cache2 import FastAPICache, RedisBackend
# from fastapi_cache2.decorator import cache
r = redis.Redis(host="localhost", port=6379)
app = FastAPI()

# Cho phép gọi từ frontend local
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173"],  # hoặc ["http://localhost:5173"]
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# from contextlib import asynccontextmanager

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     r = redis.Redis(host="localhost", port=6379, db=0)
#     FastAPICache.init(RedisBackend(r), prefix="fastapi-cache")
#     yield  # Lifespan context
#     # Add any cleanup logic here if needed

# app = FastAPI(lifespan=lifespan)

# # Channel → Handler mapping
# channel_handlers: Dict[str, callable] = {
#     "abc": abc_handler.handle_action,
#     "xyz": xyz_handler.handle_action,
# }

# # Optional: expose history for debugging/demo
# message_getters: Dict[str, callable] = {
#     "abc": abc_handler.get_messages,
#     "xyz": xyz_handler.get_messages,
# }
# message_queues: Dict[str, deque] = {}
message_queues: str = []
MAX_MESSAGES = 20
# TODO  create function register bot to channel,when hook listener receive message, it will try to trade


@app.on_event("startup")
async def startup_event():

    await init_app()


async def init_app():
    # Ví dụ: mở kết nối DB, nạp cấu hình, load model, v.v.
    while not ccxt_service.ohlcv_data_1d:
        await fetch_bulk_update("1d", limit=2000, new_create=False)
    print("✅ Server ready")


@app.get("/")
def home():
    return {"message": "MT5 Reporting API"}


@app.get("/api/mt5/report")
# @cache(expire=60*5)
def get_mt5_report(account="fx_bot2"):
    to_date = datetime.today()
    from_date = to_date - timedelta(days=90)  # Lấy dữ liệu trong 30 ngày qua
    result = analyze_mt5(account_key=account,
                         from_date=from_date, to_date=to_date)
    # return result
    return JSONResponse(content=result)


@app.get("/api/cmc_listing")
async def get_cmc_listing():
    data = await fetch_listing_cmc()
    # print(data)
    # return json.loads(data)
    return data


@app.get("/api/cmc_quote")
async def get_cmc_quote():
    data = await fetch_quote_cmc()
    # print(data)
    # return json.loads(data)
    return data


@app.get("/api/fetch_similar_ohlcv/{token}")
async def fetch_similar_ohlcv(token):
    tf = "1d"
    window = 30
    k = 10
    result = await get_similar_ohlcv(token, tf=tf, k=k, window=window)

    return result


@app.post("/api/ccxt_ohlcv")
async def fetch_ccxt_ohlcv(request: Request):
    data = await request.json()
    symbol = data.get("symbol")
    tf = data.get("tf")
    since = data.get("since")
    limit = data.get("limit")  # Mặc định lấy 1000 nến nếu không có limit
    data = await get_ccxt_ohlcv(symbol=symbol, tf=tf, since=since, limit=limit, buffer=0)
    return json.loads(data.to_json(orient="records"))

EXCHANGE_WS = "wss://stream.binance.com:9443/ws"


async def binance_stream(websocket: WebSocket, symbol: str):
    """Kết nối tới Binance và forward data tới client"""
    async with aiohttp.ClientSession() as session:
        async with session.ws_connect(EXCHANGE_WS,heartbeat=30) as ws:
            # Subscribe miniTicker
            request = {
                "method": "SUBSCRIBE",
                "params": [
                    f"{symbol}@miniTicker"
                    # "!miniTicker@arr"
                ],
                "id": 1
            }
            await ws.send_str(json.dumps(request))
            print(f"Subscribed to {symbol} miniTicker ")

            async for msg in ws:
                # print ("received message from Binance:", msg)
                if msg.type == aiohttp.WSMsgType.TEXT:
                    data = json.loads(msg.data)
                    print(f"Received data for {symbol}: {data}")
                    if data.get("E") :
                        data_return = {
                            "timestamp": data["E"],
                            # open price is calculated from last price and change percentage
                            "open":  float(data["o"]),
                            "high": float(data["h"]),
                            "low": float(data["l"]),
                            "close": float(data["c"]),
                            "volume": float(data["v"]),
                        }
                        await websocket.send_json(data_return)
                        
                elif msg.type == aiohttp.WSMsgType.ERROR:
                    break


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Đọc message đầu tiên từ client (giả sử client gửi JSON {"symbol": "BTCUSDT"})
        init_msg = await websocket.receive_text()
        init_data = json.loads(init_msg)
        symbol = init_data.get("symbol").lower()
        if not symbol:
            await websocket.send_text("Error: 'symbol' is required in initial message")
            await websocket.close()
            return

        # Gọi hàm stream với symbol lấy được
        await binance_stream(websocket, symbol)

    except Exception as e:
        print(f"Error: {e}")

    finally:
        await websocket.close()

# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     while True:
#         try:
#             message = await websocket.receive_text()
#             if message == "get_listing":
#                 data = await fetch_listing_cmc()
#                 # data = await fetch_quote_cmc()
#                 await websocket.send_text(data)
#         except Exception as e:
#             await websocket.close()
#             break


@app.post("/bots/register")
async def bots_register(request: Request):
    try:
        data = await request.json()
        channel = data.get("channel")
        bot_id = data.get("bot_id")

        if not channel or not bot_id:
            return JSONResponse(status_code=400, content={"error": "Missing channel or bot_id"})
        # Tạo tập hợp bots nếu chưa có
        await r.sadd(f"bots:{channel}", bot_id)
        return JSONResponse(content={"message": "Bot registered successfully", "channel": channel, "bot_id": bot_id})
    except json.JSONDecodeError:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON"})


@app.post("/hook")
async def webhook_listener(request: Request):
    try:
        data = await request.json()

        channel = data.get("channel")
        if not channel:
            return JSONResponse(status_code=400, content={"error": "Missing channel"})
        # Gắn thêm thời điểm nhận message (UTC)
        data["received_at"] = datetime.utcnow().isoformat() + "Z"

        # Tạo hàng đợi nếu chưa có
        if channel not in message_queues:
            message_queues.append(channel)
        #     message_queues[channel] = deque(maxlen=MAX_MESSAGES)

        # # Lưu message vào queue của channel tương ứng
        # message_queues[channel].append(data)
        # Lưu message tron redis
        await r.lpush(f"messages:{channel}", json.dumps(data))
        # Giữ tối đa 20 message
        await r.ltrim(f"messages:{channel}", 0, MAX_MESSAGES-1)
        # Xử lý chung cho mọi channel
        action = data.get("action", "unknown")
        # TODO call registered bot to trade
        errors = []
        registered_bots = await r.smembers(f"bots:{channel}")
        for i in registered_bots:
            try:
                # bot_trade(i, trade_action, entry, tp, sl, reason)
                pass
            except Exception as e:
                errors.append(f"Bot {i}: {str(e)}")
            # pass
        #
        return {
            "channel": channel,
            "action": action,
            "received_at": data["received_at"],
            # "messages_in_channel": len(message_queues[channel])
        }

    except json.JSONDecodeError:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON"})


@app.get("/hook/{channel}")
async def get_messages(channel: str):
    # if channel not in message_queues:
    #     return JSONResponse(status_code=404, content={"error": f"No messages for channel '{channel}'"})

    messages = await r.lrange(f"messages:{channel}", 0, -1)
    parsed = []

    for m in messages:
        msg = json.loads(m)
        # Sửa lỗi 'Z' → '+00:00' để parse
        iso_str = msg["received_at"].replace("Z", "+00:00")
        # Parse ISO time, gắn timezone nếu chưa có
        dt = datetime.fromisoformat(iso_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=ZoneInfo("UTC"))

        # Convert sang Asia/Ho_Chi_Minh
        local_dt = dt.astimezone(ZoneInfo("Asia/Ho_Chi_Minh"))

        # Format lại string
        formatted = local_dt.strftime("%d/%m/%Y %H:%M:%S GMT%z")
        # Chèn dấu ":" vào GMT+0700 → GMT+07:00
        formatted = formatted[:-2] + ":" + formatted[-2:]

        msg["received_at"] = formatted
        parsed.append(msg)

    # return {"channel": channel, "messages": parsed}
    return parsed


@app.get("/hook")
async def get_channel_summary():
    # Lấy danh sách key Redis có dạng "messages:*"
    keys = await r.keys("messages:*")

    result = []

    for key in keys:
        channel = key.decode().split("messages:")[1]

        # Lấy danh sách message trong channel
        messages = await r.lrange(key, 0, -1)
        count = len(messages)

        if count == 0:
            latest_message = None
        else:
            last_msg = json.loads(messages[0])  # 0 là mới nhất do dùng LPUSH

            # Chuyển thời gian UTC → Asia/Ho_Chi_Minh
            iso_str = last_msg["received_at"].replace("Z", "+00:00")
            dt = datetime.fromisoformat(iso_str)
            local_dt = dt.astimezone(ZoneInfo("Asia/Ho_Chi_Minh"))

            # Format dạng "20/07/2025 19:32:12 GMT+07:00"
            formatted = local_dt.strftime("%d/%m/%Y %H:%M:%S GMT%z")
            formatted = formatted[:-2] + ":" + formatted[-2:]

            latest_message = {
                "action": last_msg.get("action"),
                "received_at": formatted
            }

        result.append({
            "channel": channel,
            "message_count": count,
            "latest_message": latest_message
        })

    return {"channels": result}
if __name__ == "__main__":
    uvicorn.run("server.sv_trading:app",
                host="0.0.0.0", port=8080, reload=True)

    # uvicorn server.sv_trading:app --host 0.0.0.0 --port 8000 --reload
