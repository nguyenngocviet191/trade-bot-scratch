

from time import time

import ccxt as ccxt1
import ccxt.async_support as ccxt2
import asyncio
import sys
import os
# Add the parent directory of 'ultils' to sys.path
# sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ultils.ultils import timed
from contextlib import contextmanager
# timed(fetch_data("BCT/USDT"))  #


@contextmanager
def timer(name=""):
    start = time()
    yield
    end = time()
    print(f"{name} - Thời gian thực thi: {end - start:.4f} giây")


def fetch_data(symbol):
    binance = ccxt1.binance({'enableRateLimit': True})
    data = binance.fetch_ohlcv(symbol, timeframe='1d', limit=250)
    return data


async def fetch_data2(symbol):
    binance = ccxt2.binance({'enableRateLimit': True})
    ohlcv = await binance.fetch_ohlcv(symbol, timeframe='1d', limit=250)
    await binance.close()
    return ohlcv

with timer("fetch data"):
    data1 = fetch_data("BTC/USDT")
    data1 = fetch_data("ETH/USDT")
    data1 = fetch_data("BNB/USDT")
    # print(data1)


async def main():
    with timer("fetch data 2"):
        symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT']
        tasks = [fetch_data(symbol) for symbol in symbols]
        results = await asyncio.gather(*tasks)
    # print(data2)  # fetch_data("ETH/USDT")

asyncio.run(main())
