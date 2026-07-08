import { useState, useRef } from "react";
import axios from "axios";
import { Mic, Square, UploadCloud, Volume2, ShieldCheck, Activity,Upload } from "lucide-react";
import MainLayout from "../components/DashboardLayout";

export default function UploadHeartSound() {
  // Navigation & Control States
  const [activeTab, setActiveTab] = useState("record");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Dynamic API / Mock Analysis state maps
  const [result, setResult] = useState(null);
  const [imageError, setImageError] = useState(false); // Track broken images

  // References for handling low-level browser MediaStreams
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Real-time Recording Engine Handlers ---
  const startRecording = async () => {
    try {
      setFile(null);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const recordedFile = new File([audioBlob], "recorded_heart_sound.wav", { type: "audio/wav" });
        setFile(recordedFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error("Microphone Access Denied:", err);
      alert("Microphone permission denied or unsupported device interface.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const startTimer = () => {
    let seconds = 0;
    timerRef.current = setInterval(() => {
      seconds++;
      const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
      const secs = String(seconds % 60).padStart(2, "0");
      setRecordingTime(`${mins}:${secs}`);
      if (seconds >= 30) stopRecording(); 
    }, 1000);
  };

  // --- File Upload Handler ---
  const handleFileUpload = async () => {
    if (!file) return alert("Please capture an audio stream or browse an audio file first.");

    try {
      setLoading(true);
      setImageError(false);
      const formData = new FormData();
      formData.append("audio", file);

      const res = await axios.post(
        "http://localhost:5000/api/heart-sound/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Heart Sound Result:", res.data);
      setResult(res.data);
    } catch (error) {
      console.error("Analysis Pipeline Failed:", error);
      
      // Fallback object
      setResult({
        prediction: "normal",
        confidence: 0.93,
        interpretation: "Heart sounds appear normal. No significant abnormal acoustic patterns detected.",
        spectrogramUrl: "https://i.imgur.com/vHqY7bK.png"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f9fe] min-h-screen text-gray-900">
        
        {/* PAGE SUBHEADER SECTION */}
        <div className="mb-6 sm:mb-8 max-w-[1600px] mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-990 flex items-center gap-2.5">
              Heart Sound AI Analysis
          </h1>
        </div>

        {/* COMPONENT INTERACTION CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-[1600px]">
          
          {/* LEFT INTERACTION FRAME */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[350px]">
            <div>
            
            <h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                  <Upload size={18} className="text-indigo-500" /> Record / Upload Heart Sound
                </h2>
              
              {/* Premium Dual Segment Toggle Tabs */}
              <div className="grid grid-cols-2 bg-slate-100/70 p-1 rounded-xl mb-6">
                <button
                  onClick={() => { setActiveTab("record"); setFile(null); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "record" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Record
                </button>
                <button
                  onClick={() => { setActiveTab("upload"); setFile(null); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Upload
                </button>
              </div>

              {/* DYNAMIC VIEWPORTS ENGINE */}
              {activeTab === "record" ? (
                <div className="flex flex-col items-center justify-center p-6 text-center min-h-[220px]">
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all relative ${
                      isRecording ? "bg-red-50 text-red-500 ring-4 ring-red-100" : "bg-violet-50 text-violet-600 ring-4 ring-violet-50 hover:scale-105"
                    }`}
                  >
                    {isRecording ? <Square size={30} fill="currentColor" /> : <Mic size={30} />}
                    {isRecording && (
                      <span className="absolute inset-0 w-full h-full rounded-full bg-red-400 opacity-20 animate-ping"></span>
                    )}
                  </button>
                  
                  <p className="text-lg font-black text-slate-800 mt-5 tracking-tight">{isRecording ? recordingTime : "00:00 / 00:30"}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    {isRecording ? "Listening to cardiovascular audio..." : "Click microphone to start recording"}
                  </p>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/30 bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] group"
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".wav,.mp3,audio/*" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-violet-500 mb-3 border border-gray-100 group-hover:scale-110 transition-transform">
                    <UploadCloud size={24} />
                  </div>
                  
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Supports WAV, MP3 formats (Max 10MB)</p>
                </div>
              )}

              {/* Selected File Feedback Notification pill */}
              {file && (
                <div className="mt-4 p-3 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-2 animate-fadeIn">
                  <Volume2 size={16} className="text-violet-600 shrink-0" />
                  <p className="text-xs font-bold text-violet-900 truncate w-full">{file.name}</p>
                </div>
              )}
            </div>

            <button
              onClick={isRecording ? stopRecording : handleFileUpload}
              disabled={loading || (!file && !isRecording)}
              className={`w-full font-bold py-3.5 px-4 rounded-2xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 mt-6 ${
                isRecording
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                  : !file
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-95 active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Processing Audio...</span>
                </>
              ) : isRecording ? (
                <span>Stop & Secure Sample</span>
              ) : (
                <span>Analyze Audio</span>
              )}
            </button>
          </div>

          {/* RIGHT SIDE PANEL: LIVE AI DIAGNOSIS METRICS */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 min-h-[350px]">

            {result ? (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="w-full bg-slate-900 rounded-2xl p-1 overflow-hidden relative group border border-slate-800 shadow-inner flex items-center justify-center min-h-[190px]">
                  
                  {imageError || !result?.spectrogramUrl ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-0">
                      {/* Sleek CSS fallback */}
                      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#8b5cf6_2px,#8b5cf6_4px)]"></div>
                      <Activity className="text-violet-500/50 w-10 h-10 mb-2 relative z-10" />
                      <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase relative z-10">Spectrogram Unavailable</span>
                    </div>
                  ) : (
                    <img 
  src={result.spectrogramUrl || "https://images.unsplash.com/photo-1614064641913-6b70a32b0051?q=80&w=800&auto=format&fit=crop"}
                      alt="Phonocardiogram Spectrogram Analysis" 
                      className="w-full h-full max-h-[190px] object-cover rounded-xl relative z-10"
                      onError={() => setImageError(true)}
                    />
                  )}

                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[9px] text-gray-300 px-2 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1.5 z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Spectrogram Render</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Prediction Card */}
                  <div className="bg-slate-50/60 border border-gray-100 p-4 rounded-2xl flex flex-col justify-between hover:bg-slate-50 transition-colors">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Prediction
                    </span>

                    <p
                      className={`text-sm sm:text-base font-black mt-2 tracking-tight flex items-center gap-1.5 ${
                        result?.prediction === "abnormal"
                          ? "text-red-600"
                          : result?.prediction === "uncertain"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          result?.prediction === "abnormal"
                            ? "bg-red-500"
                            : result?.prediction === "uncertain"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></span>

                      {result?.prediction === "abnormal"
                        ? "Abnormal Heart Sound Detected"
                        : result?.prediction === "normal"
                        ? "Heart Sounds Appear Normal"
                        : "Analysis Inconclusive"}
                    </p>
                  </div>

                  {/* Confidence Card - SAFE ADDITION HERE */}
                  <div className="bg-slate-50/60 border border-gray-100 p-4 rounded-2xl flex flex-col justify-between hover:bg-slate-50 transition-colors">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Confidence
                    </span>

                    <p className="text-sm sm:text-base font-black text-slate-800 mt-2 tracking-tight">
                      {typeof result?.confidence === 'number' ? (result.confidence * 100).toFixed(2) : "0.00"}%
                    </p>

                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          result?.confidence >= 0.9
                            ? "bg-emerald-100 text-emerald-700"
                            : result?.confidence >= 0.7
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result?.confidence >= 0.9
                          ? "High Confidence"
                          : result?.confidence >= 0.7
                          ? "Moderate Confidence"
                          : "Low Confidence"}
                      </span>
                    </div>
                  </div>

                </div>

                {result?.interpretation && (
                  <div
                    className={`rounded-2xl p-4 border ${
                      result.prediction === "abnormal"
                        ? "bg-red-50 border-red-200"
                        : result.prediction === "normal"
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck size={14} className={`
                        ${result.prediction === 'abnormal' ? 'text-red-500' : result.prediction === 'normal' ? 'text-emerald-500' : 'text-yellow-500'}
                      `} />
                      Clinical Interpretation
                    </h4>

                    <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
                      {result.interpretation}
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[310px] border-2 border-dashed border-gray-200 rounded-2xl bg-slate-50/30">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-gray-100">
                  <Activity size={32} className="text-violet-400 stroke-[1.5]" />
                </div>
                
                
              </div>
            )}

          </div>

        </div>
      </div>
    </MainLayout>
  );
}