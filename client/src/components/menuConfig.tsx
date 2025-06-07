const menuConfig = [
    {
        label: "Dashboard",
        path: "/",
        icon: "dashboard",
      },
    {
      label: "Market Screening",
      icon: "market",
      children: [
        { label: "Stock", path: "/market/stock" },
        { label: "Crypto", path: "/market/crypto" },
        { label: "Onchain", path: "/market/onchain" },
      ],
    },
    {
      label: "Tradebot",
      icon: "trade",
      children: [
        { label: "Bot manage", path: "/tradebot/overview" },
        { label: "Bot detail", path: "/tradebot/detail" },
        { label: "Bot studio", path: "/tradebot/studio" },
      ],
    },

    {
      label: "Reports",
      icon: "report",
      path: "/reports", // không có submenu
      children: [
        { label: "mt5", path: "/reports/mt5" },
        
      ],
    },
    {
      label: "Settings",
      icon: "setting",
      children: [
        { label: "Overview", path: "/settings/overview" },
        { label: "Accounts", path: "/settings/acounts" },
        
      ],
    },    
  ];
  
  export default menuConfig;