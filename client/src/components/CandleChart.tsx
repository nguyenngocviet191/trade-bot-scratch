import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { generateMockData } from "@/hooks/mock_candle_generation";
import { usePostRequest } from "../hooks/use_post_request";
import { useWebSocket } from "../hooks/use_web_socket"
import throttle from "lodash.throttle";
import {
  createChart,
  IChartApi,
  // SeriesApi,
  CandlestickData,
  CandlestickSeries,
  HistogramData,
  LineData,
  Time,
  LineSeries,
  HistogramSeries,
  CrosshairMode,
  createTextWatermark,

} from "lightweight-charts";
import { ADX } from "technicalindicators";
import { EMA } from "technicalindicators";
import { SMA } from "technicalindicators";
import { Factory, Star, Ruler } from "lucide-react";


export default function CandleChart({ symbol, width, height }: { symbol: string, width: number, height: number }) {

  const chartRef = useRef<HTMLDivElement>(null);
  const [interval, setChartInterval] = useState("1d");
  const [drawMode, setDrawMode] = useState(false);
  // const [fetchMore, setfetchMore] = useState(false);
  const sendLockRef = useRef(false); // dùng ref để tránh re-render khi setState
  const loadDataRef = useRef(false); // dùng ref để tránh re-render khi setState
  const lastPosRef = useRef(0);
  // const [first, setFirst] = useState<{x:Number;y:Number} | null>(null);
  const firstRef = useRef<{ time: Number; price: Number } | null>(null);
  const secondRef = useRef<{ time: Number; price: Number } | null>(null);
  const selectingRef = useRef<Boolean>(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<{
    chart :IChartApi | null, 
    candleSeries: CandlestickSeries | null,
    volumeSeries: HistogramSeries | null,
    ema10Series: LineSeries | null,
    sma20Series: LineSeries | null,
    sma50Series: LineSeries | null,
    sma200Series: LineSeries | null,
    adxSeries:LineSeries | null,
    plusDiSeries:LineSeries | null,
    minusDiSeries: LineSeries | null,
   
    
  }| null>(null); // useRef to store the chart instance
  // const [position, setPosition] = useState("mid"); // mid, left, right
  const { message, sendMessage } = useWebSocket("ws://localhost:8000/ws");
  const positionRef = useRef<"mid" | "left" | "right">("mid");
  const dataRef = useRef<{
    candles: CandlestickData[];
    volumes: HistogramData[];
  } | null>(null);
  const dataIndicatorRef = useRef<{
    candles: CandlestickData[];
    volumes: HistogramData[];
    ema10: LineData[];
    sma20: LineData[];
    sma50: LineData[];
    sma200: LineData[];
    adx: LineData[];
    pdi: LineData[];
    mdi: LineData[];
  } | null>(null);
  const throttledUpdate = useMemo(() => throttle(() => {
    renderChart(chartRef, canvasRef, dataIndicatorRef);
  }, 1000), []);

  const lengthClosedBar = 100;
  const intervals = ['4h', '1d', '1w', '1M']; // Define the available intervals

  const { data, loading, error, post } = usePostRequest<any[]>();

  const handleSend = (symbol: string, tf: string, since: Number | null, limit: Number | null) => {
    post({
      url: "http://localhost:8000/api/ccxt_ohlcv",
      body: { symbol: symbol, tf: tf, since: since, limit: limit },
    });
  };
  useEffect(() => {
    const since = null;
    const limit = lengthClosedBar;
    handleSend("BTC/USDT", "1d", since, limit);
    loadDataRef.current = false; // reset loadDataRef when component mounts
    //socket

  }, []); // chỉ chạy 1 lần
  //draw chart
  useEffect(() => {
    // chartRef.current.
    if (!chartRef.current) return;
    console.log("Create chart instance");
    if (!canvasRef.current) {
      canvasRef.current = {
        chart: null,
        candleSeries: null,
        volumeSeries: null,
        ema10Series: null,
        sma20Series: null,
        sma50Series: null,
        sma200Series: null,
        adxSeries: null,
        plusDiSeries: null,
        minusDiSeries: null,
      };
    }
    // console.log("canvasRef.current", canvasRef.current);
    canvasRef.current.chart = createChart(chartRef.current, {
      // width: width,
      // height: height,
      width: 800,
      height: 300,
      crosshair: {
        mode: CrosshairMode.Normal,

      },
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
    });
    createTextWatermark(canvasRef.current.chart.panes()[0], {
      horzAlign: 'center',
      vertAlign: 'center',
      lines: [
        {
          text: symbol,
          color: 'rgba(5, 5, 5, 0.3)',
          fontSize: 36,
        },
      ],
    });
    canvasRef.current.candleSeries = canvasRef.current.chart.addSeries(CandlestickSeries);
    canvasRef.current.volumeSeries = canvasRef.current.chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay by setting a blank priceScaleId
    });
    canvasRef.current.volumeSeries.priceScale().applyOptions({
      // set the positioning of the volume series
      scaleMargins: {
        top: 0.9, // highest point of the series will be 70% away from the top
        bottom: 0,
      },
    });
    canvasRef.current.ema10Series = canvasRef.current.chart.addSeries(LineSeries, { color: 'rgb(211, 245, 20)', lineWidth: 1 });
    canvasRef.current.sma20Series = canvasRef.current.chart.addSeries(LineSeries, { color: 'rgb(11, 11, 12)', lineWidth: 1 });
    canvasRef.current.sma50Series = canvasRef.current.chart.addSeries(LineSeries, { color: 'rgb(14, 11, 230)', lineWidth: 1 });
    canvasRef.current.sma200Series = canvasRef.current.chart.addSeries(LineSeries, { color: 'rgb(240, 0, 208)', lineWidth: 1 });
    canvasRef.current.adxSeries = canvasRef.current.chart.addSeries(LineSeries, { color: 'rgb(28, 27, 34)', lineStyle: 2, lineWidth: 1 });
    canvasRef.current.plusDiSeries = canvasRef.current.chart.addSeries(LineSeries, { color: 'rgb(14, 11, 230)', lineWidth: 1 });
    canvasRef.current.minusDiSeries = canvasRef.current.chart.addSeries(LineSeries, { color: 'rgb(245, 11, 11)', lineWidth: 1 });
    canvasRef.current.adxSeries.moveToPane(1);
    canvasRef.current.plusDiSeries.moveToPane(1);
    canvasRef.current.minusDiSeries.moveToPane(1);
    const updateSelectedBox = (canvasRef,boxRef,x1: Number, y1: Number, x2: Number, y2: Number) => {

      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const top = Math.min(y1, y2);
      const height = Math.abs(y2 - y1); // Assuming y1 and y2 are defined in the context
      const width = Math.abs(x2 - x1);
    
    
      // Chuyển tọa độ y sang giá
      const price1 = canvasRef.current.candleSeries.coordinateToPrice(y1);
      const price2 = canvasRef.current.candleSeries.coordinateToPrice(y2);
    
      // Chuyển tọa độ x sang thời gian
      const timeLeft = canvasRef.current.chart.timeScale().coordinateToTime(left);
      const timeRight = canvasRef.current.chart.timeScale().coordinateToTime(right);
      // const from = new Date(Math.min(time1, time2) * 1000).toLocaleString();
      // const to = new Date(Math.max(time1, time2) * 1000).toLocaleString();
      const barCount = x1 && x2 ? canvasRef.current.timeScale().coordinateToLogical(x2) - canvasRef.current.timeScale().coordinateToLogical(x1) : 0;
      const priceDiff = price1 && price2 ? price2 - price1 : 0;
      const pricePct = price1 ? ((priceDiff / price1) * 100).toFixed(2) : "0.00";
    
      boxRef.current.style.left = `${left}px`;
      boxRef.current.style.top = `${top}px`;
      boxRef.current.style.width = `${width}px`;
      boxRef.current.style.height = `${height}px`;
      boxRef.current.style.display = "block";
      if (boxRef.current) boxRef.current.style.backgroundColor = price2 > price1 ? 'rgba(147, 197, 253, 0.3)' : 'rgba(252, 165, 165, 0.3)' // Set background color based on interval
      // khong dung label.innerHTM vi browser phai parse lien tuc,hieu nang kem
      const labelBars = boxRef.current.querySelector(".label-bars");
      const labelPrice = boxRef.current.querySelector(".label-price");
      const labelGroup = boxRef.current.querySelector(".label-group");
      if (labelGroup) {
        labelGroup.style.top = `${height + 10}px`; // position label group below the box
        labelGroup.style.display = `block`; // position label group below the box
        labelGroup.style.backgroundColor = price2 > price1 ? 'rgba(147, 197, 253, 1)' : 'rgba(252, 165, 165, 1)';
      }
    
      if (labelBars) labelBars.textContent = `Bars: ${barCount}`;
      if (labelPrice) labelPrice.textContent = ` Price Change: ${priceDiff?.toFixed(2)} (${pricePct}%)`;
      // if (labelPrice) labelPrice.textContent = `From: ${from} To :(${to})`;
    };
    
    
    const handleHover = (param: MouseEventParams) => {
      if (!drawMode || !selectingRef.current || !firstRef.current || !param.point) return;
      // if (!drawMode) return;
    
    
      const x1 = canvasRef.current.chart.timeScale().timeToCoordinate(firstRef.current.time);  // convert time to x coordinate
      const y1 = canvasRef.current.candleSeries.priceToCoordinate(firstRef.current.price);
      const x2 = param.point.x;
      const y2 = param.point.y;
      console.log("Second pos at:", param.point.x, param.point.y);
      updateSelectedBox(canvasRef,boxRef,x1, y1, x2, y2); // gọi hàm vẽ vùng
      // setSecond(param.time); // cập nhật điểm thứ 2 liên tục
    }
    const handleClick = (param: MouseEventParams) => {
      if (!drawMode || !param.time || !param.point) return;
    
      if (!firstRef.current || secondRef.current && selectingRef.current === false) {
        // setFirst(param.time);
        console.log("First click at:", param.point.x, param.point.y);
        firstRef.current = {
          // x: param.point.x,
          // y: param.point.y,
          time: param.time,
          price: candleSeries.coordinateToPrice(param.point.y), // convert y coordinate to price
        };
        selectingRef.current = true;
        return;
        // Perform any necessary logic here or remove this line if not needed
      }
      // setSecond(param.time);
    
      if (selectingRef.current) {
        console.log("Second click at:", param.point.x, param.point.y);
        secondRef.current = {
          // x: param.point.x,
          // y: param.point.y,
          time: param.time,
          price: candleSeries.coordinateToPrice(param.point.y), // convert y coordinate to price
        };
        selectingRef.current = false;
    
      }
      // const from = Math.min(firstRef.current.time, param.time);
      // const to = Math.max(firstRef.current.time, param.time);
      // drawBox(x1,y1,x2,y2);
      // firstRef.current = null; // reset first point after second click
    
    };
    
    canvasRef.current.chart.subscribeClick(handleClick);
    canvasRef.current.chart.subscribeCrosshairMove(handleHover);
    // canvasRef.current.subscribeCrosshairMove(updateLegend);
    canvasRef.current.chart.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
      // console.log(logicalRange);  // { from: 420, to: 499 }
      if (logicalRange && logicalRange.from < 0 && !sendLockRef.current) {
        // if (logicalRange && logicalRange.from < 0 ) {
        console.log("Need more data:", logicalRange);
        const FetchLeftBars = () => {
          const logicalRange = canvasRef.current.chart.timeScale().getVisibleLogicalRange();
          const startIndex = Math.floor(logicalRange.from);
          const endIndex = Math.ceil(logicalRange.to);
        
          const numberBarsToLoad = 50 - startIndex;
          // const numberAddBarsToLoad = numberBarsToLoad - dataRef.current.candles.length;
          // const numberAddBarsToLoad =numberBarsToLoad;
          const numberAddBarsToLoad = numberBarsToLoad;
          lastPosRef.current = endIndex;
          const since = dataRef.current.candles[0].time * 1000 - (numberAddBarsToLoad) * getDeltaTimeMs(interval); // convert to milliseconds
          if (numberAddBarsToLoad > 0) {
        
            handleSend(symbol, interval, since, numberAddBarsToLoad)
            console.log("Loading more data:", numberAddBarsToLoad);
            // setfetchMore(true);
            loadDataRef.current = false;
            sendLockRef.current = true; // set fetchMore to true to prevent multiple calls

            // const olderData = transformChartData(data);
            positionRef.current = "left";
        
          }
        }
        FetchLeftBars();
      }
      // redraw when scroll or zoom
      if (drawMode && canvasRef.current && firstRef.current && secondRef.current) {
        const x1 = canvasRef.current.chart.timeScale().timeToCoordinate(firstRef.current.time as Time) ?? 0;  // convert time to x coordinate
        const y1 = candleSeries.priceToCoordinate(firstRef.current.price as number) ?? 0;
        const x2 = canvasRef.current.chart.timeScale().timeToCoordinate(secondRef.current.time as Time) ?? 0;  // convert time to x coordinate
        const y2 = candleSeries.priceToCoordinate(secondRef.current.price as number) ?? 0;
        updateSelectedBox(canvasRef,boxRef,x1, y1, x2, y2);
      }
    });
    return () => {

      // clearInterval(intervalID);
      if (canvasRef.current) {
        canvasRef.current.chart.unsubscribeClick(handleClick);
        canvasRef.current.chart.unsubscribeCrosshairMove(handleHover);
        // chart.unsubscribeCrosshairMove(updateLegend);
        canvasRef.current.chart.remove();
      }

    };
  }, []);
  //subscribe to socket stream
  useEffect(() => {
    // Gửi message subscribe 1 lần khi component mount
    const pSymbol = "btcusdt"
    const msg = JSON.stringify({ symbol: pSymbol.toLowerCase() });
    sendMessage(msg);
  }, [sendMessage]);

  //update data
  useEffect(() => {
    if (!chartRef.current || (!data && !message)) return;
    //load data
    if (data && !loadDataRef.current) {
      console.log("Received data:", data.length);
      sendLockRef.current = false;
      loadDataRef.current = true;
      if (Array.isArray(data)) {
        // console.log("Before data:", data);
        if (positionRef.current == "mid") dataRef.current = transformChartData(data);
        if (positionRef.current == "left" && dataRef.current) {

          const transformedData = transformChartData(data);
          const rightTimeStamp = dataRef.current.candles[0].time;
          const leftTimeStamp = transformedData.candles[transformedData.candles.length - 1].time;
          // console.log("Left timestamp:", leftTimeStamp, "->", "Right timestamp:", rightTimeStamp);
          if (rightTimeStamp > leftTimeStamp) {

            dataRef.current = {
              candles: [...transformedData.candles, ...dataRef.current.candles],
              volumes: [...transformedData.volumes, ...dataRef.current.volumes],
            };
          } else {
            console.error("Dữ liệu mới không hợp lệ, không thể thêm vào bên trái");
            return;
          }
        }
        if (positionRef.current == "right" && dataRef.current) {
          const transformedData = transformChartData(data);
          dataRef.current = {
            candles: [...dataRef.current.candles, ...transformedData.candles],
            volumes: [...dataRef.current.volumes, ...transformedData.volumes],
          };
        }
      }
    }
    //check new bar
    // if (dataRef.current?.candles[0]?.time && (dataRef.current.candles[0].time * 1000 + getDeltaTimeMs(interval)) < Date.now() && !sendLockRef.current) {
    //   console.log("Pull new bar")
    //   positionRef.current = "right";
    //   const since = dataRef.current.candles[0].time * 1000;
    //   handleSend(symbol, interval, since, 1);
    //   sendLockRef.current = true;
    // }
    //mock update realtime
    // const dataUpdate = generateMockData(100, dataRef.current.candles[dataRef.current.candles.length - 1].close, dataRef.current.candles[dataRef.current.candles.length - 1].time + getDeltaTimeMs(interval), getDeltaTimeMs(interval), false);,
    //handle socket message
    if (message && data) {
      console.log("Received message:", message.length);
      const parsedMessage: { timestamp: number; open: number; high: number; low: number; close: number; volume: number } = JSON.parse(message);
      const time = parsedMessage.timestamp / 1000 as Time; // chuyển về giây
      // const lastTime = (dataRef.current?.candles[dataRef.current.candles.length - 1]?.time as number | undefined ?? 0) * 1000 + getDeltaTimeMs(interval);
      const lastTime = (dataRef.current?.candles[dataRef.current.candles.length - 1]?.time as number | undefined ?? 0) * 1000;
      const newTime = parsedMessage.timestamp; // chuyển về giây
      console.log("Last time:", lastTime, "New time:", newTime);
      if (dataRef.current && newTime >= lastTime) {
        console.log("Pop 1 bar:");
        dataRef.current.candles.pop();
        dataRef.current.volumes.pop();
        console.log("Update new bar:", parsedMessage);
        dataRef.current.candles.push({
          time,
          open: parsedMessage.open,
          high: parsedMessage.high,
          low: parsedMessage.low,
          close: parsedMessage.close,
        }); //

        dataRef.current.volumes.push({
          time,
          value: parsedMessage.volume,
          color: parsedMessage.close >= parsedMessage.open ? "#26a69a" : "#ef5350",
        });
      }
    }
    if (!message && !data) {
      console.error("Không có data update hay message ");
      return;
    }
    // apply indicator to the dataRef.current
    if (!dataRef.current || dataRef.current?.candles.length == 0) return;
    if (!dataIndicatorRef.current) {
      dataIndicatorRef.current = {
        candles: [],
        volumes: [],
        ema10: [],
        sma20: [],
        sma50: [],
        sma200: [],
        adx: [],
        pdi: [],
        mdi: [],
      };
    }

    ApplyIndicator(dataRef, dataIndicatorRef);
    

    if (!canvasRef.current) {
      console.error("Chart instance is not initialized");
      return;
    }
    else    {
      renderChart(chartRef, canvasRef, dataIndicatorRef);

      // throttledUpdate();
    }  
   
    // const logicalRange = canvasRef.current.timeScale().getVisibleLogicalRange();
    // console.log("Start index:", logicalRange?.from, "End index:", logicalRange?.to);
    
    // chart.timeScale().fitContent();
    // range= 
    // setVisibleLogicalRange({0, lastPosRef.current}); // set visible range to the last 100 bars
    // chart.timeScale().scrollToPosition(lastPosRef.current,false);
    return () => {
    };

  }, [data, message]);
  // }, [data,loading,error, drawMode, interval]);
  return (
    // relative
    <div className=" relative w-full h-full max-w-screen max-h-screen ">
      <div className="absolute  top-2 left-2 z-10 flex flex-row gap-2">
        <div className=" flex flex-row ">
          {intervals.map((ivl) => (
            <Button
              key={ivl}
              variant={interval === ivl ? "default" : "outline"}
              onClick={() => setChartInterval(ivl)}
              className="h-5 w-5"
            >
              {ivl}
            </Button>
          ))}
        </div>
        <Button
          variant={drawMode ? "default" : "outline"}
          onClick={() => {
            setDrawMode((prev) => !prev);
            if (drawMode) {
              // Reset khi tắt drawMode
              // setFirst(null);
              // setSecond(null);
              if (boxRef.current) boxRef.current.style.display = "none";
              // chartRef.timeScale().applyOptions({ interactive: true }); // Cho phép cuộn lại
            } else {
              // chartRef.timeScale().applyOptions({ interactive: false }); // Khoá cuộn khi bật drawMode
            }
          }}
          className={`h-5 w-5 ${drawMode ? 'bg-blue-500/30' : ''}`}
        >
          <Ruler />
        </Button>
      </div>
      <div style={{
        position: 'absolute',
        left: 12,
        top: 30,
        zIndex: 10,
        fontSize: 12,
        fontFamily: 'sans-serif',
        lineHeight: '18px',
        fontWeight: 300,
        color: 'black'
      }}>
        <div>{`${symbol} ${interval} Close`}</div>
        <div>{loading ? 'Loading...' : error ? `Error: ${error}` : ''}</div>
        {/* <div>{message}</div> */}
      </div>
      <div ref={chartRef} className="relative w-full h-full " >

      </div>

      <div ref={boxRef} className="absolute h-full    z-50 " style={{ display: "none" }}>
        <div className="absolute label-group  flex flex-col items-center  gap-1" style={{ top: 0, display: "none" }}>

          <div className="label-bars text-xs text-black-900 p-1 z-51  " />
          <div className="label-price text-xs text-black-900 p-1 z-51 " />
        </div>
      </div>

      {/* <span className="text-xs text-blue-500 p-1 "> change {} % </span>
        <span className="text-xs text-blue-500 p-1 "> {} bars </span>
        <span className="text-xs text-blue-500 p-1 "> from {} to {} </span> */}

    </div>
  );
  
};


