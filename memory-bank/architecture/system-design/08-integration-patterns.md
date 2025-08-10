# Integration Patterns - Trade Bot Scratch

## 🔗 Integration Overview

Hệ thống Trade Bot Scratch tích hợp với nhiều external services và APIs, đòi hỏi robust integration patterns để đảm bảo reliability, performance và maintainability.

## 🏗️ Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Integration Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Trading   │    │   Market    │    │  External   │     │
│  │  Exchanges  │    │    Data     │    │  Services   │     │
│  │             │    │ Providers   │    │             │     │
│  │ • Binance   │    │ • CMC       │    │ • SMS       │     │
│  │ • Gate.io   │    │ • Yahoo     │    │ • Email     │     │
│  │ • MEXC      │    │ • Alpha     │    │ • Auth0     │     │
│  │ • MT5       │    │ • Polygon   │    │ • Stripe    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Integration Layer                      │   │
│  │                                                     │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │ │  Adapters   │ │ Message     │ │   Circuit   │    │   │
│  │ │  Pattern    │ │   Queue     │ │  Breakers   │    │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  │                                                     │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │ │   Retry     │ │  Rate       │ │   Event     │    │   │
│  │ │ Mechanisms  │ │ Limiting    │ │ Streaming   │    │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Core Services                        │   │
│  │  • Market Service   • Trading Engine               │   │
│  │  • User Service     • Analysis Service             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Exchange Integration Patterns

### Adapter Pattern Implementation
```typescript
// Base Exchange Adapter
abstract class ExchangeAdapter {
  protected exchange: ccxt.Exchange;
  protected config: ExchangeConfig;
  protected circuitBreaker: CircuitBreaker;
  protected rateLimiter: RateLimiter;
  
  constructor(config: ExchangeConfig) {
    this.config = config;
    this.initializeExchange();
    this.setupCircuitBreaker();
    this.setupRateLimiter();
  }
  
  abstract async fetchTicker(symbol: string): Promise<Ticker>;
  abstract async fetchOHLCV(symbol: string, timeframe: string, limit?: number): Promise<OHLCV[]>;
  abstract async createOrder(order: OrderRequest): Promise<Order>;
  abstract async fetchBalance(): Promise<Balance>;
  
  protected async executeWithResilience<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      await this.rateLimiter.waitForToken();
      
      try {
        const result = await this.retryWithBackoff(operation, {
          maxAttempts: 3,
          baseDelay: 1000,
          maxDelay: 30000
        });
        
        this.updateSuccessMetrics(context);
        return result;
      } catch (error) {
        this.updateErrorMetrics(context, error);
        throw error;
      }
    });
  }
}

// Binance Adapter
class BinanceAdapter extends ExchangeAdapter {
  constructor(config: BinanceConfig) {
    super(config);
    this.exchange = new ccxt.binance({
      apiKey: config.apiKey,
      secret: config.secret,
      sandbox: config.testnet,
      enableRateLimit: true,
      rateLimit: 1200, // 50 requests per minute
      options: {
        adjustForTimeDifference: true,
        recvWindow: 10000
      }
    });
  }
  
  async fetchTicker(symbol: string): Promise<Ticker> {
    return this.executeWithResilience(async () => {
      const ticker = await this.exchange.fetchTicker(symbol);
      return this.normalizeTicker(ticker);
    }, `fetchTicker:${symbol}`);
  }
  
  async fetchOHLCV(
    symbol: string, 
    timeframe: string, 
    limit: number = 500
  ): Promise<OHLCV[]> {
    return this.executeWithResilience(async () => {
      const ohlcv = await this.exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
      return ohlcv.map(this.normalizeOHLCV);
    }, `fetchOHLCV:${symbol}:${timeframe}`);
  }
  
  async createOrder(orderRequest: OrderRequest): Promise<Order> {
    return this.executeWithResilience(async () => {
      const order = await this.exchange.createOrder(
        orderRequest.symbol,
        orderRequest.type,
        orderRequest.side,
        orderRequest.amount,
        orderRequest.price,
        undefined,
        orderRequest.params
      );
      
      return this.normalizeOrder(order);
    }, `createOrder:${orderRequest.symbol}`);
  }
  
  // WebSocket connection for real-time data
  async subscribeToTicker(symbol: string, callback: (ticker: Ticker) => void): Promise<void> {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    
    ws.on('message', (data) => {
      try {
        const ticker = this.parseWebSocketTicker(JSON.parse(data.toString()));
        callback(ticker);
      } catch (error) {
        console.error('Failed to parse WebSocket ticker:', error);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      // Implement reconnection logic
      setTimeout(() => this.subscribeToTicker(symbol, callback), 5000);
    });
  }
  
  private normalizeTicker(rawTicker: any): Ticker {
    return {
      symbol: rawTicker.symbol,
      price: parseFloat(rawTicker.last),
      bid: parseFloat(rawTicker.bid),
      ask: parseFloat(rawTicker.ask),
      volume: parseFloat(rawTicker.baseVolume),
      change24h: parseFloat(rawTicker.change),
      changePercent24h: parseFloat(rawTicker.percentage),
      high24h: parseFloat(rawTicker.high),
      low24h: parseFloat(rawTicker.low),
      timestamp: new Date(rawTicker.timestamp)
    };
  }
}

// Gate.io Adapter
class GateIOAdapter extends ExchangeAdapter {
  constructor(config: GateIOConfig) {
    super(config);
    this.exchange = new ccxt.gateio({
      apiKey: config.apiKey,
      secret: config.secret,
      password: config.passphrase,
      sandbox: config.testnet,
      enableRateLimit: true,
      rateLimit: 1000 // 60 requests per minute
    });
  }
  
  // Implementation similar to Binance but with Gate.io specifics
  async fetchTicker(symbol: string): Promise<Ticker> {
    return this.executeWithResilience(async () => {
      const ticker = await this.exchange.fetchTicker(symbol);
      return this.normalizeGateIOTicker(ticker);
    }, `fetchTicker:${symbol}`);
  }
  
  // Gate.io specific normalization
  private normalizeGateIOTicker(rawTicker: any): Ticker {
    // Gate.io specific field mapping
    return {
      symbol: rawTicker.symbol,
      price: parseFloat(rawTicker.last),
      // ... other fields with Gate.io specific mapping
    };
  }
}
```

