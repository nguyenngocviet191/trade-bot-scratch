// import { Switch, Route } from "wouter";
// import { queryClient } from "@/lib/queryClient";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
// import { AuthProvider } from "@/hooks/use-auth";
import Sidebar from "@/components/sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/header";
import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
// import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/Home-page";
// import ReportMt5Page from "@/pages/Report-MT5-page";
import BotMgmtPage from "@/pages/fintech/Bot_manage-page";

import IndevelopePage from "@/pages/Indevelope-page";
import MetatraderPage from "@/pages/fintech/Metatrader-page";
import MarketPage from "@/pages/fintech/Market-page";
import TestPage from "@/pages/Test-page";
import PersonalPage from "@/pages/personal/Personal-page";
import KnowledgePage from "@/pages/knowledge/Knowledge-page";
import QuotePage from "@/pages/knowledge/Quote-page";
import SankeyPage from "@/pages/Sankey-page";
import FintechPage from "./pages/fintech/Fintech-page";
import HookSignalPage from "@/pages/fintech/HookSignal-page";
// import BacktestPage from "@/pages/backtest-page";
// import SettingsPage from "@/pages/settings-page";
// import NotFound from "@/pages/not-found";
// import InvoicesPieChart from "./components/invoice-pricechart";


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        {/* header */}
        <div className='flex flex-row overflow-hidden h-8 '>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-800 dark:text-white w-8 h-8 flex items-center justify-center bg-blue-500"
          >
            ☰
          </button>
          <Header username="Shin" />
          {/* <div className="flex-1"></div> */}


        </div>

        {/* Sidebar cho Desktop */}
        <div className="h-screen flex flex-row overflow-hidden">
          <div className="hidden md:block">
            {/* <Sidebar /> */}
            <Sidebar />

          </div>
          <main className="flex flex-1 overflow-y-auto scrollbar-hidden  overflow-x-hidden">
            <Routes>
              <Route path="/fintech" element={<FintechPage />} />
              <Route path="/fintech/market" element={<MarketPage />} />
              <Route path="/fintech/metatrader" element={<MetatraderPage />} />
              <Route path="/fintech/hooksignal" element={<HookSignalPage />} />
              <Route path="/tradebot/bot_manage" element={<BotMgmtPage />} />

              <Route path="/knowledge" element={<KnowledgePage />} />
              <Route path="/knowledge/quote" element={<QuotePage />} />
              <Route path="/personal" element={<PersonalPage />} />
              <Route path="/test" element={<TestPage />} />
              {/* <Route path="/reports/sankey" element={<SankeyPage />} /> */}
            </Routes>
          </main>
        </div>

        {/* Sidebar popup cho Mobile */}
        {sidebarOpen && (
          //layer gương trong bao phu
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)}>
            {/* sidebar */}
            <div className="absolute left-0 top-0 w-64 h-full bg-gray-800 text-white z-50" onClick={e => e.stopPropagation()}>
              <Sidebar onClose={() => setSidebarOpen(false)} />

            </div>
          </div>
        )}
        <BottomNav />



        {/* <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex-1 overflow-y-auto p-4">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reports/mt5" element={<ReportMt5Page />} />
            </Routes>
          </main>
        </div> */}
      </div>
    </HashRouter>
  );
}

export default App;