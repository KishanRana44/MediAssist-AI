import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Activity, 
  HeartPulse, 
  FileText, 
  History, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import logo from "../assets/logo.png";

function Sidebar() {
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "ECG Analysis", path: "/ecg", icon: Activity },
    { name: "Heart Sound Analysis", path: "/heart-sound", icon: HeartPulse },
    { name: "AI Chat Assistant", path: "/chat", icon: MessageSquare },
    { name: "Medical Report", path: "/report", icon: FileText },
    { name: "History", path: "/history", icon: History },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* FLOATING TOGGLE BUTTON */}
      {isHidden && (
        <button
          onClick={() => setIsHidden(false)}
          className="fixed top-6 left-6 z-50 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:text-rose-800 transition-all shadow-lg hover:scale-105"
          aria-label="Show Sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* SIDEBAR MAIN CONTAINER - LIGHT RED / ROSE GRADIENT THEME */}
      <div 
        className={`font-serif bg-gradient-to-b from-rose-50/90 via-red-50/60 to-rose-100/80 text-rose-950/70 h-screen flex flex-col justify-between p-5 border-r border-rose-200/80 shadow-sm select-none transition-all duration-300 ease-in-out shrink-0 z-40 ${
          isHidden ? "w-0 p-0 border-none overflow-hidden opacity-0" : "w-64 opacity-100"
        }`}
      >
        {/* TOP BLOCK: LOGO & CLOSE TRIGGER */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-8 px-1 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <img 
                src={logo} 
                alt="CardiacSaarthi AI Logo" 
                className="h-100 w-auto max-w-[140px] object-contain shrink-0 drop-shadow-sm rounded-xl" 
              />
            </div>
            
            <button 
              onClick={() => setIsHidden(true)}
              className="p-1.5 rounded-xl bg-white/70 border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-white transition-colors shadow-xs"
              aria-label="Hide Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* NAVIGATION LINKS CONTAINER */}
          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-semibold tracking-wide transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-500/25 font-bold"
                      : "text-rose-900/75 hover:bg-white/80 hover:text-rose-700 hover:shadow-xs"
                  }`
                }
              >
                <div className="flex items-center gap-3.5 overflow-hidden whitespace-nowrap">
                  <item.icon size={18} className="opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
                  <span>{item.name}</span>
                </div>
                
                {item.badge && (
                  <span className="bg-red-100 text-red-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 border border-red-200">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* BOTTOM SECTION: PROFILE & LOGOUT BUTTON */}
        <div className="space-y-1 mt-auto pt-2 shrink-0">
          <hr className="border-rose-200/80 my-2" />

          {/* Interactive Sign Out Row */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-700 hover:text-white hover:bg-gradient-to-r hover:from-rose-500 hover:to-red-600 transition-all group overflow-hidden whitespace-nowrap shadow-xs hover:shadow-md hover:shadow-rose-400/20"
          >
            <LogOut size={18} className="opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </>
  );
}

export default Sidebar;