### Exchange Factory Pattern
```typescript
interface ExchangeFactory {
  createAdapter(exchangeName: string, config: ExchangeConfig): ExchangeAdapter;
}

class DefaultExchangeFactory implements ExchangeFactory {
  private adapterClasses: Map<string, typeof ExchangeAdapter> = new Map([
    ['binance', BinanceAdapter],
    ['gateio', GateIOAdapter],
    ['mexc', MEXCAdapter],
    ['mt5', MT5Adapter]
  ]);
  
  createAdapter(exchangeName: string, config: ExchangeConfig): ExchangeAdapter {
    const AdapterClass = this.adapterClasses.get(exchangeName.toLowerCase());
    
    if (!AdapterClass) {
      throw new Error(`Unsupported exchange: ${exchangeName}`);
    }
    
    return new AdapterClass(config);
  }
  
  getSupportedExchanges(): string[] {
    return Array.from(this.adapterClasses.keys());
  }
}

// Exchange Manager
class ExchangeManager {
  private adapters: Map<string, ExchangeAdapter> = new Map();
  private factory: ExchangeFactory;
  
  constructor(factory: ExchangeFactory = new DefaultExchangeFactory()) {
    this.factory = factory;
  }
  
  async addExchange(name: string, config: ExchangeConfig): Promise<void> {
    const adapter = this.factory.createAdapter(name, config);
    await this.validateConnection(adapter);
    this.adapters.set(name, adapter);
  }
  
  async fetchTickerFromAllExchanges(symbol: string): Promise<Map<string, Ticker>> {
    const results = new Map<string, Ticker>();
    
    const fetchPromises = Array.from(this.adapters.entries()).map(
      async ([exchangeName, adapter]) => {
        try {
          const ticker = await adapter.fetchTicker(symbol);
          results.set(exchangeName, ticker);
        } catch (error) {
          console.warn(`Failed to fetch ticker from ${exchangeName}:`, error);
        }
      }
    );
    
    await Promise.allSettled(fetchPromises);
    return results;
  }
  
  private async validateConnection(adapter: ExchangeAdapter): Promise<void> {
    try {
      await adapter.fetchBalance();
    } catch (error) {
      throw new Error(`Failed to validate exchange connection: ${error.message}`);
    }
  }
}
```

