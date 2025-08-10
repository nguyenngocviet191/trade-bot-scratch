import websocket
import uuid
import json
import time

def on_open(ws):
    print("Connection opened")
    current_time = int(time.time())
    request = {
        "time": current_time,
        "event": "subscribe",
        "channel": "spot.tickers",
        "payload": [
          "BTC_USDT"
        ],
        # "id": str(uuid.uuid4())  gateio does not require an id field
     
    }
    ws.send(json.dumps(request))
def on_message(ws,message):
# Log the received message
    m = json.loads(message)
    data_return={
        "timestamp": m["time_ms"],
        "open":  float(m["result"]["last"]) / float(m["result"]["change_percentage"]), # open price is calculated from last price and change percentage
        "high":float(m["result"]["high_24h"]), 
        "low" : float(m["result"]["low_24h"]),
        "close": float(m["result"]["last"]),
        "volume": float(m["result"]["base_volume"]),
    }   

    print(data_return)

client = websocket.WebSocketApp(

    "wss://api.gateio.ws/ws/v4/",

    on_open=on_open,

    on_close=lambda ws, code, msg: print("Connection closed"),

    on_error=lambda ws, error: print(f"Error: {error}"),

    on_message=on_message

)

client.run_forever()
client.close()

"""
channel :"spot.tickers"
message : {"time":1754676198,"time_ms":1754676198909,"channel":"spot.tickers","event":"update","result":{"currency_pair":"BTC_USDT","last":"116762","lowest_ask":"116762","highest_bid":"116761.9","change_percentage":"0.2899","base_volume":"8059.288476","quote_volume":"942042493.4857494","high_24h":"117666.6","low_24h":"115906.8"}}
"""