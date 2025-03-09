import { Ticker, Candle } from '../types';

export const mockMarkets = [
  'BTC/USDT',
  'ETH/USDT', 
  'BNB/USDT',
  'XRP/USDT',
  'SOL/USDT',
  'DOT/USDT',
  'DOGE/USDT',
  'ADA/USDT',
  'MATIC/USDT',
  'LTC/USDT'
];

export const mockTickers: Record<string, Ticker> = {
  'BTC/USDT': {
    symbol: 'BTC/USDT',
    price: 43250.50,
    change: 2.35,
    volume: 1250.45
  },
  'ETH/USDT': {
    symbol: 'ETH/USDT',
    price: 2280.75,
    change: -1.20,
    volume: 15420.30
  },
  'BNB/USDT': {
    symbol: 'BNB/USDT',
    price: 312.45,
    change: 0.85,
    volume: 5240.20
  },
  'XRP/USDT': {
    symbol: 'XRP/USDT',
    price: 0.62,
    change: -0.45,
    volume: 85420.15
  },
  'SOL/USDT': {
    symbol: 'SOL/USDT',
    price: 108.30,
    change: 5.20,
    volume: 12540.80
  }
};

export const mockOHLCV: Record<string, Candle[]> = {
  'BTC/USDT': [
    { time: Date.now() - 3600000 * 3, open: 43100, high: 43400, low: 43000, close: 43200, volume: 1200 },
    { time: Date.now() - 3600000 * 2, open: 43200, high: 43500, low: 43100, close: 43300, volume: 1300 },
    { time: Date.now() - 3600000, open: 43300, high: 43600, low: 43200, close: 43400, volume: 1400 },
    { time: Date.now(), open: 43400, high: 43700, low: 43300, close: 43500, volume: 1500 }
  ]
};

export function generateMockOHLCV(symbol: string, count: number = 100): Candle[] {
  const candles: Candle[] = [];
  let lastClose = mockTickers[symbol]?.price || 100;
  
  for (let i = 0; i < count; i++) {
    const time = Date.now() - (3600000 * (count - i));
    const volatility = lastClose * 0.02;
    const open = lastClose;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    const volume = Math.random() * 1000 + 500;
    
    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume
    });
    
    lastClose = close;
  }
  
  return candles;
}
