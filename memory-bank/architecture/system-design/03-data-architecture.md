# Data Architecture - Trade Bot Scratch

## 🗄️ Data Architecture Overview

Hệ thống sử dụng hybrid data architecture với PostgreSQL cho persistent data và Redis cho caching/real-time data.

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer Architecture                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │              │    │              │    │              │  │
│  │ PostgreSQL   │    │    Redis     │    │  File Store  │  │
│  │ (Main DB)    │    │  (Cache +    │    │ (Logs +     │  │
│  │              │    │   Pub/Sub)   │    │  Exports)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                     │                     │       │
│         ▼                     ▼                     ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   OLTP       │    │  Real-time   │    │   Archive    │  │
│  │ Operations   │    │   Data       │    │   Storage    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🐘 PostgreSQL Database Design

### Schema Overview
```sql
-- Database: trade_bot_scratch
-- Version: PostgreSQL 14+
-- Encoding: UTF8

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Core Tables

#### 1. User Management
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    preferences JSONB DEFAULT '{}',
    trading_limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- User API Keys (for exchanges)
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    secret_encrypted TEXT NOT NULL,
    passphrase_encrypted TEXT,
    is_testnet BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exchange, is_testnet)
);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
```

#### 2. Market Data
```sql
-- Trading Pairs
CREATE TABLE trading_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    base VARCHAR(10) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    min_order_size DECIMAL(20,8),
    max_order_size DECIMAL(20,8),
    price_precision INTEGER,
    quantity_precision INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(symbol, base, exchange)
);

-- OHLCV Data (Time-series)
CREATE TABLE ohlcv_data (
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    base VARCHAR(10) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    open_price DECIMAL(20,8) NOT NULL,
    high_price DECIMAL(20,8) NOT NULL,
    low_price DECIMAL(20,8) NOT NULL,
    close_price DECIMAL(20,8) NOT NULL,
    volume DECIMAL(20,8) NOT NULL,
    quote_volume DECIMAL(20,8),
    trade_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (timestamp, symbol, base, exchange, timeframe)
);

-- Tickers (Latest prices)
CREATE TABLE tickers (
    symbol VARCHAR(20) NOT NULL,
    base VARCHAR(10) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    bid DECIMAL(20,8),
    ask DECIMAL(20,8),
    volume_24h DECIMAL(20,8),
    change_24h DECIMAL(10,4),
    change_percent_24h DECIMAL(10,4),
    high_24h DECIMAL(20,8),
    low_24h DECIMAL(20,8),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (symbol, base, exchange)
);

-- Indexes for Market Data
CREATE INDEX idx_ohlcv_symbol_timeframe ON ohlcv_data(symbol, base, timeframe, timestamp DESC);
CREATE INDEX idx_ohlcv_timestamp ON ohlcv_data(timestamp DESC);
CREATE INDEX idx_tickers_symbol ON tickers(symbol, base);
CREATE INDEX idx_trading_pairs_exchange ON trading_pairs(exchange, is_active);
```

#### 3. Trading System
```sql
-- Trading Strategies
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    strategy_type VARCHAR(50) NOT NULL, -- 'SMA_CROSS', 'RSI_DIVERGENCE', etc.
    parameters JSONB NOT NULL DEFAULT '{}',
    risk_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    is_backtested BOOLEAN DEFAULT false,
    backtest_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading Bots
CREATE TABLE trading_bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    base VARCHAR(10) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    is_running BOOLEAN DEFAULT false,
    capital_allocated DECIMAL(20,8) NOT NULL,
    current_capital DECIMAL(20,8) NOT NULL,
    max_drawdown_percent DECIMAL(5,2) DEFAULT 10.00,
    stop_loss_percent DECIMAL(5,2),
    take_profit_percent DECIMAL(5,2),
    position_size_percent DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    stopped_at TIMESTAMP WITH TIME ZONE
);

-- Trades
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES trading_bots(id) ON DELETE SET NULL,
    strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    base VARCHAR(10) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    order_type VARCHAR(20) DEFAULT 'MARKET',
    price DECIMAL(20,8) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    filled_quantity DECIMAL(20,8) DEFAULT 0,
    fee DECIMAL(20,8) DEFAULT 0,
    fee_currency VARCHAR(10),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, FILLED, CANCELLED, FAILED
    exchange_order_id VARCHAR(100),
    signal_data JSONB,
    pnl DECIMAL(20,8),
    pnl_percent DECIMAL(10,4),
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Positions
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES trading_bots(id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    base VARCHAR(10) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('LONG', 'SHORT')),
    entry_price DECIMAL(20,8) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8),
    unrealized_pnl DECIMAL(20,8),
    unrealized_pnl_percent DECIMAL(10,4),
    stop_loss_price DECIMAL(20,8),
    take_profit_price DECIMAL(20,8),
    is_open BOOLEAN DEFAULT true,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Trading
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_trading_bots_user_id ON trading_bots(user_id);
CREATE INDEX idx_trading_bots_strategy_id ON trading_bots(strategy_id);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_bot_id ON trades(bot_id);
CREATE INDEX idx_trades_symbol ON trades(symbol, base, exchange);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_open ON positions(is_open);
```

