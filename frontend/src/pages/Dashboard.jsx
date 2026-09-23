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
    recentAnalyses: [],
    aiDirectives: []
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
      const res = await API.get("/dashboard/stats");
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

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "text-red-700 border-red-200 bg-red-50";
      case "moderate":
        return "text-amber-700 border-amber-200 bg-amber-50";
      default:
        return "text-emerald-700 border-emerald-200 bg-emerald-50";
    }
  };

  const getLogIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "ecg rhythm":
        return <Activity size={14} className="text-red-600" />;
      case "heart sound":
        return <HeartPulse size={14} className="text-rose-600" />;
      default:
        return <FileText size={14} className="text-rose-500" />;
    }
  };

  const getDirectiveIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case "cardio":
        return <Dumbbell size={16} className="text-rose-600" />;
      case "vitals":
        return <Heart size={16} className="text-red-600" />;
      case "hydration":
        return <Droplet size={16} className="text-rose-500" />;
      default:
        return <Calendar size={16} className="text-amber-600" />;
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
      <div className="bg-gradient-to-br from-[#fff7f7] via-[#fffbfb] to-[#fff1f2] min-h-screen w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 text-rose-950 font-serif">
        <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8">
          
          {/* TOP PROFILE BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-100/80 pb-6 sm:pb-0 sm:border-none">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-rose-700 text-xs font-semibold mb-2">
                <HeartPulse size={13} className="text-red-600 animate-pulse" />
                <span>Cardiac Monitoring Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-950 flex items-center gap-2 flex-wrap">
                {getGreeting()}, {stats?.user?.name?.split(" ")[0] || "User"}!
              </h1>
            </div>

            {/* Profile Menu */}
            <div className="relative flex items-center w-full sm:w-auto justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="flex items-center gap-2.5 bg-white/90 backdrop-blur-sm pl-2.5 pr-4 py-1.5 rounded-full shadow-xs border border-rose-100 hover:border-rose-200 hover:shadow-md transition-all shrink-0"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-red-600 to-rose-500 rounded-full flex items-center justify-center font-bold text-white text-xs uppercase shadow-xs">
                  {stats?.user?.name
                    ?.split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "US"}
                </div>

                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-rose-950 leading-none">
                    {stats?.user?.name || "Unknown User"}
                  </p>
                  <p className="text-[10px] text-rose-400 font-semibold mt-1">
                    Patient ID: {stats?.user?.patientId || "N/A"}
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-rose-400 hidden md:block transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-14 w-[250px] bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 bg-rose-50/60 border-b border-rose-100">
                    <p className="text-xs font-bold text-rose-900">Patient Record Card</p>
                  </div>
                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-rose-400 font-medium">Patient ID</span>
                      <span className="font-bold text-rose-900">{stats?.user?.patientId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-rose-400 font-medium">Age</span>
                      <span className="font-bold text-rose-900">{stats?.user?.age || "--"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-rose-400 font-medium">Gender</span>
                      <span className="font-bold text-rose-900">{stats?.user?.gender || "--"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-rose-400 font-medium">Blood Group</span>
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                        {stats?.user?.bloodGroup || "--"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* METRICS / KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

            {/* Card 1: Heart Health Score */}
            <div className="w-full h-[160px] bg-white/95 rounded-2xl p-5 border border-rose-100/90 shadow-xs flex flex-col justify-between relative overflow-hidden hover:shadow-md hover:border-rose-200 transition-all group">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-semibold text-rose-400 tracking-wide">
                    Heart Health Score
                  </p>
                  <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                    <Heart size={15} />
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-black text-rose-600 tracking-tight">
                    {stats.heartHealthScore}
                  </span>
                  <span className="text-rose-300 font-semibold text-sm">/ 100</span>
                </div>

                <p
                  className={`font-bold text-xs mt-1.5 flex items-center gap-1.5 ${
                    stats.heartHealthScore >= 75 ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      stats.heartHealthScore >= 75 ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                    }`}
                  ></span>
                  {stats.heartHealthScore >= 75 ? "Optimal Cardiac State" : "Review Recommended"}
                </p>
              </div>

              {/* Pulse line chart */}
              <div className="absolute bottom-0 left-0 right-0 h-10 px-1 opacity-40 pointer-events-none group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path
                    d="M0,22 Q15,18 28,21 L35,8 L40,25 L45,15 L50,22 T75,20 T95,12 T100,20"
                    fill="none"
                    stroke={stats.heartHealthScore >= 75 ? "#e11d48" : "#f59e0b"}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 2: Processed Documents */}
            <div className="w-full h-[160px] bg-white/95 rounded-2xl p-5 border border-rose-100/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-rose-200 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-semibold text-rose-400 tracking-wide">
                    Processed Diagnostic Logs
                  </p>
                  <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
                    <FileText size={15} />
                  </span>
                </div>

                <h2 className="text-4xl font-black text-rose-950 mt-1 tracking-tight">
                  {stats.ecgCount + stats.reportCount + stats.heartCount}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-700">
                    {stats.ecgCount} ECG
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-red-50 border border-red-100 text-red-700">
                    {stats.reportCount} Reports
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-100/70 border border-rose-200 text-rose-800">
                    {stats.heartCount} PCG Sounds
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: AI Cross-Risk Status */}
            <div className="w-full h-[160px] bg-white/95 rounded-2xl p-5 border border-rose-100/90 shadow-xs flex flex-col justify-between relative overflow-hidden hover:shadow-md hover:border-rose-200 transition-all">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-semibold text-rose-400 tracking-wide">
                    AI Cross-Risk Assessment
                  </p>
                  <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                    <ShieldCheck size={15} />
                  </span>
                </div>

                <h2
                  className={`text-2xl font-black mt-2 tracking-tight ${
                    stats.riskLevel === "Low"
                      ? "text-emerald-600"
                      : stats.riskLevel === "Moderate"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.riskLevel} Risk Profile
                </h2>

                <p className="text-rose-400 font-medium text-xs mt-1">
                  {stats.riskLevel === "Low"
                    ? "Bio-signals stable & verified"
                    : "Clinical rhythm review advised"}
                </p>
              </div>

              {/* Gauge Arc */}
              <div className="absolute bottom-[-10px] right-2 w-20 h-12 opacity-35 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#ffe4e6"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 50 10"
                    fill="none"
                    stroke={
                      stats.riskLevel === "Low"
                        ? "#10b981"
                        : stats.riskLevel === "Moderate"
                        ? "#f59e0b"
                        : "#e11d48"
                    }
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

          </div>

          {/* WORKSPACE WORKFLOW SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

            {/* LEFT SIDE: Medical Metrics Table */}
            <div className="lg:col-span-2 bg-white/95 rounded-3xl shadow-xs border border-rose-100/90 p-5 sm:p-6 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-rose-50 text-red-600 rounded-xl border border-rose-100">
                      <Activity size={18} />
                    </span>
                    <h2 className="font-extrabold text-base sm:text-lg text-rose-950">
                      Recent Medical Analyses
                    </h2>
                  </div>
                  <button className="text-rose-600 hover:text-red-700 text-xs font-bold transition flex items-center gap-0.5">
                    Full History <ChevronRight size={14} />
                  </button>
                </div>

                <div className="w-full overflow-x-auto rounded-xl [scrollbar-width:thin]">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="text-rose-400 text-[10px] font-bold uppercase tracking-wider border-b border-rose-100">
                        <th className="pb-3">Diagnosis Stream</th>
                        <th className="pb-3">Diagnostic Details</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50 text-xs sm:text-sm font-medium text-rose-900">
                      {stats.recentAnalyses.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-rose-400 font-medium">
                            No recent cardiac analyses logged in database.
                          </td>
                        </tr>
                      ) : (
                        stats.recentAnalyses.map((log, index) => (
                          <tr key={log.id || index} className="hover:bg-rose-50/40 transition-colors">
                            <td className="py-3 flex items-center gap-2.5">
                              <span className="p-2 bg-rose-50/80 rounded-xl shrink-0 border border-rose-100/60">
                                {getLogIcon(log.type)}
                              </span>
                              <span className="font-bold text-rose-950">{log.type}</span>
                            </td>
                            <td className="py-3 text-rose-700/80 font-normal">{log.info}</td>
                            <td className="py-3 text-rose-400 font-normal text-xs">
                              {new Date(log.date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </td>
                            <td className="py-3 text-right">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getRiskColor(
                                  log.status
                                )}`}
                              >
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
              <div className="mt-5 bg-gradient-to-r from-rose-50 to-red-50/60 border border-rose-100 rounded-2xl p-4 flex items-center gap-3.5 text-left">
                <span className="p-2 bg-white text-red-600 rounded-full shadow-xs border border-rose-100 shrink-0">
                  <Sparkles size={15} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 leading-tight">
                    {stats.riskLevel === "Low"
                      ? "Cardiac biometric records synced & verified"
                      : "Action required on cardiac biometric flags"}
                  </h4>
                  <p className="text-[11px] text-rose-600/80 font-medium mt-0.5">
                    {stats.riskLevel === "Low"
                      ? "Rhythm variance and heart sounds are within safe clinical bounds."
                      : "AI diagnostics engine detected irregular rhythm variations requiring clinician checkup."}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Dynamic AI Directives */}
            <div className="bg-white/95 rounded-3xl shadow-xs border border-rose-100/90 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="p-2 bg-red-50 text-red-600 rounded-xl border border-rose-100 shrink-0">
                    <Sparkles size={16} />
                  </span>
                  <h2 className="font-extrabold text-base sm:text-lg text-rose-950">
                    AI Care Directives
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {stats.aiDirectives.length === 0 ? (
                    <div className="text-center py-8 text-xs text-rose-400 font-medium">
                      Waiting for active diagnosis data streams...
                    </div>
                  ) : (
                    stats.aiDirectives.map((directive, idx) => (
                      <div
                        key={idx}
                        className="group border border-rose-100/80 hover:border-rose-200 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all bg-rose-50/20 hover:bg-rose-50/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="p-2 bg-white rounded-xl shadow-2xs border border-rose-100 shrink-0">
                            {getDirectiveIcon(directive.iconType)}
                          </span>
                          <div className="text-left truncate">
                            <p className="text-xs font-extrabold text-rose-950 truncate">
                              {directive.title}
                            </p>
                            <p className="text-[10px] text-rose-500 font-medium mt-0.5 truncate">
                              {directive.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-rose-300 group-hover:text-rose-500 transition shrink-0 ml-1.5"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Red-Rose Gradient Action Button */}
              <button className="mt-6 w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-2xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 text-xs sm:text-sm transition shrink-0">
                <span>View Full Medical Report</span>
                <ChevronRight size={15} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}