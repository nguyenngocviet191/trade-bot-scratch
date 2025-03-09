import { useEffect, useState } from 'react';
import { LogDisplay } from './log-display';
import { D3Chart } from './d3-chart';
import type { Candle } from '../../../shared/types';

interface ChartContainerProps {
  data?: Candle[];
  height?: number;
  symbol?: string;
}

interface Log {
  type: string;
  message: string;
  timestamp: string;
}

export function ChartContainer({ data = [], height = 400, symbol = 'BTC/USDT' }: ChartContainerProps) {
  const [logs, setLogs] = useState<Log[]>([]);

  // Debug logging
  useEffect(() => {
    console.log('[Chart] Props:', { symbol, height, dataLength: data.length });
    if (data.length > 0) {
      console.log('[Chart] First candle:', data[0]);
      console.log('[Chart] Last candle:', data[data.length - 1]);
    }
  }, [data, symbol, height]);

  if (!data || data.length === 0) {
    console.log('[Chart] No data available');
    return (
      <div 
        style={{ height: `${height}px` }}
        className="flex items-center justify-center bg-background rounded-lg border border-border"
      >
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <D3Chart data={data} height={height} />
      <LogDisplay logs={logs} />
    </div>
  );
}