


import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { AppWindowIcon, CodeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GoalPage from "@/pages/personal/Goal-page";
import InvestmentPage from "@/pages/personal/Investment-page";

export default function DashboardPage() {
  return (
    <div className="flex w-full  flex-col gap-6">
      <Tabs defaultValue="goal">
        {/* <TabsList className="overflow-x-auto scrollbar-hidden"> */}
        <TabsList >
          <TabsTrigger value="goal">Goal</TabsTrigger>
          <TabsTrigger value="earning">Earning</TabsTrigger>
          <TabsTrigger value="transact">Transact</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>
        <TabsContent value="goal">
          <GoalPage />
        </TabsContent>
        <TabsContent value="portfolio">
          <InvestmentPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}