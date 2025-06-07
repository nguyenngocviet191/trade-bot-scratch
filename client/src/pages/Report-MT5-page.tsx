import React from 'react';

import CalHeatmapComponent from "@/components/CalHeatmap"

const data_source = [
  { date: "2025-01-01", temp_max: 2 },
  { date: "2025-01-02", temp_max: 5 },
  { date: "2025-01-05", temp_max: 5 },
];

export default function ReportMT5() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Activity Heatmap</h2>
      <CalHeatmapComponent data={data_source} />
    </div>
  );
}