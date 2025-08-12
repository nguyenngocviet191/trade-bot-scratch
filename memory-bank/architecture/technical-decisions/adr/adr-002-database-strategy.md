# ADR-002: Database Strategy
**Status**: Accepted  
**Date**: 10/08/2025  
**Deciders**: [Team Members]

## Context
Dự án Trade Bot Scratch với kiến trúc microservices cần một chiến lược database có thể hỗ trợ:
- Dữ liệu thị trường real-time với volume lớn
- Dữ liệu người dùng và trading bots
- Phân tích kỹ thuật và lịch sử giao dịch
- Scalability và performance cao
- Data consistency giữa các services

## Decision
Áp dụng chiến lược database polyglot với các database chuyên biệt:

### Primary Databases
- **PostgreSQL**: Main relational database cho user data, bot configurations, trading history
- **Redis**: In-memory cache và session management
- **InfluxDB/TimescaleDB**: Time-series database cho market data và metrics

### Data Distribution Strategy
- **Database per Service**: Mỗi service có database riêng
- **Shared Database**: PostgreSQL cho cross-service data
- **Event Sourcing**: Sử dụng event store cho audit trail

## Consequences

### Positive
- **Performance**: Mỗi database được tối ưu cho use case cụ thể
- **Scalability**: Có thể scale từng database độc lập
- **Flexibility**: Sử dụng database phù hợp cho từng loại dữ liệu
- **Fault Isolation**: Database failure không ảnh hưởng toàn bộ hệ thống
- **Technology Optimization**: Tận dụng strengths của từng database

### Negative
- **Complexity**: Quản lý nhiều database systems
- **Data Consistency**: Khó khăn trong đảm bảo consistency across databases
- **Operational Overhead**: Monitoring và maintenance nhiều database
- **Learning Curve**: Team cần kiến thức về nhiều database technologies
- **Cost**: Chi phí infrastructure và licensing cao hơn

## Implementation Plan

### Phase 1: Core Database Setup
1. **PostgreSQL Setup**
   - Install và configure PostgreSQL cluster
   - Setup connection pooling với PgBouncer
   - Implement database migrations
   - Setup backup và recovery strategy

2. **Redis Setup**
   - Install Redis cluster
   - Configure persistence và replication
   - Setup Redis Sentinel cho high availability
   - Implement caching strategies

### Phase 2: Time-Series Database
1. **InfluxDB/TimescaleDB Selection**
   - Evaluate performance requirements
   - Choose between InfluxDB và TimescaleDB
   - Setup time-series database cluster
   - Implement data retention policies

### Phase 3: Data Integration
1. **Service Integration**
   - Implement database connections cho từng service
   - Setup data access layers
   - Implement connection pooling
   - Setup monitoring và alerting

2. **Data Consistency**
   - Implement eventual consistency patterns
   - Setup event sourcing cho critical data
   - Implement saga pattern cho distributed transactions
   - Setup data synchronization mechanisms

### Phase 4: Optimization
1. **Performance Tuning**
   - Database indexing strategies
   - Query optimization
   - Connection pooling optimization
   - Caching layer optimization

2. **Monitoring & Maintenance**
   - Setup database monitoring
   - Implement automated backups
   - Setup performance alerts
   - Regular maintenance schedules

## Database Schema Design

### PostgreSQL Schema
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trading bots table
CREATE TABLE trading_bots (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    strategy_config JSONB,
    status VARCHAR(50) DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trading history table
CREATE TABLE trading_history (
    id UUID PRIMARY KEY,
    bot_id UUID REFERENCES trading_bots(id),
    exchange VARCHAR(100) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity DECIMAL NOT NULL,
    price DECIMAL NOT NULL,
    executed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Redis Data Structures
```redis
# User sessions
SET user:session:{session_id} {user_data} EX 3600

# Market data cache
SET market:price:{symbol} {price_data} EX 60

# Bot status
SET bot:status:{bot_id} {status_data} EX 300

# Rate limiting
INCR rate:limit:{user_id}:{endpoint}
EXPIRE rate:limit:{user_id}:{endpoint} 3600
```

### Time-Series Data Structure
```sql
-- Market data table (TimescaleDB)
CREATE TABLE market_data (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(100) NOT NULL,
    open DECIMAL NOT NULL,
    high DECIMAL NOT NULL,
    low DECIMAL NOT NULL,
    close DECIMAL NOT NULL,
    volume DECIMAL NOT NULL
);

-- Create hypertable
SELECT create_hypertable('market_data', 'time');

-- Create indexes
CREATE INDEX idx_market_data_symbol_time ON market_data (symbol, time DESC);
CREATE INDEX idx_market_data_exchange_time ON market_data (exchange, time DESC);
```

## Data Access Patterns

### Read Patterns
- **User Data**: Direct PostgreSQL queries với caching
- **Market Data**: Time-series database với Redis cache
- **Bot Status**: Redis với PostgreSQL backup
- **Trading History**: PostgreSQL với pagination

### Write Patterns
- **User Operations**: PostgreSQL với transaction
- **Market Data**: Time-series database với batch writes
- **Trading Operations**: Event sourcing với eventual consistency
- **Bot Updates**: Redis với PostgreSQL synchronization

## Backup & Recovery Strategy

### Backup Strategy
- **PostgreSQL**: Daily full backup + hourly WAL archiving
- **Redis**: RDB snapshots + AOF persistence
- **Time-Series**: Daily backups với retention policies
- **Cross-Region**: Backup replication cho disaster recovery

### Recovery Strategy
- **Point-in-Time Recovery**: PostgreSQL WAL-based recovery
- **Redis Recovery**: AOF replay + RDB restore
- **Data Validation**: Automated consistency checks
- **Failover**: Automated failover với health checks

## Monitoring & Alerting

### Key Metrics
- **Database Performance**: Query response times, connection counts
- **Storage Usage**: Disk space, growth rates
- **Availability**: Uptime, error rates
- **Data Consistency**: Sync delays, consistency checks

### Alerting Rules
- **High Response Time**: > 500ms average query time
- **Connection Exhaustion**: > 80% connection pool usage
- **Disk Space**: > 85% disk usage
- **Replication Lag**: > 30 seconds lag

## Related ADRs
- ADR-001: Microservices Architecture
- ADR-003: API Design Patterns
- ADR-004: Event Sourcing Strategy
- ADR-005: Caching Strategy

---
*Last updated: 10/08/2025*