import { useEffect, useState } from "react";
import { FileText, Activity, Volume2, Image, Search, Filter, Calendar, ChevronRight, Sparkles, ExternalLink, X, Database } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../services/api"; // Make sure your API is pointing to http://localhost:5000/api

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
      
      // ⚠️ IMPORTANT: Yahan URL check karein. Agar backend server.js mein 'app.use("/api/report", ...)' hai, 
      // toh yahan API.get("/report") aayega. Agar "/api/reports" hai, toh API.get("/reports") aayega.
      const res = await API.get("/report").catch(() => API.get("/reports")); 

      let reportsData = [];

      // Check format of response
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
          // Show AI findings or raw text in Modal
          fullAnswer: item.findings || item.rawExtractedText || "No extractions found in this file.",
          rawDate: new Date(item.uploadDate || item.createdAt || Date.now()),
          status: item.riskLevel || "Processed",
          // Assuming your express static folder is 'uploads'
          fileUrl: item.fileUrl ? item.fileUrl : (item.filename ? `http://localhost:5000/uploads/${item.filename}` : null)
        }));

        // Sort: Newest first
        formattedReports.sort((a, b) => b.rawDate - a.rawDate);
        
        // Format dates for UI
        const displayData = formattedReports.map(item => ({
          ...item,
          date: item.rawDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));

        setHistory(displayData);
      } else {
        useMockData(); // DB khali hai
      }

    } catch (error) {
      console.error("Failed to fetch reports:", error);
      useMockData(); // API fail hui toh error dikhayega
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
        fullAnswer: "Please check if you have uploaded a report. Also ensure frontend API matches backend route.", 
        date: "Just now", 
        status: "Error", 
        fileUrl: null 
      }
    ]);
  };

  const getIconAndColor = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("blood") || t.includes("hematology")) return { icon: <FileText size={16} />, bg: "bg-red-50 text-red-500 border-red-100" };
    if (t.includes("ecg") || t.includes("cardio")) return { icon: <Activity size={16} />, bg: "bg-blue-50 text-blue-500 border-blue-100" };
    if (t.includes("audio") || t.includes("sound")) return { icon: <Volume2 size={16} />, bg: "bg-purple-50 text-purple-500 border-purple-100" };
    if (t.includes("ray") || t.includes("image")) return { icon: <Image size={16} />, bg: "bg-indigo-50 text-indigo-500 border-indigo-100" };
    return { icon: <Sparkles size={16} />, bg: "bg-slate-50 text-slate-500 border-slate-100" };
  };

  const filteredHistory = history.filter((item) => {
    const matchesType = selectedType === "All Types" || (item.type && item.type.includes(selectedType));
    const matchesSearch = (item.type || "").toLowerCase().includes(searchQuery.toLowerCase()) || (item.details || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f9fe] min-h-screen text-gray-900 relative">
        <div className="mb-8 max-w-[1400px] mx-auto">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Report History</h1>
          <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">Browse your uploaded medical reports, PDFs, and AI extractions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-[1400px] mx-auto">
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 min-h-[480px]">
            {loading ? (
              <div className="space-y-6 py-4 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
                    <div className="space-y-2 w-full"><div className="h-3 bg-slate-100 rounded w-1/4" /><div className="h-4 bg-slate-200 rounded w-3/4" /></div>
                  </div>
                ))}
              </div>
            ) : filteredHistory.length > 0 ? (
              <div className="relative pl-4 sm:pl-6 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[18px] sm:before:left-[22px] before:w-[2px] before:bg-indigo-100">
                {filteredHistory.map((item) => {
                  const uiMeta = getIconAndColor(item.type);
                  return (
                    <div key={item.id} className="relative flex items-start justify-between gap-4 group transition-all">
                      <div className="absolute left-[-22px] sm:left-[-26px] top-3 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50 z-10" />
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className={`p-2.5 rounded-2xl border shadow-sm shrink-0 ${uiMeta.bg}`}>{uiMeta.icon}</div>
                        <div className="min-w-0 pt-0.5 w-full">
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-gray-400">
                            <Calendar size={12} /><span>{item.date}</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-800 tracking-tight mt-0.5">{item.type}</h4>
                          <p className="text-xs font-semibold text-gray-500 truncate mt-0.5">{item.details}</p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            {item.status && (
                              <span className={`font-bold text-[10px] px-2.5 py-1 rounded-full border ${item.status.toLowerCase().includes('high') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                • {item.status}
                              </span>
                            )}
                            
                            {/* DYNAMIC ACTION BUTTONS */}
                            <button 
                              onClick={() => setSelectedItem(item)}
                              className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition shadow-sm border border-indigo-100"
                            >
                              <Database size={12} /> View Extractions
                            </button>
                            
                            {item.fileUrl && (
                              <button 
                                onClick={() => window.open(item.fileUrl, "_blank")}
                                className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-800 transition shadow-sm"
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
              <div className="flex flex-col items-center justify-center text-center py-28 text-gray-400">
                <FileText size={36} className="stroke-[1.5] mb-2 text-gray-300" />
                <p className="text-sm font-bold">No uploaded reports found</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1"><Filter size={12} /> Filter</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-bold text-gray-700 outline-none">
                  <option>All Types</option><option>Blood Report</option><option>ECG</option><option>Medical Report</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC MODAL (For Extractions) */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              <div className="p-5 border-b flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-500" />
                  Report Extractions
                </h3>
                <button onClick={() => setSelectedItem(null)} className="p-1.5 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">File Name</span>
                  <p className="text-sm font-bold text-gray-800">{selectedItem.details}</p>
                  <p className="text-xs text-gray-500 mt-1">Uploaded on: {selectedItem.date}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">AI Extracted Summary / Data</span>
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedItem.fullAnswer}
                  </div>
                </div>
              </div>
              {selectedItem.fileUrl && (
                <div className="p-4 border-t bg-gray-50 flex justify-end shrink-0">
                  <button 
                    onClick={() => window.open(selectedItem.fileUrl, "_blank")}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-md"
                  >
                    <ExternalLink size={14} /> View Original File
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