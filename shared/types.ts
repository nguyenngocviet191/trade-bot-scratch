export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export interface Ticker {
    symbol: string;
    price: number;
    change: number;
    volume: number;
  }
  