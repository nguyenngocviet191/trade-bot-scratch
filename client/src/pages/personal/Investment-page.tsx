import { Chart } from "react-google-charts";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, LabelList } from 'recharts';
const portfolioData = [
  { name: 'AAPL', value: 25.8, color: '#4285F4' },
  { name: 'AXP', value: 15.8, color: '#FFA726' },
  { name: 'KO', value: 11.1, color: '#BA68C8' },
  { name: 'BAC', value: 10.2, color: '#4DB6AC' },
  { name: 'CVX', value: 7.7, color: '#F44336' },
  { name: 'OXY', value: 5.1, color: '#FFD54F' },
  { name: 'MCO', value: 4.4, color: '#90CAF9' },
  { name: 'KHC', value: 3.8, color: '#81D4FA' },
  { name: 'CB', value: 3.2, color: '#B39DDB' },
  { name: 'DVA', value: 2.1, color: '#4FC3F7' },
  { name: 'Other', value: 9.8, color: '#BDBDBD' },
];



export default function WarrenPortfolioChart() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">Portfolio Breakdown</h2>
      <div className="flex flex-col">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={portfolioData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
              {portfolioData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
            <Tooltip />
            <LabelList dataKey="name" position="outside" />
          </PieChart>
        </ResponsiveContainer>

        <div>
          <table className="text-sm w-full">
            <thead>
              <tr>
                <th className="text-left">Stock</th>
                <th className="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.map((entry, i) => (
                <tr key={i}>
                  <td className="py-1">{entry.name}</td>
                  <td className="text-right">{entry.value}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}