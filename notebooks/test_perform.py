import time
import random
import pandas as pd
symbol_list =2000
record_num =270000
symbols = [f"symbol_{i}" for i in range(symbol_list)]  # Simulating 2000 symbols

# Create a DataFrame with 270,000 random records
data = {
    "symbol": [random.choice(symbols) for _ in range(record_num)],
    "tf": [random.choice(["1d", "1h", "5m"]) for _ in range(record_num)],
    "value": [random.random() for _ in range(record_num)],
}
df = pd.DataFrame(data)
print("FInish init dataframe with {} records".format(len(df)))
def filter_dataframe(symbol):
    return df[(df["symbol"] == symbol) & (df["tf"] == "1d")]

json_list = [{"symbol": sym, "ohlcv": df[df["symbol"] == sym]} for sym in symbols]

def filter_json(symbol):
    for item in json_list:
        if item["symbol"] == symbol:
            return item["ohlcv"]

dict_data = {sym: df[df["symbol"] == sym] for sym in symbols}
dict_data.add()

def filter_dict(symbol):
    return dict_data[symbol]
print("FInish processed data {} records".format(len(df)))
# # 1. DataFrame gốc
# start = time.time()
# for s in symbols:
#     _ = filter_dataframe(s)
# print("DataFrame filter time:", time.time() - start)

# 2. JSON list
print("Start filtering JSON list...")
start = time.time()
for s in symbols:
    _ = filter_json(s)
print("JSON list filter time:", time.time() - start)

# 3. Dict
print("Start filtering Dict...")
start = time.time()
for s in symbols:
    _ = filter_dict(s)
print("Dict filter time:", time.time() - start)