import { describe, it, expect } from '@jest/globals';

// Import types to test
import {
  Currency,
  OHLCVData,
  TradingSignal,
  Order,
  Position,
  ExchangeConfig,
  MarketData,
  User,
  BotConfig,
  StrategyConfig,
  BacktestResult,
  PerformanceMetrics
} from '../../shared/types';

describe('Shared Types', () => {
  describe('Currency Interface', () => {
    it('should validate Currency interface structure', () => {
      const validCurrency: Currency = {
        symbol: 'BTC',
        base: 'USDT',
        close: 50000.00,
        change: 1500.00,
        percentChange: 3.10,
        volume: 1000000,
        high: 51000.00,
        low: 49000.00,
        open: 48500.00
      };

      expect(validCurrency.symbol).toBe('BTC');
      expect(validCurrency.base).toBe('USDT');
      expect(validCurrency.close).toBe(50000.00);
      expect(validCurrency.change).toBe(1500.00);
      expect(validCurrency.percentChange).toBe(3.10);
      expect(validCurrency.volume).toBe(1000000);
      expect(validCurrency.high).toBe(51000.00);
      expect(validCurrency.low).toBe(49000.00);
      expect(validCurrency.open).toBe(48500.00);
    });

    it('should handle negative values correctly', () => {
      const negativeCurrency: Currency = {
        symbol: 'ETH',
        base: 'USDT',
        close: 3000.00,
        change: -50.00,
        percentChange: -1.64,
        volume: 500000,
        high: 3050.00,
        low: 2950.00,
        open: 3050.00
      };

      expect(negativeCurrency.change).toBe(-50.00);
      expect(negativeCurrency.percentChange).toBe(-1.64);
    });
  });

  describe('OHLCVData Interface', () => {
    it('should validate OHLCVData interface structure', () => {
      const validOHLCV: OHLCVData = {
        timestamp: 1640995200000,
        open: 50000.00,
        high: 50200.00,
        low: 49900.00,
        close: 50100.00,
        volume: 1000000
      };

      expect(validOHLCV.timestamp).toBe(1640995200000);
      expect(validOHLCV.open).toBe(50000.00);
      expect(validOHLCV.high).toBe(50200.00);
      expect(validOHLCV.low).toBe(49900.00);
      expect(validOHLCV.close).toBe(50100.00);
      expect(validOHLCV.volume).toBe(1000000);
    });

    it('should handle zero values', () => {
      const zeroOHLCV: OHLCVData = {
        timestamp: 1640995200000,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0
      };

      expect(zeroOHLCV.open).toBe(0);
      expect(zeroOHLCV.volume).toBe(0);
    });
  });

  describe('TradingSignal Interface', () => {
    it('should validate TradingSignal interface structure', () => {
      const validSignal: TradingSignal = {
        symbol: 'BTC/USDT',
        signalType: 'BUY',
        price: 50000.00,
        timestamp: 1640995200000,
        confidence: 0.85,
        strategy: 'RSI_OVERSOLD',
        strength: 'STRONG',
        stopLoss: 48000.00,
        takeProfit: 52000.00
      };

      expect(validSignal.symbol).toBe('BTC/USDT');
      expect(validSignal.signalType).toBe('BUY');
      expect(validSignal.price).toBe(50000.00);
      expect(validSignal.timestamp).toBe(1640995200000);
      expect(validSignal.confidence).toBe(0.85);
      expect(validSignal.strategy).toBe('RSI_OVERSOLD');
      expect(validSignal.strength).toBe('STRONG');
      expect(validSignal.stopLoss).toBe(48000.00);
      expect(validSignal.takeProfit).toBe(52000.00);
    });

    it('should validate signal types', () => {
      const buySignal: TradingSignal = {
        symbol: 'BTC/USDT',
        signalType: 'BUY',
        price: 50000.00,
        timestamp: 1640995200000,
        confidence: 0.85,
        strategy: 'RSI_OVERSOLD',
        strength: 'STRONG'
      };

      const sellSignal: TradingSignal = {
        symbol: 'BTC/USDT',
        signalType: 'SELL',
        price: 50000.00,
        timestamp: 1640995200000,
        confidence: 0.75,
        strategy: 'RSI_OVERBOUGHT',
        strength: 'MEDIUM'
      };

      expect(buySignal.signalType).toBe('BUY');
      expect(sellSignal.signalType).toBe('SELL');
    });
  });

  describe('Order Interface', () => {
    it('should validate Order interface structure', () => {
      const validOrder: Order = {
        id: 'order_123',
        symbol: 'BTC/USDT',
        type: 'LIMIT',
        side: 'BUY',
        amount: 0.1,
        price: 50000.00,
        status: 'PENDING',
        timestamp: 1640995200000,
        filledAmount: 0,
        remainingAmount: 0.1,
        averagePrice: 0,
        cost: 0,
        fee: 0,
        feeCurrency: 'USDT'
      };

      expect(validOrder.id).toBe('order_123');
      expect(validOrder.symbol).toBe('BTC/USDT');
      expect(validOrder.type).toBe('LIMIT');
      expect(validOrder.side).toBe('BUY');
      expect(validOrder.amount).toBe(0.1);
      expect(validOrder.price).toBe(50000.00);
      expect(validOrder.status).toBe('PENDING');
    });

    it('should handle different order types', () => {
      const marketOrder: Order = {
        id: 'order_456',
        symbol: 'ETH/USDT',
        type: 'MARKET',
        side: 'SELL',
        amount: 1.0,
        price: 0, // Market orders don't have a specific price
        status: 'FILLED',
        timestamp: 1640995200000,
        filledAmount: 1.0,
        remainingAmount: 0,
        averagePrice: 3000.00,
        cost: 3000.00,
        fee: 3.00,
        feeCurrency: 'USDT'
      };

      expect(marketOrder.type).toBe('MARKET');
      expect(marketOrder.status).toBe('FILLED');
      expect(marketOrder.filledAmount).toBe(1.0);
    });
  });

  describe('Position Interface', () => {
    it('should validate Position interface structure', () => {
      const validPosition: Position = {
        symbol: 'BTC/USDT',
        side: 'LONG',
        size: 0.5,
        entryPrice: 50000.00,
        currentPrice: 51000.00,
        unrealizedPnl: 500.00,
        realizedPnl: 0,
        timestamp: 1640995200000,
        leverage: 1,
        margin: 25000.00,
        liquidationPrice: 0
      };

      expect(validPosition.symbol).toBe('BTC/USDT');
      expect(validPosition.side).toBe('LONG');
      expect(validPosition.size).toBe(0.5);
      expect(validPosition.entryPrice).toBe(50000.00);
      expect(validPosition.currentPrice).toBe(51000.00);
      expect(validPosition.unrealizedPnl).toBe(500.00);
    });

    it('should handle short positions', () => {
      const shortPosition: Position = {
        symbol: 'ETH/USDT',
        side: 'SHORT',
        size: 2.0,
        entryPrice: 3000.00,
        currentPrice: 2900.00,
        unrealizedPnl: 200.00,
        realizedPnl: 0,
        timestamp: 1640995200000,
        leverage: 2,
        margin: 3000.00,
        liquidationPrice: 4500.00
      };

      expect(shortPosition.side).toBe('SHORT');
      expect(shortPosition.leverage).toBe(2);
      expect(shortPosition.unrealizedPnl).toBe(200.00);
    });
  });

  describe('ExchangeConfig Interface', () => {
    it('should validate ExchangeConfig interface structure', () => {
      const validConfig: ExchangeConfig = {
        name: 'binance',
        apiKey: 'test_api_key',
        secretKey: 'test_secret_key',
        sandbox: true,
        rateLimit: 1200,
        timeout: 30000,
        enableRateLimit: true
      };

      expect(validConfig.name).toBe('binance');
      expect(validConfig.apiKey).toBe('test_api_key');
      expect(validConfig.secretKey).toBe('test_secret_key');
      expect(validConfig.sandbox).toBe(true);
      expect(validConfig.rateLimit).toBe(1200);
      expect(validConfig.timeout).toBe(30000);
      expect(validConfig.enableRateLimit).toBe(true);
    });
  });

  describe('MarketData Interface', () => {
    it('should validate MarketData interface structure', () => {
      const validMarketData: MarketData = {
        symbol: 'BTC/USDT',
        price: 50000.00,
        change: 1500.00,
        percentChange: 3.10,
        volume: 1000000,
        high24h: 51000.00,
        low24h: 49000.00,
        marketCap: 1000000000000,
        timestamp: 1640995200000
      };

      expect(validMarketData.symbol).toBe('BTC/USDT');
      expect(validMarketData.price).toBe(50000.00);
      expect(validMarketData.change).toBe(1500.00);
      expect(validMarketData.percentChange).toBe(3.10);
      expect(validMarketData.volume).toBe(1000000);
    });
  });

  describe('User Interface', () => {
    it('should validate User interface structure', () => {
      const validUser: User = {
        id: 'user_123',
        username: 'trader123',
        email: 'trader@example.com',
        createdAt: 1640995200000,
        updatedAt: 1640995200000,
        isActive: true,
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'UTC'
        }
      };

      expect(validUser.id).toBe('user_123');
      expect(validUser.username).toBe('trader123');
      expect(validUser.email).toBe('trader@example.com');
      expect(validUser.isActive).toBe(true);
      expect(validUser.preferences.theme).toBe('dark');
    });
  });

  describe('BotConfig Interface', () => {
    it('should validate BotConfig interface structure', () => {
      const validBotConfig: BotConfig = {
        id: 'bot_123',
        name: 'RSI Strategy Bot',
        userId: 'user_123',
        exchange: 'binance',
        symbol: 'BTC/USDT',
        strategy: 'RSI_STRATEGY',
        isActive: true,
        createdAt: 1640995200000,
        updatedAt: 1640995200000,
        config: {
          rsiPeriod: 14,
          oversoldThreshold: 30,
          overboughtThreshold: 70,
          stopLoss: 0.02,
          takeProfit: 0.05
        }
      };

      expect(validBotConfig.id).toBe('bot_123');
      expect(validBotConfig.name).toBe('RSI Strategy Bot');
      expect(validBotConfig.exchange).toBe('binance');
      expect(validBotConfig.symbol).toBe('BTC/USDT');
      expect(validBotConfig.isActive).toBe(true);
      expect(validBotConfig.config.rsiPeriod).toBe(14);
    });
  });

  describe('StrategyConfig Interface', () => {
    it('should validate StrategyConfig interface structure', () => {
      const validStrategyConfig: StrategyConfig = {
        name: 'RSI_STRATEGY',
        description: 'RSI-based trading strategy',
        parameters: {
          rsiPeriod: 14,
          oversoldThreshold: 30,
          overboughtThreshold: 70
        },
        riskManagement: {
          stopLoss: 0.02,
          takeProfit: 0.05,
          maxPositionSize: 0.1
        },
        timeframes: ['1h', '4h', '1d'],
        exchanges: ['binance', 'gateio']
      };

      expect(validStrategyConfig.name).toBe('RSI_STRATEGY');
      expect(validStrategyConfig.description).toBe('RSI-based trading strategy');
      expect(validStrategyConfig.parameters.rsiPeriod).toBe(14);
      expect(validStrategyConfig.riskManagement.stopLoss).toBe(0.02);
      expect(validStrategyConfig.timeframes).toContain('1h');
      expect(validStrategyConfig.exchanges).toContain('binance');
    });
  });

  describe('BacktestResult Interface', () => {
    it('should validate BacktestResult interface structure', () => {
      const validBacktestResult: BacktestResult = {
        id: 'backtest_123',
        botId: 'bot_123',
        startDate: 1640995200000,
        endDate: 1643587200000,
        initialBalance: 10000.00,
        finalBalance: 11500.00,
        totalReturn: 0.15,
        totalTrades: 50,
        winningTrades: 30,
        losingTrades: 20,
        winRate: 0.6,
        maxDrawdown: 0.05,
        sharpeRatio: 1.2,
        trades: [],
        performanceMetrics: {
          totalReturn: 0.15,
          annualizedReturn: 0.18,
          volatility: 0.12,
          sharpeRatio: 1.2,
          maxDrawdown: 0.05,
          calmarRatio: 3.6
        }
      };

      expect(validBacktestResult.id).toBe('backtest_123');
      expect(validBacktestResult.botId).toBe('bot_123');
      expect(validBacktestResult.initialBalance).toBe(10000.00);
      expect(validBacktestResult.finalBalance).toBe(11500.00);
      expect(validBacktestResult.totalReturn).toBe(0.15);
      expect(validBacktestResult.winRate).toBe(0.6);
      expect(validBacktestResult.performanceMetrics.sharpeRatio).toBe(1.2);
    });
  });

  describe('PerformanceMetrics Interface', () => {
    it('should validate PerformanceMetrics interface structure', () => {
      const validMetrics: PerformanceMetrics = {
        totalReturn: 0.15,
        annualizedReturn: 0.18,
        volatility: 0.12,
        sharpeRatio: 1.2,
        maxDrawdown: 0.05,
        calmarRatio: 3.6,
        sortinoRatio: 1.5,
        informationRatio: 0.8,
        beta: 0.9,
        alpha: 0.02
      };

      expect(validMetrics.totalReturn).toBe(0.15);
      expect(validMetrics.annualizedReturn).toBe(0.18);
      expect(validMetrics.volatility).toBe(0.12);
      expect(validMetrics.sharpeRatio).toBe(1.2);
      expect(validMetrics.maxDrawdown).toBe(0.05);
      expect(validMetrics.calmarRatio).toBe(3.6);
    });

    it('should handle negative performance metrics', () => {
      const negativeMetrics: PerformanceMetrics = {
        totalReturn: -0.05,
        annualizedReturn: -0.06,
        volatility: 0.15,
        sharpeRatio: -0.3,
        maxDrawdown: 0.08,
        calmarRatio: -0.75,
        sortinoRatio: -0.4,
        informationRatio: -0.2,
        beta: 1.1,
        alpha: -0.01
      };

      expect(negativeMetrics.totalReturn).toBe(-0.05);
      expect(negativeMetrics.sharpeRatio).toBe(-0.3);
      expect(negativeMetrics.calmarRatio).toBe(-0.75);
    });
  });

  describe('Type Validation', () => {
    it('should ensure all required fields are present', () => {
      // This test ensures TypeScript compilation works correctly
      const currency: Currency = {
        symbol: 'BTC',
        base: 'USDT',
        close: 50000.00,
        change: 1500.00,
        percentChange: 3.10,
        volume: 1000000,
        high: 51000.00,
        low: 49000.00,
        open: 48500.00
      };

      // All required fields should be accessible
      expect(typeof currency.symbol).toBe('string');
      expect(typeof currency.close).toBe('number');
      expect(typeof currency.change).toBe('number');
      expect(typeof currency.percentChange).toBe('number');
    });

    it('should handle optional fields correctly', () => {
      const minimalCurrency: Currency = {
        symbol: 'BTC',
        base: 'USDT',
        close: 50000.00,
        change: 1500.00,
        percentChange: 3.10
      };

      // Optional fields should be undefined if not provided
      expect(minimalCurrency.volume).toBeUndefined();
      expect(minimalCurrency.high).toBeUndefined();
      expect(minimalCurrency.low).toBeUndefined();
      expect(minimalCurrency.open).toBeUndefined();
    });
  });
});
