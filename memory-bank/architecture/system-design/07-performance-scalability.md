# Performance & Scalability - Trade Bot Scratch

## 🚀 Performance Overview

Hệ thống Trade Bot Scratch được thiết kế để xử lý high-frequency trading data với low latency và high throughput, đảm bảo khả năng mở rộng từ hundreds đến thousands of concurrent users.

## 📊 Performance Requirements & SLAs

### Target Performance Metrics
```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Targets                     │
├─────────────────────────────────────────────────────────────┤
│  Metric                    │  Target     │  Acceptable    │
├─────────────────────────────────────────────────────────────┤
│  API Response Time (p95)   │  < 200ms    │  < 500ms       │
│  Market Data Latency       │  < 100ms    │  < 200ms       │
│  Trade Execution Time      │  < 500ms    │  < 1s          │
│  Database Query Time       │  < 50ms     │  < 100ms       │
│  WebSocket Message Delay   │  < 10ms     │  < 50ms        │
│  System Uptime             │  99.9%      │  99.5%         │
│  Concurrent Users          │  1,000+     │  500+          │
│  Requests per Second       │  10,000+    │  5,000+        │
│  Data Throughput           │  1M pts/day │  500K pts/day  │
└─────────────────────────────────────────────────────────────┘
```

### Performance Testing Strategy
```typescript
interface PerformanceTest {
  name: string;
  type: 'load' | 'stress' | 'spike' | 'endurance';
  duration: string;
  concurrent_users: number;
  ramp_up_time: string;
  success_criteria: {
    response_time_p95: number;
    error_rate: number;
    throughput: number;
  };
}

const performanceTests: PerformanceTest[] = [
  {
    name: 'Market Data Load Test',
    type: 'load',
    duration: '10m',
    concurrent_users: 1000,
    ramp_up_time: '2m',
    success_criteria: {
      response_time_p95: 200,
      error_rate: 0.01,
      throughput: 5000
    }
  },
  {
    name: 'Trading API Stress Test',
    type: 'stress',
    duration: '30m',
    concurrent_users: 2000,
    ramp_up_time: '5m',
    success_criteria: {
      response_time_p95: 500,
      error_rate: 0.05,
      throughput: 3000
    }
  }
];
```

## 🔧 Application Performance Optimization

### Database Performance

#### Query Optimization
```sql
-- Optimized query for user trades with pagination
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
  t.id,
  t.symbol,
  t.base,
  t.side,
  t.price,
  t.quantity,
  t.pnl,
  t.created_at
FROM trades t
WHERE t.user_id = $1
  AND t.created_at >= $2  -- Index-friendly date filter
  AND ($3 IS NULL OR t.created_at < $3)  -- Cursor pagination
ORDER BY t.created_at DESC
LIMIT $4;

-- Covering index for optimal performance
CREATE INDEX CONCURRENTLY idx_trades_user_performance 
ON trades (user_id, created_at DESC) 
INCLUDE (id, symbol, base, side, price, quantity, pnl);

-- Partial index for active positions
CREATE INDEX CONCURRENTLY idx_positions_active 
ON positions (user_id, symbol, base) 
WHERE is_open = true;
```

#### Connection Pooling Optimization
```typescript
class OptimizedDBPool {
  private pool: Pool;
  private metrics: PoolMetrics;
  
  constructor() {
    this.pool = new Pool({
      // Connection settings
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      
      // Pool optimization
      min: 20,                    // Keep minimum connections warm
      max: 100,                   // Maximum connections
      idleTimeoutMillis: 30000,   // Close idle connections
      connectionTimeoutMillis: 3000,
      
      // Performance settings
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      statement_timeout: 30000,   // 30s query timeout
      query_timeout: 30000,
      
      // SSL for production
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });
    
    this.setupMetrics();
    this.setupHealthChecks();
  }
  
  private setupMetrics(): void {
    // Monitor pool metrics
    setInterval(() => {
      this.metrics = {
        total_connections: this.pool.totalCount,
        idle_connections: this.pool.idleCount,
        waiting_clients: this.pool.waitingCount,
        active_queries: this.pool.totalCount - this.pool.idleCount
      };
      
      // Log if pool is under stress
      if (this.metrics.waiting_clients > 0) {
        console.warn('Database pool under pressure', this.metrics);
      }
    }, 5000);
  }
  
  async executeOptimizedQuery<T>(
    query: string, 
    params: any[], 
    options: QueryOptions = {}
  ): Promise<T[]> {
    const client = await this.pool.connect();
    const startTime = Date.now();
    
    try {
      // Set query-specific timeout
      if (options.timeout) {
        await client.query(`SET statement_timeout = ${options.timeout}`);
      }
      
      const result = await client.query(query, params);
      
      // Log slow queries
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        console.warn('Slow query detected', { query, duration, params });
      }
      
      return result.rows;
    } finally {
      client.release();
    }
  }
}
```