#### 4. Analytics & Reporting
```sql
-- Portfolio Snapshots
CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_value DECIMAL(20,8) NOT NULL,
    total_pnl DECIMAL(20,8) NOT NULL,
    total_pnl_percent DECIMAL(10,4) NOT NULL,
    asset_allocation JSONB NOT NULL,
    performance_metrics JSONB,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, snapshot_date)
);

-- Performance Metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES trading_bots(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),
    avg_win DECIMAL(20,8),
    avg_loss DECIMAL(20,8),
    profit_factor DECIMAL(10,4),
    max_drawdown DECIMAL(10,4),
    sharpe_ratio DECIMAL(10,4),
    total_return DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Analytics
CREATE INDEX idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_bot_id ON performance_metrics(bot_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### Data Partitioning Strategy

#### Time-based Partitioning for OHLCV Data
```sql
-- Partition OHLCV data by month
CREATE TABLE ohlcv_data_y2025m01 PARTITION OF ohlcv_data
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE ohlcv_data_y2025m02 PARTITION OF ohlcv_data
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Auto-create monthly partitions
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    start_month text;
    end_date date;
BEGIN
    partition_name := table_name || '_y' || EXTRACT(YEAR FROM start_date) || 'm' || LPAD(EXTRACT(MONTH FROM start_date)::text, 2, '0');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

## 📦 Redis Data Structures

### Cache Layer
```redis
# Market Data Cache (TTL: 60 seconds)
market:ticker:{symbol}:{base}:{exchange} → Hash
  - price: 50000.00
  - volume: 1234.56
  - change_24h: 2.5
  - timestamp: 1704067200

# OHLCV Cache (TTL: 300 seconds)
market:ohlcv:{symbol}:{base}:{exchange}:{timeframe} → List
  [timestamp, open, high, low, close, volume]

# Order Book Cache (TTL: 30 seconds)
market:orderbook:{symbol}:{base}:{exchange}:bids → Sorted Set
market:orderbook:{symbol}:{base}:{exchange}:asks → Sorted Set
  - Score: price, Member: quantity

# Technical Indicators Cache (TTL: 300 seconds)
analysis:indicators:{symbol}:{base}:{timeframe} → Hash
  - sma_20: 48500.00
  - ema_12: 49200.00
  - rsi_14: 65.5
  - macd: 120.5
  - timestamp: 1704067200
```

### Session Management
```redis
# User Sessions (TTL: 24 hours)
session:{token_hash} → Hash
  - user_id: uuid
  - expires_at: timestamp
  - permissions: ["trade", "view_portfolio"]
  - ip_address: "192.168.1.1"

# User Preferences Cache (TTL: 1 hour)
user:preferences:{user_id} → Hash
  - theme: "dark"
  - notifications: true
  - default_exchange: "binance"
  - timezone: "UTC"
```

### Real-time Data
```redis
# WebSocket Subscriptions
subscriptions:market:{symbol}:{base} → Set
  {user_id1, user_id2, user_id3}

subscriptions:user:{user_id} → Set
  {symbol1:base1, symbol2:base2}

# Live Trading State
trading:positions:{user_id} → Hash
  {symbol:base: position_data_json}

trading:orders:{user_id} → List
  [order1_json, order2_json, ...]

# Trading Signals Queue
signals:pending → List
  [signal1_json, signal2_json, ...]

signals:processing:{bot_id} → String
  signal_json
```

### Event Streaming
```redis
# Redis Streams for Event Sourcing
events:trades → Stream
  * user_id: uuid, symbol: "BTC", side: "BUY", price: 50000, quantity: 0.1

events:market_data → Stream
  * symbol: "BTC", base: "USDT", price: 50000, volume: 1000

events:strategy_signals → Stream
  * strategy_id: uuid, signal_type: "BUY", confidence: 0.85

# Consumer Groups
trades_consumer_group → Consumer Group for events:trades
analysis_consumer_group → Consumer Group for events:market_data
```

## 🔄 Data Flow Patterns

### Market Data Pipeline
```
1. Exchange WebSocket → Market Service
2. Market Service → Redis Cache (real-time)
3. Market Service → PostgreSQL (historical)
4. Redis Pub/Sub → Frontend (WebSocket)
5. Batch Process → Analytics (daily)
```

### Trading Execution Flow
```
1. Strategy Signal → Redis Queue
2. Trading Engine → Process Signal
3. Risk Check → PostgreSQL (positions, limits)
4. Exchange API → Execute Trade
5. Trade Result → PostgreSQL + Redis
6. Event → Redis Streams
7. Analytics Update → Performance Metrics
```

### User Data Synchronization
```
1. User Action → API Gateway
2. Authentication → Redis Session Check
3. Business Logic → Service Layer
4. Data Update → PostgreSQL
5. Cache Invalidation → Redis
6. Event Notification → Frontend
```

## 📊 Data Consistency Strategies

