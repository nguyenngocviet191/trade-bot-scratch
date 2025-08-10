from ultils.ultils import BarProgress, SpinnerProgress,SpinnerSimpleProgress
from typing import Any
from concurrent.futures import ThreadPoolExecutor, as_completed
import server.services.postgre_service as postgre_service
from server.services.coinmaketcap_service import get_listing_only, fetch_listing_cmc
from server.services import state
import faiss
import numpy as np
import json
import asyncio
import ta
import pandas as pd
import redis as redis_sync
import ccxt as ccxt_sync
import ccxt.async_support as ccxt
import redis.asyncio as redis
# import yaspin
import aiohttp
from concurrent.futures import ThreadPoolExecutor
import os
import sys
import pickle
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

binance = None
gateio = None
mexc = None
binance_symbols = []
gateio_symbols = []
mexc_symbols = []
# dict to improve performance
ohlcv_data_1d = {}
ohlcv_data_4h = {}
r = redis.Redis(host="localhost", port=6379, decode_responses=True)
executor = ThreadPoolExecutor(max_workers=8)


async def fetch_exchange_data(exchange, symbol, tf, length=50, buffer=200):
    ohlcv = await exchange.fetch_ohlcv(symbol, timeframe=tf, limit=length+buffer)
    return ohlcv


def _process_data(ohlcv, symbol, tf):
    df = pd.DataFrame(
        ohlcv, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df.set_index("timestamp", inplace=True)
    # EMA & SMA
    df["ema10"] = df["close"].ewm(span=10, adjust=False).mean()
    df["sma20"] = df["close"].rolling(window=20).mean()
    df["sma50"] = df["close"].rolling(window=50).mean()
    df["sma200"] = df["close"].rolling(window=200).mean()
    # ADX, DI+, DI- dùng thư viện `ta`
    adx = ta.trend.ADXIndicator(
        high=df["high"], low=df["low"], close=df["close"], window=14)
    df["adx"] = adx.adx()
    df["di+"] = adx.adx_pos()
    df["di-"] = adx.adx_neg()
    df["symbol"] = symbol
    df["tf"] = tf
    # Loại bỏ các dòng có giá trị NaN, bat buoc phai loai bo truoc khi json.dump
    df = df.replace(0, np.nan)
    df = df.where(pd.notnull(df), None)  # na=> th None
    return df.reset_index()


def _create_embedding(df, window=30):
    df_norm = df.tail(window).copy()
    cols = ['open', 'high', 'low', 'close', 'volume', 'ema10', 'sma20',
            'sma50', 'sma200', 'adx', 'di+', 'di-', 'symbol', 'tf']
    # Check missing columns
    missing = [col for col in cols if col not in df_norm.columns]
    if missing:
        raise ValueError(f"Thiếu cột: {missing} ")
    global_max = df_norm[['open', 'high', 'low', 'close',
                          'ema10', 'sma20', 'sma50', 'sma200']].max().max()
    global_min = df_norm[['open', 'high', 'low', 'close',
                          'ema10', 'sma20', 'sma50', 'sma200']].min().min()
    for col in ['open', 'high', 'low', 'close', 'ema10', 'sma20', 'sma50', 'sma200']:
        df_norm[col] = (df[col] - global_min)/(global_max -
                                               global_min)  # Chuẩn hóa về khoảng [0, 1]
    df_norm['volume'] = (df['volume'] - df['volume'].min()) / \
        (df['volume'].max() - df['volume'].min())
    df_norm['adx'] = df['adx'] / 100
    df_norm['di+'] = df['di+'] / 100
    df_norm['di-'] = df['di-'] / 100
    df_norm["position"] = np.arange(window) / (window - 1)
    features = [
        'open', 'high', 'low', 'close', 'volume',
        'ema10', 'sma20', 'sma50', 'sma200',
        'adx', 'di+', 'di-', 'position'
    ]
    df_norm = df_norm[features].tail(window)
    return df_norm


def _select_ohlcv_data(tf):
    global ohlcv_data_1d, ohlcv_data_4h
    if tf == "1d":
        ohlcv_data = ohlcv_data_1d
    elif tf == "4h":
        ohlcv_data = ohlcv_data_4h
    else:
        raise ValueError(
            f"Unsupported timeframe: {tf}. Supported timeframes are '1d' and '4h'.")
    return ohlcv_data


def _task_index(tf, symbol, window):
    ohlcv_data = _select_ohlcv_data(tf)
    try:
        df = ohlcv_data[symbol]
        vec = _create_embedding(df, window=window).values.flatten().astype("float32")
    except Exception as e:
        raise ValueError(f"Error index for {symbol} : {e}")
    return {symbol: vec}


async def _index_matrix(tf="1d", window=30):
    ohlcv_data = _select_ohlcv_data(tf)
    ohlcv_symbols= list(ohlcv_data.keys())
    matrix_symbols = []
    vectors = []
    print(f"Init matrix {len(ohlcv_symbols)} symbols")
    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(executor, _task_index, tf, symbol, window)
        for symbol in ohlcv_symbols
    ]
    with SpinnerProgress() as spinner:
        # results = await asyncio.gather(*tasks, return_exceptions=True)
        t = spinner.add_task(description="Indexing OHLCV data...",
                             total=len(tasks), item="Starting...")
        for coro in asyncio.as_completed(tasks):
            try:
                result = await coro
              
                symbol, vec = next(iter(result.items()))
                spinner.update(t, advance=1, item=f"[green]✅ Index: {symbol}")
                matrix_symbols.append(symbol)
                vectors.append(vec)
            except Exception as e:
                spinner.update(t, advance=1, item=f"[red]❌ Error : {str(e)}")

        matrix = np.stack(vectors).astype("float32")
        index = faiss.IndexFlatL2(matrix.shape[1])
        index.add(matrix)
        spinner.update(
            t, description=f"Finish index OHLCV data {len(matrix_symbols)} symbols")
        # spinner.stop_task(t)

    return (index ,matrix_symbols)


