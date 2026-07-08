import { useState } from "react";
import { MessageSquare, Send, Sparkles, BookOpen, Plus, Heart, HelpCircle, Activity } from "lucide-react";
import MainLayout from "../components/DashboardLayout";
import API from "../services/api";

export default function ChatAssistant() {
  // Sidebar session tabs tracking
  const [chatSessions, setChatSessions] = useState([
    { id: "s1", title: "What is atrial fibrillation?" },
    { id: "s2", title: "Why is my cholesterol high?" },
    { id: "s3", title: "Explain my ECG report" },
    { id: "s4", title: "How to reduce BP?" }
  ]);
  
  const [activeSession, setActiveSession] = useState("s1");
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Active chat log stream matrix state
  const [currentChat, setCurrentChat] = useState({
    prompt: "What is atrial fibrillation?",
    response: "Atrial fibrillation (AFib) is an irregular and often rapid heart rhythm that occurs when the two upper chambers of your heart (atria) beat out of sync with the lower chambers (ventricles). It can increase the risk of stroke, heart failure and other heart-related complications.",
    sources: [
      { name: "American Heart Association", url: "#" },
      { name: "Mayo Clinic", url: "#" }
    ]
  });

  const handleSelectSession = (session) => {
    setActiveSession(session.id);
    setLoading(true);

    // Dynamic state simulation switcher for the dummy history sidebar
    setTimeout(() => {
      if (session.id === "s1") {
        setCurrentChat({
          prompt: "What is atrial fibrillation?",
          response: "Atrial fibrillation (AFib) is an irregular and often rapid heart rhythm that occurs when the two upper chambers of your heart (atria) beat out of sync with the lower chambers (ventricles). It can increase the risk of stroke, heart failure and other heart-related complications.",
          sources: [
            { name: "American Heart Association", url: "#" },
            { name: "Mayo Clinic", url: "#" }
          ]
        });
      } else if (session.id === "s2") {
        setCurrentChat({
          prompt: "Why is my cholesterol high?",
          response: "Elevated cholesterol levels are often caused by a combination of dietary habits, lack of physical activity, genetics, and metabolic processing efficiency. Your recent lab results indicated a value of 210 mg/dL, which sits slightly above the normal threshold.",
          sources: [
            { name: "National Heart, Lung, and Blood Institute", url: "#" },
            { name: "CDC Medical Guidelines", url: "#" }
          ]
        });
      } else {
        setCurrentChat({
          prompt: session.title,
          response: `This is a contextualized AI medical answer simulated for your query: "${session.title}". The integrated RAG engine parses your verified patient telemetry logs to generate localized parameters safely.`,
          sources: [{ name: "Internal Clinical Knowledge Base", url: "#" }]
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

    // Generate dynamic new sidebar session log element
    const newId = `s_${Date.now()}`;
    const newSession = { id: newId, title: userPrompt.length > 28 ? userPrompt.substring(0, 28) + "..." : userPrompt };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSession(newId);

    try {
      // 1. Point to the NEW backend endpoint
      const res = await API.post("/chat/send-message", { 
        // 2. Pass the message using the variable the backend expects
        userMessage: userPrompt 
      });
      
      setCurrentChat({
        prompt: userPrompt,
        // 3. Receive the reply using the variable the backend sends
        response: res.data.reply,
        sources: [{ name: "MediAssist AI Knowledge Base", url: "#" }, { name: "Patient Lab Results", url: "#" }]
      });
    } catch (err) {
      console.error("RAG Pipeline Route Failure:", err);
      // Actual Error Fallback
      setCurrentChat({
        prompt: userPrompt,
        response: "⚠️ Unable to connect to the analysis server. Please ensure your backend is running.",
        sources: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f9fe] min-h-screen text-gray-900">
        
        {/* VIEW MAIN PAGEHEADER */}
        <div className="mb-8 max-w-[1500px] mx-auto">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">AI Chat Assistant</h1>
        </div>

        {/* DOUBLE VIEW COLUMN WORKSPACE MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1500px] mx-auto items-start">
          
          {/* LEFT CONTAINER WIDGET: CHAT TOPICS HISTORY LIST */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[520px]">
            <div className="space-y-4">
              <button
                onClick={() => {
                  setInputMessage("");
                  setCurrentChat(null);
                  setActiveSession(null);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
              >
                <Plus size={14} />
                <span>New Chat</span>
              </button>

              <div className="pt-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-2 mb-2">Recent Queries</span>
                <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
                  {chatSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-2 group truncate ${
                        activeSession === session.id
                          ? "bg-indigo-50/80 text-indigo-600"
                          : "text-gray-500 hover:bg-slate-50 hover:text-gray-800"
                      }`}
                    >
                      <MessageSquare size={14} className={activeSession === session.id ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-600"} />
                      <span className="truncate">{session.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Safety Guideline Label Block */}
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 mt-4">
              <p className="text-[10px] font-bold text-gray-400 leading-relaxed flex gap-1.5 items-start">
                <HelpCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                <span>Answers are contextualized via semantic database matching vectors and should not replace professional clinical decisions.</span>
              </p>
            </div>
          </div>

          {/* RIGHT CONTAINER WIDGET: CONVERSATIONAL CONTEXT CANVAS */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 min-h-[520px] flex flex-col justify-between">
            
            {/* Dynamic Conversational Content Interface */}
            <div className="flex-1">
              {loading ? (
                /* High fidelity skeleton response state */
                <div className="space-y-4 animate-pulse py-4">
                  <div className="h-4 bg-slate-100 rounded w-1/3 ml-auto" />
                  <div className="h-24 bg-slate-50 rounded-2xl w-full mt-6" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              ) : currentChat ? (
                <div className="space-y-6">
                  
                  {/* User Outgoing Prompt Block */}
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-xs font-bold max-w-[85%] shadow-sm tracking-wide">
                      {currentChat.prompt}
                    </div>
                  </div>

                  {/* AI Incoming Response Frame Card */}
                  <div className="bg-slate-50/70 border border-gray-100 rounded-2xl p-4 sm:p-5 space-y-4 relative">
                    
                    {/* ADDED whitespace-pre-wrap so the AI's Markdown lists format correctly */}
                    <div className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                      {currentChat.response}
                    </div>

                    {/* RAG Core References / Sources block element */}
                    {currentChat.sources && currentChat.sources.length > 0 && (
                      <div className="pt-3 border-t border-gray-200/60">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                          <BookOpen size={12} className="text-indigo-500" />
                          Sources Cited:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentChat.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              className="text-[11px] font-bold text-indigo-600 hover:underline bg-white border border-gray-100 px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1"
                            >
                              <span className="w-1 h-1 rounded-full bg-indigo-500" />
                              {src.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Zero state canvas presentation view */
                <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400">
                  <Activity size={38} className="stroke-[1.5] text-indigo-400/80 animate-pulse mb-3" />
                  <h3 className="text-sm font-black text-slate-800">Clinical Knowledge Workspace</h3>
                  <p className="text-[11px] text-gray-400 max-w-xs mt-1 font-medium">
                    Select a topic question from the sidebar history matrix or submit a custom metabolic query below to parse citations.
                  </p>
                </div>
              )}
            </div>

            {/* MESSAGE USER SUBMISSION INPUT FORM */}
            <form onSubmit={handleSendMessage} className="mt-6 pt-4 border-t border-gray-50 flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about symptoms, diagnostic interpretations, or report data..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-xs font-bold text-gray-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                />
                <div className="absolute right-3.5 top-3.5 text-indigo-500 pointer-events-none">
                  <Sparkles size={14} className="animate-pulse" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className={`p-3 rounded-xl transition flex items-center justify-center shadow-sm ${
                  !inputMessage.trim()
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                }`}
              >
                <Send size={14} />
              </button>
            </form>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}