import React from "react";
import { Link } from "wouter";
import { useState } from "react";

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-900 text-white p-5 transition-all duration-300 ${isHovered ? "w-40" : "w-20"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h1 className={`text-2xl font-bold mb-5 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        📊 TradeBot
      </h1>
      <nav className="flex flex-col gap-3">
        <Link href="/" className="hover:bg-gray-700 p-2 rounded flex items-center">
          🏠
          {isHovered && <span className="ml-2">Home</span>}
        </Link>
        <Link href="/market" className="hover:bg-gray-700 p-2 rounded flex items-center">
          📈
          {isHovered && <span className="ml-2">Market</span>}
        </Link>
        <Link href="/backtest" className="hover:bg-gray-700 p-2 rounded flex items-center">
          📊
          {isHovered && <span className="ml-2">Backtest</span>}
        </Link>
        <Link href="/report" className="hover:bg-gray-700 p-2 rounded flex items-center">
          📑
          {isHovered && <span className="ml-2">Report</span>}
        </Link>
        <Link href="/setting" className="hover:bg-gray-700 p-2 rounded flex items-center">
          ⚙️
          {isHovered && <span className="ml-2">Setting</span>}
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;