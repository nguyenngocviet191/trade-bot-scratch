import React from 'react';
import CandleChart from '@/components/CandleChart';
import { useCandleSocket } from '@/hooks/use_candle_socket';

export default function RealtimeCandlePage() {
  const candles = useCandleSocket();

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2 font-semibold">Biểu đồ nến Realtime</h2>
      <CandleChart data={candles} />
    </div>
  );
}