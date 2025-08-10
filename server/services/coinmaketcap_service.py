import aiohttp
import asyncio
import os
import json
import redis.asyncio as redis
import sys
from server.services import state
r = redis.Redis(host="localhost", port=6379, decode_responses=True)
import dotenv
dotenv.load_dotenv()  # load .env file if exists
COINMARKETCAP_API_KEY = os.getenv("CMC_API_KEY")  # bạn set bằng dotenv hoặc export
# print("CMC_API_KEY:", COINMARKETCAP_API_KEY)
API_QUOTE_URL = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest"
API_LISTING_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"
# redis va socket chi gui dang text

async def get_listing_only(type):
    if type == "symbol":
        cached = await r.get("cmc_listing_symbol")
        if cached:
            return  json.loads(cached)  # dữ liệu đã được cache
        await fetch_listing_cmc()
        global listing_symbol
        return listing_symbol
    else:
        cached = await r.get("cmc_listing_id")
        if cached:
            return  json.loads(cached)          
        await fetch_listing_cmc()
        global listing_id
        return listing_id

    return None
async def fetch_listing_cmc():
    cached = await r.get("cmc_listing")
    if cached:
        return cached  # dữ liệu đã được cache

    headers = {
        'Accepts': 'application/json',
        "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
    }
    params = {
        "start" : 1,  # Lấy dữ liệu của các đồng phổ biến
        "limit": 2000,  # Giới hạn số lượng đồng tiền lấy về
        # "symbol": "BTC,ETH,BNB,XRP,ADA,DOGE,SOL,TRX,SHIB,MATIC",  # Chỉ lấy một số đồng phổ biến
        # "limit": "10",
        "convert": "USD",
        "sort": "market_cap",  # Sắp xếp theo vốn hóa thị trường
    }
    async with aiohttp.ClientSession() as session:
        async with session.get(API_LISTING_URL, headers=headers, params=params) as resp:
            if resp.status != 200:
                return {"error": f"CMC error {resp.status}"}
            data = await resp.text()
            # lay danh sach id cua cac dong tien
            # Extract listing IDs from the data if needed
            data_json = json.loads(data)
            listing_id = [item["id"] for item in data_json["data"]]
            listing_symbol = [item["symbol"] for item in data_json["data"]]
            # Perform operations with extracted_listing_ids if necessary
            state.cmc_list = listing_symbol # Lưu vào state để sử dụng sau này
            await r.set("cmc_listing", data, ex=60*60) 
            await r.set("cmc_listing_symbol", json.dumps(listing_symbol), ex=60*60*4) 
            await r.set("cmc_listing_id", json.dumps(listing_id), ex=60*60*4)  # cache trong 60s
            return json.loads(data)
async def fetch_quote_cmc():
    global listing_id
    if  listing_id == []:
        await fetch_listing_cmc()
    cached = await r.get("cmc_quote")
    if cached:
        return cached  # dữ liệu đã được cache

    headers = {
         'Accepts': 'application/json',
        "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
    }
    params = {
        "id" :  ",".join(str(i) for i in listing_id[0:200]),  # Lấy dữ liệu của các đồng phổ biến
        #! max 200 id trong 1 lần gọi API
        # "symbol": "BTC,ETH,BNB,XRP,ADA,DOGE,SOL,TRX,SHIB,MATIC",  # Chỉ lấy một số đồng phổ biến
        # "limit": "10",
        # "convert": "USD"
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(API_QUOTE_URL, headers=headers, params=params) as resp:
            if resp.status != 200:
                return {"error": f"CMC error {resp.status}"}
            data = await resp.text()
           
            await r.set("cmc_quote", data, ex=60)  # cache trong 60s
            return json.loads(data)
        
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
if __name__ == "__main__":
        
    list_symbol=    asyncio.run(get_listing_only("id"))
    print (list_symbol)