import ccxt
binance_t = ccxt.binance()
binance_t.set_sandbox_mode(True)
t = binance_t.fetch_ticker(symbol="BTCUSDT")
print (t)