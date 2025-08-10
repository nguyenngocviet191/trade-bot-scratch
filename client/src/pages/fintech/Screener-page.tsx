import React from 'react';
import CandleChart from '@/components/CandleChart';
// import { useCandleSocket } from '@/hooks/use_candle_socket';
import { mockData } from '@/mockdata/candle_data';
// import { useOhlcvData } from "../../hooks/use_post_request";
const symbol = "BTC"; // Thay thế bằng symbol bạn muốn hiển thị
export default function MarketChart() {
  // const { data, loading, error } = useOhlcvData(symbol);

  // if (loading) return <p>Đang tải dữ liệu...</p>;
  // if (error) return <p>Lỗi: {error}</p>;
  // if (!data) return null;

  return (
    <div className="flex item-center w-full p-2 ml-10">

      <div className="flex flex-row justify-items-center gap-5">
        <CandleChart symbol="BTC/USDT" width={700} height={300}/>
        {/* <CandleChart symbol="BTC/USDT" width={350} height={300}/> */}
      </div>
      {/* <div className="max-h-[500px]">
        <h2 className="text-xl font-bold mb-2">Biểu đồ: {symbol}/USDT</h2>
        <CandleChart data={data} />
      </div> */}
    </div>
  );
}