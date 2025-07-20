// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import CalHeatmapComponent from "@/components/CalHeatmap"
import { Progress } from "@/components/ui/progress";
function getDefaultDates() {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const format = (d: Date) => d.toISOString().split("T")[0];

  return {
    start: format(threeMonthsAgo),
    end: format(today),
  };
}
const streaks = [
  { "date": "2025-01-01", "win": true, "rule": true },
  { "date": "2025-01-02", "win": true, "rule": false },
  { "date": "2025-01-03", "win": true, "rule": true },
  { "date": "2025-01-04", "win": false, "rule": false },
  { "date": "2025-01-05", "win": false, "rule": true },
  { "date": "2025-01-08", "win": true, "rule": true },
  { "date": "2025-01-09", "win": false, "rule": false },
  { "date": "2025-01-10", "win": false, "rule": true },
  { "date": "2025-01-11", "win": true, "rule": true },
]

const mockAccounts = [
  { id: '25303967', name: 'Account #1 - $20K' },
  { id: '25303968', name: 'Account #2 - $50K' },
  { id: '25303969', name: 'Account #3 - $100K' },
];
const activityData = [
  { "date": "2025-01-01", "temp_max": 18 },
  { "date": "2025-01-02", "temp_max": 21 },
  { "date": "2025-01-03", "temp_max": 19 },
  { "date": "2025-01-04", "temp_max": 23 },
  { "date": "2025-01-05", "temp_max": 25 },
  { "date": "2025-01-06", "temp_max": 22 },
  { "date": "2025-01-07", "temp_max": 17 },
  { "date": "2025-01-08", "temp_max": 25 },
  { "date": "2025-01-11", "temp_max": 22 },
  { "date": "2025-01-07", "temp_max": 17 },
];

const balanceData = [
  { time: 'Jun 20', balance: 20500 },
  { time: 'Jun 21', balance: 20320 },
  { time: 'Jun 22', balance: 19850 },
  { time: 'Jun 23', balance: 19200 },
  { time: 'Jun 24', balance: 18800 },
  { time: 'Jun 25', balance: 18600 },
  { time: 'Jun 26', balance: 18563 },
];
const growthData = [
  { time: '2025-01', value: 100 },
  { time: '2025-02', value: 103 },
  { time: '2025-03', value: 105 },
  { time: '2025-04', value: 50 },
  { time: '2025-05', value: 208 },
  { time: '2025-06', value: 409 },
  { time: '2025-07', value: 607 },
  { time: '2025-08', value: 908 },
  { time: '2025-08', value: 1009 },
];

const radarStats = [
  { metric: 'Algo trading', value: 0 },
  { metric: 'Profit Trades', value: 60 },
  { metric: 'Loss Trades', value: 40 },
  { metric: 'Trading activity', value: 36.3 },
  { metric: 'Max deposit load', value: 48 },
  { metric: 'Maximum drawdown', value: 4.2 },
];

const openTrades = [
  { id: '395856145', date: 'Jun 26 13:56:59', symbol: 'GBPCAD', side: 'Sell', entry: 1.8792, qty: 0.05, fee: -0.2, pnl: -0.2 },
  { id: '395595068', date: 'Jun 26 04:56:13', symbol: 'XAUUSD', side: 'Buy', entry: 3330.2, qty: 0.02, fee: -0.08, pnl: -0.08 },
  { id: '394188750', date: 'Jun 23 17:32:49', symbol: 'GBPAUD', side: 'Sell', entry: 2.0965, qty: 0.02, fee: -0.08, pnl: -0.08 },
  { id: '393756885', date: 'Jun 23 04:13:23', symbol: 'USDCHF', side: 'Buy', entry: 0.8189, qty: 0.02, fee: -0.08, pnl: -0.08 },
];
const statsBalanceMock = {
  pnl: 1000,
  equity: 18585.31,
  balance: 18563.94,

}
const statsTradeMock = {
  // pnl: 1000,
  // equity: 18585.31,
  // balance: 18563.94,
  // totalTrades: 184,
  // winRate: 33.69,
  // bestProfit: 125.10,
  // biggestLoss: -207.36,
  // profitFactor: 0.6,
  total_trades: 500,
  total_profit: 700.52,
  win_rate_percent: 17.2,
  average_win: 21.97,
  average_loss: 7.25,
  expectancy: -2.22,
  max_drawdown: -394.33,
  risk_reward_ratio: 3.03,

};
// {"total_trades":500,"total_profit":700.52,"win_rate_percent":17.2,"average_win":21.97,"average_loss":7.25,"expectancy":-2.22,"max_drawdown":-394.33,"risk_reward_ratio":3.03}
const targetData = [
  { label: 'Reached', value: 1000, fill: '#facc15' },
  { label: 'Remaining', value: 1600 - 1000, fill: '#e5e7eb' },
];



