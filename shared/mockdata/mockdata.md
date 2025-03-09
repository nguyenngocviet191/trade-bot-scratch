
1. Dùng mockdata rồi khi chạy run theo mode
vite:mock (load file mock)
vite:api  (dùng api)
biến môi trường VITE_APP_MODE
'''javascript
const mockData = {
    markets: [
      { id: "BTC/USDT", price: 50000, volume: 1200 },
      { id: "ETH/USDT", price: 3000, volume: 800 },
    ],
    users: [
      { id: 1, name: "Alice", balance: 10000 },
      { id: 2, name: "Bob", balance: 5000 },
    ],
    trades: [
      { id: 101, user: 1, pair: "BTC/USDT", amount: 0.5 },
      { id: 102, user: 2, pair: "ETH/USDT", amount: 2 },
    ],
  };

  export default mockData;
'''  

-không bắt buộc giống tên file
=usage
'''javascript
import mockData from "@/mock/mockData";
console.log(mockData.markets);
'''

2. Dùng json server giả lập api
// dùng json server để tạo server giả lập
// cài đặt json server 
// npm install -g json-server
// tạo file db.json
// chạy lệnh json-server --watch mockdata/mockdata2.json -- port 3001