// helper function to transform the data from the API to the format required by lightweight-charts
const renderChart = (chartRef, canvasRef, dataIndicatorRef) => {
  console.log("Render chart ");

  if (!chartRef.current) return;
  if (!dataIndicatorRef.current) return;
  if (dataIndicatorRef.current.candles.length == 0) {
    console.error("No data to render chart");
    return;
  }
  if (!canvasRef.current) {
    console.error("canvasRef.current is null or undefined");
    return;
  }
  
  canvasRef.current.candleSeries.setData(dataIndicatorRef.current.candles);
  canvasRef.current.volumeSeries.setData(dataIndicatorRef.current.volumes);

  canvasRef.current.ema10Series.setData(dataIndicatorRef.current.ema10); 
  canvasRef.current.sma20Series.setData(dataIndicatorRef.current.sma20);
  canvasRef.current.sma50Series.setData(dataIndicatorRef.current.sma50);
  canvasRef.current.sma200Series.setData(dataIndicatorRef.current.sma200);
  canvasRef.current.adxSeries.setData(dataIndicatorRef.current.adx);
  canvasRef.current.plusDiSeries.setData(dataIndicatorRef.current.pdi);
  canvasRef.current.minusDiSeries.setData(dataIndicatorRef.current.mdi);
  

}
function getDeltaTimeMs(tf: string): number {
  const msInSecond = 1000;
  const msInMinute = 60 * msInSecond;
  const msInHour = 60 * msInMinute;
  const msInDay = 24 * msInHour;

  switch (tf) {
    case "1d":
      return msInDay;
    case "4d":
      return 4 * msInDay;
    case "1w":
      return 7 * msInDay;
    case "1M":
      return 30 * msInDay; // giả định 1 tháng là 30 ngày
    default:
      throw new Error(`Unsupported timeframe: ${tf}`);
  }
};
function transformChartData(jsonData: any[]) {
  const candles: CandlestickData[] = [];
  const volumes: HistogramData[] = [];
 

  for (const item of jsonData) {
    // console.log("item", item);
    const time = Math.floor(item.timestamp / 1000) as Time; // chuyển về giây

    candles.push({
      time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    });

    volumes.push({
      time,
      value: item.volume,
      color: item.close >= item.open ? "#26a69a" : "#ef5350",
    });

  }

  return {
    candles,
    volumes,

  };
}
const ApplyIndicator = (dataRef, dataIndicatorRef) => {
  console.log("Apply indicator to data");
  dataIndicatorRef.current.candles = dataRef.current.candles;
  dataIndicatorRef.current.volumes = dataRef.current.volumes;
  const ema_input = {
    values: dataRef.current.candles.map(candle => candle.close),
    period: 10, // default period for EMA
  };
  const emaResult = EMA.calculate(ema_input);
  dataIndicatorRef.current.ema10 = emaResult.map((value, index) => ({
    time: dataRef.current.candles[index + ema_input.period - 1].time,
    value: value,
  }));
  const sma_input20 = {
    values: dataRef.current.candles.map(candle => candle.close),
    period: 20, // default period for SMA
  };
  const smaResult20 = SMA.calculate(sma_input20);
  dataIndicatorRef.current.sma20 = smaResult20.map((value, index) => ({
    time: dataRef.current.candles[index + sma_input20.period - 1].time,
    value: value,
  }));
  const sma_input50 = {
    values: dataRef.current.candles.map(candle => candle.close),
    period: 50, // default period for SMA
  };
  const smaResult50 = SMA.calculate(sma_input50);
  dataIndicatorRef.current.sma50 = smaResult50.map((value, index) => ({
    time: dataRef.current.candles[index + sma_input50.period - 1].time,
    value: value,
  }));
  const sma_input200 = {
    values: dataRef.current.candles.map(candle => candle.close),
    period: 200, // default period for SMA
  };
  const smaResult200 = SMA.calculate(sma_input200);
  dataIndicatorRef.current.sma200 = smaResult200.map((value, index) => ({
    time: dataRef.current.candles[index + sma_input200.period - 1].time,
    value: value,
  }));
  const adx_input = {
    // time: dataRef.current.candles.map(candle => candle.time) as Time[],
    high: dataRef.current.candles.map(candle => candle.high),
    low: dataRef.current.candles.map(candle => candle.low),
    close: dataRef.current.candles.map(candle => candle.close),
    period: 14, // default period for ADX
  }
  const adxResult = ADX.calculate(adx_input);
  const offset = dataRef.current.candles.length - adxResult.length;

  dataIndicatorRef.current.adx = adxResult.map((item, index) => ({
    time: dataRef.current.candles[index + offset].time,
    value: item.adx,
  }))
  dataIndicatorRef.current.pdi = adxResult.map((item, index) => ({
    time: dataRef.current.candles[index + offset].time,
    value: item.pdi,
  }))
  dataIndicatorRef.current.mdi = adxResult.map((item, index) => ({
    time: dataRef.current.candles[index + offset].time,
    value: item.mdi,
  }))
}
const RealtimeUpdate = (updateData, candleSeries, volumeSeries) => {

  // function* la generator to yield data points one by one when streamingDataProvider.next() is called ->next.value
  function* getNextRealtimeUpdate(realtimeData) {
    for (const dataPoint of realtimeData) {
      yield dataPoint;
    }
    return null;
  }
  // Simulate real-time data updates by using a generator function getNextRealtimeUpdate
  const streamingDataProvider_cancle = getNextRealtimeUpdate(updateData.candles);
  const streamingDataProvider_volume = getNextRealtimeUpdate(updateData.volumes);
  // Start a timer to update the chart every 100ms
  const intervalID = setInterval(() => {
    try {
      console.log("update new bar");
      const candle = streamingDataProvider_cancle.next();
      const volume = streamingDataProvider_volume.next();
      if (candle.done) {
        console.log("No more data to update");
        clearInterval(intervalID);
        return;
      }
      candleSeries.update(candle.value);
      volumeSeries.update(volume.value);
    }
    catch (error) {
      console.error("Error in setInterval", error);
      clearInterval(intervalID);
    }
  }, 100);
  // }, []);

}


//mock data
// const initialData = generateMockData(200, 100, Math.floor(Date.now() / 1000) - 500 * 60, 60, false);
// dataRef.current = initialData;
// const lastPrice = initialData.candles[initialData.candles.length - 1].close;
// const lastTime = initialData.candles[initialData.candles.length - 1].time;
// const updateData = generateMockData(100, lastPrice, Number(lastTime) + 60, 60, false); // generate 100 data points starting from lastTime + 60 seconds