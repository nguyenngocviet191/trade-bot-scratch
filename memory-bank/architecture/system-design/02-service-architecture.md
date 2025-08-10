# Service Architecture - Trade Bot Scratch

## 🏗️ Microservices Overview

Hệ thống được thiết kế theo pattern microservices với 6 services chính:

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                            │
│                   (Express.js)                             │
│                    Port: 5000                              │
└─────────────────┬───────────────────────────┬─────────────┘
                  │                           │
      ┌───────────▼─────────────┐  ┌─────────▼─────────────┐
      │    Market Service       │  │   User Service        │
      │    (Node.js)           │  │   (Node.js)           │
      │    Port: 5001          │  │   Port: 5002          │
      └───────────┬─────────────┘  └─────────┬─────────────┘
                  │                          │
      ┌───────────▼─────────────┐  ┌─────────▼─────────────┐
      │  Trading Engine         │  │  Analysis Service     │
      │  (Python FastAPI)       │  │  (Python)             │
      │  Port: 8000            │  │  Port: 8001           │
      └───────────┬─────────────┘  └─────────┬─────────────┘
                  │                          │
                  └──────────┬───────────────┘
                             │
              ┌──────────────▼──────────────┐
              │      Data Layer             │
              │  PostgreSQL + Redis         │
              └─────────────────────────────┘
```

## 📋 Service Responsibilities

### 1. API Gateway (Port: 5000)
**Technology**: Express.js + TypeScript  
**Responsibility**: Routing, Authentication, Rate Limiting

```typescript
// Key Components
interface GatewayConfig {
  authentication: AuthMiddleware;
  rateLimit: RateLimitConfig;
  cors: CorsConfig;
  proxy: ProxyConfig;
}

// Route Configuration
const routes = {
  '/market/*': 'http://localhost:5001',
  '/user/*': 'http://localhost:5002',
  '/trading/*': 'http://localhost:8000',
  '/analysis/*': 'http://localhost:8001'
};
```

**Key Features**:
- Request routing và load balancing
- JWT authentication middleware
- Rate limiting (100 req/min per user)
- CORS handling
- Request/Response logging
- Circuit breaker implementation

### 2. Market Service (Port: 5001)
**Technology**: Node.js + TypeScript + CCXT  
**Responsibility**: Market data acquisition and processing

```typescript
// Core Functions
export async function fetchCryptoPrice(symbol: string, base: string): Promise<Ticker>
export async function fetchCryptoPrices(pairs: TradingPair[]): Promise<Ticker[]>
export async function fetchCryptoOHLCV(
  symbol: string, 
  timeframe: string, 
  limit: number
): Promise<OHLCV[]>

// WebSocket Management
class MarketDataStream {
  private connections: Map<string, WebSocket>;
  private subscribers: Map<string, Set<string>>;
  
  subscribe(symbol: string, userId: string): void;
  unsubscribe(symbol: string, userId: string): void;
  broadcast(symbol: string, data: MarketData): void;
}
```

**Supported Exchanges**:
- Binance (Primary)
- Gate.io (Secondary)
- MEXC (Additional)

**Data Flow**:
```
Exchange APIs → Market Service → Redis Cache → WebSocket → Frontend
                     ↓
               PostgreSQL (Historical)
```

### 3. User Service (Port: 5002)
**Technology**: Node.js + TypeScript  
**Responsibility**: User management and authentication

```typescript
// User Management
interface User {
  id: string;
  email: string;
  hashedPassword: string;
  preferences: UserPreferences;
  tradingLimits: TradingLimits;
  createdAt: Date;
  lastLoginAt: Date;
}

// Authentication
class AuthService {
  async login(email: string, password: string): Promise<AuthResult>;
  async register(userData: RegisterRequest): Promise<User>;
  async refreshToken(token: string): Promise<string>;
  async logout(userId: string): Promise<void>;
}
```

**Key Features**:
- User registration/login
- JWT token management
- Password hashing (bcrypt)
- User preferences storage
- Trading permissions management
- Session management với Redis

### 4. Trading Engine (Port: 8000)
**Technology**: Python + FastAPI + CCXT  
**Responsibility**: Trade execution and bot management

```python
# Core Architecture
@dataclass
class Adapter:
    exchange: str
    connection: dict
    symbol: str
    timeframe: str
    orders: List[Order]
    positions: List[Position]
    
    def connection_exchange(self) -> bool:
        """Establish exchange connection"""
        
    def execute_trade(self, signal: TradingSignal) -> TradeResult:
        """Execute trading signal"""
        
    def manage_risk(self, position: Position) -> RiskAction:
        """Apply risk management rules"""

# Strategy Pattern
class TradingStrategy(ABC):
    @abstractmethod
    def generate_signal(self, market_data: MarketData) -> TradingSignal:
        pass
        
    @abstractmethod
    def calculate_position_size(self, signal: TradingSignal) -> float:
        pass
