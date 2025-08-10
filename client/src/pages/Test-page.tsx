// app/components/ProgressBarDemo.tsx
// "use client"

import { Progress } from "@/components/ui/progress"
import { useEffect, useState ,useRef } from "react"
import { usePostRequest } from "../hooks/use_post_request";
import { Button } from "@/components/ui/button"
// const progress =50
export default function ProgressBarDemo() {
  const [progress, setProgress] = useState(10)
  const { data, loading, error, post } = usePostRequest<any[]>();
  const [dataList,setDatalist] = useState<any[]>([]);
  const handleSend = (symbol: string, tf: string, since: Number | null, limit: Number | null) => {
    post({
      url: "http://localhost:8000/api/ccxt_ohlcv",
      body: { symbol: symbol, tf: tf, since: since, limit: limit },
    });
  };
  useEffect(() => {
   console.log("First useEffect, run 1 time ")
  //  dataRef.current =[];
  }, [])
  useEffect(() => {
    if (loading) {
      console.log("Loading data...");
    }
    if (error) {
      console.error("Error fetching data:", error);
    }
   }, [loading, error])

  useEffect(() => {
    console.log("Received data:", data);
    setDatalist(prev => [...prev, ...(data || [])]);
   }, [data])
  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      {loading ? "loading..." : `Data length: ${dataList.length || 0}`}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded" >
        <Button onClick={() => handleSend("BTC/USDT", "1d", null, 1)}>Send Request</Button>
      </button>
      {/* {"data Received"} */}
      {/* {dataRef.current} */}
      {dataList.map((item, index) => (
        <div className="flex flex-row gap-2" key={index}>
            <div key={index}>{JSON.stringify(item)}</div>
          
      </div>
      
      ))}
    </div>
  )
}
// import {Progress} from "@heroui/react";

// export default function App() {
//   return <Progress aria-label="Loading..." className="max-w-md" value={60} />;
// }
