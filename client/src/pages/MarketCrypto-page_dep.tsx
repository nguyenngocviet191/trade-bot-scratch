import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu
export type Token = {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
    };
  };
};

type CoinMarketCapResponse = {
  data: Token[];
};

export default function TokenList() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem('cmc_tokens');
    const cachedTime = localStorage.getItem('cmc_tokens_time');
    const isFresh = cached && cachedTime && (Date.now() - Number(cachedTime) < 1000 * 60 * 5); // 5 phút

    if (isFresh) {
      setTokens(JSON.parse(cached));
      return;
    }
    const apiKey = import.meta.env.VITE_CMC_API_KEY; //
    console.log('API Key:', apiKey);
    axios
      .get<CoinMarketCapResponse>('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=50', {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
        },
      })
      .then((res) => {
        setTokens(res.data.data);
        localStorage.setItem('cmc_tokens', JSON.stringify(res.data.data));
        localStorage.setItem('cmc_tokens_time', String(Date.now()));
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAddWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist((prev) => [...prev, symbol]);
    }
  };

  const filtered = tokens.filter((token) =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Top Tokens</h1>
      <input
        type="text"
        placeholder="Search token..."
        className="border px-3 py-2 rounded w-full mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul className="space-y-2">
        {filtered.map((token) => (
          <li key={token.id} className="flex justify-between items-center p-3 bg-gray-100 rounded">
            <div className="flex items-center gap-3">
              <img
                src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`}
                alt={token.name}
                className="w-8 h-8"
              />
              <div>
                <div className="font-semibold">{token.name} ({token.symbol})</div>
                <div className="text-sm text-gray-600">${token.quote.USD.price.toFixed(2)}</div>
              </div>
            </div>
            <button
              onClick={() => handleAddWatchlist(token.symbol)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add to Watchlist
            </button>
          </li>
        ))}
      </ul>

      {watchlist.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Watchlist</h2>
          <ul className="list-disc pl-5 text-gray-700">
            {watchlist.map((symbol, i) => (
              <li key={i}>{symbol}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
