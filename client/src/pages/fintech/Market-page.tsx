


import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { AppWindowIcon, CodeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MarketCryptoPage from "@/pages/fintech/MarketCrypto-page";
import ScreenerPage from "@/pages/fintech/Screener-page";
import { useWebSocket } from "@/hooks/use_web_socket";
export default function MarketPage() {
  // const { message, sendMessage } = useWebSocket("ws://localhost:8000/ws");
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     sendMessage("get_data");
  //   }, 5000); // refresh mỗi 5 giây

  //   return () => clearInterval(interval); // cleanup khi component unmount
  // }, [sendMessage]);


  return (
    <div className="flex w-full  flex-col ">
      <Tabs defaultValue="crypto">
        <TabsList>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="fx">Fx</TabsTrigger>
          <TabsTrigger value="screener">screener</TabsTrigger>
        </TabsList>
        <TabsContent value="screener">
          <ScreenerPage />
        </TabsContent>
        <TabsContent value="crypto">
         
          <MarketCryptoPage/>
        </TabsContent>
      </Tabs>
    </div>
  )
}