def _get_nearest_vector(index , symbols, query_embed, k=10):
    query_vec = np.array(query_embed).flatten().astype("float32")
    D, I = index.search(np.array([query_vec]), k=k)
    return [(symbols[i], D[0][idx]) for idx, i in enumerate(I[0])]


async def get_similar_ohlcv(token, tf="1d", k=10, window=30):
    ohlcv_data = _select_ohlcv_data(tf)
    index, vec_symbols = await _index_matrix(tf=tf, window=window)
    query_symbol = token+"/USDT"
    query_ohlvc = ohlcv_data[query_symbol]
    query_embed = _create_embedding(query_ohlvc, window)
    data_return = _get_nearest_vector(index, vec_symbols, query_embed, k=k)
    return [{"symbol": s, "distance": float(v)} for s, v in data_return] #numpy.float32 → float


async def _task_update(symbol, tf="1d", length=100, buffer=200):
    global binance, gateio, mexc
    global binance_symbols, gateio_symbols, mexc_symbols
    ohlcv = []
    if symbol in binance_symbols:
        exchange = "binance"
        ohlcv = await binance.fetch_ohlcv(symbol, timeframe=tf, limit=length+buffer)
    elif symbol in gateio_symbols:
        exchange = "gateio"
        ohlcv = await gateio.fetch_ohlcv(symbol, timeframe=tf, limit=length+buffer)
    elif symbol in mexc_symbols:
        exchange = "mexc"
        ohlcv = await mexc.fetch_ohlcv(symbol, timeframe=tf, limit=length+buffer)
    else:
        raise ValueError(
            f"Symbol {symbol} not found in Binance, Gate.io, or MEXC.")

    if len(ohlcv) > 1:
        processed_data = _process_data(ohlcv, symbol, tf)
        processed_data["timestamp"] = processed_data["timestamp"].dt.tz_localize(
            "UTC").dt.tz_convert("Asia/Ho_Chi_Minh").dt.strftime("%Y-%m-%d %H:%M %z")  # Add timezone
        return_data = {symbol: processed_data}
    else:

        raise ValueError(f"No OHLCV data found for {symbol} on {exchange}")
    return return_data

async def get_ccxt_ohlcv( symbol,tf,since,limit,buffer=0):

    exchanges = [ ccxt.binance, ccxt.gateio, ccxt.mexc]
    
    for exchange_class in exchanges:
        exchange = exchange_class({'enableRateLimit': True})
        data = await exchange.fetch_ohlcv(symbol, tf, since, limit+buffer)
        await exchange.close()
        if data:
            cols = ['timestamp','open', 'high', 'low', 'close', 'volume']
            data = pd.DataFrame(data,columns=cols)
            # data = _process_data(data, symbol, tf)
            return data
    raise Exception("Failed to fetch OHLCV data from all exchanges.")