#### Database Partitioning
```sql
-- Time-based partitioning for large tables
CREATE TABLE trades_partitioned (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  base VARCHAR(10) NOT NULL,
  side VARCHAR(4) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  -- ... other columns
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE trades_y2025m01 PARTITION OF trades_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE trades_y2025m02 PARTITION OF trades_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Auto-partition function
CREATE OR REPLACE FUNCTION create_partition_if_not_exists(
  table_name text,
  partition_date date
) RETURNS void AS $$
DECLARE
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  start_date := date_trunc('month', partition_date);
  end_date := start_date + interval '1 month';
  partition_name := table_name || '_y' || EXTRACT(YEAR FROM start_date) || 
                   'm' || LPAD(EXTRACT(MONTH FROM start_date)::text, 2, '0');
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
      partition_name, table_name, start_date, end_date
    );
    
    -- Create indexes on new partition
    EXECUTE format(
      'CREATE INDEX %I ON %I (user_id, created_at DESC)',
      partition_name || '_user_created_idx', partition_name
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Caching Strategy

#### Multi-Level Caching
```typescript
interface CacheLayer {
  name: string;
  ttl: number;
  maxSize?: number;
  evictionPolicy: 'LRU' | 'LFU' | 'TTL';
}

class HybridCache {
  private layers: Map<string, CacheInstance> = new Map();
  
  constructor() {
    // L1: In-memory cache (fastest)
    this.addLayer('memory', {
      name: 'memory',
      ttl: 60,
      maxSize: 1000,
      evictionPolicy: 'LRU'
    }, new MemoryCache());
    
    // L2: Redis cache (distributed)
    this.addLayer('redis', {
      name: 'redis',
      ttl: 300,
      evictionPolicy: 'TTL'
    }, new RedisCache());
    
    // L3: Database (source of truth)
    this.addLayer('database', {
      name: 'database',
      ttl: Infinity,
      evictionPolicy: 'TTL'
    }, new DatabaseCache());
  }
  
  async get<T>(key: string): Promise<T | null> {
    // Try each layer in order
    for (const [layerName, cache] of this.layers) {
      const value = await cache.get<T>(key);
      if (value !== null) {
        // Backfill higher layers
        await this.backfillCache(key, value, layerName);
        return value;
      }
    }
    return null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Set in all layers
    const promises = Array.from(this.layers.values()).map(cache =>
      cache.set(key, value, ttl)
    );
    await Promise.all(promises);
  }
  
  private async backfillCache<T>(
    key: string, 
    value: T, 
    sourceLayer: string
  ): Promise<void> {
    const layerNames = Array.from(this.layers.keys());
    const sourceIndex = layerNames.indexOf(sourceLayer);
    
    // Backfill higher-priority layers
    for (let i = 0; i < sourceIndex; i++) {
      const cache = this.layers.get(layerNames[i]);
      if (cache) {
        await cache.set(key, value);
      }
    }
  }
}
```

#### Smart Cache Warming
```typescript
class CacheWarmer {
  private warmingJobs: Map<string, WarmingJob> = new Map();
  
  async warmMarketData(): Promise<void> {
    const popularPairs = await this.getPopularTradingPairs();
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    
    const warmingPromises = popularPairs.flatMap(pair =>
      timeframes.map(timeframe =>
        this.warmOHLCVData(pair.symbol, pair.base, timeframe)
      )
    );
    
    await Promise.allSettled(warmingPromises);
  }
  
