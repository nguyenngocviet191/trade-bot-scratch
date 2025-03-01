
## Sample API Request for /tickers

### Endpoint
```
POST /tickers
```

### Request Body
```json
{
    "pairs": [
        { "symbol": "BTC", "base": "USDT" },
        { "symbol": "ETH", "base": "USDT" },
        { "symbol": "XRP", "base": "USDT" }
    ]
}
```

### Response
```json
[
    {
        "symbol": "BTC",
        "base": "USDT",
        "timestamp": 1633024800000,
        "open": 43000,
        "high": 44000,
        "low": 42000,
        "close": 43500,
        "volume": 1234.56
    },
    {
        "symbol": "ETH",
        "base": "USDT",
        "timestamp": 1633024800000,
        "open": 3000,
        "high": 3100,
        "low": 2900,
        "close": 3050,
        "volume": 789.01
    },
    {
        "symbol": "XRP",
        "base": "USDT",
        "timestamp": 1633024800000,
        "open": 1,
        "high": 1.1,
        "low": 0.9,
        "close": 1.05,
        "volume": 4567.89
    }
]
```