### ACID Transactions
```sql
-- Example: Trade Execution Transaction
BEGIN;
  -- Insert trade record
  INSERT INTO trades (user_id, symbol, side, price, quantity, ...)
  VALUES (...);
  
  -- Update user balance
  UPDATE user_balances 
  SET balance = balance - (price * quantity)
  WHERE user_id = $1 AND currency = $2;
  
  -- Update position
  INSERT INTO positions (user_id, symbol, side, quantity, ...)
  VALUES (...)
  ON CONFLICT (user_id, symbol) 
  DO UPDATE SET quantity = positions.quantity + EXCLUDED.quantity;
  
COMMIT;
```

### Cache Consistency
```python
async def update_user_balance(user_id: str, balance_update: dict):
    # Update database first
    await db.execute(
        "UPDATE user_balances SET balance = %s WHERE user_id = %s",
        balance_update['balance'], user_id
    )
    
    # Then update cache
    cache_key = f"user:balance:{user_id}"
    await redis.hset(cache_key, balance_update)
    await redis.expire(cache_key, 3600)  # 1 hour TTL
    
    # Publish change event
    await redis.publish(f"user_updates:{user_id}", json.dumps(balance_update))
```

### Eventual Consistency
```python
# Event Sourcing for audit trail
async def create_audit_event(action: str, user_id: str, details: dict):
    event = {
        "id": str(uuid.uuid4()),
        "action": action,
        "user_id": user_id,
        "details": details,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Add to stream (never fails)
    await redis.xadd("events:audit", event)
    
    # Async processing will handle persistence
    # If processing fails, events remain in stream for retry
```

## 🔒 Data Security & Privacy

### Encryption at Rest
```sql
-- Encrypt sensitive data in PostgreSQL
CREATE TABLE user_api_keys (
    api_key_encrypted TEXT NOT NULL CHECK (length(api_key_encrypted) > 0),
    secret_encrypted TEXT NOT NULL CHECK (length(secret_encrypted) > 0)
);

-- Use pgcrypto for encryption/decryption
INSERT INTO user_api_keys (api_key_encrypted, secret_encrypted)
VALUES (
    pgp_sym_encrypt('actual_api_key', 'encryption_key'),
    pgp_sym_encrypt('actual_secret', 'encryption_key')
);
```

### Data Masking
```python
def mask_sensitive_data(data: dict) -> dict:
    """Mask sensitive fields in logs and responses"""
    masked = data.copy()
    sensitive_fields = ['password', 'api_key', 'secret', 'token']
    
    for field in sensitive_fields:
        if field in masked:
            if len(str(masked[field])) > 4:
                masked[field] = str(masked[field])[:4] + "*" * (len(str(masked[field])) - 4)
            else:
                masked[field] = "****"
    
    return masked
```

### Access Control
```sql
-- Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_trades_policy ON trades
    FOR ALL TO authenticated_users
    USING (user_id = current_setting('app.current_user_id')::uuid);

-- Database Roles
CREATE ROLE trading_app_read;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO trading_app_read;

CREATE ROLE trading_app_write;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO trading_app_write;
```

## 🚀 Performance Optimization

### Database Optimization
```sql
-- Optimize frequent queries
EXPLAIN ANALYZE SELECT * FROM trades 
WHERE user_id = $1 AND created_at >= $2 
ORDER BY created_at DESC LIMIT 50;

-- Partial indexes for common filters
CREATE INDEX idx_trades_user_recent 
ON trades(user_id, created_at DESC) 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Covering indexes
CREATE INDEX idx_trades_portfolio_coverage 
ON trades(user_id, symbol, base) 
INCLUDE (price, quantity, pnl, created_at);
```

### Redis Optimization
```python
# Pipeline operations for better performance
async def bulk_update_tickers(tickers: List[dict]):
    pipe = redis.pipeline()
    
    for ticker in tickers:
        key = f"market:ticker:{ticker['symbol']}:{ticker['base']}"
        pipe.hset(key, ticker)
        pipe.expire(key, 60)
    
    await pipe.execute()

# Use connection pooling
redis_pool = redis.ConnectionPool(
    host='localhost',
    port=6379,
    max_connections=20,
    retry_on_timeout=True
)
```

### Query Patterns
```python
# Efficient pagination
async def get_trades_paginated(
    user_id: str, 
    cursor: datetime = None,
    limit: int = 50
) -> List[dict]:
    query = """
    SELECT * FROM trades 
    WHERE user_id = $1 
    AND ($2 IS NULL OR created_at < $2)
    ORDER BY created_at DESC 
    LIMIT $3
    """
    
    return await db.fetch_all(query, user_id, cursor, limit)

# Aggregate queries with caching
async def get_user_stats(user_id: str) -> dict:
    cache_key = f"user:stats:{user_id}"
    
    # Try cache first
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Calculate from database
    stats = await db.fetch_one("""
        SELECT 
            COUNT(*) as total_trades,
            SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
            AVG(pnl) as avg_pnl,
            SUM(pnl) as total_pnl
        FROM trades 
        WHERE user_id = $1 AND status = 'FILLED'
    """, user_id)
    
    # Cache for 1 hour
    await redis.setex(cache_key, 3600, json.dumps(dict(stats)))
    return dict(stats)
```

---
*Last updated: 10/08/2025*
*Version: 1.0*
