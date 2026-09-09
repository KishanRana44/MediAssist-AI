import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  UploadCloud, 
  Activity, 
  HeartPulse, 
  FileText, 
  History, 
  MessageSquare,
  Bone,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";

function Sidebar() {
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "ECG Analysis", path: "/ecg", icon: Activity },
    { name: "Heart Sound Analysis", path: "/heart-sound", icon: HeartPulse },
    { name: "AI Chat Assistant", path: "/chat", icon: MessageSquare },
    { name: "Medical Report", path: "/report", icon: FileText },
    { name: "X-Ray Analysis", path: "/xray", icon: Bone },
    { name: "History", path: "/history", icon: History },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* FLOATING TOGGLE BUTTON: Jab sidebar hidden hoga, ye button screen par float karega */}
      {isHidden && (
        <button
          onClick={() => setIsHidden(false)}
          className="fixed top-6 left-6 z-50 p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 text-slate-400 hover:text-white transition-all shadow-xl hover:scale-105"
          aria-label="Show Sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* SIDEBAR MAIN CONTAINER */}
      <div 
        className={`bg-[#0b0f19] text-[#94a3b8] h-screen flex flex-col justify-between p-5 border-r border-slate-950 select-none transition-all duration-300 ease-in-out shrink-0 z-40 ${
          isHidden ? "w-0 p-0 border-none overflow-hidden opacity-0" : "w-64 opacity-100"
        }`}
      >
        {/* TOP BLOCK: LOGO & CLOSE TRIGGER */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-8 px-1 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <HeartPulse className="text-white animate-pulse" size={22} />
              </div>
              <div className="text-left">
                <h1 className="font-black text-white text-md tracking-tight leading-none">MediAssist AI</h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-1 uppercase">Smart. Accurate.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsHidden(true)}
              className="p-1.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white transition-colors"
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
                  `flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold tracking-wide transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/15"
                      : "hover:bg-slate-900/60 hover:text-slate-200"
                  }`
                }
              >
                <div className="flex items-center gap-3.5 overflow-hidden whitespace-nowrap">
                  <item.icon size={18} className="opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
                  <span>{item.name}</span>
                </div>
                
                {item.badge && (
                  <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* BOTTOM SECTION: PROFILE & LOGOUT BUTTON */}
        <div className="space-y-1 mt-auto pt-2 bg-[#0b0f19] shrink-0">
          <hr className="border-slate-800/60 my-1" />

          {/* Interactive Sign Out Row */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-rose-400/90 hover:text-rose-400 hover:bg-rose-500/10 transition-all group overflow-hidden whitespace-nowrap"
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