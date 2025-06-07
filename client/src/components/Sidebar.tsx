import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import menuConfig from "./menuConfig";
import { useNavigate } from "react-router-dom";

export default function SidebarMenu() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label as string],
    }));
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 space-y-2">
      {menuConfig.map((item, idx) => (
        <div key={idx}>
          {item.children ? (
            <>
              <button
                onClick={() => toggleMenu(item.label)}
                className="flex justify-between w-full px-3 py-2 hover:bg-gray-700 rounded"
              >
                <span>{item.label}</span>
                {openMenus[item.label as string] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openMenus[item.label as string] && (
                <div className="pl-5 text-sm text-gray-300">
                  {item.children.map((sub, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(sub.path)}
                      className="cursor-pointer py-1 hover:text-white"
                    >
                      {sub.label}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              onClick={() => navigate(item.path)}
              className="cursor-pointer px-3 py-2 hover:bg-gray-700 rounded"
            >
              {item.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}