# Realtime Candlestick Chart Feature - Technical Design Document

## Overview
Tính năng vẽ biểu đồ nến (candlestick chart) realtime cho trading, nhận dữ liệu từ WebSocket và hiển thị giá trị OHLC (Open, High, Low, Close) theo thời gian thực.

## Purpose
- Hiển thị biến động giá crypto/forex theo thời gian thực
- Cung cấp công cụ phân tích kỹ thuật cho traders
- Tích hợp với trading bot để đưa ra quyết định
- Hỗ trợ multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)

## Design

### Architecture Components
1. **WebSocket Client**: Kết nối và nhận dữ liệu từ exchange APIs
2. **Data Processor**: Xử lý và format dữ liệu OHLC
3. **Chart Component**: React component sử dụng lightweight-charts
4. **Timeframe Manager**: Quản lý các khung thời gian khác nhau
5. **Data Store**: Lưu trữ historical data và realtime updates

### Technical Implementation
- **WebSocket**: Sử dụng Socket.IO hoặc native WebSocket
- **Chart Library**: Lightweight Charts (TradingView)
- **Data Structure**: OHLC format với timestamp
- **State Management**: React Context + useReducer
- **Performance**: Virtual scrolling cho large datasets
- **Real-time Updates**: Efficient re-rendering với Web Workers

### Data Flowf
```
Exchange API → WebSocket → Data Processor → Chart Store → Chart Component → UI
```

### Chart Features
- **Candlestick Display**: OHLC bars với màu sắc
- **Volume Bars**: Hiển thị volume trading
- **Technical Indicators**: MA, EMA, RSI, MACD
- **Drawing Tools**: Trend lines, Fibonacci retracements
- **Timeframe Switching**: 1m, 5m, 15m, 1h, 4h, 1d
- **Zoom & Pan**: Interactive chart navigation
- **Crosshair**: Price và time tracking

## Dependencies
- **Frontend**: React 18+, TypeScript
- **Chart Library**: lightweight-charts
- **WebSocket**: Socket.IO client hoặc native WebSocket
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Backend**: WebSocket server cho data streaming

## Usage
```tsx
// Chart component usage
<CandlestickChart 
  symbol="BTCUSDT"
  timeframe="1m"
  onDataUpdate={handleDataUpdate}
  indicators={['MA', 'RSI']}
/>

// WebSocket connection
const socket = useWebSocket('wss://exchange-api.com/ws');
const chartData = useChartData(socket, symbol, timeframe);
```

## Error Handling
- WebSocket connection failures và reconnection
- Data validation và sanitization
- Chart rendering errors
- Memory management cho large datasets
- Network timeout handling

## Open Questions
- Cần hỗ trợ bao nhiêu symbols đồng thời?
- Có cần historical data loading?
- Cần implement technical indicators nào?
- Có cần save chart settings per user?
- Cần optimize performance cho mobile devices?

## Success Criteria
- Chart updates realtime với < 100ms delay
- Smooth rendering với 60fps
- Support 1000+ candlesticks without lag
- Cross-browser compatibility
- Mobile responsive design
- Memory usage < 50MB cho 24h data
