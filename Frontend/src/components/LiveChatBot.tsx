import { PORTFOLIO_MODE } from "../portfolio";
import { Bot, RefreshCw, Send, User, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { api, errorText } from "../api";

interface LiveChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  isOffline: boolean;
  setActiveTab: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  source?: string;
}

function createChatMessage(
  sender: ChatMessage["sender"],
  text: string,
  source?: string,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    sender,
    text,
    source,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export const LiveChatBot: React.FC<LiveChatBotProps> = ({
  isOpen,
  onClose,
  isOffline,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-1",
      sender: "ai",
      text: "Welcome to the TaraSibale portfolio demo. Use sample questions only; this prototype does not provide live travel advice, bookings or emergency assistance.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      source: "curated_guide",
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "When does the Pinamalayan boat leave?",
    "Top beaches in Concepcion?",
    "Where to stay in Bachawan?",
    "Local dishes & tuba drink?",
    "Asi dialect greetings",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isLoading) return;

    const userMsg = createChatMessage("user", prompt);

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt("");
    setIsLoading(true);

    try {
      if (PORTFOLIO_MODE) {
        setMessages(previous => [...previous, createChatMessage("ai", "Portfolio demonstration: explore the Culture section for sourced phrases and food credits, or try a sample itinerary. Routes, sailing times, prices and contacts are not verified for travel. This demo cannot book services or contact guides. Your sample chat stays in this page’s memory and is not sent to the server.", "portfolio_demo")]);
        return;
      }
      const data = await api<{ reply: string; source: string }>("/api/chat", {
        message: prompt,
      });
      const aiReplyText =
        data.reply ||
        "I am here to help guide your journey around Concepcion, Romblon.";

      const aiMsg = createChatMessage("ai", aiReplyText, data.source);

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMsg = createChatMessage(
        "ai",
        "The guide is unavailable: " +
          errorText(err) +
          " Browse Travel Info for saved schedules and confirm sailing with the operator.",
        "curated_guide",
      );
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-96 max-w-sm h-[calc(100dvh-130px)] sm:h-[540px] max-h-[600px] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/15 bg-slate-900/95 backdrop-blur-2xl text-white flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(46,196,182,0.4)] ring-2 ring-teal-400/60 shrink-0 overflow-hidden">
            <img
              src="/portfolio-mark.svg"
              alt="TaraSibale Guide"
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-white">
                TaraSibale Island Guide
              </h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold uppercase backdrop-blur-md">
                {isOffline ? "Offline Mode" : "Curated Guide"}
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              TaraSibale Travel Assistant
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`flex items-start gap-2 max-w-[85%] ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === "user"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-teal-500 text-slate-950 font-bold"
                }`}>
                {msg.sender === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl whitespace-pre-line leading-relaxed backdrop-blur-md ${
                  msg.sender === "user"
                    ? "bg-amber-500/20 text-amber-100 border border-amber-500/30 rounded-tr-none"
                    : "bg-white/10 border border-white/15 text-slate-100 rounded-tl-none"
                }`}>
                {msg.text}
              </div>
            </div>

            <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs p-2">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
            <span>TaraSibale is typing answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="p-2 border-t border-white/10 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 bg-white/5 backdrop-blur-md">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-white/15 bg-white/10 text-slate-200 hover:bg-teal-500/20 hover:text-teal-300 hover:border-teal-500/40 transition-all cursor-pointer backdrop-blur-md">
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything about Concepcion..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-white/15 bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-400"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(46,196,182,0.4)]">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
