import React from "react";
import { Chart } from "react-google-charts";

export const data = [
  ["From", "To", "Weight"],
  ["Doanh  thu A", "Sol", 5],
  ["Doanh  thu B", "Sol", 10],
  ["Sol", "Chi tiêu A", 6],
  ["Sol", "Chi tiêu B", 2],
  ["Sol", "Còn lại", 8],
  ["Chi tiêu B", "Chi tiêu X", 3],
];

export const options = {
    height :400,
    width :600,
    sankey: { 
              iterations: 32, // defauklt 32
              node: { width: 50  ,nodePadding: 80 } ,
              link: {
                    // color: {
                    // // // fill: '#efd',     // Color of the link.
                    // fillOpacity: 0.8, // Transparency of the link.
                    // // // stroke: 'black',  // Color of the link border.
                    // // // strokeWidth: 1    // Thickness of the link border (default 0).
                    // },
                    // colors: [
                    // '#a6cee3',        // Custom color palette for sankey links.
                    // '#1f78b4',        // Nodes will cycle through this palette
                    // '#b2df8a',        // giving the links for that node the color.
                    // '#33a02c'
                    // ]
                    colorMode :'source'
                }},
};

export default function Sankey() {
  return (
    <div className="w-full flex flex-col p-2">
      <h2 className="text-xl font-bold mb-4">Sankey Diagram</h2>
        <Chart
        chartType="Sankey"
        width="100%"
        height="100%"
        data={data}
        options={options}
        />
    </div>    
  );
}
