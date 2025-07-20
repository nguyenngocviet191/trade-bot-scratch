// components/MobileBottomNav.tsx
"use client"

import { Home,ChartArea , BriefcaseBusiness,ChartPie,User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import menuConfig from "./menuConfig";
import { path } from "d3"



export default function BottomNav() {
  const navigate = useNavigate()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md flex justify-around items-center h-16  md:hidden">
      {menuConfig.map((item, index) => {
        const Icon = item.icon
        return (
          <Button
            key={index}
            onClick={() => navigate(item.path)}
            variant="ghost"
            size="icon"
            className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary"
          >
            <Icon className="h-10 w-10" />
            {/* <span className="text-[10px]">{item.label}</span> */}
          </Button>
        )
      })}
    </nav>
  )
}