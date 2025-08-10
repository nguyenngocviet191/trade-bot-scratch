import websocket
import uuid
import json


def on_open(ws):
    print("Connection opened")
    request = {
        "method": "SUBSCRIBE",
        "params": [
            "btcusdt@miniTicker"
            # "!miniTicker@arr"
        ],
        "id": 1
    }
    ws.send(json.dumps(request))
def on_message(ws,message):
    m = json.loads(message)
    data_return={
        "timestamp": m["E"],
        "open":  float(m["o"]) , # open price is calculated from last price and change percentage
        "high":float(m["h"]), 
        "low" : float(m["l"]),
        "close": float(m["c"]),
        "volume": float(m["v"]),
    }   

    print(data_return)


client = websocket.WebSocketApp(

    "wss://stream.binance.com:9443/ws",

    on_open=on_open,

    on_close=lambda ws, code, msg: print("Connection closed"),

    on_error=lambda ws, error: print(f"Error: {error}"),

    on_message= on_message

)

client.run_forever()
client.close()

"""
channel :"btcusdt@miniTicker"
message : {"e":"24hrMiniTicker","E":1754676198909,"s":"BTCUSDT","c":"116762.00000000","o":"116761.90000000","h":"117666.60000000","l":"115906.80000000","v":"8059.28847600","q":"942042493.48574940"}
"""