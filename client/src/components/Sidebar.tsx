import React from "react";
import { Link } from "wouter";

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-5">📊 TradeBot</h1>
      <nav className="flex flex-col gap-3">
        <Link href="/" className="hover:bg-gray-700 p-2 rounded">🏠 Home</Link>
        <Link href="/market" className="hover:bg-gray-700 p-2 rounded">📈 Market</Link>
        <Link href="/backtest" className="hover:bg-gray-700 p-2 rounded">📊 Backtest</Link>
        <Link href="/report" className="hover:bg-gray-700 p-2 rounded">⚙️ Setting</Link>
      </nav>
    </div>
  );
};

export default Sidebar;