import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// import { useAuth } from "@/hooks/use-auth";
import {
  BarChart3,
  LineChart,
  Settings,
  History,
  LogOut
} from "lucide-react";

const menuItems = [
  { icon: BarChart3, label: "Dashboard", href: "/" },
  { icon: LineChart, label: "Screener", href: "/screener" },
  { icon: History, label: "Backtest", href: "/backtest" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();
//   const { logoutMutation } = useAuth();

  return (
    // <div className="fixed h-screen bg-sidebar border-r border-border">
    <div className="fixed h-screen bg-sidebar w-35 border-r border-border">
      <div className="p-4 overflow-hidden whitespace-nowrap">
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate">
          AI
        </h1>
      </div>

      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 mb-2 px-3",
                  location === item.href && "bg-sidebar-accent",
                  "overflow-hidden whitespace-nowrap"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="opacity-100">
                  {item.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 px-3 text-red-500 overflow-hidden whitespace-nowrap"
        //   onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span className="opacity-100">
            Logout
          </span>
        </Button>
      </div>
    </div>
  );
}
export default Sidebar;