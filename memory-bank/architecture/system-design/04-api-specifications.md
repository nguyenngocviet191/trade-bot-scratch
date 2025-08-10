# API Specifications - Trade Bot Scratch

## 🌐 API Overview

Hệ thống Trade Bot Scratch sử dụng RESTful APIs với JSON format, following OpenAPI 3.0 specification.

## 🔗 Base URLs

```
Development:  http://localhost:5000/api/v1
Staging:      https://staging-api.tradebot.com/api/v1
Production:   https://api.tradebot.com/api/v1
```

## 🔐 Authentication

### JWT Authentication
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### API Response Format
```json
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": object
  },
  "meta": {
    "timestamp": "2025-01-08T10:00:00Z",
    "version": "1.0",
    "request_id": "uuid"
  }
}
```

## 👤 User Service APIs

### Authentication Endpoints

#### POST /auth/register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2025-01-08T10:00:00Z"
    },
    "token": "jwt_token_here",
    "expires_at": "2025-01-08T22:00:00Z"
  }
}
```

#### POST /auth/login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### POST /auth/refresh
```http
POST /api/v1/auth/refresh
Authorization: Bearer <refresh_token>
```

#### POST /auth/logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <jwt_token>
```

### User Management

#### GET /users/profile
```http
GET /api/v1/users/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "default_exchange": "binance"
    },
    "trading_limits": {
      "max_position_size": 10000,
      "max_daily_trades": 100
    }
  }
}
```

#### PUT /users/profile
```http
PUT /api/v1/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

#### POST /users/api-keys
```http
POST /api/v1/users/api-keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "exchange": "binance",
  "api_key": "your_api_key",
  "secret": "your_secret",
  "passphrase": "your_passphrase",
  "is_testnet": true
}
```

## 📊 Market Service APIs

### Market Data Endpoints

#### GET /market/tickers
```http
GET /api/v1/market/tickers?exchange=binance&symbols=BTC/USDT,ETH/USDT
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "BTC",
      "base": "USDT",
      "exchange": "binance",
      "price": 45000.00,
      "bid": 44995.00,
      "ask": 45005.00,
      "volume_24h": 1234567.89,
      "change_24h": 1250.00,
      "change_percent_24h": 2.85,
      "high_24h": 45500.00,
      "low_24h": 43500.00,
      "timestamp": "2025-01-08T10:00:00Z"
    }
  ]
}
```

#### GET /market/ohlcv
```http
GET /api/v1/market/ohlcv?symbol=BTC&base=USDT&exchange=binance&timeframe=1h&limit=100
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-01-08T10:00:00Z",
      "open": 44800.00,
      "high": 45200.00,
      "low": 44600.00,
      "close": 45000.00,
      "volume": 125.45
    }
  ],
  "meta": {
    "symbol": "BTC/USDT",
    "timeframe": "1h",
    "count": 100
  }
}
```

#### GET /market/orderbook
```http
GET /api/v1/market/orderbook?symbol=BTC&base=USDT&exchange=binance&limit=50
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTC/USDT",
    "bids": [
      [44995.00, 0.5],
      [44990.00, 1.2]
    ],
    "asks": [
      [45005.00, 0.8],
      [45010.00, 1.5]
    ],
    "timestamp": "2025-01-08T10:00:00Z"
  }
}
```

### WebSocket Market Data

#### Connect to Market Stream
```javascript
const ws = new WebSocket('ws://localhost:5000/ws/market');

// Subscribe to ticker updates
ws.send(JSON.stringify({
  action: 'subscribe',
  channel: 'tickers',
  symbols: ['BTC/USDT', 'ETH/USDT']
}));