export default function Dashboard() {
  const [selectedAccount, setSelectedAccount] = useState(mockAccounts[0].id);
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [statsBalance, setStatsBalance] = useState(statsBalanceMock);
  const [statsTrade, setStatsTrade] = useState(statsTradeMock);
  useEffect(() => {
    // const { start, end } = getDefaultDates();
    // setStartDate(start);
    // setEndDate(end);
    if (import.meta.env.VITE_APP_MODE === 'mock') {
      setStatsTrade(statsTradeMock)
    } else {
      fetch("http://localhost:8000/api/mt5/report")
        .then((res) => res.json())
        .then((data) => {
          setStatsTrade(data)
          setLoading(false);
        })
        .catch((err) => console.error("Fetch error:", err));
    }

  }, [])

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      {/* Dropdown chọn tài khoản */}
      <div className="flex flex-row justify-between items-center mb-4">
        <div className='flex-col'>
          Connect account
          <div className="flex justify-end">
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
            >
              {mockAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

        </div>
        {/* <div className="flex flex-row items-end gap-4 p-4 ">
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className='bg-blue-100 shadow-md'>
            <Button variant="default" onClick={() => onRefresh(startDate, endDate)}>
              Refresh Data
            </Button>
          </div>
        </div> */}
      </div>

      <Card>
        <CardContent className="p-4 overflow-x-auto">

          <div className="flex flex-col md:flex-row  ">
            <div className="md:w-full flex flex-col  items-center">
              <h2 className="text-lg font-semibold mb-2">Growth Since 2025</h2>
              <div className="text-green-600 font-bold mb-2">+9%</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={growthData}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col w-150 items-center">
              <h2 className="text-lg font-semibold mb-2">Advanced Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm  ">
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs  ">Total Trades: <span className="font-bold ">{statsTrade.total_trades}</span></div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs  ">Win Rate: <span className="font-bold">{statsTrade.win_rate_percent}%</span></div>
                {/* <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ">Profit Factor: <span className="font-bold">{statsTrade.profit_factor}</span></div> */}
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs  col-span-2 ">Expectancy: <span className="font-bold">${statsTrade.expectancy}</span></div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs col-span-2">Risk_reward_ratio: <span className="font-bold">${statsTrade.risk_reward_ratio}</span></div>
              </div>
            </div>
            <div className="flex flex-col w-150 md:ml-auto items-center ">
              {/* <h2 className="text-lg font-semibold mb-2">Radar Metrics</h2> */}
              <ResponsiveContainer width={730} height={250}>
                <RadarChart outerRadius={70} data={radarStats}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Metrics" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </CardContent>
      </Card>
      {/* <div className="max-w-80 md:max-w-200">
        <CalHeatmapComponent data= {activityData}/>
      </div> */}
      {/* Treak list  */}
      <h2 className="text-md font-bold">Streaks</h2>
      <div className='flex flex-row overflow-x-auto scrollbar-hidden w-100'>
        {streaks.map((streak, index) => (
          <div key={index} className={`flex flex-col w-12 h-12 items-center p-1 m-1 rounded-lg shadow-md  ${streak.win ? 'bg-green-100' : 'bg-red-100'} border-2  ${streak.rule ? 'border-blue-600' : 'border-red-600'}`}>
            <div className="text-sm font-sm">{new Date(streak.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}</div>
            <div className={`text-md font-bold ${streak.win ? 'text-green-800' : 'text-red-800'}`}>
              {streak.win ? 'W' : 'L'}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card className="bg-yellow-100 text-yellow-900">
          <CardContent className="p-4">
            <div className="text-sm font-semibold">Profit Target</div>
            <div className="text-2xl font-bold">${statsBalance.pnl} / $1600</div>
            <Progress value={statsBalance.pnl / 1600 * 100} className=" bg-blue-100" />

            {/* <ResponsiveContainer width="100%" height={50}>
              <BarChart data={targetData} layout="vertical" margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <Bar dataKey="value">
                  {targetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer> */}
          </CardContent>
        </Card>

        <Card className="bg-teal-100 text-teal-900">
          <CardContent className="p-4">
            <div className="text-sm font-semibold">Daily Loss Level</div>
            <div className="text-2xl font-bold">$938 left</div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-100 text-indigo-900">
          <CardContent className="p-4">
            <div className="text-sm font-semibold">Profitable Days</div>
            <div className="text-2xl font-bold">3 / 3</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Account Balance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>P&L: <span className="font-bold text-red-600">${statsBalance.pnl}</span></div>
            <div>Equity: <span className="font-bold text-green-600">${statsBalance.equity}</span></div>
            <div>Balance: <span className="font-bold text-green-600">${statsBalance.balance}</span></div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={balanceData}>
              <XAxis dataKey="time" />
              <YAxis domain={[18000, 21000]} />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* <Card>
        <CardContent className="p-4">
          
        </CardContent>
      </Card>
       */}

      {/* <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">Radar Metrics</h2>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart outerRadius={90} data={radarStats}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Metrics" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}
      {/* </div> */}
      {/* // trade */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Open Trades</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Symbol</th>
                  <th className="py-2 px-3">Side</th>
                  <th className="py-2 px-3">Entry</th>
                  <th className="py-2 px-3">Qty</th>
                  <th className="py-2 px-3">Fee</th>
                  <th className="py-2 px-3">P&L</th>
                </tr>
              </thead>
              <tbody>
                {openTrades.map((trade) => (
                  <tr key={trade.id} className="border-b">
                    <td className="py-2 px-3 font-mono">{trade.id}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{trade.date}</td>
                    <td className="py-2 px-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {trade.symbol}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${trade.side === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-2 px-3">{trade.entry}</td>
                    <td className="py-2 px-3">{trade.qty}</td>
                    <td className="py-2 px-3">${trade.fee}</td>
                    <td className="py-2 px-3">${trade.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}