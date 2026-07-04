import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Leaf, Bot, User, Loader2, ArrowLeft, Mic, MicOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const SUGGESTED = [
  "कापसावर बोंडअळी आली आहे, काय करू?",
  "सोयाबीनची पाने पिवळी होत आहेत",
  "जोवारीवर काय फवारावे?",
  "तूर डाळीवर रोग आला आहे",
  "कांदा पिकात थ्रिप्स आहेत",
  "पाऊस नसताना पिकाची काळजी कशी घ्यावी?",
];

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "नमस्कार! मी LeafShield AI आहे — जालना, मराठवाड्यातील शेतकऱ्यांसाठी तुमचा कृषी सहाय्यक. कापूस, सोयाबीन, जोवार, तूर, कांदा किंवा कोणत्याही पिकाबद्दल विचारा! 🌿",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    const history = messages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are LeafShield AI, an expert agricultural assistant for farmers in Jalna district, Marathwada, Maharashtra, India.

IMPORTANT RULES:
- Always reply in Marathi (मराठी) language
- Be practical and specific to Jalna/Marathwada region
- Mention local crop names: Kapus (Cotton), Soya (Soybean), Jowar (Sorghum), Tur (Pigeon Pea), Kanda (Onion), Mirchi (Chilli), Gahu (Wheat), Moong, Chana
- Give actionable advice: specific pesticides, dosage, timing
- Mention local market names or Krishi Kendra if relevant
- Keep responses concise but complete
- Use simple Marathi that farmers understand

Conversation history:
${history}

User's latest message: ${userText}

Respond helpfully in Marathi:`,
      model: "claude_sonnet_4_6",
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 flex flex-col h-[90vh]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex-shrink-0">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-green-600 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> मुख्यपृष्ठ
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl nature-gradient flex items-center justify-center shadow-lg shadow-green-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">कृषी AI सहाय्यक</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-gray-400">जालना · मराठवाडा शेतकऱ्यांसाठी</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl nature-gradient flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-green-600 text-white rounded-br-sm"
                  : "bg-white border border-green-100 text-gray-700 rounded-bl-sm"
              }`}>
                {msg.role === "assistant"
                  ? <ReactMarkdown className="prose prose-sm prose-green max-w-none">{msg.content}</ReactMarkdown>
                  : msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-green-600" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl nature-gradient flex items-center justify-center flex-shrink-0">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-green-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
              <span className="text-xs text-gray-400">विचार करतोय...</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex-shrink-0 mb-3">
          <p className="text-xs text-gray-400 mb-2 font-medium">सुचवलेले प्रश्न:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((s, i) => (
              <motion.button key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="पिकाबद्दल विचारा... (मराठीत किंवा इंग्रजीत)"
          className="flex-1 px-4 py-3 rounded-2xl border border-green-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder:text-gray-300"
        />
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-12 h-12 rounded-2xl nature-gradient text-white flex items-center justify-center shadow-lg shadow-green-500/20 disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  );
}