import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CandlestickData = {
  x: Date;
  y: [number, number, number, number]; // Open, High, Low, Close
};

type VolumeData = {
  x: Date;
  y: number;
};

type ChartSeries = { name: string; type: string; data: any[] };

const PAIRS = [
  { value: "BTC/USD", label: "BTC/USD" },
  { value: "ETH/USD", label: "ETH/USD" },
  { value: "SOL/USD", label: "SOL/USD" },
  { value: "XRP/USD", label: "XRP/USD" },
];

const TIMEFRAMES = [
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
];

const Market = () => {
  const [pair, setPair] = useState<string>("BTC/USD");
  const [timeframe, setTimeframe] = useState<string>("1m");
  const [ticker, setTicker] = useState<{ open: number; high: number; low: number; close: number; volume: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ series: ChartSeries[]; yMin: number; yMax: number; volumeMax: number }>({
    series: [
      { name: "Candlestick", type: "candlestick", data: [] },
      { name: "Volume", type: "bar", data: [] },
    ],
    yMin: 0,
    yMax: 100,
    volumeMax: 1,
  });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const [base, quote] = pair.split('/');
        const tickerResponse = await axios.get<{ timestamp: number; open: number; high: number; low: number; close: number; volume: number }>(
          `http://localhost:5001/ticker/${base}/${quote}`
        );
        const { open, high, low, close, volume } = tickerResponse.data;
        setTicker({ open, high, low, close, volume });
      
      } catch (err) {
        setError("Failed to fetch price");
      }
    };

    const fetchCandlestickData = async () => {
      try {
        const [base, quote] = pair.split('/');
        const response = await axios.get<[number, number, number, number, number, number][]>(
          `http://localhost:5001/OHLCV/${base}/${quote}/${timeframe}?limit=120`
        );

        const candlestickData: CandlestickData[] = response.data.map(
          ([timestamp, open, high, low, close]) => ({
            x: new Date(timestamp),
            y: [open, high, low, close],
          })
        );

        const volumeData: VolumeData[] = response.data.map(([timestamp, , , , , volume]) => ({
          x: new Date(timestamp),
          y: volume,
        }));

        // ✅ Cập nhật cây nến cuối bằng dữ liệu ticker
        if (candlestickData.length > 0 && ticker) {
          const lastCandle = candlestickData[candlestickData.length - 1];
          candlestickData[candlestickData.length - 1] = {
            x: new Date(lastCandle.x),
            y: [
              lastCandle.y[0], // Open giữ nguyên
              Math.max(lastCandle.y[1], ticker.high), // High cập nhật nếu cần
              Math.min(lastCandle.y[2], ticker.low), // Low cập nhật nếu cần
              ticker.close, // Close lấy từ ticker
            ],
          };
          // ✅ Cập nhật Volume của cây nến cuối
          volumeData[volumeData.length - 1] = { x: new Date(lastCandle.x), y: ticker.volume };
        }
      
        // ✅ Tính min & max để điều chỉnh trục Y chính
        const prices = response.data.map(([_, open, high, low, close]) => [open, high, low, close]).flat();
        const yMin = Math.min(...prices) * 0.98; // Giảm 2% để tránh hiển thị quá sát biên
        const yMax = Math.max(...prices) * 1.02; // Tăng 2% để tránh hiển thị quá sát biên
        // ✅ Tính max của Volume và giữ nó trong khoảng 1/5 biểu đồ
        const volumeMax = Math.max(...response.data.map((d) => d[5])) * 5;
        
        setChartData({
          series: [
            { name: "Candlestick", type: "candlestick", data: candlestickData },
            { name: "Volume", type: "bar", data: volumeData },
          ],
          yMin,
          yMax,
          volumeMax,
        });
      } catch (err) {
        setError("Failed to fetch candlestick data");
      }
    };

    fetchPrice();
    fetchCandlestickData();
    const intervalId = setInterval(() => {
      fetchPrice();
      fetchCandlestickData();
    }, 1000); // Increased interval to 1 seconds to reduce load

    return () => clearInterval(intervalId);
  }, [pair, timeframe, ticker]);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">📈 Market</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium mb-1">Pair</label>
              <Select value={pair} onValueChange={setPair}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pair" />
                </SelectTrigger>
                <SelectContent>
                  {PAIRS.map((pairOption) => (
                    <SelectItem key={pairOption.value} value={pairOption.value}>
                      {pairOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium mb-1">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3 flex items-end">
              {error && <div className="text-red-500">{error}</div>}
              {ticker && ticker.close !== null ? (
                <div className="text-lg font-semibold">
                  Current {pair} Price: <span className="text-green-500">${ticker.close.toLocaleString()}</span>
                </div>
              ) : (
                <div>Loading price...</div>
              )}
            </div>
          </div>
          
          <div className="mixed-chart relative">
            <Chart
              options={{
                chart: { 
                  type: "candlestick", 
                  height: 350,
                  toolbar: {
                    show: true,
                  },
                  animations: {
                    enabled: false, // Disable animations for better performance
                  }
                },
                title: {
                  text: `${pair} (${timeframe})`,
                  align: 'left'
                },
                xaxis: { 
                  type: "datetime",
                  labels: {
                    datetimeUTC: false, // Use local time
                  }
                },
                yaxis: [
                  {
                    title: { text: "Price (USD)" },
                    min: chartData.yMin,
                    max: chartData.yMax,
                    tooltip: { enabled: true },
                    labels: {
                      formatter: (val) => val.toFixed(0),
                    },
                  },
                  {
                    opposite: true,
                    title: { text: "Volume" },
                    min: 0,
                    max: chartData.volumeMax,
                    labels: {
                      formatter: (val) => val.toFixed(0),
                    },
                  },
                ],
                tooltip: {
                  enabled: true,
                  theme: 'dark',
                  x: {
                    format: 'dd MMM yyyy, HH:mm:ss'
                  }
                }
              }}
              series={chartData.series}
              type="candlestick"
              height={500}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Market;
