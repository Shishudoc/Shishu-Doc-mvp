import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Bot, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/language";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAnalysis {
  riskLevel: "low" | "moderate" | "high";
  riskPercent: number;
  condition: string;
  advice: string[];
  warning: string;
  reassurance: string;
}

const RISK_CONFIG = {
  low: {
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-500",
    label: "Low Risk",
  },
  moderate: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    label: "Moderate Risk",
  },
  high: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    label: "High Risk",
  },
};

const QUICK_SYMPTOMS = {
  en: ["Fever", "Cough", "Cold", "Diarrhea", "Vomiting", "Rash", "Redness", "Stomach pain"],
  bn: ["জ্বর", "কাশি", "সর্দি", "ডায়রিয়া", "বমি", "ফুসকুড়ি", "চোখ লাল", "পেট ব্যথা"],
};

function AIResponseCard({ analysis, streaming }: { analysis: AIAnalysis | null; streaming: boolean }) {
  if (streaming && !analysis) {
    return (
      <div className="bg-white rounded-[16px] rounded-tl-sm w-[90%] shadow-sm border-l-[3px] border-l-primary overflow-hidden">
        <div className="p-4 flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Analyzing symptoms…</span>
          <span className="flex gap-1 ml-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const cfg = RISK_CONFIG[analysis.riskLevel];
  const RiskIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[16px] rounded-tl-sm w-[90%] shadow-sm border-l-[3px] border-l-primary overflow-hidden"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
          <Bot className="w-3.5 h-3.5" />
          AI Analysis
        </div>

        {/* Risk badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.bg} ${cfg.border}`}>
          <RiskIcon className={`w-4 h-4 shrink-0 ${cfg.iconColor}`} />
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-bold ${cfg.color}`}>{cfg.label} — {analysis.riskPercent}%</div>
            <div className={`text-xs ${cfg.color} opacity-80`}>{analysis.condition}</div>
          </div>
          <div className="w-16 bg-gray-100 rounded-full h-1.5 shrink-0">
            <div
              className={`h-1.5 rounded-full ${analysis.riskLevel === "low" ? "bg-green-500" : analysis.riskLevel === "moderate" ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${analysis.riskPercent}%` }}
            />
          </div>
        </div>

        {/* Advice */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Recommended Actions</div>
          <ul className="space-y-1.5">
            {analysis.advice.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Reassurance */}
        <p className="text-xs text-muted-foreground italic px-1">{analysis.reassurance}</p>
      </div>

      {/* Warning footer */}
      <div className="bg-amber-50 border-t border-amber-100 px-4 py-2.5 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 font-medium">{analysis.warning}</p>
      </div>
    </motion.div>
  );
}

export default function Assistant() {
  const { language, isBangla } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingAnalysis, setPendingAnalysis] = useState<AIAnalysis | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickSymptoms = QUICK_SYMPTOMS[language];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setIsStreaming(true);
    setPendingAnalysis(null);
    setError(null);

    try {
      const response = await fetch("/api/symptoms/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          language,
        }),
      });

      if (!response.ok) throw new Error("Server error");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              setError(data.error);
              setIsStreaming(false);
              return;
            }
            if (data.content) {
              fullContent += data.content;
            }
            if (data.done && data.full) {
              fullContent = data.full;
            }
          } catch {}
        }
      }

      // Parse JSON from accumulated content
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as AIAnalysis;
        setPendingAnalysis(parsed);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fullContent },
        ]);
      } else {
        setError("Could not parse AI response. Please try again.");
      }
    } catch (err) {
      setError("Connection failed. Please check your internet and try again.");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  // Build display list: pairs of (user msg, AI analysis)
  const userMessages = messages.filter((m) => m.role === "user");
  const assistantMessages = messages.filter((m) => m.role === "assistant");

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] relative">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            {isBangla ? "AI স্বাস্থ্য সহকারী" : "AI Health Assistant"}
          </h1>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">{isBangla ? "অনলাইন" : "Online"}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 pl-7">
          {isBangla ? "আপনার শিশুর উপসর্গ বলুন, তাৎক্ষণিক বিশ্লেষণ পান" : "Describe your child's symptoms for an instant analysis"}
        </p>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-40">
        {/* Empty state */}
        {messages.length === 0 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-10 text-center px-4"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">
              {isBangla ? "আমি কীভাবে সাহায্য করতে পারি?" : "How can I help?"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isBangla
                ? "আপনার শিশুর উপসর্গ বলুন, আমি তাৎক্ষণিক স্বাস্থ্য বিশ্লেষণ ও পরামর্শ দেব।"
                : "Tell me your child's symptoms and I'll provide an instant health analysis with practical advice."}
            </p>
          </motion.div>
        )}

        {/* Message pairs */}
        {userMessages.map((userMsg, i) => (
          <div key={i} className="space-y-4">
            {/* User bubble */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-end"
            >
              <div
                className="bg-primary text-white px-4 py-3 rounded-[16px] rounded-tr-sm max-w-[85%] shadow-sm text-sm leading-relaxed"
                data-testid={`msg-user-${i}`}
              >
                {userMsg.content}
              </div>
            </motion.div>

            {/* AI response for this turn */}
            <div className="flex justify-start">
              {assistantMessages[i] ? (
                (() => {
                  try {
                    const jsonMatch = assistantMessages[i].content.match(/\{[\s\S]*\}/);
                    if (!jsonMatch) throw new Error();
                    const analysis = JSON.parse(jsonMatch[0]) as AIAnalysis;
                    return <AIResponseCard analysis={analysis} streaming={false} data-testid={`msg-ai-${i}`} />;
                  } catch {
                    return (
                      <div className="bg-white rounded-[16px] rounded-tl-sm w-[90%] shadow-sm border-l-[3px] border-l-primary p-4">
                        <p className="text-sm text-muted-foreground">Unable to display response.</p>
                      </div>
                    );
                  }
                })()
              ) : (
                i === userMessages.length - 1 && isStreaming && (
                  <AIResponseCard analysis={null} streaming={true} />
                )
              )}
            </div>
          </div>
        ))}

        {/* Newly completed analysis not yet in messages (transient) */}
        {pendingAnalysis && !isStreaming && assistantMessages.length === userMessages.length && (
          <div className="flex justify-start">
            <AIResponseCard analysis={pendingAnalysis} streaming={false} />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border p-4 space-y-3 pb-6">
        {/* Quick symptom pills */}
        <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 no-scrollbar">
          {quickSymptoms.map((symp) => (
            <button
              key={symp}
              onClick={() => sendMessage(symp)}
              disabled={isStreaming}
              className="whitespace-nowrap px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:border-primary hover:text-primary transition-colors shrink-0 disabled:opacity-50"
              data-testid={`btn-quick-${symp.toLowerCase()}`}
            >
              {symp}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isBangla ? "আপনার শিশুর উপসর্গ বলুন…" : "Describe your child's symptoms…"}
            disabled={isStreaming}
            className="flex-1 bg-gray-100 rounded-full py-3 px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 border-none"
            data-testid="input-chat"
          />
          {inputText.trim() ? (
            <button
              onClick={() => sendMessage(inputText)}
              disabled={isStreaming}
              className="p-3 bg-primary text-white rounded-full shrink-0 disabled:opacity-50 hover:bg-blue-600 transition-colors"
              data-testid="btn-send"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={isStreaming}
              className="p-3 text-primary hover:bg-blue-50 rounded-full shrink-0 transition-colors disabled:opacity-50"
              data-testid="btn-mic"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