## 📊 Market Data Integration

### Data Aggregation Pattern
```typescript
interface MarketDataProvider {
  name: string;
  priority: number;
  fetchTicker(symbol: string): Promise<Ticker>;
  fetchOHLCV(symbol: string, timeframe: string): Promise<OHLCV[]>;
}

class MarketDataAggregator {
  private providers: MarketDataProvider[] = [];
  private cache: Cache;
  
  constructor(cache: Cache) {
    this.cache = cache;
  }
  
  addProvider(provider: MarketDataProvider): void {
    this.providers.push(provider);
    // Sort by priority (higher priority first)
    this.providers.sort((a, b) => b.priority - a.priority);
  }
  
  async fetchTicker(symbol: string): Promise<Ticker> {
    const cacheKey = `ticker:${symbol}`;
    
    // Try cache first
    const cached = await this.cache.get<Ticker>(cacheKey);
    if (cached && this.isFresh(cached.timestamp, 60000)) { // 1 minute TTL
      return cached;
    }
    
    // Try providers in priority order
    for (const provider of this.providers) {
      try {
        const ticker = await provider.fetchTicker(symbol);
        
        // Cache successful result
        await this.cache.set(cacheKey, ticker, 60);
        
        return ticker;
      } catch (error) {
        console.warn(`Provider ${provider.name} failed for ${symbol}:`, error);
        continue;
      }
    }
    
    throw new Error(`All providers failed for symbol: ${symbol}`);
  }
  
  async fetchTickerFromMultipleSources(symbol: string): Promise<Ticker[]> {
    const promises = this.providers.map(async provider => {
      try {
        return await provider.fetchTicker(symbol);
      } catch (error) {
        return null;
      }
    });
    
    const results = await Promise.allSettled(promises);
    return results
      .filter(r => r.status === 'fulfilled' && r.value !== null)
      .map(r => (r as PromiseFulfilledResult<Ticker>).value);
  }
  
  private isFresh(timestamp: Date, maxAgeMs: number): boolean {
    return Date.now() - timestamp.getTime() < maxAgeMs;
  }
}

// CoinMarketCap Provider
class CoinMarketCapProvider implements MarketDataProvider {
  name = 'coinmarketcap';
  priority = 2;
  
  private apiKey: string;
  private httpClient: AxiosInstance;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.httpClient = axios.create({
      baseURL: 'https://pro-api.coinmarketcap.com/v1',
      headers: {
        'X-CMC_PRO_API_KEY': apiKey
      },
      timeout: 10000
    });
  }
  
  async fetchTicker(symbol: string): Promise<Ticker> {
    const response = await this.httpClient.get('/cryptocurrency/quotes/latest', {
      params: {
        symbol: symbol.toUpperCase(),
        convert: 'USD'
      }
    });
    
    const data = response.data.data[symbol.toUpperCase()];
    return this.normalizeCMCData(data);
  }
  
  async fetchOHLCV(symbol: string, timeframe: string): Promise<OHLCV[]> {
    // CoinMarketCap doesn't provide OHLCV data in free tier
    throw new Error('OHLCV data not available from CoinMarketCap');
  }
  
  private normalizeCMCData(data: any): Ticker {
    const quote = data.quote.USD;
    return {
      symbol: data.symbol,
      price: quote.price,
      volume: quote.volume_24h,
      change24h: quote.change_24h,
      changePercent24h: quote.percent_change_24h,
      timestamp: new Date(data.last_updated)
    };
  }
}
```

### Real-time Data Streaming
```typescript
class RealTimeDataStreamer {
  private connections: Map<string, WebSocket> = new Map();
  private subscribers: Map<string, Set<DataSubscriber>> = new Map();
  private reconnectStrategies: Map<string, ReconnectStrategy> = new Map();
  
  async subscribeToSymbol(
    exchange: string,
    symbol: string,
    subscriber: DataSubscriber
  ): Promise<void> {
    const key = `${exchange}:${symbol}`;
    
    // Add subscriber
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(subscriber);
    
    // Create connection if not exists
    if (!this.connections.has(key)) {
      await this.createConnection(exchange, symbol);
    }
  }
  
  private async createConnection(exchange: string, symbol: string): Promise<void> {
    const key = `${exchange}:${symbol}`;
    const wsUrl = this.getWebSocketURL(exchange, symbol);
    
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      console.log(`WebSocket connected: ${key}`);
      this.sendSubscriptionMessage(ws, exchange, symbol);
    });
    
    ws.on('message', (data) => {
      this.handleMessage(key, data);
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${key}:`, error);
      this.handleConnectionError(key, error);
    });
    
    ws.on('close', () => {
      console.warn(`WebSocket closed: ${key}`);
      this.handleConnectionClose(key);
    });
    
    this.connections.set(key, ws);
    this.setupReconnectStrategy(key);
  }
  
  private handleMessage(key: string, data: Buffer): void {
    try {
      const parsed = JSON.parse(data.toString());
      const normalizedData = this.normalizeMessage(key, parsed);
      
      // Broadcast to all subscribers
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.forEach(subscriber => {
          try {
            subscriber.onData(normalizedData);
          } catch (error) {
            console.error('Subscriber error:', error);
          }
        });
      }
    } catch (error) {
      console.error(`Failed to parse message for ${key}:`, error);
    }
  }
  
  private handleConnectionError(key: string, error: Error): void {
    const strategy = this.reconnectStrategies.get(key);
    if (strategy) {
      strategy.onError(error);
    }
  }
  
  private handleConnectionClose(key: string): void {
    this.connections.delete(key);
    
    const strategy = this.reconnectStrategies.get(key);
    if (strategy && strategy.shouldReconnect()) {
      setTimeout(() => {
        const [exchange, symbol] = key.split(':');
        this.createConnection(exchange, symbol);
      }, strategy.getRetryDelay());
    }
  }
}

interface DataSubscriber {
  onData(data: any): void;
  onError?(error: Error): void;
}

class ReconnectStrategy {
  private attempts = 0;
  private maxAttempts = 10;
  private baseDelay = 1000;
  private maxDelay = 30000;
  
  shouldReconnect(): boolean {
    return this.attempts < this.maxAttempts;
  }
  
  getRetryDelay(): number {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.attempts),
      this.maxDelay
    );
    this.attempts++;
    return delay;
  }
  
  onError(error: Error): void {
    console.warn(`Connection error (attempt ${this.attempts}):`, error);
  }
  
  reset(): void {
    this.attempts = 0;
  }
}
```

## 🔄 Message Queue Integration

### Event-Driven Architecture
```typescript
// Event Bus Implementation
interface EventBus {
  publish(topic: string, event: any): Promise<void>;
  subscribe(topic: string, handler: EventHandler): Promise<void>;
  unsubscribe(topic: string, handler: EventHandler): Promise<void>;
}

type EventHandler = (event: any) => Promise<void>;

class RedisEventBus implements EventBus {
  private redis: Redis;
  private subscribers: Map<string, Set<EventHandler>> = new Map();
  
  constructor(redis: Redis) {
    this.redis = redis;
    this.setupSubscriber();
  }
  
  async publish(topic: string, event: any): Promise<void> {
    const message = {
      id: uuid.v4(),
      timestamp: new Date().toISOString(),
      topic,
      data: event
    };
    
    await this.redis.publish(topic, JSON.stringify(message));
  }
  
  async subscribe(topic: string, handler: EventHandler): Promise<void> {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
      await this.redis.subscribe(topic);
    }
    
    this.subscribers.get(topic)!.add(handler);
  }
  
  async unsubscribe(topic: string, handler: EventHandler): Promise<void> {
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.subscribers.delete(topic);
        await this.redis.unsubscribe(topic);
      }
    }
  }
  
  private setupSubscriber(): void {
    this.redis.on('message', async (topic, message) => {
      const handlers = this.subscribers.get(topic);
      if (handlers) {
        const parsedMessage = JSON.parse(message);
        
        // Execute handlers in parallel
        const promises = Array.from(handlers).map(handler =>
          this.executeHandler(handler, parsedMessage.data)
        );
        
        await Promise.allSettled(promises);
      }
    });
  }
  
  private async executeHandler(
    handler: EventHandler, 
    data: any
  ): Promise<void> {
    try {
      await handler(data);
    } catch (error) {
      console.error('Event handler error:', error);
      // Could implement dead letter queue here
    }
  }
}

// Event Types
enum EventTypes {
  TRADE_EXECUTED = 'trade.executed',
  PRICE_UPDATED = 'price.updated',
  BALANCE_CHANGED = 'balance.changed',
  STRATEGY_TRIGGERED = 'strategy.triggered',
  RISK_LIMIT_EXCEEDED = 'risk.limit.exceeded'
}

// Event Publishers
class TradingEventPublisher {
  constructor(private eventBus: EventBus) {}
  
  async publishTradeExecuted(trade: Trade): Promise<void> {
    await this.eventBus.publish(EventTypes.TRADE_EXECUTED, {
      tradeId: trade.id,
      userId: trade.userId,
      symbol: trade.symbol,
      side: trade.side,
      price: trade.price,
      quantity: trade.quantity,
      timestamp: trade.executedAt
    });
  }
  
  async publishPriceUpdate(ticker: Ticker): Promise<void> {
    await this.eventBus.publish(EventTypes.PRICE_UPDATED, {
      symbol: ticker.symbol,
      price: ticker.price,
      change: ticker.change24h,
      volume: ticker.volume,
      timestamp: ticker.timestamp
    });
  }
}

// Event Subscribers
class AnalyticsEventSubscriber {
  constructor(private eventBus: EventBus) {
    this.setupSubscriptions();
  }
  
  private async setupSubscriptions(): Promise<void> {
    await this.eventBus.subscribe(
      EventTypes.TRADE_EXECUTED,
      this.handleTradeExecuted.bind(this)
    );
    
    await this.eventBus.subscribe(
      EventTypes.PRICE_UPDATED,
      this.handlePriceUpdate.bind(this)
    );
  }
  
  private async handleTradeExecuted(event: any): Promise<void> {
    // Update trading analytics
    await this.updateTradingMetrics(event);
    await this.updatePortfolioMetrics(event.userId);
  }
  
  private async handlePriceUpdate(event: any): Promise<void> {
    // Update market analytics
    await this.updateMarketMetrics(event);
    await this.checkPriceAlerts(event);
  }
}
```

## 🔌 External Service Integration

### Notification Service Integration
```typescript
// Notification Service
interface NotificationProvider {
  send(recipient: string, message: NotificationMessage): Promise<void>;
}

class EmailNotificationProvider implements NotificationProvider {
  private transporter: nodemailer.Transporter;
  
  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password
      }
    });
  }
  
  async send(recipient: string, message: NotificationMessage): Promise<void> {
    await this.transporter.sendMail({
      from: message.from,
      to: recipient,
      subject: message.subject,
      html: message.html,
      text: message.text
    });
  }
}

class SMSNotificationProvider implements NotificationProvider {
  private twilioClient: TwilioClient;
  
  constructor(config: TwilioConfig) {
    this.twilioClient = new TwilioClient(config.accountSid, config.authToken);
  }
  
  async send(recipient: string, message: NotificationMessage): Promise<void> {
    await this.twilioClient.messages.create({
      body: message.text,
      from: message.from,
      to: recipient
    });
  }
}

class NotificationService {
  private providers: Map<string, NotificationProvider> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  
  addProvider(name: string, provider: NotificationProvider): void {
    this.providers.set(name, provider);
  }
  
  async sendNotification(
    type: NotificationType,
    recipient: string,
    data: any,
    channels: string[] = ['email']
  ): Promise<void> {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`No template found for notification type: ${type}`);
    }
    
    const message = template.render(data);
    
    const sendPromises = channels.map(async channel => {
      const provider = this.providers.get(channel);
      if (provider) {
        try {
          await provider.send(recipient, message);
        } catch (error) {
          console.error(`Failed to send ${type} via ${channel}:`, error);
        }
      }
    });
    
    await Promise.allSettled(sendPromises);
  }
}

// Usage
enum NotificationType {
  TRADE_EXECUTED = 'trade_executed',
  PRICE_ALERT = 'price_alert',
  RISK_LIMIT_EXCEEDED = 'risk_limit_exceeded',
  STRATEGY_STOPPED = 'strategy_stopped'
}

const notificationService = new NotificationService();

// Setup providers
notificationService.addProvider('email', new EmailNotificationProvider(emailConfig));
notificationService.addProvider('sms', new SMSNotificationProvider(twilioConfig));

// Send notification
await notificationService.sendNotification(
  NotificationType.TRADE_EXECUTED,
  'user@example.com',
  {
    symbol: 'BTC/USDT',
    side: 'BUY',
    price: 45000,
    quantity: 0.1,
    pnl: 125.50
  },
  ['email', 'sms']
);
```

### Payment Gateway Integration
```typescript
// Payment Service for subscription management
interface PaymentProvider {
  createCustomer(customerData: CustomerData): Promise<string>;
  createSubscription(customerId: string, planId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  processPayment(paymentData: PaymentData): Promise<PaymentResult>;
}

class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;
  
  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, { apiVersion: '2022-11-15' });
  }
  
  async createCustomer(customerData: CustomerData): Promise<string> {
    const customer = await this.stripe.customers.create({
      email: customerData.email,
      name: customerData.name,
      metadata: {
        userId: customerData.userId
      }
    });
    
    return customer.id;
  }
  
  async createSubscription(
    customerId: string, 
    planId: string
  ): Promise<Subscription> {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
    
    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
    };
  }
  
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(paymentData.amount * 100), // Convert to cents
      currency: paymentData.currency.toLowerCase(),
      customer: paymentData.customerId,
      metadata: {
        userId: paymentData.userId,
        type: paymentData.type
      }
    });
    
    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: paymentIntent.status
    };
  }
}

// Webhook handling for payment events
class PaymentWebhookHandler {
  private stripe: Stripe;
  private eventBus: EventBus;
  
  constructor(stripe: Stripe, eventBus: EventBus) {
    this.stripe = stripe;
    this.eventBus = eventBus;
  }
  
  async handleWebhook(
    body: string, 
    signature: string, 
    endpointSecret: string
  ): Promise<void> {
    let event: Stripe.Event;
    
    try {
      event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;
    }
  }
  
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.eventBus.publish('payment.succeeded', {
      paymentId: paymentIntent.id,
      customerId: paymentIntent.customer,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
  }
}
```

## 🔧 Integration Resilience Patterns

### Circuit Breaker Implementation
```typescript
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private halfOpenMaxCalls: number = 3
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new Error('Circuit breaker is OPEN');
      }
      
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
    }
    
    if (this.state === CircuitState.HALF_OPEN && this.successCount >= this.halfOpenMaxCalls) {
      throw new Error('Circuit breaker is HALF_OPEN - max calls exceeded');
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
  
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.halfOpenMaxCalls) {
        this.state = CircuitState.CLOSED;
      }
    }
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}
```

### Bulkhead Pattern
```typescript
class BulkheadExecutor {
  private pools: Map<string, ResourcePool> = new Map();
  
  createPool(name: string, config: PoolConfig): void {
    this.pools.set(name, new ResourcePool(config));
  }
  
  async execute<T>(
    poolName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const pool = this.pools.get(poolName);
    if (!pool) {
      throw new Error(`Pool not found: ${poolName}`);
    }
    
    return pool.execute(operation);
  }
}

class ResourcePool {
  private activeCount = 0;
  private queue: Array<() => void> = [];
  
  constructor(private config: PoolConfig) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.config.maxConcurrent) {
      await this.waitForSlot();
    }
    
    this.activeCount++;
    
    try {
      return await Promise.race([
        operation(),
        this.createTimeoutPromise()
      ]);
    } finally {
      this.activeCount--;
      this.notifyNext();
    }
  }
  
  private waitForSlot(): Promise<void> {
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }
  
  private notifyNext(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    }
  }
  
  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timeout'));
      }, this.config.timeout);
    });
  }
}

// Usage
const bulkhead = new BulkheadExecutor();

// Separate pools for different types of operations
bulkhead.createPool('exchange_api', { maxConcurrent: 10, timeout: 30000 });
bulkhead.createPool('database', { maxConcurrent: 50, timeout: 10000 });
bulkhead.createPool('notifications', { maxConcurrent: 5, timeout: 15000 });

// Execute operations in isolated pools
const ticker = await bulkhead.execute('exchange_api', () => 
  exchangeAdapter.fetchTicker('BTC/USDT')
);
```

---
*Last updated: 10/08/2025*
*Version: 1.0*