  private async warmOHLCVData(
    symbol: string, 
    base: string, 
    timeframe: string
  ): Promise<void> {
    const cacheKey = `market:ohlcv:${symbol}:${base}:${timeframe}`;
    
    // Check if already cached
    const cached = await this.cache.get(cacheKey);
    if (cached) return;
    
    // Fetch from exchange
    const ohlcvData = await this.marketService.fetchOHLCV(
      symbol, base, timeframe, 100
    );
    
    // Cache with appropriate TTL
    const ttl = this.getTTLForTimeframe(timeframe);
    await this.cache.set(cacheKey, ohlcvData, ttl);
  }
  
  private getTTLForTimeframe(timeframe: string): number {
    const ttlMap: Record<string, number> = {
      '1m': 60,      // 1 minute
      '5m': 300,     // 5 minutes
      '15m': 900,    // 15 minutes
      '1h': 3600,    // 1 hour
      '4h': 14400,   // 4 hours
      '1d': 86400    // 1 day
    };
    return ttlMap[timeframe] || 300;
  }
}
```

### API Performance Optimization

#### Request Optimization
```typescript
class APIOptimizer {
  // Request batching for efficiency
  async batchMarketDataRequests(
    requests: MarketDataRequest[]
  ): Promise<MarketDataResponse[]> {
    // Group by exchange and timeframe
    const grouped = this.groupRequests(requests);
    
    const results = await Promise.all(
      Object.entries(grouped).map(([key, reqs]) =>
        this.executeBatchRequest(key, reqs)
      )
    );
    
    return results.flat();
  }
  
  // Response compression
  compressResponse(data: any): Buffer {
    if (data.length > 1024) { // Only compress larger responses
      return gzip(JSON.stringify(data));
    }
    return Buffer.from(JSON.stringify(data));
  }
  
  // Request deduplication
  private requestCache = new Map<string, Promise<any>>();
  
  async dedupedRequest<T>(
    key: string, 
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.requestCache.has(key)) {
      return this.requestCache.get(key)!;
    }
    
    const promise = requestFn();
    this.requestCache.set(key, promise);
    
    // Clean up after 1 second
    setTimeout(() => {
      this.requestCache.delete(key);
    }, 1000);
    
    return promise;
  }
}
```

#### Rate Limiting Optimization
```typescript
class SmartRateLimiter {
  private tokenBuckets = new Map<string, TokenBucket>();
  private adaptiveThresholds = new Map<string, AdaptiveThreshold>();
  
  async checkRateLimit(
    userId: string, 
    endpoint: string,
    context?: RequestContext
  ): Promise<RateLimitResult> {
    const bucketKey = `${userId}:${endpoint}`;
    let bucket = this.tokenBuckets.get(bucketKey);
    
    if (!bucket) {
      bucket = this.createTokenBucket(userId, endpoint);
      this.tokenBuckets.set(bucketKey, bucket);
    }
    
    // Adaptive rate limiting based on user behavior
    const threshold = await this.getAdaptiveThreshold(userId, endpoint);
    
    if (bucket.tokens < threshold.minTokens) {
      return {
        allowed: false,
        retryAfter: this.calculateRetryAfter(bucket),
        reason: 'Rate limit exceeded'
      };
    }
    
    bucket.consume(1);
    
    // Update adaptive threshold based on success
    await this.updateAdaptiveThreshold(userId, endpoint, true);
    
    return {
      allowed: true,
      remainingTokens: bucket.tokens,
      resetTime: bucket.nextRefill
    };
  }
  
  private createTokenBucket(userId: string, endpoint: string): TokenBucket {
    const userTier = this.getUserTier(userId);
    const endpointConfig = this.getEndpointConfig(endpoint);
    
    return new TokenBucket({
      capacity: userTier.baseLimit * endpointConfig.multiplier,
      refillRate: userTier.refillRate,
      refillPeriod: 60000 // 1 minute
    });
  }
}
```

## 📈 Scalability Architecture

### Horizontal Scaling Strategy

#### Auto-Scaling Configuration
```yaml
# Kubernetes HPA with custom metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: trading-engine-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: trading-engine
  minReplicas: 3
  maxReplicas: 50
  metrics:
  # CPU-based scaling
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  
  # Memory-based scaling
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  
  # Custom metrics from Prometheus
  - type: Pods
    pods:
      metric:
        name: active_trading_bots
      target:
        type: AverageValue
        averageValue: "10"
  
  - type: Pods
    pods:
      metric:
        name: pending_trades_queue_size
      target:
        type: AverageValue
        averageValue: "100"
  
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
    
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

