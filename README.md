# trade-bot-scratch


Tradebot microservice

Frontend :Nodejs
API gateway (notejs)
Service
-Bot manage : fastapi
-Market : nodejs

//xoa data redis bang cmd
DEL ohlcv_1d:BTC/USDT
redis-cli --scan --pattern 'ohlcv_1d:*' | xargs redis-cli del
// xoa bang by python
await r.delete("ohlcv_1d:BTC/USDT")