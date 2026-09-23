import React, { useState, useRef } from "react";
import {
  Mic,
  Square,
  UploadCloud,
  Volume2,
  ShieldCheck,
  Activity,
  Upload,
  AlertCircle,
  HeartPulse,
} from "lucide-react";
import MainLayout from "../components/DashboardLayout";

export default function HeartSoundModule() {
  const [activeTab, setActiveTab] = useState("record");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [result, setResult] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const startRecording = async () => {
    try {
      setAudioFile(null);
      setResult(null);
      setErrorMessage(null);
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
        const recordedFile = new File([audioBlob], "recorded_heart_sound.wav", {
          type: "audio/wav",
        });
        setAudioFile(recordedFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error("Microphone Access Denied:", err);
      setErrorMessage("Microphone permission denied or unsupported device interface.");
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
    setRecordingTime("00:00");
    timerRef.current = setInterval(() => {
      seconds++;
      const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
      const secs = String(seconds % 60).padStart(2, "0");
      setRecordingTime(`${mins}:${secs}`);
      if (seconds >= 30) stopRecording();
    }, 1000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      setResult(null);
      setErrorMessage(null);
    }
  };

  const handleAnalyze = async () => {
    if (!audioFile) {
      setErrorMessage("Please capture an audio stream or browse an audio file first.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("file", audioFile);

      const res = await fetch("http://localhost:8000/api/heart/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Heart sound analysis pipeline failed.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Analysis Pipeline Failed:", err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAbnormal =
    result?.analysis?.is_abnormal ??
    result?.prediction?.toLowerCase() === "abnormal";

  const predictionText =
    result?.analysis?.prediction ||
    result?.prediction ||
    (isAbnormal ? "Abnormal Heart Sound Detected" : "Heart Sounds Appear Normal");

  const urgency = result?.analysis?.urgency_level || (isAbnormal ? "High" : "Low");

  const confidenceValue =
    result?.analysis?.confidence_percentage !== undefined
      ? result.analysis.confidence_percentage
      : typeof result?.confidence === "number"
      ? (result.confidence * 100).toFixed(1)
      : null;

  const abnormalProb =
    result?.analysis?.abnormal_probability !== undefined
      ? result.analysis.abnormal_probability * 100
      : isAbnormal
      ? 85.0
      : 12.0;

  const clinicalNotes =
    result?.clinical_notes ||
    result?.interpretation ||
    "No acoustic anomalies detected during phonocardiogram evaluation.";

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#fff7f7] via-[#fffbfb] to-[#fff1f2] min-h-screen text-rose-950 font-serif">
        {/* Header */}
        <div className="mb-6 sm:mb-8 max-w-[1600px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-rose-700 text-xs font-semibold mb-2">
            <HeartPulse size={13} className="text-red-600 animate-pulse" />
            <span>Acoustic Phonocardiogram (PCG)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-950 flex items-center gap-2.5">
            Heart Sound AI Diagnostics
          </h1>
          <p className="text-xs text-rose-500 font-medium mt-1">
            CardiacSaarthi acoustic cardiac screening & murmur classification
          </p>
        </div>

        {/* Interaction Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-[1600px] mx-auto">
          {/* Left Interaction Panel */}
          <div className="lg:col-span-5 bg-white/95 rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/90 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="border-b border-rose-100 pb-4 mb-4">
                <h2 className="text-sm font-extrabold text-rose-950 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-50 text-red-600">
                    <Upload size={16} />
                  </span>
                  Record or Select Audio Sample
                </h2>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 bg-rose-50/60 p-1 rounded-xl mb-5 border border-rose-100/70">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("record");
                    setAudioFile(null);
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "record"
                      ? "bg-white text-rose-950 shadow-xs border border-rose-100"
                      : "text-rose-500 hover:text-rose-800"
                  }`}
                >
                  Record Live
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("upload");
                    setAudioFile(null);
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "upload"
                      ? "bg-white text-rose-950 shadow-xs border border-rose-100"
                      : "text-rose-500 hover:text-rose-800"
                  }`}
                >
                  File Upload
                </button>
              </div>

              {/* Input Modes */}
              {activeTab === "record" ? (
                <div className="flex flex-col items-center justify-center p-6 text-center min-h-[200px] bg-rose-50/30 rounded-2xl border border-rose-100">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all relative ${
                      isRecording
                        ? "bg-red-600 text-white ring-4 ring-red-200 shadow-md shadow-red-500/30"
                        : "bg-rose-50 text-red-600 ring-4 ring-rose-100 hover:scale-105 border border-rose-200"
                    }`}
                  >
                    {isRecording ? <Square size={26} fill="currentColor" /> : <Mic size={26} />}
                    {isRecording && (
                      <span className="absolute inset-0 w-full h-full rounded-full bg-red-400 opacity-25 animate-ping"></span>
                    )}
                  </button>

                  <p className="text-lg font-black text-rose-950 mt-4 tracking-tight">
                    {isRecording ? recordingTime : "00:00 / 00:30"}
                  </p>
                  <p className="text-xs text-rose-400 font-medium mt-1">
                    {isRecording
                      ? "Listening to cardiovascular audio..."
                      : "Tap mic to capture digital stethoscope input"}
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-rose-200 hover:border-red-400 hover:bg-rose-50/50 bg-rose-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".wav,.mp3,.ogg,.m4a,audio/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="p-3 bg-white rounded-2xl shadow-xs text-red-600 mb-3 border border-rose-100 group-hover:scale-110 transition-transform">
                    <UploadCloud size={24} />
                  </div>
                  <span className="text-xs font-semibold text-rose-900">
                    Browse PCG Audio Sample
                  </span>
                  <p className="text-[10px] text-rose-400 mt-1 font-medium">
                    Supports WAV, MP3, OGG, M4A (Max 10MB)
                  </p>
                </div>
              )}

              {/* Audio Playback Preview */}
              {audioFile && (
                <div className="mt-4 p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Volume2 size={16} className="text-red-600 shrink-0" />
                    <p className="text-xs font-bold text-rose-950 truncate w-full">
                      {audioFile.name}
                    </p>
                  </div>
                  <audio
                    controls
                    src={URL.createObjectURL(audioFile)}
                    className="h-8 w-full mt-1 accent-red-600"
                  />
                </div>
              )}

              {/* Error Output */}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Run Analysis Trigger */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : handleAnalyze}
              disabled={loading || (!audioFile && !isRecording)}
              className={`w-full font-bold py-3 px-4 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-6 ${
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-700 animate-pulse shadow-red-500/20"
                  : !audioFile
                  ? "bg-rose-100/70 text-rose-300 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 active:scale-[0.99] shadow-rose-500/20"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Processing PCG Audio...</span>
                </>
              ) : isRecording ? (
                <span>Stop & Use Sample</span>
              ) : (
                <span>Run Cardiac Analysis</span>
              )}
            </button>
          </div>

          {/* Right Metrics Panel */}
          <div className="lg:col-span-7 bg-white/95 rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/90 min-h-[380px]">
            {result ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Spectrogram Preview Card */}
                <div className="bg-[#1f0f14] border border-rose-950/40 rounded-2xl p-3 flex items-center justify-center min-h-[160px] overflow-hidden">
                  {result?.spectrogram_image ? (
                    <img
                      src={result.spectrogram_image}
                      alt="PCG Mel Spectrogram"
                      className="w-full h-full object-cover rounded-xl shadow-xs"
                    />
                  ) : (
                    <span className="text-rose-200/60 text-sm font-medium">
                      Mel Spectrogram Audio Representation
                    </span>
                  )}
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Classification State */}
                  <div className="bg-rose-50/30 border border-rose-100 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                        Classification
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                          urgency.toLowerCase() === "high"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        Urgency: {urgency}
                      </span>
                    </div>

                    <p
                      className={`text-base font-black mt-3 tracking-tight flex items-center gap-2 ${
                        isAbnormal ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isAbnormal ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                        }`}
                      ></span>
                      {predictionText}
                    </p>
                  </div>

                  {/* Confidence Score */}
                  <div className="bg-rose-50/30 border border-rose-100 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      Confidence Score
                    </span>
                    <p className="text-base font-black text-rose-950 mt-2 tracking-tight">
                      {confidenceValue ? `${confidenceValue}%` : "N/A"}
                    </p>

                    <div className="mt-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          Number(confidenceValue) >= 80
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {Number(confidenceValue) >= 80 ? "High Reliability" : "Moderate Reliability"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Anomaly Probability Bar */}
                <div className="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl">
                  <div className="flex justify-between text-xs text-rose-900 font-medium mb-1.5">
                    <span>Murmur / Anomaly Likelihood</span>
                    <span className="font-bold text-rose-950">{abnormalProb.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isAbnormal ? "bg-red-600" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(abnormalProb, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Clinical Notes */}
                <div
                  className={`rounded-2xl p-4 border ${
                    isAbnormal
                      ? "bg-red-50/70 border-red-200 text-red-950"
                      : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  }`}
                >
                  <h4 className="text-[11px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck
                      size={14}
                      className={isAbnormal ? "text-red-600" : "text-emerald-600"}
                    />
                    Clinical Note & Interpretation
                  </h4>
                  <p className="text-xs font-medium leading-relaxed opacity-90">
                    {clinicalNotes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[320px] border-2 border-dashed border-rose-200/80 rounded-2xl bg-rose-50/20 p-6">
                <div className="p-4 bg-white rounded-2xl shadow-xs mb-3 border border-rose-100">
                  <Activity size={32} className="text-red-500 stroke-[1.5]" />
                </div>
                <p className="text-xs font-bold text-rose-950">Awaiting Audio Stream</p>
                <p className="text-[11px] text-rose-400 mt-1 max-w-xs">
                  Record a live sample or upload a PCG recording to view acoustic classifications and anomaly likelihood.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}