#### Load Balancing Strategy
```typescript
class SmartLoadBalancer {
  private instances: ServiceInstance[] = [];
  private healthChecker: HealthChecker;
  
  constructor() {
    this.healthChecker = new HealthChecker({
      checkInterval: 30000,
      timeout: 5000,
      retries: 3
    });
  }
  
  async selectInstance(request: Request): Promise<ServiceInstance> {
    const healthyInstances = this.instances.filter(i => i.isHealthy);
    
    if (healthyInstances.length === 0) {
      throw new Error('No healthy instances available');
    }
    
    // Different strategies based on request type
    switch (request.type) {
      case 'market_data':
        return this.selectByLatency(healthyInstances);
      
      case 'trading':
        return this.selectByCapacity(healthyInstances);
      
      case 'analysis':
        return this.selectByCPUUsage(healthyInstances);
      
      default:
        return this.selectRoundRobin(healthyInstances);
    }
  }
  
  private selectByLatency(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((best, current) =>
      current.averageLatency < best.averageLatency ? current : best
    );
  }
  
  private selectByCapacity(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((best, current) =>
      current.availableCapacity > best.availableCapacity ? current : best
    );
  }
}
```

### Database Scaling

#### Read Replicas Strategy
```typescript
class DatabaseRouter {
  private primaryDB: DatabaseConnection;
  private readReplicas: DatabaseConnection[];
  private replicationLag: Map<string, number> = new Map();
  
  async executeQuery(
    query: string, 
    params: any[], 
    options: QueryOptions = {}
  ): Promise<any> {
    if (this.isWriteQuery(query) || options.forcePrimary) {
      return this.primaryDB.query(query, params);
    }
    
    // Select best read replica
    const replica = await this.selectReadReplica(options);
    
    // Check replication lag
    const lag = this.replicationLag.get(replica.id) || 0;
    if (lag > options.maxReplicationLag || 30000) {
      console.warn(`High replication lag detected: ${lag}ms`);
      if (options.consistencyLevel === 'strong') {
        return this.primaryDB.query(query, params);
      }
    }
    
    return replica.query(query, params);
  }
  
  private async selectReadReplica(
    options: QueryOptions
  ): Promise<DatabaseConnection> {
    // Health check replicas
    const healthyReplicas = this.readReplicas.filter(r => r.isHealthy);
    
    if (healthyReplicas.length === 0) {
      console.warn('No healthy read replicas, using primary');
      return this.primaryDB;
    }
    
    // Select by load balancing strategy
    switch (options.routingStrategy) {
      case 'least_connections':
        return this.selectByLeastConnections(healthyReplicas);
      
      case 'geographic':
        return this.selectByGeography(healthyReplicas, options.region);
      
      default:
        return this.selectRoundRobin(healthyReplicas);
    }
  }
}
```

#### Sharding Strategy
```typescript
interface ShardingConfig {
  shardKey: string;
  shardFunction: (key: any) => string;
  shards: ShardDefinition[];
}

class DatabaseSharding {
  private config: ShardingConfig;
  private shardConnections: Map<string, DatabaseConnection> = new Map();
  
  constructor(config: ShardingConfig) {
    this.config = config;
    this.initializeShards();
  }
  
  async executeShardedQuery<T>(
    query: string,
    params: any[],
    shardKey?: any
  ): Promise<T[]> {
    if (shardKey) {
      // Single shard query
      const shardId = this.config.shardFunction(shardKey);
      const connection = this.shardConnections.get(shardId)!;
      return connection.query(query, params);
    } else {
      // Multi-shard query (scatter-gather)
      const promises = Array.from(this.shardConnections.values()).map(
        connection => connection.query(query, params)
      );
      
      const results = await Promise.allSettled(promises);
      return results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => (r as PromiseFulfilledResult<T[]>).value);
    }
  }
  
  // User-based sharding function
  private userShardFunction = (userId: string): string => {
    const hash = this.calculateHash(userId);
    const shardIndex = hash % this.config.shards.length;
    return this.config.shards[shardIndex].id;
  };
  
  // Time-based sharding function
  private timeShardFunction = (timestamp: Date): string => {
    const month = timestamp.getMonth();
    const year = timestamp.getFullYear();
    return `shard_${year}_${month}`;
  };
}
```

