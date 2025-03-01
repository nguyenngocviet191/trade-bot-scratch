import React from 'react';

type Currency = {
  symbol: string;
  base: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type CurrencyTableProps = {
  currencies: Currency[];
  onCurrencyClick: (pair: string) => void;
};

const CurrencyTable: React.FC<CurrencyTableProps> = ({ currencies, onCurrencyClick }) => {
  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2">Symbol</th>
          <th className="py-2">Base</th>
          <th className="py-2">Timestamp</th>
          <th className="py-2">Open</th>
          <th className="py-2">High</th>
          <th className="py-2">Low</th>
          <th className="py-2">Close</th>
          <th className="py-2">Volume</th>
        </tr>
      </thead>
      <tbody>
        {currencies.map((currency, index) => (
          <tr key={index} onClick={() => onCurrencyClick(`${currency.symbol}/${currency.base}`)}>
            <td className="py-2">{currency.symbol}</td>
            <td className="py-2">{currency.base}</td>
            <td className="py-2">{new Date(currency.timestamp).toLocaleString()}</td>
            <td className="py-2">{currency.open}</td>
            <td className="py-2">{currency.high}</td>
            <td className="py-2">{currency.low}</td>
            <td className="py-2">{currency.close}</td>
            <td className="py-2">{currency.volume}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CurrencyTable;
