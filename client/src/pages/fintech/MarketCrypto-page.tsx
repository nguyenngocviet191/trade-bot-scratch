import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
// Định nghĩa kiểu dữ liệu
const watchlist = ["BTC", "ETH", "LTH"];
const data = [
  { symbol: "BTC", id: 1, name: "Bitcoin", price: 50000, change: 700, changePercent: 0.1 },
  { symbol: "LTH", id: 2, name: "Litecoin", price: 50000, change: 700, changePercent: 0.2 },
  { symbol: "ETH", id: 1027, name: "Etherum", price: 50000, change: 700, changePercent: 0.2 },
]
export default function MarketCrypto() {

  return (
    <div className="flex flex-col gap-2">
      {/* <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded ml-auto"
            >
              +
      </button> */}
      <Dialog >
        <form>
          <DialogTrigger asChild>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded ml-auto"
            >
              +
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">Name</Label>
                <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username-1">Username</Label>
                <Input id="username-1" name="username" defaultValue="@peduarte" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2  rounded ">
        {data.map((token) => (

          <div key={token.id} className="grid grid-cols-4 md:grid-cols-2  grid-rows-2 md:grid-rows-4 bg-gray-100 rounded p-2 gap-2 items-center  md:w-[150px]">
            <img
              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`}
              alt={token.name}
              className="w-8 h-8 md:w-5 md:h-5 mr-2 row-span-2  md:row-span-1 justify-self-center"
            />
            <div className="font-semibold">{token.symbol}</div>
            <div className="font-sm md:hidden col-start-2 row-start-2">{token.name}</div>
            <div className="font-semibold col-start-4 row-start-1 md:row-start-2 md:col-start-1 md:col-span-2">{token.price}</div>
            <div className="font-sm md:hidden col-start-3 row-start-2">{token.change}</div>
            <div className="font-sm col-start-4 row-start-2 md:row-start-3 md:col-start-1 md:col-span-2">{token.changePercent}</div>


          </div>


        ))}
      </div>


    </div>
  );
}
