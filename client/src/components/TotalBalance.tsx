














































































export default Sidebar;}  );    </div>      {/* ...existing code... */}    <div className="ml-30 p-4">  return (export function TotalBalance() {}  );    </div>      </div>        </Button>          </span>            Logout          <span className="transition-opacity duration-300 opacity-0 group-hover:opacity-100">          <LogOut className="h-4 w-4 flex-shrink-0" />        >        //   onClick={() => logoutMutation.mutate()}          className="w-full justify-start gap-2 px-2 text-red-500 hover:text-red-600 overflow-hidden whitespace-nowrap"          variant="ghost"        <Button      <div className="p-2 border-t border-border">      </nav>        })}          );            </Link>              </Button>                </span>                  {item.label}                <span className="opacity-100">                <Icon className="h-4 w-4 flex-shrink-0" />              >                )}                  "overflow-hidden whitespace-nowrap"                  location === item.href && "bg-sidebar-accent",                  "w-full justify-start gap-2 mb-1 px-2",                className={cn(                variant={location === item.href ? "secondary" : "ghost"}              <Button            <Link key={item.href} href={item.href}>          return (          const Icon = item.icon;        {menuItems.map((item) => {      <nav className="flex-1 px-2">      </div>        </h1>          AI        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate">      <div className="p-3 overflow-hidden whitespace-nowrap">    <div className="fixed h-screen w-30 bg-sidebar border-r border-border bg-opacity-100">  return (//   const { logoutMutation } = useAuth();  const [location] = useLocation();export function Sidebar() {];  { icon: Settings, label: "Settings", href: "/settings" },  { icon: History, label: "Backtest", href: "/backtest" },  { icon: LineChart, label: "Screener", href: "/screener" },  { icon: BarChart3, label: "Dashboard", href: "/" },const menuItems = [} from "lucide-react";  LogOut  History,  Settings,  LineChart,  BarChart3,import {// import { useAuth } from "@/hooks/use-auth";import { Button } from "@/components/ui/button";import { cn } from "@/lib/utils";import { Link, useLocation } from "wouter";