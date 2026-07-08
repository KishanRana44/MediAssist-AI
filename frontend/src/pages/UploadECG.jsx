import { useState, useEffect } from "react";
import { 
  Activity, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Stethoscope,
  PhoneCall,
  UserCheck,
  Loader2,
  X
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../services/api";

export default function ECGReportAnalysis() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [pastRecords, setPastRecords] = useState([]);
  const [error, setError] = useState(null);
  const [simulateInvalidImage, setSimulateInvalidImage] = useState(false);
  
  // State to store selected history log for modal pop-up display
  const [selectedReportModal, setSelectedReportModal] = useState(null);

  const criticalCardioConsultants = [
    { id: 1, name: "Dr. Arvind Swamy", specialty: "Interventional Cardiologist", contact: "+91 98765 43210", experience: "16+ Yrs" },
    { id: 2, name: "Dr. Meera Chawla", specialty: "Cardiac Electrophysiologist", contact: "+91 87654 32109", experience: "12+ Yrs" }
  ];

  useEffect(() => {
    fetchPastECGRecords();
  }, []);

  const fetchPastECGRecords = async () => {
    try {
      const res = await API.get("/ecg/history"); 
      // 🔥 FIXED FOR STEP 8: Backend directly returns the array data instead of res.data.records
      if (res.data) {
        setPastRecords(Array.isArray(res.data) ? res.data : res.data.records || []);
      }
    } catch (err) {
      console.error("Error pulling history registry logs matrix:", err);
    }
  };

  const handleFileSelection = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validExtensions = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!validExtensions.includes(selectedFile.type)) {
        setError("Format Error: Please attach a valid ECG image graph (PNG, JPG, JPEG) or medical PDF.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handlePipelineSubmission = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please attach an operational ECG document/telemetry file.");
      return;
    }

    const formData = new FormData();
    formData.append("ecg", file);
    formData.append("isFakeDummyImage", simulateInvalidImage ? "true" : "false");

    try {
      setIsAnalyzing(true);
      setError(null);

      const res = await API.post("/ecg/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data && res.data.success) {
        // Handle payload alignment safely
        const savedData = res.data.data;
        setCurrentReport(savedData);
        fetchPastECGRecords(); 
        setFile(null);
      }
    } catch (err) {
      console.error("ECG Multi-modal ingestion block collapsed:", err);
      setError(err.response?.data?.message || "Inference server validation gateway exception error.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadgeStyles = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
      case "critical": 
        return "bg-rose-50 border-rose-200 text-rose-600";
      case "medium": 
      case "moderate":
        return "bg-amber-50 border-amber-200 text-amber-600";
      default: 
        return "bg-emerald-50 border-emerald-200 text-emerald-600";
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-[#f8f9fe] min-h-screen p-4 sm:p-6 lg:p-8 text-gray-900 font-sans">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-990 flex items-center gap-2.5">
              ECG AI Analysis
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* INGESTION TERMINAL */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                  <Upload size={18} className="text-indigo-500" /> Upload ECG Image
                </h2>
              </div>
              <form onSubmit={handlePipelineSubmission} className="space-y-4">
                <div className="border-2 border-dashed border-slate-100 hover:border-indigo-400 rounded-2xl p-6 transition bg-slate-50/50 hover:bg-white text-center flex flex-col items-center justify-center cursor-pointer relative group min-h-[160px]">
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileSelection} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" disabled={isAnalyzing} />
                  <Upload size={28} className="text-indigo-500 group-hover:scale-110 transition duration-300" />
                  <p className="text-xs font-bold text-gray-700 mt-2.5">{file ? file.name : ""}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Supports PNG, JPG, JPEG, and PDF</p>
                </div>

                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-start gap-2">
                    <ShieldAlert size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={isAnalyzing || !file} className={`w-full font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm ${isAnalyzing || !file ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"}`}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Processing ECG Image...</span>
                    </>
                  ) : (
                    "Analyze Report"
                  )}
                </button>
              </form>
            </div>

            {/* DIAGNOSTIC MONITOR SCREEN */}
            <div className="lg:col-span-7 space-y-6">
              {currentReport ? (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* 🔥 STEP 7: INTEGRATED DASHBOARD RESULT CARD */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-50 pb-4">
                      <div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Latest Assessment Sync</span>
                        <h3 className="text-xl font-black text-slate-800 mt-0.5">Latest ECG</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentReport.confidence && (
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                            Confidence: {currentReport.confidence}%
                          </span>
                        )}
                        <span className={`text-[11px] font-black border px-2.5 py-0.5 rounded-md ${getRiskBadgeStyles(currentReport.riskLevel)}`}>
                          Risk: {currentReport.riskLevel}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60 space-y-1">
                      <span className="text-[10px] text-indigo-500 font-black uppercase tracking-wider flex items-center gap-1"><Sparkles size={12}/> AI Analytical Core Prediction</span>
                      <p className="text-base font-black text-slate-800">{currentReport.prediction}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Electrophysiology Findings</span>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed bg-white border border-gray-100 p-3.5 rounded-xl">
                        {currentReport.findings || "Atypical waveform morphology patterns analyzed."}
                      </p>
                    </div>

                    {currentReport.recommendations && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">AI Directed Interventions</span>
                        <div className="bg-gradient-to-r from-violet-50/50 to-indigo-50/30 border border-indigo-50/60 p-4 rounded-xl space-y-2">
                          {Array.isArray(currentReport.recommendations) ? (
                            <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700 font-bold">
                              {currentReport.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-700 font-bold flex items-start gap-2">
                              <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{currentReport.recommendation || currentReport.recommendations || "Monitor telemetry logs tracking routines."}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DOCTOR CONSULTATION MATRIX */}
                  {(currentReport.riskLevel?.toLowerCase() === "high" || currentReport.riskLevel?.toLowerCase() === "critical" || currentReport.prediction === "STEMI" || currentReport.prediction === "AFib") && (
                    <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-rose-600"><Stethoscope size={18} /><h3 className="text-xs font-black uppercase tracking-wider">Urgent Clinical Consultation Panels Mapped</h3></div>
                      <p className="text-xs text-gray-400 font-semibold leading-relaxed">System warnings identified critical wave frequencies. Immediate validation via active cardiology specialists is required.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {criticalCardioConsultants.map((doc) => (
                          <div key={doc.id} className="bg-slate-50/50 hover:bg-white border border-slate-100 rounded-2xl p-4 transition flex flex-col justify-between space-y-3 group">
                            <div>
                              <p className="text-xs font-black text-gray-800 flex items-center gap-1"><UserCheck size={14} className="text-emerald-500" /> {doc.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold mt-0.5">{doc.specialty} ({doc.experience})</p>
                            </div>
                            <a href={`tel:${doc.contact}`} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition"><PhoneCall size={10} /> Request Tele-Consultation</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[360px]">
                  <FileText size={36} className="text-slate-300 stroke-[1.2] mb-3" />
                </div>
              )}
            </div>

          </div>

          {/* HISTORICAL ECG ANALYTICS REGISTRY LOGS */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" />
              <h3 className="text-sm font-extrabold text-gray-800">Historical ECG Analytics Registry Logs</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastRecords.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 col-span-full py-4 text-center">No past telemetry sessions synced found inside this user matrix.</p>
              ) : (
                pastRecords.map((rec) => (
                  <button 
                    key={rec._id} 
                    onClick={() => {
                      setCurrentReport(rec);
                      setSelectedReportModal(rec);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left border border-gray-100 bg-slate-50/40 hover:bg-white hover:border-indigo-200 hover:shadow-md p-4 rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-3 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <p className="text-xs font-black text-gray-800 truncate max-w-[160px]">
                          {rec.prediction || "ECG Log Track"}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                          {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString("en-GB") : "Recent"}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-md ${getRiskBadgeStyles(rec.riskLevel)}`}>
                        {rec.riskLevel || "Low"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center w-full bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs group-hover:border-indigo-50">
                      <span className="text-[11px] font-extrabold text-gray-700 truncate max-w-[180px]">
                        Confidence: {rec.confidence}%
                      </span>
                      <ArrowRight size={12} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* OVERLAY MODAL FOR EXPANDED HISTORICAL LOG DETAILS */}
          {selectedReportModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto space-y-5">
                
                <button 
                  onClick={() => setSelectedReportModal(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-slate-100 hover:text-gray-600 transition"
                >
                  <X size={18} />
                </button>

                <div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-indigo-500" />
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Archived Log Session Overview</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mt-0.5">
                    Latest ECG Analysis Logs
                  </h3>
                  <p className="text-[11px] font-bold text-gray-400">
                    Processed on: {selectedReportModal.createdAt ? new Date(selectedReportModal.createdAt).toLocaleString("en-GB") : "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t border-b border-slate-50 py-3">
                  <span className={`text-[10px] font-black border px-2.5 py-0.5 rounded-md ${getRiskBadgeStyles(selectedReportModal.riskLevel)}`}>
                    Risk: {selectedReportModal.riskLevel}
                  </span>
                  {selectedReportModal.confidence && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                      Confidence: {selectedReportModal.confidence}%
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-0.5">
                    <span className="text-[9px] text-indigo-500 font-black uppercase tracking-wider block">Inference Prediction</span>
                    <p className="text-sm font-black text-slate-800">{selectedReportModal.prediction}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Full Waveform Findings</span>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed bg-slate-50/30 border border-slate-100 p-3 rounded-xl">
                      {selectedReportModal.findings || "Normal waveform metrics captured by parsing engines."}
                    </p>
                  </div>

                  {selectedReportModal.recommendations && (
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Directives & Interventions</span>
                      <div className="bg-indigo-50/40 border border-indigo-100/50 p-3 rounded-xl text-xs text-slate-700 font-bold">
                        {Array.isArray(selectedReportModal.recommendations) ? (
                          <ul className="list-disc pl-4 space-y-0.5">
                            {selectedReportModal.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                          </ul>
                        ) : (
                          <p>{selectedReportModal.recommendation || selectedReportModal.recommendations || "No explicit recommendations logged."}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setSelectedReportModal(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Dismiss Overview Monitor
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}