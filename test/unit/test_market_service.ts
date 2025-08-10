import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

jest.mock('ccxt', () => ({
  binance: jest.fn(() => ({
    fetchTicker: jest.fn(),
    fetchOHLCV: jest.fn(),
  })),
  gateio: jest.fn(() => ({
    fetchTicker: jest.fn(),
    fetchOHLCV: jest.fn(),
  })),
  mexc: jest.fn(() => ({
    fetchTicker: jest.fn(),
    fetchOHLCV: jest.fn(),
  })),
}));

// Import the module to test
import { getMarketData, getOHLCVData, getTickerData } from '../../server/services/market';

describe('Market Service', () => {
  let mockRedisClient: any;
  let mockBinance: any;
  let mockGateio: any;
  let mockMexc: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockRedisClient = {
      connect: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      disconnect: jest.fn(),
    };

    mockBinance = {
      fetchTicker: jest.fn(),
      fetchOHLCV: jest.fn(),
    };

    mockGateio = {
      fetchTicker: jest.fn(),
      fetchOHLCV: jest.fn(),
    };

    mockMexc = {
      fetchTicker: jest.fn(),
      fetchOHLCV: jest.fn(),
    };
  });

  describe('getMarketData', () => {
    it('should return market data from cache when available', async () => {
      const mockCachedData = JSON.stringify({
        BTC: { price: 50000, change: 1000 },
        ETH: { price: 3000, change: -50 },
      });

      mockRedisClient.get.mockResolvedValue(mockCachedData);

      const result = await getMarketData();

      expect(mockRedisClient.get).toHaveBeenCalledWith('market_data');
      expect(result).toEqual(JSON.parse(mockCachedData));
    });

    it('should fetch fresh data when cache is empty', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      // Mock exchange responses
      mockBinance.fetchTicker.mockResolvedValue({
        symbol: 'BTC/USDT',
        last: 50000,
        change: 1000,
        percentage: 2.0,
      });

      mockGateio.fetchTicker.mockResolvedValue({
        symbol: 'ETH/USDT',
        last: 3000,
        change: -50,
        percentage: -1.64,
      });

      const result = await getMarketData();

      expect(mockRedisClient.set).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));

      await expect(getMarketData()).rejects.toThrow('Redis connection failed');
    });
  });

  describe('getOHLCVData', () => {
    it('should return OHLCV data for valid symbol and timeframe', async () => {
      const mockOHLCVData = [
        [1640995200000, 50000, 50200, 49900, 50100, 100],
        [1640995260000, 50100, 50300, 50050, 50200, 150],
      ];

      mockBinance.fetchOHLCV.mockResolvedValue(mockOHLCVData);

      const result = await getOHLCVData('BTC/USDT', '1h', 100);

      expect(mockBinance.fetchOHLCV).toHaveBeenCalledWith('BTC/USDT', '1h', undefined, 100);
      expect(result).toEqual(mockOHLCVData);
    });

    it('should handle different timeframes correctly', async () => {
      const mockOHLCVData = [
        [1640995200000, 50000, 50200, 49900, 50100, 100],
      ];

      mockBinance.fetchOHLCV.mockResolvedValue(mockOHLCVData);

      await getOHLCVData('BTC/USDT', '4h', 50);

      expect(mockBinance.fetchOHLCV).toHaveBeenCalledWith('BTC/USDT', '4h', undefined, 50);
    });

    it('should handle exchange errors', async () => {
      mockBinance.fetchOHLCV.mockRejectedValue(new Error('Exchange API error'));

      await expect(getOHLCVData('BTC/USDT', '1h', 100)).rejects.toThrow('Exchange API error');
    });

    it('should validate input parameters', async () => {
      await expect(getOHLCVData('', '1h', 100)).rejects.toThrow();
      await expect(getOHLCVData('BTC/USDT', '', 100)).rejects.toThrow();
      await expect(getOHLCVData('BTC/USDT', '1h', -1)).rejects.toThrow();
    });
  });

  describe('getTickerData', () => {
    it('should return ticker data for valid symbol', async () => {
      const mockTickerData = {
        symbol: 'BTC/USDT',
        last: 50000,
        bid: 49990,
        ask: 50010,
        volume: 1000,
        change: 1000,
        percentage: 2.0,
      };

      mockBinance.fetchTicker.mockResolvedValue(mockTickerData);

      const result = await getTickerData('BTC/USDT');

      expect(mockBinance.fetchTicker).toHaveBeenCalledWith('BTC/USDT');
      expect(result).toEqual(mockTickerData);
    });

    it('should handle multiple exchanges', async () => {
      const mockTickerData = {
        symbol: 'ETH/USDT',
        last: 3000,
        bid: 2995,
        ask: 3005,
        volume: 500,
        change: -50,
        percentage: -1.64,
      };

      // Mock different exchanges
      mockBinance.fetchTicker.mockRejectedValue(new Error('Binance error'));
      mockGateio.fetchTicker.mockResolvedValue(mockTickerData);

      const result = await getTickerData('ETH/USDT');

      expect(mockGateio.fetchTicker).toHaveBeenCalledWith('ETH/USDT');
      expect(result).toEqual(mockTickerData);
    });

    it('should throw error when all exchanges fail', async () => {
      mockBinance.fetchTicker.mockRejectedValue(new Error('Binance error'));
      mockGateio.fetchTicker.mockRejectedValue(new Error('Gate.io error'));
      mockMexc.fetchTicker.mockRejectedValue(new Error('MEXC error'));

      await expect(getTickerData('BTC/USDT')).rejects.toThrow('All exchanges failed');
    });

    it('should validate symbol parameter', async () => {
      await expect(getTickerData('')).rejects.toThrow();
      await expect(getTickerData('invalid-symbol')).rejects.toThrow();
    });
  });

  describe('Data Validation', () => {
    it('should validate OHLCV data structure', async () => {
      const invalidOHLCVData = [
        [1640995200000, 50000], // Missing data points
      ];

      mockBinance.fetchOHLCV.mockResolvedValue(invalidOHLCVData);

      const result = await getOHLCVData('BTC/USDT', '1h', 1);

      // Should handle invalid data gracefully
      expect(result).toEqual(invalidOHLCVData);
    });

    it('should validate ticker data structure', async () => {
      const invalidTickerData = {
        symbol: 'BTC/USDT',
        // Missing required fields
      };

      mockBinance.fetchTicker.mockResolvedValue(invalidTickerData);

      const result = await getTickerData('BTC/USDT');

      // Should handle invalid data gracefully
      expect(result).toEqual(invalidTickerData);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting from exchanges', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitExceeded';

      mockBinance.fetchTicker.mockRejectedValue(rateLimitError);

      await expect(getTickerData('BTC/USDT')).rejects.toThrow('Rate limit exceeded');
    });

    it('should retry with different exchange on rate limit', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitExceeded';

      const mockTickerData = {
        symbol: 'BTC/USDT',
        last: 50000,
        bid: 49990,
        ask: 50010,
        volume: 1000,
        change: 1000,
        percentage: 2.0,
      };

      mockBinance.fetchTicker.mockRejectedValue(rateLimitError);
      mockGateio.fetchTicker.mockResolvedValue(mockTickerData);

      const result = await getTickerData('BTC/USDT');

      expect(mockGateio.fetchTicker).toHaveBeenCalledWith('BTC/USDT');
      expect(result).toEqual(mockTickerData);
    });
  });

  describe('Cache Management', () => {
    it('should set cache with proper expiration', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const mockTickerData = {
        symbol: 'BTC/USDT',
        last: 50000,
        bid: 49990,
        ask: 50010,
        volume: 1000,
        change: 1000,
        percentage: 2.0,
      };

      mockBinance.fetchTicker.mockResolvedValue(mockTickerData);

      await getMarketData();

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'market_data',
        expect.any(String),
        'EX',
        300 // 5 minutes expiration
      );
    });

    it('should handle cache set failures gracefully', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockRejectedValue(new Error('Cache set failed'));

      const mockTickerData = {
        symbol: 'BTC/USDT',
        last: 50000,
        bid: 49990,
        ask: 50010,
        volume: 1000,
        change: 1000,
        percentage: 2.0,
      };

      mockBinance.fetchTicker.mockResolvedValue(mockTickerData);

      // Should not throw error when cache set fails
      const result = await getMarketData();
      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockBinance.fetchTicker.mockRejectedValue(timeoutError);

      await expect(getTickerData('BTC/USDT')).rejects.toThrow('Request timeout');
    });

    it('should handle invalid JSON in cache', async () => {
      mockRedisClient.get.mockResolvedValue('invalid-json');

      await expect(getMarketData()).rejects.toThrow();
    });

    it('should handle empty response from exchanges', async () => {
      mockBinance.fetchTicker.mockResolvedValue(null);

      await expect(getTickerData('BTC/USDT')).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should complete requests within reasonable time', async () => {
      const startTime = Date.now();

      mockBinance.fetchTicker.mockResolvedValue({
        symbol: 'BTC/USDT',
        last: 50000,
        bid: 49990,
        ask: 50010,
        volume: 1000,
        change: 1000,
        percentage: 2.0,
      });

      await getTickerData('BTC/USDT');

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should complete within 5 seconds
      expect(executionTime).toBeLessThan(5000);
    });
  });
});
