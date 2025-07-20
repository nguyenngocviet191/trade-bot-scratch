from zoneinfo import ZoneInfo
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .services.analysis_mt5 import analyze_mt5
from datetime import datetime, timedelta
# from fastapi_cache2 import FastAPICache, RedisBackend
# from fastapi_cache2.decorator import cache
import redis.asyncio as redis
import json
from typing import Dict
from collections import deque
from datetime import datetime
r = redis.Redis(host="localhost", port=6379)
app = FastAPI()

# Cho phép gọi từ frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # hoặc ["http://localhost:5173"]
    # allow_origins=["*"],
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
                #bot_trade(i, trade_action, entry, tp, sl, reason)
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
