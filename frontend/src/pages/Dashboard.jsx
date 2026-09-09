import { useEffect, useState } from "react";
import {
  Activity,
  HeartPulse,
  FileText,
  ShieldCheck,
  ChevronRight,
  Dumbbell,
  Heart,
  Droplet,
  Calendar,
  Sparkles,
  ChevronDown
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import API from "../services/api";

export default function Dashboard() {
  // Database States setup - Completely Dynamic Layout Mappings
  const [stats, setStats] = useState({
    user: {
      name: "Loading...",
      patientId: "---",
      age: "--",
      gender: "--",
      bloodGroup: "--"
    },
    ecgCount: 0,
    heartCount: 0,
    reportCount: 0,
    imageCount: 0,
    riskLevel: "Low",
    heartHealthScore: 100,
    recentAnalyses: [], // Array mapping dynamic logs from collections
    aiDirectives: []    // Array mapping system AI recommendations 
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileMenu(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      // Fetches calculations computed from USERS, PATIENTS, ECG_RECORDS, etc.
      const res = await API.get("/dashboard/stats");
      console.log("Dashboard Data:", res.data);
      if (res.data) {
        setStats((prev) => ({
          ...prev,
          ...res.data
        }));
      }
    } catch (error) {
      console.error("Error fetching database dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper utility for setting dynamic CSS styling matching system analysis flags
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high": return "text-rose-500 border-rose-100 bg-rose-50";
      case "moderate": return "text-amber-500 border-amber-100 bg-amber-50";
      default: return "text-emerald-500 border-emerald-100 bg-emerald-50";
    }
  };

  const getLogIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "ecg rhythm": return <Activity size={14} className="text-emerald-500" />;
      case "heart sound": return <Heart size={14} className="text-rose-500" />;
      default: return <FileText size={14} className="text-blue-500" />;
    }
  };

  const getDirectiveIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case "cardio": return <Dumbbell size={16} className="text-blue-600" />;
      case "vitals": return <Heart size={16} className="text-rose-500" />;
      case "hydration": return <Droplet size={16} className="text-sky-500" />;
      default: return <Calendar size={16} className="text-amber-500" />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <DashboardLayout>
      <div className="bg-[#f8f9fe] min-h-screen w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 text-gray-900 font-sans">
        <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8">
          
          {/* TOP PROFILE BAR*/}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6 sm:pb-0 sm:border-none">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2 flex-wrap">
                {getGreeting()}, {stats?.user?.name?.split(" ")[0] || "User"}! <span className="animate-bounce inline-block"></span>
              </h1>
            </div>
            
            {}
            {/* Action Group with Adaptive Alignment */}
            <div className="relative flex items-center w-full sm:w-auto justify-end">
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu(!showProfileMenu);
                }}
                className="flex items-center gap-2.5 bg-white pl-2.5 pr-4 py-1.5 rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all shrink-0"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center font-bold text-white text-xs uppercase">
                {stats?.user?.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "US"}
                </div>

                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-gray-800 leading-none">
                    {stats?.user?.name || "Unknown User"}
                  </p>

                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    Patient ID: {stats?.user?.patientId || "N/A"}
                  </p>
                </div>

                <ChevronDown size={14} className={`text-gray-400 hidden md:block transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-14 w-[250px] h-[170px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              
                  {/* Details */}
                  <div className="p-5 space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Patient ID</span>
                      <span className="font-semibold">{stats?.user?.patientId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age</span>
                      <span className="font-semibold">{stats?.user?.age || "--"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender</span>
                      <span className="font-semibold">{stats?.user?.gender || "--"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Blood Group</span>
                      <span className="font-semibold">{stats?.user?.bloodGroup || "--"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          {/* METRICS / KPI GRID - Dynamic Column Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Card 1: Dynamic Aggregated Heart Health Score */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px] relative overflow-hidden hover:shadow-md transition-all">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-400 tracking-wide uppercase">Heart Health Score</p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tight">
                      {stats.heartHealthScore}
                    </span>
                    <span className="text-gray-400 font-bold text-base">/ 100</span>
                  </div>
                  <p className={`font-black text-xs sm:text-sm mt-1.5 flex items-center gap-1 ${stats.heartHealthScore >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${stats.heartHealthScore >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {stats.heartHealthScore >= 75 ? "Optimal State" : "Review Needed"}
                  </p>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl">
                  <HeartPulse size={20} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-10 w-full px-1 opacity-70 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,25 Q15,20 30,23 T60,10 T90,18 T100,5" fill="none" stroke={stats.heartHealthScore >= 75 ? "#10b981" : "#f59e0b"} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: ECG Records Count */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px] relative overflow-hidden hover:shadow-md transition-all">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-400 tracking-wide uppercase">ECG Signals</p>
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mt-3 tracking-tight">
                    {stats.ecgCount}
                  </h2>
                  <p className="text-gray-400 font-semibold text-xs mt-2">Active Signals Checked</p>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
                  <Activity size={20} />
                </div>
              </div>
              <div className="absolute bottom-1 left-0 right-0 h-8 w-full px-2 opacity-40 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                  <path d="M0,20 L40,20 L45,10 L50,30 L55,20 L90,20 L95,5 L100,35 L105,20 L150,20 L155,15 L160,25 L165,20 L200,20" fill="none" stroke="#10b981" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Card 3: Total Consolidated Structured Reports & Images */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px] relative overflow-hidden hover:shadow-md transition-all">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-400 tracking-wide uppercase">Processed Documents</p>
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mt-3 tracking-tight">
                    {stats.reportCount + stats.imageCount}
                  </h2>
                  <p className="text-indigo-500 font-bold text-xs mt-2">{stats.reportCount} Reports | {stats.imageCount} Med Images</p>
                </div>
                <div className="p-2.5 bg-violet-50 text-violet-500 rounded-xl">
                  <FileText size={20} />
                </div>
              </div>
              <div className="absolute bottom-2 right-4 h-8 flex items-end gap-1 opacity-30 pointer-events-none">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                <div className="w-1 h-7 bg-indigo-500 rounded-full"></div>
              </div>
            </div>

            {/* Card 4: AI Context-Driven Consolidated Risk Level */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px] relative overflow-hidden hover:shadow-md transition-all">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-400 tracking-wide uppercase">AI Cross-Risk Status</p>
                  <h2 className={`text-3xl font-black mt-4 tracking-tight ${
                    stats.riskLevel === 'Low' ? 'text-emerald-500' : stats.riskLevel === 'Moderate' ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {stats.riskLevel} Risk
                  </h2>
                  <p className="text-gray-400 font-semibold text-xs mt-1.5">
                    {stats.riskLevel === 'Low' ? 'All records appear stable' : 'Requires clinical analysis review'}
                  </p>
                </div>
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="absolute bottom-[-12px] right-1 w-20 h-12 opacity-30 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                  <path 
                    d="M 10 50 A 40 40 0 0 1 45 14" 
                    fill="none" 
                    stroke={stats.riskLevel === 'Low' ? '#10b981' : stats.riskLevel === 'Moderate' ? '#f59e0b' : '#ef4444'} 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* BOTTOM WORKSPACE WORKFLOW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

            {/* LEFT SIDE: Dynamic Analysis Logs Table from DB */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <Activity size={16} />
                    </span>
                    <h2 className="font-extrabold text-base sm:text-lg text-gray-800">Recent Medical Metrics</h2>
                  </div>
                  <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700 transition flex items-center gap-0.5">
                    View Logs <ChevronRight size={14} />
                  </button>
                </div>

                <div className="w-full overflow-x-auto rounded-xl [scrollbar-width:thin]">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100/80">
                        <th className="pb-3 font-bold">Log Type</th>
                        <th className="pb-3 font-bold">Diagnostics Info</th>
                        <th className="pb-3 font-bold">Scanned Date</th>
                        <th className="pb-3 font-bold text-right">Database Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs sm:text-sm font-medium text-gray-700">
                      {stats.recentAnalyses.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-gray-400 font-medium">
                            No recent diagnosis data streams logged in database.
                          </td>
                        </tr>
                      ) : (
                        stats.recentAnalyses.map((log, index) => (
                          <tr key={log.id || index} className="hover:bg-gray-50/40 transition-colors">
                            <td className="py-3 flex items-center gap-2.5">
                              <span className="p-2 bg-slate-50 rounded-xl shrink-0">
                                {getLogIcon(log.type)}
                              </span>
                              <span className="font-bold text-gray-800">{log.type}</span>
                            </td>
                            <td className="py-3 text-gray-500 font-normal">{log.info}</td>
                            <td className="py-3 text-gray-400 font-normal text-xs">
                              {new Date(log.date).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </td>
                            <td className="py-3 text-right">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${getRiskColor(log.status)}`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Notification Insight Indicator */}
              <div className="mt-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 flex items-center gap-3 text-left">
                <span className="p-1.5 bg-white text-indigo-600 rounded-full shadow-sm shrink-0">
                  <Sparkles size={14} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">
                    {stats.riskLevel === 'Low' ? 'All structures synced correctly from db!' : 'Attention required on anomalies!'}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                    {stats.riskLevel === 'Low' ? 'Parameters correspond to stable health logs.' : 'RAG engine indicates parameters needing system checkup.'}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Dynamic AI Recommendation Lists */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="p-1.5 bg-violet-50 text-violet-600 rounded-lg shrink-0">
                    <Sparkles size={16} />
                  </span>
                  <h2 className="font-extrabold text-base sm:text-lg text-gray-800">AI Care Directives</h2>
                </div>

                <div className="space-y-2.5">
                  {stats.aiDirectives.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 font-medium">
                      Waiting for incoming medical data streams...
                    </div>
                  ) : (
                    stats.aiDirectives.map((directive, idx) => (
                      <div key={idx} className="group border border-gray-50 hover:border-gray-100 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all bg-slate-50/30 hover:bg-white">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="p-2 bg-slate-50 rounded-xl shrink-0">
                            {getDirectiveIcon(directive.iconType)}
                          </span>
                          <div className="text-left truncate">
                            <p className="text-xs font-extrabold text-gray-800 truncate">{directive.title}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{directive.description}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 transition shrink-0 ml-1" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-1.5 text-xs sm:text-sm transition shrink-0">
                <span>View Full Analysis Report</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}