import React, { useState } from "react";
import { Mic, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function Assistant() {
  const [message, setMessage] = useState("");

  const quickSymptoms = [
    "Fever", "Cough", "Cold", "Diarrhea", "Vomiting", "Rash"
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">AI Health Assistant</h1>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {/* User Message */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <div className="bg-primary text-white px-4 py-3 rounded-[16px] rounded-tr-sm max-w-[85%] shadow-sm text-sm">
            My child has fever and cough
          </div>
        </motion.div>

        {/* AI Response */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-start"
        >
          <div className="bg-white rounded-[16px] rounded-tl-sm w-[90%] shadow-sm border-l-[3px] border-l-primary overflow-hidden">
            <div className="p-4">
              <div className="text-primary text-xs font-bold mb-2 flex items-center gap-1">
                <span>🤖</span> AI Analysis
              </div>
              
              <div className="bg-amber-50 text-amber-800 text-sm font-medium px-3 py-2 rounded-lg mb-4 border border-amber-100 flex items-center gap-2">
                <span>⚠️</span> Moderate Risk — 65% viral infection
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm text-foreground space-y-2 mb-4 border border-gray-100">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Monitor temperature every 4 hours</li>
                  <li>Ensure rest and sleep</li>
                  <li>Push fluids — water, ORS, coconut water</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-100/50 px-4 py-3 text-xs font-semibold text-amber-800 border-t border-amber-100">
              ⏰ If symptoms persist 48h → Consult a doctor
            </div>
          </div>
        </motion.div>
      </div>

      {/* Input Area (Fixed Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border p-4 space-y-3 pb-8">
        {/* Quick buttons */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide no-scrollbar -mx-4 px-4">
          {quickSymptoms.map((symp) => (
            <button 
              key={symp} 
              className="whitespace-nowrap px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shrink-0"
              data-testid={`btn-quick-${symp.toLowerCase()}`}
            >
              {symp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="relative flex items-center gap-2">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your child's symptoms..."
            className="w-full bg-gray-100 border-none rounded-full py-3 px-4 pr-12 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            data-testid="input-chat"
          />
          {message ? (
            <button className="absolute right-2 p-2 bg-primary text-white rounded-full" data-testid="btn-send">
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button className="absolute right-2 p-2 text-primary hover:bg-blue-50 rounded-full" data-testid="btn-mic">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
