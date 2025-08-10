import asyncio
import ccxt.async_support as ccxt
import json
import ta
import pandas as pd
from datetime import datetime

async def fetch_data(symbol):
    binance = ccxt.binance({'enableRateLimit': True})
    ohlcv = await binance.fetch_ohlcv(symbol, timeframe='1d', limit=240)
    await binance.close()
    return process_data(symbol, ohlcv)
    # Format timestamp sang dạng ISO string (hoặc giữ nguyên ms nếu muốn)
    # data = [[
    #     datetime.utcfromtimestamp(candle[0] / 1000).isoformat(),  # timestamp
    #     round(candle[1], 2),  # open
    #     round(candle[2], 2),  # high
    #     round(candle[3], 2),  # low
    #     round(candle[4], 2),  # close
    #     round(candle[5], 2),  # volume
    # ] for candle in ohlcv]

    # return {
    #     "symbol": symbol,
    #     "data": data
    # }
def update_ohlcv_with_latest(df: pd.DataFrame, exchange: ccxt.Exchange, symbol: str = "BTC/USDT", timeframe: str = "1d") -> pd.DataFrame:
    """
    Cập nhật thêm 1 cây nến 1 ngày mới (nếu có) vào DataFrame `df`, đảm bảo chỉ giữ lại 250 nến mới nhất.

    Args:
        df (pd.DataFrame): Dữ liệu OHLCV hiện có, cần có cột `timestamp`.
        exchange (ccxt.Exchange): Instance Binance (hoặc sàn khác).
        symbol (str): Cặp giao dịch.
        timeframe (str): Khung thời gian ('1d' mặc định).

    Returns:
        pd.DataFrame: Dữ liệu đã cập nhật, tối đa 250 dòng.
    """
    # Lấy nến mới nhất từ sàn
    latest_candle = exchange.fetch_ohlcv(symbol=symbol, timeframe=timeframe, limit=2)[-1] //o
    latest_ts = latest_candle[0]

    # Nếu timestamp chưa có trong df thì thêm vào
    if latest_ts not in df["timestamp"].values:
        new_row = {
            "timestamp": latest_ts,
            "open": latest_candle[1],
            "high": latest_candle[2],
            "low": latest_candle[3],
            "close": latest_candle[4],
            "volume": latest_candle[5]
        }
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

    # Chỉ giữ lại 250 dòng mới nhất
    df = df.sort_values("timestamp").iloc[-250:].reset_index(drop=True)
    return df
    
def process_data(symbol, raw_data):
    df = pd.DataFrame(raw_data, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df.set_index("timestamp", inplace=True)

    # EMA & SMA
    df["EMA10"] = df["close"].ewm(span=10, adjust=False).mean()
    df["SMA20"] = df["close"].rolling(window=20).mean()
    df["SMA50"] = df["close"].rolling(window=50).mean()
    df["SMA200"] = df["close"].rolling(window=200).mean()

    # ADX, DI+, DI- dùng thư viện `ta`
    adx = ta.trend.ADXIndicator(high=df["high"], low=df["low"], close=df["close"], window=14)
    df["ADX"] = adx.adx()
    df["DI+"] = adx.adx_pos()
    df["DI-"] = adx.adx_neg()

    df["symbol"] = symbol
    return df.reset_index()


async def main():
    # symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT']
    symbols = ['BTC/USDT']
    tasks = [fetch_data(symbol) for symbol in symbols]
    results = await asyncio.gather(*tasks)



     # Gộp tất cả vào 1 DataFrame
    df_all = pd.concat(results)
    print(df_all)

    # # Save to JSON file
    # with open("ohlcv_data.json", "w") as f:
    #     json.dump(results, f, indent=2) # indent

    # # In ra 1 phần để kiểm tra
    # print(json.dumps(results[0], indent=2)[:500])

asyncio.run(main())