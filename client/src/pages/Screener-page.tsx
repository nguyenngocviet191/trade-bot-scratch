import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/chart-container";
import { StrategyForm } from "@/components/strategy-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchOHLCV,
  fetchTicker,
  fetchMarkets,
} from "@/services/exchange";
import { generateMockOHLCV } from "../../../shared/mockdata/mockts";
import { type Candle } from "../../../shared/types";
import { useQuery } from "@tanstack/react-query";

const timeframes = [
  { value: "1m", label: "1 phút" },
  { value: "5m", label: "5 phút" },
  { value: "15m", label: "15 phút" },
  { value: "30m", label: "30 phút" },
  { value: "1h", label: "1 giờ" },
  { value: "4h", label: "4 giờ" },
  { value: "1d", label: "1 ngày" },
];

// if (import.meta.env.VITE_APP_MODE === "mock") {
//     console.log("📢 Using Mock Data");
//     return Promise.resolve(mockMarkets);
//   } else {
//     console.log("🌍 Fetching Real API");
//     const response = await fetch(`${API_URL}/markets`);
//     return response.json();
//   }

export default function ScreenerPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");

  // Fetch available markets
  const { data: markets = [] } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
  });

  // Fetch market tickers
  const { data: tickers = [] } = useQuery({
    queryKey: ["tickers"],
    queryFn: async () => {
      const tickerPromises = markets
        .slice(0, 10)
        .map((symbol) => fetchTicker(symbol));
      const data = await Promise.all(tickerPromises);
      return data.filter(ticker => ticker !== null);
    },
    enabled: markets.length > 0,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch OHLCV data
  const { data: candleData = [], isLoading: isLoadingCandles } = useQuery({
    queryKey: ["ohlcv", selectedSymbol, selectedTimeframe],
    queryFn: () => {
      // For testing, use mock data first
      return Promise.resolve(generateMockOHLCV(selectedSymbol, 100));
      // return fetchOHLCV(selectedSymbol, selectedTimeframe);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Debug logging
  useEffect(() => {
    console.log('[Screener] Selected Symbol:', selectedSymbol);
    console.log('[Screener] Timeframe:', selectedTimeframe);
    console.log('[Screener] Candle Data:', candleData?.length, 'candles');
    console.log('[Screener] Markets:', markets);
    console.log('[Screener] Tickers:', tickers);
  }, [selectedSymbol, selectedTimeframe, candleData, markets, tickers]);

  return (
    <div className="ml-12 flex-1 p-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">
                {selectedSymbol} Price Chart
              </CardTitle>
              <Select
                value={selectedTimeframe}
                onValueChange={setSelectedTimeframe}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn khung thời gian" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[600px] relative">
                {isLoadingCandles ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <ChartContainer 
                    data={candleData}
                    symbol={selectedSymbol}
                    height={550}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">24h %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickers.map((ticker) => (
                      <TableRow
                        key={ticker.symbol}
                        className={`cursor-pointer hover:bg-muted ${
                          selectedSymbol === ticker.symbol ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedSymbol(ticker.symbol)}
                      >
                        <TableCell className="font-medium">
                          {ticker.symbol}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(ticker.price)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            ticker.change >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {ticker.change.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Strategy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <StrategyForm
                onSubmit={async (data) => {
                  console.log("Strategy settings:", data);
                }}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}