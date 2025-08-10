import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import menuConfig from "./menuConfig";
import { Link, useNavigate } from "react-router-dom";

import { Home,ChartArea , BriefcaseBusiness,ChartPie,User, Settings } from "lucide-react"
export default function SidebarMenu({ onClose }: { onClose?: () => void }) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label as string],
    }));
  };

  return (
    <div className="group min-h-screen flex flex-col bg-gray-800 text-white  p-2 space-y-2">
      {menuConfig.map((item, idx) => (
        <div key={idx}>
     
        
          {item.children ? (

            <>
              <button
                onClick={() => toggleMenu(item.label)}
                className="flex w-full gap-2  items-center hover:bg-gray-700 rounded"
              >
                <span>{item.icon && <item.icon size={18} />}</span>
                <span className="hidden group-hover:block">{item.label}</span>
                <div className= "ml-auto hidden group-hover:block">
                  {openMenus[item.label as string] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
              </button>
              {openMenus[item.label as string] && (
                <div className="pl-5 text-sm text-gray-300">
                  {item.children.map((sub, i) => (
                    <ul>
                       <Link to={sub.path}> {sub.label} </Link>
                    </ul>

                  ))}
                </div>
              )}
            </>


          ) :
          (<Link to={item.path}>
            <div className="flex flex-row items-center gap-2">
              <span>{item.icon && <item.icon size={18} />}</span>
              <span className="hidden group-hover:block">{item.label}</span>
            </div>
          </Link>)
          }
        </div>
      ))}
    </div>
  );
}