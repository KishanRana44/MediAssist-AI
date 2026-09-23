import { useEffect, useState } from "react";
import { 
  FileText, 
  Activity, 
  Volume2, 
  Image, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  ExternalLink, 
  X, 
  Database,
  HeartPulse 
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../services/api";

export default function PatientHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All Types");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchReportsOnly();
  }, []);

  const fetchReportsOnly = async () => {
    try {
      setLoading(true);
      const res = await API.get("/report").catch(() => API.get("/reports")); 

      let reportsData = [];
      if (res.data && res.data.reports) {
        reportsData = res.data.reports;
      } else if (Array.isArray(res.data)) {
        reportsData = res.data;
      }

      if (reportsData.length > 0) {
        const formattedReports = reportsData.map(item => ({
          id: item._id,
          type: item.prediction || "Medical Report",
          details: item.filename || item.patientName || "Uploaded Document",
          fullAnswer: item.findings || item.rawExtractedText || "No extractions found in this file.",
          rawDate: new Date(item.uploadDate || item.createdAt || Date.now()),
          status: item.riskLevel || "Processed",
          fileUrl: item.fileUrl ? item.fileUrl : (item.filename ? `http://localhost:5000/uploads/${item.filename}` : null)
        }));

        formattedReports.sort((a, b) => b.rawDate - a.rawDate);
        
        const displayData = formattedReports.map(item => ({
          ...item,
          date: item.rawDate.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }));

        setHistory(displayData);
      } else {
        useMockData();
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    setHistory([
      { 
        id: 1, 
        type: "Connection Error / No Data", 
        details: "No reports found in database", 
        fullAnswer: "Please check if you have uploaded a report. Also verify the frontend API route matches the backend.", 
        date: "Just now", 
        status: "Error", 
        fileUrl: null 
      }
    ]);
  };

  const getIconAndColor = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("blood") || t.includes("hematology")) 
      return { icon: <FileText size={16} />, bg: "bg-red-50 text-red-600 border-red-200" };
    if (t.includes("ecg") || t.includes("cardio")) 
      return { icon: <Activity size={16} />, bg: "bg-rose-50 text-rose-600 border-rose-200" };
    if (t.includes("audio") || t.includes("sound")) 
      return { icon: <Volume2 size={16} />, bg: "bg-rose-100/70 text-rose-700 border-rose-300" };
    if (t.includes("ray") || t.includes("image")) 
      return { icon: <Image size={16} />, bg: "bg-amber-50 text-amber-600 border-amber-200" };
    return { icon: <Sparkles size={16} />, bg: "bg-rose-50/40 text-rose-500 border-rose-100" };
  };

  const filteredHistory = history.filter((item) => {
    const matchesType = selectedType === "All Types" || (item.type && item.type.includes(selectedType));
    const matchesSearch = (item.type || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.details || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#fff7f7] via-[#fffbfb] to-[#fff1f2] min-h-screen text-rose-950 font-serif relative">
        
        {/* HEADER */}
        <div className="mb-8 max-w-[1400px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-rose-700 text-xs font-semibold mb-2">
            <HeartPulse size={13} className="text-red-600 animate-pulse" />
            <span>Biometric Archive Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight">
            Patient Diagnostic History
          </h1>
          <p className="text-rose-400 text-xs sm:text-sm font-medium mt-1">
            Browse your archived ECG telemetries, PCG sounds, blood biomarkers, and AI extractions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-[1400px] mx-auto">
          
          {/* MAIN TIMELINE LOGS */}
          <div className="lg:col-span-8 bg-white/95 rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/90 min-h-[480px]">
            {loading ? (
              <div className="space-y-6 py-4 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-2xl bg-rose-100/60 shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="h-3 bg-rose-100/60 rounded w-1/4" />
                      <div className="h-4 bg-rose-50 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHistory.length > 0 ? (
              <div className="relative pl-4 sm:pl-6 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[18px] sm:before:left-[22px] before:w-[2px] before:bg-rose-100">
                {filteredHistory.map((item) => {
                  const uiMeta = getIconAndColor(item.type);
                  return (
                    <div key={item.id} className="relative flex items-start justify-between gap-4 group transition-all">
                      <div className="absolute left-[-22px] sm:left-[-26px] top-3 w-2.5 h-2.5 rounded-full bg-red-600 ring-4 ring-rose-100 z-10" />
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className={`p-2.5 rounded-2xl border shadow-2xs shrink-0 ${uiMeta.bg}`}>
                          {uiMeta.icon}
                        </div>
                        <div className="min-w-0 pt-0.5 w-full">
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-rose-400">
                            <Calendar size={12} />
                            <span>{item.date}</span>
                          </div>
                          <h4 className="text-sm font-black text-rose-950 tracking-tight mt-0.5">{item.type}</h4>
                          <p className="text-xs font-semibold text-rose-500 truncate mt-0.5">{item.details}</p>
                          
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            {item.status && (
                              <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${
                                item.status.toLowerCase().includes('high') || item.status.toLowerCase().includes('critical')
                                  ? 'bg-red-50 text-red-600 border-red-200' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                • {item.status}
                              </span>
                            )}
                            
                            <button 
                              onClick={() => setSelectedItem(item)}
                              className="flex items-center gap-1.5 bg-rose-50 text-rose-800 px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-rose-100 transition shadow-2xs border border-rose-200"
                            >
                              <Database size={12} className="text-red-600" /> View Extractions
                            </button>
                            
                            {item.fileUrl && (
                              <button 
                                onClick={() => window.open(item.fileUrl, "_blank")}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:from-red-700 hover:to-rose-700 transition shadow-2xs"
                              >
                                <ExternalLink size={12} /> Open PDF
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-28 text-rose-300">
                <FileText size={36} className="stroke-[1.5] mb-2 text-rose-300" />
                <p className="text-sm font-bold text-rose-950">No uploaded records found</p>
                <p className="text-xs text-rose-400 mt-1">Try changing your search or filter parameters.</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: FILTERS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/90 space-y-5">
              
              {/* Search Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <Search size={12} /> Search Records
                </label>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name or test type..."
                  className="w-full bg-rose-50/30 border border-rose-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-rose-950 outline-none focus:border-red-400 focus:bg-white transition-all"
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <Filter size={12} /> Diagnostic Category
                </label>
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)} 
                  className="w-full bg-rose-50/30 border border-rose-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-rose-950 outline-none focus:border-red-400 focus:bg-white transition-all"
                >
                  <option>All Types</option>
                  <option>Blood Report</option>
                  <option>ECG</option>
                  <option>Medical Report</option>
                </select>
              </div>

              {/* Total count badge */}
              <div className="pt-2 border-t border-rose-100 text-[11px] font-bold text-rose-400 flex justify-between">
                <span>Total Matched</span>
                <span className="text-red-600 font-black">{filteredHistory.length} records</span>
              </div>
            </div>
          </div>
        </div>

        {/* EXTRACTIONS MODAL */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[85vh]">
              
              <div className="p-5 border-b border-rose-100 flex justify-between items-center bg-rose-50/60 shrink-0">
                <h3 className="font-black text-rose-950 text-base flex items-center gap-2">
                  <Sparkles size={16} className="text-red-600" />
                  Clinical Report Extractions
                </h3>
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="p-1.5 text-rose-400 hover:bg-rose-100 hover:text-red-700 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                    Document Reference
                  </span>
                  <p className="text-sm font-black text-rose-950">{selectedItem.details}</p>
                  <p className="text-xs text-rose-400 mt-0.5">Uploaded on: {selectedItem.date}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                    AI Extracted Biometric Findings
                  </span>
                  <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100 text-xs sm:text-sm text-rose-900 whitespace-pre-wrap leading-relaxed">
                    {selectedItem.fullAnswer}
                  </div>
                </div>
              </div>

              {selectedItem.fileUrl && (
                <div className="p-4 border-t border-rose-100 bg-rose-50/30 flex justify-end shrink-0">
                  <button 
                    onClick={() => window.open(selectedItem.fileUrl, "_blank")}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:from-red-700 hover:to-rose-700 transition shadow-md shadow-rose-500/20"
                  >
                    <ExternalLink size={14} /> View Original Document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}