## ⚡ Real-time Performance

### WebSocket Optimization
```typescript
class OptimizedWebSocketServer {
  private connections: Map<string, WebSocketConnection> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private messageBuffer: MessageBuffer;
  
  constructor() {
    this.messageBuffer = new MessageBuffer({
      maxSize: 1000,
      flushInterval: 10, // 10ms
      compressionThreshold: 100
    });
    
    this.startOptimizations();
  }
  
  private startOptimizations(): void {
    // Batch message delivery
    setInterval(() => {
      this.flushMessageBuffer();
    }, this.messageBuffer.flushInterval);
    
    // Connection cleanup
    setInterval(() => {
      this.cleanupStaleConnections();
    }, 30000);
    
    // Performance monitoring
    setInterval(() => {
      this.monitorPerformance();
    }, 5000);
  }
  
  async broadcastToRoom(
    roomId: string, 
    message: any,
    options: BroadcastOptions = {}
  ): Promise<void> {
    const connectionIds = this.rooms.get(roomId);
    if (!connectionIds) return;
    
    const serializedMessage = JSON.stringify(message);
    const compressedMessage = options.compress ? 
      await this.compressMessage(serializedMessage) : serializedMessage;
    
    // Batch sending for efficiency
    const sendPromises = Array.from(connectionIds).map(async connectionId => {
      const connection = this.connections.get(connectionId);
      if (connection && connection.readyState === WebSocket.OPEN) {
        try {
          await connection.send(compressedMessage);
        } catch (error) {
          console.warn(`Failed to send to ${connectionId}:`, error);
          this.removeConnection(connectionId);
        }
      }
    });
    
    await Promise.allSettled(sendPromises);
  }
  
  private async compressMessage(message: string): Promise<Buffer> {
    if (message.length < 100) return Buffer.from(message);
    
    return new Promise((resolve, reject) => {
      gzip(message, (err, compressed) => {
        if (err) reject(err);
        else resolve(compressed);
      });
    });
  }
}
```

### Event Streaming Optimization
```typescript
class HighPerformanceEventStream {
  private kafka: KafkaProducer;
  private redis: Redis;
  private batchProcessor: BatchProcessor;
  
  constructor() {
    this.kafka = new KafkaProducer({
      brokers: ['kafka1:9092', 'kafka2:9092', 'kafka3:9092'],
      compression: CompressionTypes.snappy,
      batch: {
        size: 16384,        // 16KB batches
        lingerMs: 5,        // Wait 5ms to batch
        maxBytes: 1048576   // 1MB max batch size
      }
    });
    
    this.batchProcessor = new BatchProcessor({
      batchSize: 100,
      flushInterval: 10,
      maxWait: 50
    });
  }
  
  async publishMarketEvent(event: MarketEvent): Promise<void> {
    // Add to batch processor
    await this.batchProcessor.add(event);
  }
  
  private async processBatch(events: MarketEvent[]): Promise<void> {
    // Group events by symbol for better partitioning
    const groupedEvents = this.groupEventsBySymbol(events);
    
    const kafkaPromises = Object.entries(groupedEvents).map(
      ([symbol, symbolEvents]) =>
        this.kafka.send({
          topic: 'market_events',
          partition: this.getPartitionForSymbol(symbol),
          messages: symbolEvents.map(event => ({
            key: event.symbol,
            value: JSON.stringify(event),
            timestamp: event.timestamp.toString()
          }))
        })
    );
    
    await Promise.all(kafkaPromises);
  }
  
  private getPartitionForSymbol(symbol: string): number {
    // Consistent hashing for better distribution
    const hash = this.calculateHash(symbol);
    return hash % 12; // 12 partitions
  }
}
```