```

**Supported Strategies**:
- Moving Average Crossover
- RSI Divergence
- Bollinger Bands
- Custom user strategies

### 5. Analysis Service (Port: 8001)
**Technology**: Python + Pandas + TA-Lib  
**Responsibility**: Technical analysis and indicators

```python
# Technical Indicators
class TechnicalAnalysis:
    def calculate_sma(self, data: pd.DataFrame, period: int) -> pd.Series:
        return data['close'].rolling(window=period).mean()
    
    def calculate_ema(self, data: pd.DataFrame, period: int) -> pd.Series:
        return data['close'].ewm(span=period).mean()
    
    def calculate_rsi(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        return ta.RSI(data['close'], timeperiod=period)

# Backtesting Engine
class BacktestEngine:
    def run_backtest(
        self, 
        strategy: TradingStrategy, 
        data: pd.DataFrame,
        initial_capital: float
    ) -> BacktestResult:
        # Implementation
        pass
```

**Available Indicators**:
- Trend: SMA, EMA, MACD
- Momentum: RSI, Stochastic
- Volatility: Bollinger Bands, ATR
- Volume: OBV, Volume Profile

### 6. Data Layer
**Technology**: PostgreSQL + Redis

**PostgreSQL Schema**:
```sql
-- Users và Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trading Data
CREATE TABLE trading_pairs (
    symbol VARCHAR(20) NOT NULL,
    base VARCHAR(10) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    PRIMARY KEY (symbol, base, exchange)
);

CREATE TABLE ohlcv_data (
    timestamp TIMESTAMP NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    open DECIMAL(20,8) NOT NULL,
    high DECIMAL(20,8) NOT NULL,
    low DECIMAL(20,8) NOT NULL,
    close DECIMAL(20,8) NOT NULL,
    volume DECIMAL(20,8) NOT NULL,
    PRIMARY KEY (timestamp, symbol, timeframe)
);

CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL, -- 'BUY' or 'SELL'
    price DECIMAL(20,8) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    strategy_name VARCHAR(100),
    pnl DECIMAL(20,8)
);

CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL,
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Redis Data Structures**:
```redis
# Market Data Cache
market:tickers:{symbol} → Hash {price, volume, change, timestamp}
market:ohlcv:{symbol}:{timeframe} → List of OHLCV arrays
market:orderbook:{symbol} → Sorted Set {price: quantity}

# User Sessions
user:session:{token} → Hash {userId, expiresAt, permissions}
user:preferences:{userId} → Hash {theme, notifications, limits}

# Real-time Subscriptions
subscriptions:market:{symbol} → Set {userId1, userId2, ...}
subscriptions:user:{userId} → Set {symbol1, symbol2, ...}

# Analysis Cache
analysis:indicators:{symbol}:{timeframe} → Hash {sma20, ema10, rsi, ...}
analysis:signals:{symbol} → List of recent signals

# Trading State
trading:positions:{userId} → Hash {symbol: position_data}
trading:orders:{userId} → List of active orders
```

## 🔄 Communication Patterns

### Synchronous Communication
```
Frontend → API Gateway → Services (REST API)
Services ↔ Services (HTTP/REST when needed)
Services → Database (SQL/Connection Pool)
Services → Redis (TCP Connection)
```

### Asynchronous Communication
```
Market Data: Exchange WebSocket → Market Service → Redis Pub/Sub → Frontend
Trade Events: Trading Engine → Redis Streams → Analysis Service
Notifications: Any Service → Redis Queue → Notification Service
```

### Event-Driven Architecture
```python
# Event Types
class EventType(Enum):
    TRADE_EXECUTED = "trade.executed"
    MARKET_DATA_UPDATED = "market.data.updated"
    STRATEGY_TRIGGERED = "strategy.triggered"
    RISK_LIMIT_EXCEEDED = "risk.limit.exceeded"

# Event Publishing
async def publish_event(event_type: EventType, data: dict):
    await redis.xadd(f"events:{event_type.value}", data)

# Event Consumption
async def consume_events(event_type: EventType, consumer_group: str):
    while True:
        events = await redis.xreadgroup(
            consumer_group, 
            "consumer", 
            {f"events:{event_type.value}": ">"}
        )
        for event in events:
            await process_event(event)
```

## 🛡️ Resilience Patterns

### Circuit Breaker
```typescript
class CircuitBreaker {
  private failureCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

### Retry Strategy
```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(ConnectionError)
)
async def fetch_market_data(symbol: str) -> MarketData:
    # Implementation
    pass
```

### Health Checks
```typescript
// Service Health Check
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      exchange: await checkExchangeAPI()
    }
  };
  
  const isHealthy = Object.values(health.services).every(s => s === 'up');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## 📊 Service Dependencies

### Dependency Matrix
```
Service          | PostgreSQL | Redis | Market | User | Trading | Analysis
API Gateway      |     No     |  Yes  |   No   |  No  |    No   |    No
Market Service   |    Yes     |  Yes  |   -    |  No  |    No   |    No
User Service     |    Yes     |  Yes  |   No   |   -  |    No   |    No
Trading Engine   |    Yes     |  Yes  |  Yes   |  No  |    -    |   Yes
Analysis Service |    Yes     |  Yes  |  Yes   |  No  |   No    |    -
```

### Critical Path Analysis
```
User Request → API Gateway → Service → Database/Cache → Response
                   ↓
              Authentication (User Service)
                   ↓
              Market Data (Market Service)
                   ↓
              Analysis (Analysis Service)
                   ↓
              Trade Execution (Trading Engine)
```

## 🚀 Deployment Strategy

### Container Architecture
```dockerfile
# API Gateway
FROM node:18-alpine
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 5000
CMD ["npm", "start"]

# Python Services
FROM python:3.11-slim
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Service Orchestration
```yaml
# docker-compose.yml
version: '3.8'
services:
  api-gateway:
    build: ./server
    ports: ["5000:5000"]
    depends_on: [redis, postgres]
    
  market-service:
    build: ./server/services
    ports: ["5001:5001"]
    depends_on: [redis, postgres]
    
  trading-engine:
    build: ./core
    ports: ["8000:8000"]
    depends_on: [redis, postgres, market-service]
```

---
*Last updated: 10/08/2025*
*Version: 1.0*
