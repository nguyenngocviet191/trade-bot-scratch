import { Home,ChartArea , BriefcaseBusiness,ChartPie,User, Settings ,Book } from "lucide-react"
const menuConfig = [
    {
        label: "Home",
        path: "/",
        icon: Home,
      },
    {
      label: "Fintech",
      icon: ChartArea,
      path: "/fintech",
      // children: [
      //   { label: "Overview", path: "/fintech" },
      //   { label: "Market", path: "/fintech/market" },
      //   { label: "Metatrader", path: "/fintech/metatrader" },

      // ],
    },
    {
      label: "Business",
      icon: BriefcaseBusiness,
      path: "/business",
      children: [
        { label: "Overview", path: "/business" },
        { label: "Bot manage", path: "/trading/bot_manage" },
        { label: "Bot detail", path: "/trading/detail" },
        { label: "Bot studio", path: "/trading/bot_studio" },
        
      ],
    },
    {
      label: "Personal",
      icon: ChartPie,
      path : "/personal",
      // children: [
      //   { label: "Goal", path: "/personal/goal" },
      //   { label: "Earning", path: "/personal/earning" },
      //   { label: "Transact", path: "/personal/transact" },
      //   { label: "Budget", path: "/personal/budget" },
      //   { label: "Portfolio", path: "/personal/portolio" },
      // ],
    },
    {
      label: "Reports",
      icon: User,
      path: "/reports", // không có submenu
      children: [
        { label: "Metatrader", path: "/reports/metatrader" },
        { label: "Sankey", path: "/reports/sankey" },
        { label: "Test", path: "/reports/test" }
      ],
    },
    {
      label: "Knowledge",
      icon: Book,
      path: "/knowledge", // không có submenu

    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
      children: [
        { label: "Overview", path: "/settings" },
        { label: "Accounts", path: "/settings/acounts" },
        
      ],
    },    
  ];
  
  export default menuConfig;