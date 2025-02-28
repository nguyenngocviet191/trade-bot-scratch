import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";

type CandlestickData = {
  x: Date;
  y: [number, number, number, number]; // Open, High, Low, Close
};

type VolumeData = {
  x: Date;
  y: number;
};

type ChartSeries = { name: string; type: string; data: any[] };

const Market = () => {
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
          // Fetch ticker
        const tickerResponse = await axios.get<{ timestamp: number; open: number; high: number; low: number; close: number; volume: number }>("http://localhost:5001/ticker/BTC/USD");
        const { open, high, low, close, volume } = tickerResponse.data;
        setTicker({ open, high, low, close, volume });
      
      } catch (err) {
        setError("Failed to fetch price");
      }
    };

    const fetchCandlestickData = async () => {
      try {
        const response = await axios.get<[number, number, number, number, number, number][]>(
          "http://localhost:5001/OHLCV/BTC/USD/1m?limit=120"
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
        const yMin = Math.min(...prices) * 0.98;
        const yMax = Math.max(...prices) * 1.02;
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
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <div>
        <div className="p-4 text-xl">📈 Market Page</div>
        {error && <div className="text-red-500">{error}</div>}
        {ticker && ticker.close !== null ? (
          <div className="text-green-500">Current BTC/USD Price: {ticker.close}</div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className="app">
        <div className="row">
          <div className="mixed-chart">
            <Chart
              options={{
                chart: { type: "candlestick", height: 350 },
                xaxis: { type: "datetime" },
                yaxis: [
                  {
                    title: { text: "Price (USD)" },
                    min: chartData.yMin,
                    max: chartData.yMax,
                    tooltip: { enabled: true },
                    labels: {
                      formatter: (val) => val.toFixed(0), // Hiển thị số nguyên
                    },
                  },
                  {
                    opposite: true,
                    title: { text: "Volume" },
                    min: 0,
                    max: chartData.volumeMax, // ✅ Điều chỉnh giới hạn max để giữ volume nhỏ hơn
                    labels: {
                      formatter: (val) => val.toFixed(0), // Hiển thị số nguyên
                    },
                  },
                ],
              }}
              series={chartData.series}
              type="candlestick"
              height={400}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Market;
