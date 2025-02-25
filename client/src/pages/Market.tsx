import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Market = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get('http://localhost:5001/crypto/BTC/USD/1h');
        setPrice(response.data.price);
      } catch (err) {
        setError('Failed to fetch price');
      }
    };

    fetchPrice();
  }, []);

  return (
    <div>
      <div className="p-4 text-xl">📈 Market Page</div>
      {error && <div className="text-red-500">{error}</div>}
      {price !== null ? (
        <div className="text-green-500">Current BTC/USD Price: {price}</div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Market;
