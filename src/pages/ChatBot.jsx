import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Leaf, Bot, User, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { chatWithAssistant } from "@/lib/gemini";

const SUGGESTED = [
  "कापसावर बोंडअळी आली आहे, काय करू?",
  "सोयाबीनची पाने पिवळी होत आहेत",
  "जोवारीवर काय फवारावे?",
  "कांदा पिकात थ्रिप्स आहेत",
];

const DEFAULT_MESSAGE = {
  role: "assistant",
  content: "नमस्कार! मी LeafShield AI आहे — जालना जिल्ह्यातील शेतकऱ्यांसाठी तुमचा वैयक्तिक कृषी सहाय्यक. तुमच्या पिकाबद्दल कोणतीही समस्या खाली विचारा! 🌿",
};

export default function ChatBot() {
  // App initialize hotana direct sessionStorage madhun data ghet ahe, network call chi garaj nahi
  const [messages, setMessages] = useState(() => {
    const savedHistory = sessionStorage.getItem("leafshield_chat_history");
    return savedHistory ? JSON.parse(savedHistory) : [DEFAULT_MESSAGE];
  });
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const targetText = textToSend || input.trim();
    if (!targetText || loading) return;

    setInput("");
    const updatedMessages = [...messages, { role: "user", content: targetText }];
    setMessages(updatedMessages);
    
    // Local storage madhe save kar, instant reload sathi
    sessionStorage.setItem("leafshield_chat_history", JSON.stringify(updatedMessages));
    setLoading(true);

    try {
      const response = await chatWithAssistant(messages, targetText);
      const finalMessages = [...updatedMessages, { role: "assistant", content: response }];
      setMessages(finalMessages);
      sessionStorage.setItem("leafshield_chat_history", JSON.stringify(finalMessages));
    } catch (error) {
      console.error(error);
      const finalMessages = [...updatedMessages, { role: "assistant", content: "कृपिया पुन्हा प्रयत्न करा, संपर्क होऊ शकला नाही." }];
      setMessages(finalMessages);
      sessionStorage.setItem("leafshield_chat_history", JSON.stringify(finalMessages));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([DEFAULT_MESSAGE]);
    sessionStorage.removeItem("leafshield_chat_history");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[90vh]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 bg-gray-100 rounded-xl"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">कृषी AI सहाय्यक</h1>
            <p className="text-xs text-gray-400">मराठीत झटपट सल्ला</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg border">
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-gray-50 p-4 rounded-2xl border">
        {/* Attha loading spinner chi garaj nahi, data instant direct load hoil */}
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-green-600 text-white" : "bg-white border text-green-600"}`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
            </div>
            <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === "user" ? "bg-green-600 text-white" : "bg-white text-gray-800"}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-gray-400 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> उत्तर शोधत आहे...</div>}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {SUGGESTED.map((q, i) => (
            <button key={i} onClick={() => handleSend(q)} className="text-left text-xs bg-white border p-2.5 rounded-xl hover:bg-green-50 text-gray-600">🌿 {q}</button>
          ))}
        </div>
      )}

      <div className="flex gap-2 bg-white border p-2 rounded-xl shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="तुमची समस्या इथे टाईप करा..."
          className="flex-1 text-sm outline-none px-2"
        />
        <button onClick={() => handleSend()} className="bg-green-600 text-white p-2.5 rounded-xl"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}