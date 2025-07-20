// components/CalHeatmap.tsx
import React from "react";
import { useEffect, useRef } from "react";
import CalHeatmap from "cal-heatmap";
import Tooltip from "cal-heatmap/plugins/Tooltip";
import LegendLite from "cal-heatmap/plugins/LegendLite";
import CalendarLabel from "cal-heatmap/plugins/CalendarLabel";
import "cal-heatmap/cal-heatmap.css";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/en"; // hoặc "vi" nếu dùng tiếng Việt

dayjs.extend(localeData);
dayjs.locale("en"); // hoặc "vi"

type DataItem = {
    date: string; // format: YYYY-MM-DD
    temp_max: number;
  };
 //  const dataSample: DataItem[] = [
//     { date: "2025-01-01", temp_max: 18 },
//     { date: "2025-01-02", temp_max: 21 },
//     { date: "2025-01-03", temp_max: 19 },
//     { date: "2025-01-04", temp_max: 23 },
//     { date: "2025-01-05", temp_max: 25 },
//     { date: "2025-01-06", temp_max: 22 },
//     { date: "2025-01-07", temp_max: 17 },
//   ];

type Props = {
    data: DataItem[];
  };
  
export default function CalHeatmapComponent({ data }: Props) {
// export default function CalHeatmapComponent() {
    const cal = useRef<CalHeatmap | null>(null);
    const heatmapContainer = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      if (!heatmapContainer.current) return;
    //   const sourceData = data.map((item) => ({
    //     // date: new Date(item.date),
       
    //     date: item.date,
    //     value: item.temp_max,
    //   }));
    //   console.log("sourceData", sourceData);
      cal.current = new CalHeatmap();
  
      cal.current.paint(
        {
          itemSelector: heatmapContainer.current,
          data: {
            source: data, // ensure this file is in /public
            // source: '../data/data.json',
            type: 'json',
            
            x: "date",
            y: "temp_max",
            // y: d => +d['temp_max'],
            // y: (d: any) => +d["value"],
            groupY: "sum",
          },
          date: { start: new Date("2025-01-01") },
          range: 12,
            // data: {
            //     source: '../data/seattle-weather.json',
            //     type: 'json',
            //     x: 'date',
            //     y: d => +d['temp_max'],
            //     groupY: 'max', 
            // },
            // range: 5, 
            // date: {start: new Date('2012-01-01')},
          
          scale: {
            color: {
              type: "threshold",
              range: ["#14432a", "#166b34", "#37a446", "#4dd05a"],
              domain: [10, 20, 30],
            },
          },
          domain: {
            type: "month",
            gutter: 4,
            label: { text: "MMM", textAlign: "start", position: "top" },
          },
          subDomain: {
            type: "ghDay",
            radius: 2,
            width: 11,
            height: 11,
            gutter: 4,
          },
        },
        [
          [
            Tooltip,
            {
              text: (date: Date, value: number, dayjsDate: dayjs.Dayjs) =>
                (value ?? "No") +
                " contributions on " +
                dayjsDate.format("dddd, MMMM D, YYYY"),
            },
          ],
          [
            LegendLite,
            {
              includeBlank: true,
              itemSelector: "#gh-legend",
              radius: 2,
              width: 11,
              height: 11,
              gutter: 4,
            },
          ],
          [
            CalendarLabel,
            {
                position: 'left',
                key: 'left',
                // text: () => ['Mon', '', '', 'Thu', '', '', 'Sun'],
                text: () => dayjs.weekdaysShort().map((d, i) => (i % 2 == 0 ? '' : d)),
                textAlign: 'start',
                width: 30,
                padding: [25, 0, 0, 0],
              },
          ],
        ]
      );
  
      return () => cal.current?.destroy();
    }, []);
  
    return (
    //   '<div className="bg-[#22272d] text-[#adbac7] rounded p-4 overflow-hidden">'
        <div className="text-[#adbac7] rounded p-4 overflow-hidden">
        <div ref={heatmapContainer} className="mb-4" />
  
        <div className="flex items-center justify-between">
          <div>
            <a
              href="#"
              className="button button--sm button--secondary"
              onClick={(e) => {
                e.preventDefault();
                cal.current?.previous();
              }}
            >
              ← Previous
            </a>
            <a
              href="#"
              className="button button--sm button--secondary ml-2"
              onClick={(e) => {
                e.preventDefault();
                cal.current?.next();
              }}
            >
              Next →
            </a>
          </div>
  
          <div className="flex items-center text-xs">
            <span className="text-[#768390]">Less</span>
            <div id="gh-legend" className="mx-2" />
            <span className="text-[#768390]">More</span>
          </div>
        </div>
      </div>
    );
  }