// components/CalHeatmap.tsx
import React from "react";
import { useEffect, useRef } from "react";
import  CalHeatmap  from "cal-heatmap";
import Tooltip from "cal-heatmap/plugins/Tooltip";
import LegendLite from "cal-heatmap/plugins/LegendLite";
import CalendarLabel from "cal-heatmap/plugins/CalendarLabel";
import "cal-heatmap/cal-heatmap.css";

// interface CalHeatmapProps {
//   data: Record<string, number>; // { timestamp: value }
// }

// const data_source =[
//     { date: '2025-01-01', temp_max: 2 },
//     { date: '2025-01-05', temp_max: 5 },

// ]
// export default function CalHeatmapComponent({ data }: CalHeatmapProps) {
interface CalHeatmapProps {
  const calRef = useRef<HTMLDivElement>(null); // Removed unused variable
}
  useEffect(() => {
    const cal = new CalHeatmap();
    if (!calRef.current) return;
export default function CalHeatmapComponent({ data }: CalHeatmapProps) {
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cal = new CalHeatmap();
            y: (d: { temp_max: number }) => d.temp_max,
    cal.paint(
        {
          data: {
            source: data,
            x: 'date',
            y: d => d['temp_max'],
            groupY: 'max',
          },
          date: { start: new Date('2025-01-01') },
          range: 12,
          scale: {
            color: {
              type: 'threshold',
              range: ['#14432a', '#166b34', '#37a446', '#4dd05a'],
              domain: [10, 20, 30],
            },
          },
          domain: {
            type: 'month',
            gutter: 4,
            label: { text: 'MMM', textAlign: 'start', position: 'top' },
          },
          subDomain: { type: 'ghDay', radius: 2, width: 11, height: 11, gutter: 4 },
              text: function (date: Date, value: number | null, dayjsDate: any) {
        },
        [
          [
            Tooltip,
            {
              text: function (date, value, dayjsDate) {
                return (
                  (value ? value : 'No') +
                  ' contributions on ' +
                  dayjsDate.format('dddd, MMMM D, YYYY')
                );
              },
            },
          ],
          [
            LegendLite,
            {
              includeBlank: true,
              itemSelector: '#ex-ghDay-legend',
              radius: 2,
              width: 11,
              height: 11,
              gutter: 4,
            },
              text: () => {
                const dayjs = require('dayjs');
                return dayjs.weekdaysShort().map((d: string, i: number) => (i % 2 === 0 ? '' : d));
              },
          [
            CalendarLabel,
            {
              width: 30,
              textAlign: 'start',
              text: () => dayjs.weekdaysShort().map((d, i) => (i % 2 == 0 ? '' : d)),
              padding: [25, 0, 0, 0],
            },
          ],
        ]
    );
    return (
        <div
          style={{
            // background: '#22272d',
            color: '#adbac7',
            borderRadius: '3px',
            padding: '1rem',
            overflow: 'hidden',
          }}
        >
          <div id="ex-ghDay" className="margin-bottom--md"></div>
          <a
            className="button button--sm button--secondary margin-top--sm"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              cal.previous();
            }}
          >
            ← Previous
          </a>
          <a
            className="button button--sm button--secondary margin-top--sm margin-left--xs"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              cal.next();
            }}
          >
            Next →
          </a>
          <div style={{ float: 'right', fontSize: 12 }}>
            <span style={{ color: '#768390' }}>Less</span>
            <div
              id="ex-ghDay-legend"
              style={{ display: 'inline-block', margin: '0 4px' }}
            ></div>
            <span style={{ color: '#768390', fontSize: 12 }}>More</span>
          </div>
        </div>
      );
    // return () => cal.destroy();
  }, [data]);

//   return <div ref={calRef} className="w-full" />;
  

}