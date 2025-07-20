import React from 'react';

import CalHeatmapComponent from "@/components/CalHeatmap"

// const data_source = [
//   { "date": "2025-01-01", "temp_max": 2 },
//   { "date": "2025-01-02", "temp_max": 5 },
//   { "date": "2025-01-05", "temp_max": 5 },
// ];
  const dataSample= [
    { "date": "2025-01-01", "temp_max": 18 },
    { "date": "2025-01-02", "temp_max": 21 },
    { "date": "2025-01-03", "temp_max": 19 },
    { "date": "2025-01-04", "temp_max": 23 },
    { "date": "2025-01-05", "temp_max": 25 },
    { "date": "2025-01-06", "temp_max": 22 },
    { "date": "2025-01-07", "temp_max": 17 }
  ];
export default function ReportMT5() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Activity Heatmap</h2>
      <CalHeatmapComponent data= {dataSample}/>

    </div>
  );
}