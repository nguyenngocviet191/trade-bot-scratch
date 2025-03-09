import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
console.log("Dashboard-page.tsx");
const stats = [
  {
    title: "Total Balance",
    value: "$11,800",
    change: "+18%",
    isPositive: true,
  },
  {
    title: "Active Bots",
    value: "3",
    change: "",
    isPositive: true,
  },
  {
    title: "Win Rate",
    value: "65%",
    change: "+5%",
    isPositive: true,
  },
  {
    title: "Daily PnL",
    value: "$200", 
    change: "-2%",
    isPositive: false,
  },
];

const activeBots = [
  {
    name: "BTC Scalper",
    strategy: "RSI + MA Crossover",
    status: "running",
    profit: "+$350",
    timeActive: "5d 12h",
    isProfit: true,
  },
  {
    name: "ETH Swing",
    strategy: "Bollinger Bands",
    status: "running",
    profit: "+$180",
    timeActive: "2d 6h",
    isProfit: true,
  },
  {
    name: "SOL Day",
    strategy: "MACD Strategy",
    status: "paused",
    profit: "-$45",
    timeActive: "12h",
    isProfit: false,
  }
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p
                  className={`text-xs ${
                    stat.isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.change} from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Trading Bots</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bot Name</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profit/Loss</TableHead>
                <TableHead>Time Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeBots.map((bot) => (
                <TableRow key={bot.name}>
                  <TableCell className="font-medium">{bot.name}</TableCell>
                  <TableCell>{bot.strategy}</TableCell>
                  <TableCell>
                    <Badge variant={bot.status === 'running' ? 'default' : 'secondary'}>
                      {bot.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={bot.isProfit ? 'text-green-500' : 'text-red-500'}>
                    {bot.profit}
                  </TableCell>
                  <TableCell>{bot.timeActive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}