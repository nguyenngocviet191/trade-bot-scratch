
import {
    CandlestickData,
    HistogramData,
    Time,

  } from "lightweight-charts";
export const generateMockData = (count:number,startPrice:number, startTime: number, interval :number,reversed :boolean=false): { candles: CandlestickData[], volumes: HistogramData[] } => {
  const candles: CandlestickData[] = [];
  const volumes: HistogramData[] = [];
  
  let time = startTime;
  // let time = Math.floor(Date.now() / 1000) - count * 60;
  let price = startPrice;

  for (let i = 0; i < count; i++) {
    const open = price;
    const close = open + (Math.random() - 0.5) * 4;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.floor(10 + Math.random() * 100);

    candles.push({
      time: time as Time,
      open,
      high,
      low,
      close,

    });
    volumes.push({
      time: time as Time,
      value: volume,
      color: close > open ? "#26a69a" : "#ef5350",
    });
    price = close;
    if (!reversed) {
      time += interval; // increment time by the interval
    } else {
      time -= interval; // decrement time by the interval for reversed data
    }
   
  
  }

  return { candles, volumes };
};