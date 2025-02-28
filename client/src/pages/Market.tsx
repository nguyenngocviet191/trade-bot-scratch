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
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ series: ChartSeries[]; yMin: number; yMax: number }>({
    series: [
      { name: "Candlestick", type: "candlestick", data: [] },
      { name: "Volume", type: "bar", data: [] },
    ],
    yMin: 0,
    yMax: 100, // Giá trị mặc định
  });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get<{ price: number }>("http://localhost:5001/ticker/BTC/USD");
        setPrice(response.data.price);
      } catch (err) {
        setError("Failed to fetch price");
      }
    };

    const fetchCandlestickData = async () => {
      try {
        const response = await axios.get<[number, number, number, number, number, number][]>(
          "http://localhost:5001/OHLCV/BTC/USD/1h?limit=50"
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

        // ✅ Tính min & max để điều chỉnh trục Y chính
        const prices = response.data.map(([_, open, high, low, close]) => [open, high, low, close]).flat();
        const yMin = Math.min(...prices) * 0.98;
        const yMax = Math.max(...prices) * 1.02;

        setChartData({
          series: [
            { name: "Candlestick", type: "candlestick", data: candlestickData },
            { name: "Volume", type: "bar", data: volumeData },
          ],
          yMin,
          yMax,
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
        {price !== null ? (
          <div className="text-green-500">Current BTC/USD Price: {price}</div>
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
                  },
                  {
                    opposite: true, // Trục thứ 2 nằm bên phải
                    title: { text: "Volume" },
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
