import redis
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# r.delete("ohlcv_1d")
r.delete("ohlcv_1d", "ohlcv_4h")

# for key in r.scan_iter("user:*"):
#     r.delete(key)

# # check truowsc khi xóa
# if r.exists("my_key"):
#     r.delete("my_key")    

# # dell all
# r.flushdb()   # Xóa DB hiện tại
# r.flushall()  # Xóa tất cả DBs    