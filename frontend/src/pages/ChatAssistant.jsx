import { useState } from "react";
import { MessageSquare, Send, Sparkles, BookOpen, Plus, HeartPulse, HelpCircle, Activity } from "lucide-react";
import MainLayout from "../components/DashboardLayout";
import API from "../services/api";

export default function ChatAssistant() {
  const [chatSessions, setChatSessions] = useState([
    { id: "s1", title: "What is atrial fibrillation?" },
    { id: "s2", title: "Why is my cholesterol high?" },
    { id: "s3", title: "Explain my ECG report" },
    { id: "s4", title: "How to reduce BP?" }
  ]);
  
  const [activeSession, setActiveSession] = useState("s1");
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentChat, setCurrentChat] = useState({
    prompt: "What is atrial fibrillation?",
    response: "Atrial fibrillation (AFib) is an irregular and often rapid heart rhythm that occurs when the two upper chambers of your heart (atria) beat out of sync with the lower chambers (ventricles). It can increase the risk of stroke, heart failure, and other cardiovascular complications.",
    sources: [
      { name: "American Heart Association", url: "#" },
      { name: "Mayo Clinic Cardiac Guidelines", url: "#" }
    ]
  });

  const handleSelectSession = (session) => {
    setActiveSession(session.id);
    setLoading(true);

    setTimeout(() => {
      if (session.id === "s1") {
        setCurrentChat({
          prompt: "What is atrial fibrillation?",
          response: "Atrial fibrillation (AFib) is an irregular and often rapid heart rhythm that occurs when the two upper chambers of your heart (atria) beat out of sync with the lower chambers (ventricles). It can increase the risk of stroke, heart failure, and other cardiovascular complications.",
          sources: [
            { name: "American Heart Association", url: "#" },
            { name: "Mayo Clinic Cardiac Guidelines", url: "#" }
          ]
        });
      } else if (session.id === "s2") {
        setCurrentChat({
          prompt: "Why is my cholesterol high?",
          response: "Elevated cholesterol levels are often driven by dietary lipids, reduced physical activity, genetic markers, or hepatic lipid clearance. Your recent biomarker panel revealed a total cholesterol reading of 210 mg/dL, which places it slightly above baseline.",
          sources: [
            { name: "National Heart, Lung, and Blood Institute", url: "#" },
            { name: "Clinical Lipid Guidelines", url: "#" }
          ]
        });
      } else {
        setCurrentChat({
          prompt: session.title,
          response: `This is a contextualized AI medical answer generated for your query: "${session.title}". The integrated RAG engine parses your verified patient telemetry logs to formulate localized parameters safely.`,
          sources: [{ name: "CardiacSaarthi Internal Knowledge Base", url: "#" }]
        });
      }
      setLoading(false);
    }, 300);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userPrompt = inputMessage;
    setInputMessage("");
    setLoading(true);

    const newId = `s_${Date.now()}`;
    const newSession = { 
      id: newId, 
      title: userPrompt.length > 28 ? userPrompt.substring(0, 28) + "..." : userPrompt 
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSession(newId);

    try {
      const res = await API.post("/chat/send-message", { 
        userMessage: userPrompt 
      });
      
      setCurrentChat({
        prompt: userPrompt,
        response: res.data?.reply || "No clinical insight returned.",
        sources: [
          { name: "CardiacSaarthi Clinical Knowledge Base", url: "#" }, 
          { name: "Patient Biometric Telemetry", url: "#" }
        ]
      });
    } catch (err) {
      console.error("RAG Pipeline Route Failure:", err);
      setCurrentChat({
        prompt: userPrompt,
        response: "⚠️ Unable to connect to the clinical analysis server. Please verify your backend service is online.",
        sources: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#fff7f7] via-[#fffbfb] to-[#fff1f2] min-h-screen text-rose-950 font-serif">
        
        {/* HEADER */}
        <div className="mb-8 max-w-[1500px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-rose-700 text-xs font-semibold mb-2">
            <HeartPulse size={13} className="text-red-600 animate-pulse" />
            <span>AI Clinical Consultation Assistant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight">
            Cardiac AI Chat Assistant
          </h1>
        </div>

        {/* WORKSPACE MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1500px] mx-auto items-start">
          
          {/* LEFT WIDGET: CHAT HISTORY LIST */}
          <div className="lg:col-span-4 bg-white/95 rounded-3xl p-5 shadow-xs border border-rose-100/90 flex flex-col justify-between min-h-[520px]">
            <div className="space-y-4">
              <button
                onClick={() => {
                  setInputMessage("");
                  setCurrentChat(null);
                  setActiveSession(null);
                }}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 active:scale-[0.99]"
              >
                <Plus size={15} />
                <span>New Consultation Session</span>
              </button>

              <div className="pt-2">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block px-2 mb-2">
                  Recent Consultations
                </span>
                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 [scrollbar-width:thin] scrollbar-thumb-rose-200">
                  {chatSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`w-full text-left py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 group truncate ${
                        activeSession === session.id
                          ? "bg-rose-50 border border-rose-200 text-red-600 shadow-2xs font-extrabold"
                          : "text-rose-900/70 hover:bg-rose-50/40 hover:text-rose-950"
                      }`}
                    >
                      <MessageSquare 
                        size={14} 
                        className={activeSession === session.id ? "text-red-600 shrink-0" : "text-rose-300 group-hover:text-rose-500 shrink-0"} 
                      />
                      <span className="truncate">{session.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Safety Guideline Block */}
            <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 mt-4">
              <p className="text-[10px] font-bold text-rose-500 leading-relaxed flex gap-2 items-start">
                <HelpCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span>Responses are derived via semantic vector retrieval and patient metrics. Always consult certified clinicians for diagnostic decisions.</span>
              </p>
            </div>
          </div>

          {/* RIGHT WIDGET: CONVERSATION CANVAS */}
          <div className="lg:col-span-8 bg-white/95 rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/90 min-h-[520px] flex flex-col justify-between">
            
            <div className="flex-1">
              {loading ? (
                <div className="space-y-4 animate-pulse py-4">
                  <div className="h-4 bg-rose-100/60 rounded-xl w-1/3 ml-auto" />
                  <div className="h-28 bg-rose-50/50 rounded-2xl w-full mt-6 border border-rose-100/60" />
                  <div className="h-3 bg-rose-100/60 rounded-xl w-1/4" />
                </div>
              ) : currentChat ? (
                <div className="space-y-6">
                  
                  {/* User Outgoing Prompt */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 text-xs font-semibold max-w-[85%] shadow-md shadow-rose-500/15 tracking-wide">
                      {currentChat.prompt}
                    </div>
                  </div>

                  {/* AI Incoming Response */}
                  <div className="bg-rose-50/40 border border-rose-100 rounded-3xl p-5 sm:p-6 space-y-4 relative">
                    <div className="flex items-center gap-2 border-b border-rose-100/70 pb-3">
                      <span className="p-1.5 rounded-xl bg-white text-red-600 border border-rose-100 shadow-2xs">
                        <Sparkles size={14} />
                      </span>
                      <span className="text-[11px] font-bold text-rose-950 uppercase tracking-wider">
                        CardiacSaarthi Clinical Synthesis
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-rose-900 font-medium leading-relaxed whitespace-pre-wrap">
                      {currentChat.response}
                    </div>

                    {/* Sources */}
                    {currentChat.sources && currentChat.sources.length > 0 && (
                      <div className="pt-3 border-t border-rose-100/80">
                        <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <BookOpen size={12} className="text-red-500" />
                          Referenced Medical Citations:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentChat.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              className="text-[11px] font-bold text-red-600 hover:underline bg-white border border-rose-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition hover:border-red-300"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              {src.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-24 text-rose-400">
                  <div className="p-4 bg-rose-50 text-red-600 rounded-2xl border border-rose-100 mb-3 shadow-2xs">
                    <Activity size={32} className="animate-pulse" />
                  </div>
                  <h3 className="text-sm font-black text-rose-950">Clinical Knowledge Workspace</h3>
                  <p className="text-[11px] text-rose-400 max-w-xs mt-1 font-medium">
                    Select a topic question from the sidebar history matrix or type your cardiac query below.
                  </p>
                </div>
              )}
            </div>

            {/* MESSAGE INPUT BAR */}
            <form onSubmit={handleSendMessage} className="mt-6 pt-4 border-t border-rose-100 flex gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about arrhythmias, heart sounds, lipid values, or treatment routines..."
                  className="w-full bg-rose-50/30 border border-rose-200 rounded-2xl py-3 pl-4 pr-12 text-xs font-semibold text-rose-950 placeholder-rose-300 outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all shadow-inner"
                />
                <div className="absolute right-3.5 top-3.5 text-red-500 pointer-events-none">
                  <Sparkles size={15} />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className={`px-4 py-3 rounded-2xl transition-all flex items-center justify-center shadow-md ${
                  !inputMessage.trim()
                    ? "bg-rose-100/70 text-rose-300 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 active:scale-95 shadow-rose-500/20"
                }`}
              >
                <Send size={15} />
              </button>
            </form>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}