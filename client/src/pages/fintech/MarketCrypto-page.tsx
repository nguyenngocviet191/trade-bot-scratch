import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/hooks/use_web_socket";
// Định nghĩa kiểu dữ liệu
const watchlist = ["BTC", "ETH", "LTH"];
// const data = [
//   { symbol: "BTC", id: 1, name: "Bittoken", price: 50000, change: 700, changePercent: 0.1 },
//   { symbol: "LTH", id: 2, name: "Litetoken", price: 50000, change: 700, changePercent: 0.2 },
//   { symbol: "ETH", id: 1027, name: "Etherum", price: 50000, change: 700, changePercent: 0.2 },
// ]
// const rawData = JSON.parse(socketMessage);
// const data = Object.values(rawData.data).map((token) => ({
//   id: token.id,
//   name: token.name,
//   symbol: token.symbol,
//   price: token.quote.USD.price,
//   change: token.quote.USD.percent_change_24h,
//   changePercent: token.quote.USD.percent_change_1h,
// }));

export default function MarketCrypto() {
  const { message, sendMessage } = useWebSocket("ws://localhost:8000/ws");
  type TokenData = {
    id: number;
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  };
  
  const [tokenData, settokenData] = useState<TokenData[]>([]);
  useEffect(() => {
   if (message) {
  try {
    const rawData = JSON.parse(message);

    if (rawData.data) {
      type Token = {
        id: number;
        name: string;
        symbol: string;
        quote?: {
          USD?: {
            price?: number;
            percent_change_24h?: number;
            percent_change_1h?: number;
          };
        };
      };

      const newData = Object.values(rawData.data).map((token) => {
        const typedToken = token as Token;
        return {
          id: typedToken.id,
          name: typedToken.name,
          symbol: typedToken.symbol,
          price: typedToken.quote?.USD?.price ?? 0,
          change: typedToken.quote?.USD?.percent_change_24h ?? 0,
          changePercent: typedToken.quote?.USD?.percent_change_1h ?? 0,
        };
      });
     
      settokenData(newData);
    }
  } catch (err) {
    console.error("Lỗi khi parse JSON từ message:", err);
  }
}
    const interval = setInterval(() => {
      sendMessage("get_data");
    }, 5000); // refresh mỗi 5 giây
    return () => clearInterval(interval);
  }, [message, sendMessage]);
  return (
    <div className="flex flex-col gap-2">
      {/* <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded ml-auto"
            >
              +
      </button> */}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2  rounded ">
        {tokenData.map((token: TokenData) => (

          <div key={token.id} className="grid grid-cols-4 md:grid-cols-2  grid-rows-2 md:grid-rows-4 bg-gray-100 rounded p-2 gap-2 items-center  md:w-[150px]">
            <img
              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`}
              // src={`https://s2.tokenmarketcap.com/static/img/tokens/64x64/1.png`}
              alt={token.name}
              className="w-8 h-8 md:w-5 md:h-5 mr-2 row-span-2  md:row-span-1 justify-self-center"
            />
            <div className="font-semibold">{token.symbol}</div>
            <div className="font-sm md:hidden col-start-2 row-start-2">{token.name}</div>
            <div className="font-semibold col-start-4 row-start-1 md:row-start-2 md:col-start-1 md:col-span-2">{token.price.toFixed(2)}</div>
            <div className="font-sm md:hidden col-start-3 row-start-2">{token.change.toFixed(2)}</div>
            <div className="font-sm col-start-4 row-start-2 md:row-start-3 md:col-start-1 md:col-span-2">{token.changePercent.toFixed(2)}</div>


          </div>


        ))}
      </div>


    </div>
  );
}
