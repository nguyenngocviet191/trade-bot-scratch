import { useEffect, useState } from 'react';

export function useCandleSocket() {
  const [candles, setCandles] = useState<any[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/candles");

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setCandles(prev => [...prev.slice(-49), msg]); // keep latest 50
    };

    return () => socket.close();
  }, []);

  return candles;
}