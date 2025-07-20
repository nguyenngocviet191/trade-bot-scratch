from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .services.analysis_mt5 import analyze_mt5
from datetime import datetime, timedelta
from fastapi import FastAPI
# from fastapi_cache2 import FastAPICache, RedisBackend
# from fastapi_cache2.decorator import cache
import redis.asyncio as redis
from fastapi.responses import JSONResponse
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


@app.get("/")
def home():
    return {"message": "MT5 Reporting API"}

@app.get("/api/mt5/report")
# @cache(expire=60*5)  
def get_mt5_report(account= "fx_bot2"):
    to_date = datetime.today()
    from_date = to_date - timedelta(days=90)  # Lấy dữ liệu trong 30 ngày qua
    result = analyze_mt5(account_key=account,from_date=from_date,to_date=to_date)
    # return result
    return JSONResponse(content=result)