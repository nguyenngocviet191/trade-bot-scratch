import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurrencyTable from "@/components/CurrencyTable";

const INITIAL_PAIRS = [
  { symbol: "BTC", base: "USDT" },
  { symbol: "ETH", base: "USDT" },
  { symbol: "SOL", base: "USDT" },
  { symbol: "XRP", base: "USDT" },
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
  const [pairs, setPairs] = useState(INITIAL_PAIRS);
  const [pair, setPair] = useState<string>("BTC/USD");
  const [timeframe, setTimeframe] = useState<string>("1m");
  const [ticker, setTicker] = useState<{ open: number; high: number; low: number; close: number; volume: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ series: any[]; yMin: number; yMax: number; volumeMax: number }>({
    series: [
      { name: "Candlestick", type: "candlestick", data: [] },
      { name: "Volume", type: "bar", data: [] },
    ],
    yMin: 0,
    yMax: 100,
    volumeMax: 1,
  });
  const [currencyData, setCurrencyData] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.post('http://localhost:5001/tickers', { pairs });
        const data = (response.data as any[]).map((item: any) => ({
          symbol: item.symbol,
          base: item.base,
          close: item.close,
          change: item.close - item.open,
          percentChange: ((item.close - item.open) / item.open) * 100,
        }));
        setCurrencyData(data);
      } catch (err) {
        setError("Failed to fetch prices");
      }
    };

    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pairs]);

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

    const fetchCandlestickData = async (limit: number) => {
      try {
        const [base, quote] = pair.split('/');
        const response = await axios.get<[number, number, number, number, number, number][]>(
          `http://localhost:5001/OHLCV/${base}/${quote}/${timeframe}?limit=${limit}`
        );
        const candlestickData = response.data.map(
          ([timestamp, open, high, low, close]) => ({
            x: new Date(timestamp),
            y: [open, high, low, close],
          })
        );

        const volumeData = response.data.map(([timestamp, , , , , volume]) => ({
          x: new Date(timestamp),
          y: volume,
        }));

        const prices = response.data.map(([_, open, high, low, close]) => [open, high, low, close]).flat();
        const yMin = Math.min(...prices) * 0.98;
        const yMax = Math.max(...prices) * 1.02;
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
    fetchCandlestickData(120);

    intervalRef.current = setInterval(() => {
      fetchPrice();
      fetchCandlestickData(120);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pair, timeframe]);

  const handleCurrencyClick = (pair: string) => {
    setPair(pair);
  };

  const handleAddPair = (symbol: string, base: string) => {
    const newPair = { symbol, base };
    setPairs((prevPairs) => [...prevPairs, newPair]);
  };

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
                  {pairs.map((pairOption) => (
                    <SelectItem key={pairOption.symbol} value={`${pairOption.symbol}/${pairOption.base}`}>
                      {pairOption.symbol}/{pairOption.base}
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

            <div className="w-full md:w-1/3 flex flex-col items-end">
              {error && <div className="text-red-500">{error}</div>}
              {ticker && ticker.close !== null ? (
                <div className="text-lg font-semibold">
                  <div>Current {pair} Price:</div>
                  <div>Open: <span className="text-green-500">${ticker.open.toLocaleString()}</span></div>
                  <div>High: <span className="text-green-500">${ticker.high.toLocaleString()}</span></div>
                  <div>Low: <span className="text-green-500">${ticker.low.toLocaleString()}</span></div>
                  <div>Close: <span className="text-green-500">${ticker.close.toLocaleString()}</span></div>
                  <div>Volume: <span className="text-green-500">${ticker.volume.toLocaleString()}</span></div>
                </div>
              ) : (
                <div>Loading price...</div>
              )}
            </div>
          </div>
          <div className="text-lg font-semibold flex flex-col md:flex-row gap-4">
            <Card className="mb-6">
              <CardContent>
                <div className="mixed-chart relative w-full md:w-2/3">
                  <Chart
                    options={{
                      chart: {
                        type: "candlestick",
                        height: 350,
                        toolbar: {
                          show: true,
                        },
                        animations: {
                          enabled: false,
                        }
                      },
                      title: {
                        text: `${pair} (${timeframe})`,
                        align: 'left'
                      },
                      xaxis: {
                        type: "datetime",
                        labels: {
                          datetimeUTC: false,
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
                    width={600}
                    height={400}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="mb-6">
              <CardContent>
                <CurrencyTable currencies={currencyData} onCurrencyClick={handleCurrencyClick} onAddPair={handleAddPair} />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Market;