// Receive real-time updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle ticker update
};
```

**WebSocket Message Format:**
```json
{
  "channel": "tickers",
  "event": "update",
  "data": {
    "symbol": "BTC/USDT",
    "price": 45000.00,
    "volume": 1234.56,
    "timestamp": "2025-01-08T10:00:00Z"
  }
}
```

## 🤖 Trading Engine APIs

### Strategy Management

#### GET /trading/strategies
```http
GET /api/v1/trading/strategies
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "SMA Crossover",
      "description": "Simple Moving Average crossover strategy",
      "strategy_type": "SMA_CROSS",
      "parameters": {
        "fast_period": 10,
        "slow_period": 20,
        "stop_loss": 2.0,
        "take_profit": 4.0
      },
      "is_active": true,
      "is_backtested": true,
      "backtest_results": {
        "win_rate": 65.5,
        "total_return": 25.3,
        "max_drawdown": 8.2
      },
      "created_at": "2025-01-08T10:00:00Z"
    }
  ]
}
```

#### POST /trading/strategies
```http
POST /api/v1/trading/strategies
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "RSI Oversold",
  "description": "Buy when RSI is oversold",
  "strategy_type": "RSI_OVERSOLD",
  "parameters": {
    "rsi_period": 14,
    "oversold_level": 30,
    "stop_loss": 3.0,
    "take_profit": 6.0
  },
  "risk_settings": {
    "max_position_size": 1000,
    "max_drawdown": 10
  }
}
```

#### PUT /trading/strategies/{strategy_id}
```http
PUT /api/v1/trading/strategies/uuid
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "parameters": {
    "rsi_period": 21,
    "oversold_level": 25
  },
  "is_active": true
}
```

### Bot Management

#### GET /trading/bots
```http
GET /api/v1/trading/bots?status=running
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "BTC Scalper",
      "strategy_id": "uuid",
      "symbol": "BTC",
      "base": "USDT",
      "exchange": "binance",
      "is_running": true,
      "capital_allocated": 10000.00,
      "current_capital": 10250.00,
      "unrealized_pnl": 125.50,
      "realized_pnl": 250.00,
      "total_trades": 45,
      "winning_trades": 28,
      "win_rate": 62.2,
      "started_at": "2025-01-08T08:00:00Z",
      "created_at": "2025-01-08T07:30:00Z"
    }
  ]
}
```

#### POST /trading/bots
```http
POST /api/v1/trading/bots
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "ETH Trend Follower",
  "strategy_id": "uuid",
  "symbol": "ETH",
  "base": "USDT",
  "exchange": "binance",
  "capital_allocated": 5000.00,
  "max_drawdown_percent": 15.0,
  "position_size_percent": 80.0
}
```

#### POST /trading/bots/{bot_id}/start
```http
POST /api/v1/trading/bots/uuid/start
Authorization: Bearer <jwt_token>
```

#### POST /trading/bots/{bot_id}/stop
```http
POST /api/v1/trading/bots/uuid/stop
Authorization: Bearer <jwt_token>
```

### Trade Execution

#### GET /trading/trades
```http
GET /api/v1/trading/trades?symbol=BTC&limit=50&cursor=2025-01-08T10:00:00Z
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "bot_id": "uuid",
      "symbol": "BTC",
      "base": "USDT",
      "exchange": "binance",
      "side": "BUY",
      "order_type": "MARKET",
      "price": 45000.00,
      "quantity": 0.1,
      "filled_quantity": 0.1,
      "fee": 4.50,
      "fee_currency": "USDT",
      "status": "FILLED",
      "pnl": 125.50,
      "pnl_percent": 2.85,
      "executed_at": "2025-01-08T10:00:00Z",
      "created_at": "2025-01-08T10:00:00Z"
    }
  ],
  "meta": {
    "has_more": true,
    "next_cursor": "2025-01-08T09:30:00Z"
  }
}
```

#### POST /trading/trades
```http
POST /api/v1/trading/trades
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "symbol": "BTC",
  "base": "USDT",
  "exchange": "binance",
  "side": "BUY",
  "order_type": "LIMIT",
  "price": 44000.00,
  "quantity": 0.05,
  "stop_loss": 43000.00,
  "take_profit": 46000.00
}
```

### Position Management

#### GET /trading/positions
```http
GET /api/v1/trading/positions?status=open
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "bot_id": "uuid",
      "symbol": "BTC",
      "base": "USDT",
      "exchange": "binance",
      "side": "LONG",
      "entry_price": 44500.00,
      "quantity": 0.2,
      "current_price": 45000.00,
      "unrealized_pnl": 100.00,
      "unrealized_pnl_percent": 2.25,
      "stop_loss_price": 43000.00,
      "take_profit_price": 47000.00,
      "is_open": true,
      "opened_at": "2025-01-08T09:00:00Z"
    }
  ]
}
```

## 📈 Analysis Service APIs

### Technical Analysis

#### GET /analysis/indicators
```http
GET /api/v1/analysis/indicators?symbol=BTC&base=USDT&timeframe=1h&indicators=sma,ema,rsi
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTC/USDT",
    "timeframe": "1h",
    "timestamp": "2025-01-08T10:00:00Z",
    "indicators": {
      "sma_20": 44750.00,
      "sma_50": 44200.00,
      "ema_12": 44920.00,
      "ema_26": 44680.00,
      "rsi_14": 65.5,
      "macd": {
        "macd": 125.50,
        "signal": 118.20,
        "histogram": 7.30
      },
      "bollinger_bands": {
        "upper": 45500.00,
        "middle": 44750.00,
        "lower": 44000.00
      }
    }
  }
}
```

### Backtesting

#### POST /analysis/backtest
```http
POST /api/v1/analysis/backtest
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "strategy_id": "uuid",
  "symbol": "BTC",
  "base": "USDT",
  "exchange": "binance",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "initial_capital": 10000.00,
  "timeframe": "1h"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backtest_id": "uuid",
    "status": "running",
    "estimated_completion": "2025-01-08T10:05:00Z"
  }
}
```

#### GET /analysis/backtest/{backtest_id}
```http
GET /api/v1/analysis/backtest/uuid
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "strategy_id": "uuid",
    "status": "completed",
    "results": {
      "total_return": 25.3,
      "annual_return": 22.8,
      "max_drawdown": 8.2,
      "sharpe_ratio": 1.65,
      "win_rate": 65.5,
      "total_trades": 156,
      "winning_trades": 102,
      "losing_trades": 54,
      "avg_win": 145.20,
      "avg_loss": -85.30,
      "profit_factor": 1.85
    },
    "equity_curve": [
      {"date": "2024-01-01", "value": 10000.00},
      {"date": "2024-01-02", "value": 10125.00}
    ],
    "trades": [
      {
        "date": "2024-01-01T10:00:00Z",
        "side": "BUY",
        "price": 42000.00,
        "quantity": 0.238,
        "pnl": 125.50
      }
    ]
  }
}
```

## 🔍 Search & Filtering

### Query Parameters

#### Pagination
```
limit: number (default: 50, max: 1000)
cursor: ISO8601 timestamp for cursor-based pagination
offset: number for offset-based pagination (not recommended for large datasets)
```

#### Filtering
```
symbol: string
base: string  
exchange: string
status: string
date_from: ISO8601 date
date_to: ISO8601 date
```

#### Sorting
```
sort_by: field name
sort_order: asc | desc
```

### Example Complex Query
```http
GET /api/v1/trading/trades?symbol=BTC&exchange=binance&status=FILLED&date_from=2025-01-01&date_to=2025-01-31&sort_by=created_at&sort_order=desc&limit=100
```

## ⚠️ Error Handling

### HTTP Status Codes
```
200 OK - Success
201 Created - Resource created
400 Bad Request - Invalid input
401 Unauthorized - Authentication required
403 Forbidden - Insufficient permissions
404 Not Found - Resource not found
422 Unprocessable Entity - Validation errors
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Server error
503 Service Unavailable - Service temporarily down
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2025-01-08T10:00:00Z",
    "request_id": "uuid"
  }
}
```

### Common Error Codes
```
AUTH_REQUIRED - Authentication required
INVALID_TOKEN - JWT token invalid or expired
INSUFFICIENT_PERMISSIONS - User lacks required permissions
VALIDATION_ERROR - Input validation failed
RESOURCE_NOT_FOUND - Requested resource doesn't exist
RATE_LIMIT_EXCEEDED - Too many requests
EXCHANGE_ERROR - External exchange API error
INSUFFICIENT_BALANCE - Not enough funds for trade
MARKET_CLOSED - Market is currently closed
STRATEGY_NOT_ACTIVE - Trading strategy is not active
```

## 🚀 Rate Limiting

### Rate Limits by Endpoint Category
```
Authentication: 10 requests/minute
Market Data: 1000 requests/minute
Trading: 100 requests/minute
Analysis: 50 requests/minute
User Management: 100 requests/minute
```

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200
Retry-After: 60
```

## 📝 API Versioning

### Version Strategy
- Current version: v1
- Versioning via URL path: `/api/v1/`
- Backward compatibility maintained for 2 major versions
- Deprecation notices provided 6 months before removal

### Version Header
```http
API-Version: 1.0
Accept: application/json
```

---
*Last updated: 10/08/2025*
*Version: 1.0*
