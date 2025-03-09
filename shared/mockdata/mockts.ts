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
//không bắt buộc giống tên file
// usage
// import mockData from "@/mock/mockData";
// console.log(mockData.markets);