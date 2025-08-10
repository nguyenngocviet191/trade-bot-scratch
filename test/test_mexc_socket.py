import websocket
import uuid
import json
import mexc_mini_ticker_pb2

def decode_mini_ticker(binary_data):
    msg = mexc_mini_ticker_pb2.PublicMiniTickerV3Api()
    msg.ParseFromString(binary_data)
    return {
        "symbol": msg.symbol,
        "price": msg.price,
        "rate": msg.rate,
        "zonedRate": msg.zonedRate,
        "high": msg.high,
        "low": msg.low,
        "volume": msg.volume,
        "quantity": msg.quantity,
        "lastCloseRate": msg.lastCloseRate,
        "lastCloseZonedRate": msg.lastCloseZonedRate,
        "lastCloseHigh": msg.lastCloseHigh,
        "lastCloseLow": msg.lastCloseLow,
    }

def on_open(ws):
    print("Connection opened")
    request = {
        "method": "SUBSCRIPTION",
        "params": [
            "spot@public.miniTicker.v3.api.pb@BTCUSDT"
            # "spot@public.kline.v3.api.pb@BTCUSDT@Min15"
            # "spot@public.aggre.deals.v3.api.pb@100ms@BTCUSDT"  
      ],
        "id": 1,

    }
    ws.send(json.dumps(request))

client = websocket.WebSocketApp(
    # "wss://wbs.mexc.com/ws",
    "wss://wbs-api.mexc.com/ws",
    on_open=on_open,

    on_close=lambda ws, code, msg: print("Connection closed"),

    on_error=lambda ws, error: print(f"Error: {error}"),

    # on_message=on_message
    on_message=lambda ws, message: print( decode_mini_ticker(message)),

)

client.run_forever()
client.close()

"""
channel :"sub.ticker"
message : {"symbol":"BTC_USDT","data":{"symbol":"BTC_USDT","lastPrice":116744.5,"riseFallRate":0.0050,"fairPrice":116756.3,"indexPrice":116802.5,"volume24":334936305,"amount24":3911566311.58808,"maxBidPrice":128482.7,"minAskPrice":105122.2,"lower24Price":115852,"high24Price":117590.1,"timestamp":1754676870465,"bid1":116744.4,"ask1":116744.5,"holdVol":82912997,"riseFallValue":582.4,"fundingRate":0.000094,"zone":"UTC+8","riseFallRates":[0.0050,0.0124,0.0708,0.1323,0.2105,0.9657],"riseFallRatesOfTimezone":[0.0025,-0.0057,0.0050]},"channel":"push.ticker","ts":1754676870465}}
"""