## 📊 Performance Monitoring

### Application Performance Monitoring
```typescript
class APMService {
  private prometheus: PrometheusRegistry;
  private tracer: Tracer;
  
  constructor() {
    this.setupMetrics();
    this.setupTracing();
  }
  
  private setupMetrics(): void {
    // HTTP request metrics
    this.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
    });
    
    // Database query metrics
    this.dbQueryDuration = new prometheus.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['query_type', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
    });
    
    // Trading metrics
    this.tradeExecutionTime = new prometheus.Histogram({
      name: 'trade_execution_duration_seconds',
      help: 'Time to execute trades',
      labelNames: ['exchange', 'symbol', 'side'],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    });
    
    // Memory usage
    this.memoryUsage = new prometheus.Gauge({
      name: 'nodejs_memory_usage_bytes',
      help: 'Node.js memory usage',
      labelNames: ['type']
    });
    
    // Start memory monitoring
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed);
      this.memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal);
      this.memoryUsage.set({ type: 'external' }, memUsage.external);
      this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    }, 5000);
  }
  
  // Performance middleware
  createPerformanceMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const span = this.tracer.startSpan(`${req.method} ${req.route?.path || req.path}`);
      
      // Add trace context to request
      req.span = span;
      req.traceId = span.spanContext().traceId;
      
      res.on('finish', () => {
        const duration = (Date.now() - startTime) / 1000;
        
        // Record metrics
        this.httpRequestDuration
          .labels(req.method, req.route?.path || 'unknown', res.statusCode.toString())
          .observe(duration);
        
        // End span
        span.setStatus({ code: res.statusCode >= 400 ? 2 : 1 });
        span.end();
        
        // Log slow requests
        if (duration > 1) {
          console.warn('Slow request detected', {
            method: req.method,
            path: req.path,
            duration,
            traceId: req.traceId
          });
        }
      });
      
      next();
    };
  }
}
```

### Custom Performance Alerts
```yaml
# prometheus-alerts.yml
groups:
- name: tradebot-performance
  rules:
  
  # High latency alerts
  - alert: HighAPILatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High API latency detected"
      description: "95th percentile latency is {{ $value }}s for {{ $labels.route }}"
  
  # Database performance
  - alert: SlowDatabaseQueries
    expr: histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m])) > 0.1
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "Slow database queries detected"
      description: "95th percentile query time is {{ $value }}s"
  
  # Memory usage
  - alert: HighMemoryUsage
    expr: (nodejs_memory_usage_bytes{type="heap_used"} / nodejs_memory_usage_bytes{type="heap_total"}) > 0.9
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High memory usage"
      description: "Memory usage is {{ $value | humanizePercentage }}"
  
  # Trading performance
  - alert: SlowTradeExecution
    expr: histogram_quantile(0.95, rate(trade_execution_duration_seconds_bucket[5m])) > 5
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Slow trade execution"
      description: "Trade execution time is {{ $value }}s"
```

## 🚀 Performance Tuning Guidelines

### Node.js Optimization
```javascript
// Node.js performance tuning
process.env.UV_THREADPOOL_SIZE = '32';  // Increase thread pool
process.env.NODE_OPTIONS = '--max-old-space-size=4096';  // Increase heap size

// GC tuning
const v8 = require('v8');
v8.setFlagsFromString('--max-old-space-size=4096');
v8.setFlagsFromString('--gc-interval=100');

// Event loop monitoring
setInterval(() => {
  const lag = Date.now() - process.hrtime.bigint() / 1000000n;
  if (lag > 100) {
    console.warn(`Event loop lag: ${lag}ms`);
  }
}, 1000);
```

### Python Optimization
```python
# Python performance settings
import asyncio
import uvloop
import multiprocessing

# Use uvloop for better async performance
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

# Optimize worker processes
worker_count = min(multiprocessing.cpu_count() * 2, 32)

# Memory optimization
import gc
gc.set_threshold(700, 10, 10)  # Aggressive garbage collection

# FastAPI optimization
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(
    title="Trading Engine",
    docs_url=None,  # Disable docs in production
    redoc_url=None
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

---
*Last updated: 10/08/2025*
*Version: 1.0*
