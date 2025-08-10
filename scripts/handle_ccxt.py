import sys
import os
import time
import pandas as pd
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import server.services.ccxt_service  as ccxt_service
from server.services.ccxt_service import  _index_matrix,_get_nearest_vector,_create_embedding ,fetch_bulk_update
from server.services.coinmaketcap_service import   *  

from server.services import state
import asyncio
import redis.asyncio as redis
import json
r = redis.Redis(host="localhost", port=6379, decode_responses=True)
# t1 = time.time()
# # asyncio.run(fetch_listing_cmc())
# asyncio.run(bulk_update())
# t2 = time.time()
# # print (state.cmc_list  )
# # cmc_listing_symbol = asyncio.run(r.get("cmc_listing_symbol"))
# # print(cmc_listing_symbol)  
# # ohlcv_1d = asyncio.run(r.get("ohlcv_1d"))
# # # print(len(ohlcv_1d))
# # print(ohlcv_1d)
# # print(cmc_listing_symbol)  
# print("Done bulk update in {} seconds".format(t2-t1))
async def init():
    await fetch_bulk_update("1d",2000,True)
async def main():
    
    t1 = time.time()
    # data= asyncio.run(fetch_bulk_update("1d",2000,True))
    symbols =[]
    query_symbol = "BTC/USDT"
    tf="1d"
    window =30
    await fetch_bulk_update("1d",2000,True)
    ohlcv_data = ccxt_service.ohlcv_data_1d
    query_df =ohlcv_data[query_symbol]
   
    query_vec = _create_embedding(query_df,window).values.flatten().astype("float32")
    # print(query_vec
    index ,symbols = await _index_matrix(tf,window)

    nearest_vectors =_get_nearest_vector(index,symbols,query_vec, k=10)
    print("Nearest vectors :", nearest_vectors)
    t2 = time.time()
    print("Done bulk update in {} seconds".format(t2-t1))

# asyncio.run(init())
asyncio.run(main())
# flat_list = [item for sublist in data for item in sublist]
# df = pd.DataFrame(flat_list)
# data2 = asyncio.run(fetch_bulk_update("4h",100,True))
# print(df.tail(10))  # Print first 10 items for brevity