


import { Card, CardContent, CardHeader,CardDescription, CardTitle ,CardFooter } from "@/components/ui/card";
import { AppWindowIcon, CodeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Tabs,TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import MarketCryptoPage from "@/pages/fintech/MarketCrypto-page";

export default function MarketPage() {
    return (
        <div className="flex w-full  flex-col gap-6">
      <Tabs defaultValue="crypto">
        <TabsList>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="fx">Fx</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          
        </TabsContent>
        <TabsContent value="crypto">
          <MarketCryptoPage/>
        </TabsContent>
      </Tabs>
    </div>
    )   
  }