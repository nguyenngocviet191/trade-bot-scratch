import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"
const stats =
{
  total_balance: 1000,
  income_passive: 50, // monthly income
  income_active: 200, // monthly income
  total_earning: "$11,800",
  month_expensive: 100,
  month_budget: 500,
  saving_gain: 500,
  saving_target: 1000,
  porfolio_balance: 5000,
  porfolio_growth: 0.2,
  bot_running: 3,
  bot_total: 5,
  business_running: 3,
  business_total: 5,
  rank: "Bronze",
  account_status: "dangerous" // safe, risky, dangerous
}
export default function DashboardPage() {
  return (
    <div className="flex flex-col w-full">
      <div className={`flex flex-col h-50 md:h-20 ${stats.account_status === "safe" ? "bg-green-200" : stats.account_status === "risky" ? "bg-yellow-200" : "bg-red-200"} ml-0 mt-0 shadow-md p-4 mb-4 top-0 sticky`}>
        <div className="text-xl text-bold ">Cash $1000</div>
        <div className="text-xl text-bold">Income ${stats.income_passive + stats.income_active}/y</div>
        <div className="text-xl text-bold">Rank {stats.rank}</div>
        <div className="text-xl text-bold">{stats.account_status}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 max-w-250">
        {/* <div className="text-2xl font-bold">Earning </div> */}
        <Card className="bg-teal-100 text-teal-900">
          <CardHeader>
            <CardTitle>Earning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row justify-between items-center">

              <div className="H1">Income $50/mo</div>
              <div className="H1">Income $2000/y</div>
            </div>
            <div className="flex flex-row mt-2  h-5">
              <Button variant="ghost" className="bg-blue-300 ml-auto">See more</Button>
            </div>

          </CardContent>

        </Card>
        <Card className="bg-teal-100 text-teal-900">
          <CardHeader>
            <CardTitle>Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col ">
              <div className="H1">$500/1000</div>
              <Progress value={(stats.month_expensive / stats.month_budget) * 100} className="w-full" />
            </div>
            <div className="flex flex-row mt-2  h-5">
              <Button variant="ghost" className="bg-blue-300 ">Budget</Button>
              <Button variant="ghost" className="bg-blue-300 ml-auto">See more</Button>
            </div>

          </CardContent>

        </Card>
        <Card className="bg-teal-100 text-teal-900">
          <CardHeader>
            <CardTitle>Saving</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row justify-between items-center">
              <div className="H1">Total ${stats.saving_gain}/{stats.saving_target}</div>

            </div>
            <Progress value={(stats.saving_gain / stats.saving_target) * 100} className="w-full" />

            <div className="flex flex-row mt-2  h-5">
              <Button variant="ghost" className="bg-blue-300 ml-auto">See more</Button>
            </div>

          </CardContent>

        </Card>
        {/* <div className="text-2xl font-bold">Portfolio </div> */}
        <Card className="bg-teal-100 text-teal-900">
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row justify-between items-center">
              <div className="H1">Balance ${stats.porfolio_balance}</div>
              <div className="H1">Grow {stats.porfolio_growth * 100}%</div>
            </div>
            <div className="flex flex-row mt-2  h-5">
              <Button variant="ghost" className="bg-blue-300 ml-auto">See more</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-teal-100 text-teal-900">
          <CardHeader>
            <CardTitle>Trading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row justify-between items-center">
              <div className="H1">Bot {stats.bot_running}/{stats.bot_total}</div>
              <div className="H1">Balance $1000</div>
              <div className="H1">PnL $50</div>

            </div>
            <div className="flex flex-row mt-2  h-5">
              <Button variant="ghost" className="bg-blue-300 ml-auto">See more</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-teal-100 text-teal-900">
          <CardHeader>
            <CardTitle>Bussiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row justify-between items-center">
              <div className="H1">Running {stats.business_running}/{stats.business_total}</div>
              <div className="H1">Balance $1000</div>
              <div className="H1">Income $50</div>


            </div>
            <div className="flex flex-row mt-2  h-5">
              <Button variant="ghost" className="bg-blue-300 ml-auto">See more</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}