async def get_ccxt_ohlcv_batch(tf, symbol):
    ohlcv_data = _select_ohlcv_data(tf)
    return ohlcv_data[symbol]

#reload market for cctx
async def load_market():
    global binance_symbols, gateio_symbols, mexc_symbols
    with SpinnerSimpleProgress() as spinner:
        t = spinner.add_task(description="Load maket data...")
        await gateio.load_markets()
        await binance.load_markets()
        await mexc.load_markets()
        spinner.update(t, description="✅ Load maket data done!")

    # global_progress.stop_task(t)
    binance_symbols = binance.symbols
    gateio_symbols = gateio.symbols
    mexc_symbols = mexc.symbols
    ccxt_market = {
        "binance": binance_symbols,
        "gateio": gateio_symbols,
        "mexc": mexc_symbols
    }
    await r.set("ccxt_market", json.dumps(ccxt_market), ex=60*60*4)

# run when server start or when need to update data
async def fetch_bulk_update(tf="1d", limit=2000, new_create=False):
    global binance_symbols, gateio_symbols, mexc_symbols
    global binance, gateio, mexc
    global ohlcv_data_1d, ohlcv_data_4h
    # ohlcv_data = await r.get("ohlcv_"+tf)
    ohlcv_data= _select_ohlcv_data(tf)
    ohlcv_data_flag = await r.get("ohlcv_data_flag")
    if ohlcv_data_flag == "True" and not new_create:
        if ohlcv_data :
            return ohlcv_data
        # ohlcv_data = postgre_service.read_ohlcv(tf)
        print("Read file data")
        with open("server/data/ohlcv_data_"+tf, "rb") as f:
            ohlcv_data.clear()
            ohlcv_data.update(pickle.load(f))
        return ohlcv_data
    # new fetch data
    cmc_listing_symbol = await r.get("cmc_listing_symbol")

    # print(cmc_listing_symbol)
    if cmc_listing_symbol is None:
        # return cached  # dữ liệu đã được cache
        cmc_listing_symbol = await fetch_listing_cmc()
    else:
        cmc_listing_symbol = json.loads(cmc_listing_symbol) 
    print(f"Fetch {len(cmc_listing_symbol)} symbols from CMC") 
    tokens = cmc_listing_symbol[0:limit]

    binance = ccxt.binance({'enableRateLimit': True})
    gateio = ccxt.gateio({'enableRateLimit': True})
    mexc = ccxt.mexc({'enableRateLimit': True})
    ccxt_market = await r.get("ccxt_market")
    if ccxt_market:
        ccxt_market = json.loads(ccxt_market)
        binance_symbols = ccxt_market["binance"]
        gateio_symbols = ccxt_market["gateio"]
        mexc_symbols = ccxt_market["mexc"]
    else:
        await load_market()

    tasks = [
        _task_update(token+"/USDT", tf=tf)
        for token in tokens
    ]
    # fetch new data
    print("Fetch new data OHLCV")
    postgre_service.delete_ohlcv()
    ohlcv_data.clear()
    with SpinnerProgress() as barprogress:

        t = barprogress.add_task("Fetching OHLCV...", total=len(tasks), item="Starting...")

        for coro in asyncio.as_completed(tasks):

            try:
                result = await coro
                symbol, ohlcv_df = next(iter(result.items()))
                barprogress.update(t, advance=1, item=f"[green]✅ Fetch: {symbol}")
                ohlcv_data[symbol]= ohlcv_df

            except Exception as e:
                barprogress.update(t, advance=1, item=f"[red]❌ Error: {str(e)}")
        barprogress.update(t, description="Complete Fetching OHLCV")

    await binance.close()
    await gateio.close()
    await mexc.close()
    print("Write file data")
    # print(ohlcv_data_1d.keys())
    os.makedirs("server/data", exist_ok=True)
    with open("server/data/ohlcv_data_"+tf, "wb") as f:  # Không có đuôi file
        pickle.dump(ohlcv_data, f)
    await r.set("ohlcv_data_flag", "True", ex=60*60*4)  # cached 4h

    return ohlcv_data
