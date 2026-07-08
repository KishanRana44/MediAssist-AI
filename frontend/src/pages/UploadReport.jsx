import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle, ShieldAlert, FileSpreadsheet, Activity, ListChecks, CalendarRange,Upload } from "lucide-react";
import MainLayout from "../components/DashboardLayout";
import PageHeader from "../components/PageHeader";
import API from "../services/api";

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select or drop a valid medical lab report first.");

    try {
      setLoading(true);
      setResult(null); // Clear previous results
      const formData = new FormData();
      
      formData.append("reportAsset", file);

      // Fetch dynamic data from the backend
      const res = await API.post("/report/analyze-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setResult(res.data);
      } else {
        alert(res.data.message || "Failed to process the medical report.");
      }
    } catch (error) {
      console.error("Lab Report Engine Failure:", error);
      alert("Error connecting to the analysis server. Please ensure the backend is running.");
    } finally {
      setFile(null); 
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f9fe] min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-990 flex items-center gap-2.5">
              Medical Report AI Analysis
        </h1>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-[1600px] mx-auto">
          
          {/* LEFT WIDGET: DROPZONE */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                  <Upload size={18} className="text-indigo-500" /> Upload Report
                </h2>
              </div>    
                     
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px]  ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-50/40" 
                    : "border-gray-200 hover:border-gray-300 bg-slate-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf, image/png, image/jpeg, image/jpg"
                  onChange={(e) => setFile(e.target.files[0])}
                />

                <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-indigo-500 mb-3">
                  <UploadCloud size={24} />
                </div>

                {file ? (
                  <div className="px-2 w-full">
                    <p className="text-xs font-bold text-gray-800 flex items-center justify-center gap-1.5 truncate">
                      <FileText size={14} className="text-indigo-500 shrink-0" />
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] text-gray-400 mt-5 font-medium">Supports: PDF, JPG, PNG</p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className={`w-full font-bold py-3.5 px-4 rounded-2xl text-xs transition mt-6 flex items-center justify-center gap-2 shadow-sm ${
                !file 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Extracting Clinical Biomarkers...</span>
                </>
              ) : (
                <span>Analyze Report</span>
              )}
            </button>
          </div>

          {/* RIGHT WIDGET: CLINICAL RESULTS */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 min-h-[360px]">
            {result ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                      <Activity size={18} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Report Category</h4>
                      <p className="text-xs sm:text-sm font-black text-gray-800 mt-0.5">{result.prediction}</p>
                    </div>
                  </div>

                  <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl ${
                      result.riskLevel?.toLowerCase() === 'critical' || result.riskLevel?.toLowerCase() === 'high' 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {result.riskLevel?.toLowerCase() === 'critical' || result.riskLevel?.toLowerCase() === 'high' ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Risk Status</h4>
                      <p className={`text-xs sm:text-sm font-black mt-0.5 ${
                        result.riskLevel?.toLowerCase() === 'critical' || result.riskLevel?.toLowerCase() === 'high' ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {result.riskLevel} Risk ({result.confidence}%)
                      </p>
                    </div>
                  </div>
                </div>

                {result.parameters && result.parameters.length > 0 && (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                          <th className="py-3.5 px-4">Biomarker Parameter</th>
                          <th className="py-3.5 px-4">Observed Value</th>
                          <th className="py-3.5 px-4 text-center">Clinical Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-xs font-bold text-gray-700">
                        {result.parameters.map((param, index) => (
                          <tr key={index} className="hover:bg-slate-50/40 transition">
                            <td className="py-3.5 px-4 text-gray-600">{param.name}</td>
                            <td className="py-3.5 px-4 font-black text-slate-800">{param.value}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black ${
                                param.status?.toLowerCase() === "high" || param.status?.toLowerCase() === "low"
                                  ? "bg-red-50 text-red-600" 
                                  : "bg-emerald-50 text-emerald-600"
                              }`}>
                                {param.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
                  <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    Clinical Interpretation Narrative
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 leading-relaxed">
                    {result.findings || "No narrative evaluation generated."}
                  </p>
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <ListChecks size={14} className="text-gray-400" />
                      AI Directed Lifestyle Interventions
                    </h4>
                    <ul className="grid grid-cols-1 gap-2.5">
                      {result.recommendations.map((item, idx) => (
                        <li key={idx} className="text-xs font-semibold text-gray-700 bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-black text-indigo-600 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border border-slate-100 bg-slate-50/20 rounded-2xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600 mt-0.5">
                    <CalendarRange size={16} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">System Follow-Up Mandate</h4>
                    <p className="text-xs font-bold text-gray-600 mt-1 leading-relaxed">
                      {result.followUp}
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-28 border-2 border-dashed border-gray-100 rounded-2xl bg-slate-50/20 w-full h-[310px]">
                <FileSpreadsheet size={38} className="text-gray-300 stroke-[1.5] animate-pulse mb-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}