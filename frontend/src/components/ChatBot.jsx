import { useState } from "react";
import API from "../services/api";

function ChatBot() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = {
      sender: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion(""); // Clear input early for better UX
    setLoading(true);

    try {
      // 1. Pointing to the correct backend route we just created
      const res = await API.post("/chat/send-message", {
        // 2. Matching the variable name the Node.js backend expects
        userMessage: question, 
      });

      const aiMessage = {
        sender: "ai",
        // 3. Matching the variable name the Node.js backend sends back
        text: res.data.reply || "No response received.",
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Unable to reach the analysis server. Please ensure the backend is running.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-[80vh] flex flex-col">
      <h2 className="text-2xl font-bold mb-4">
        MediAssist AI
      </h2>

      <div className="flex-1 overflow-y-auto border rounded-xl p-4 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 ${
              msg.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              // Added 'whitespace-pre-wrap' so the AI's line breaks render correctly
              className={`inline-block px-4 py-2 rounded-xl whitespace-pre-wrap text-left ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <p className="text-gray-500 text-sm animate-pulse">
            MediAssist AI is analyzing...
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendQuestion()} // Added Enter to send
          placeholder="Ask about your lab results..."
          className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <button
          onClick={sendQuestion}
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBot;