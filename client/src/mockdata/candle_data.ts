type Candle = {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    ema10?: number;
    sma20?: number;
    sma50?: number;
    sma200?: number;
    adx?: number;
  };

export const mockData: Candle[] = Array.from({ length: 100 }, (_, i) => {
    const baseDate = new Date();
    baseDate.setMinutes(0, 0, 0);
    baseDate.setHours(baseDate.getHours() - (100 - i));
  
    const timestamp = baseDate.toISOString();
    const open = 100 + Math.random() * 10;
    const close = open + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    const volume = Math.floor(1000 + Math.random() * 500);
  
    return {
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      ema10: 100 + Math.sin(i / 10) * 5,
      sma20: 100 + Math.sin(i / 15) * 5,
      sma50: 100 + Math.sin(i / 25) * 5,
      sma200: 100,
      adx: 20 + Math.random() * 20,
    };
  });