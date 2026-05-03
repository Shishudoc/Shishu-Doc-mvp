import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MapPage() {
  const [activeToggle, setActiveToggle] = useState("Dengue");
  const toggles = ["Dengue", "Heat", "Air Quality"];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden relative">
      <div className="px-4 pt-6 pb-2 z-10 relative bg-white">
        <header className="mb-4">
          <h1 className="text-xl font-bold text-foreground">Community Health Map</h1>
        </header>

        {/* Toggles */}
        <div className="flex gap-2 mb-2">
          {toggles.map(t => (
            <button
              key={t}
              onClick={() => setActiveToggle(t)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border",
                activeToggle === t 
                  ? "bg-primary text-white border-primary" 
                  : "bg-white text-foreground border-border hover:bg-gray-50"
              )}
              data-testid={`toggle-${t.toLowerCase().replace(" ", "-")}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-[#E8F0FE] overflow-hidden border-y border-border">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <span className="text-xl font-bold text-blue-900/30 uppercase tracking-widest rotate-[-15deg]">Dhaka, Bangladesh</span>
        </div>

        {/* Zones */}
        <AnimatePresence>
          {activeToggle === "Dengue" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Red Zone (Mirpur) */}
              <div className="absolute top-[20%] right-[15%] w-32 h-32 bg-red-500/20 rounded-full border border-red-500/50 flex items-center justify-center pulse-animation">
                <div className="w-16 h-16 bg-red-500/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-[12%] right-[10%] bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-[10px] font-bold text-red-700">Mirpur — HIGH RISK</div>

              {/* Yellow Zone (Dhanmondi) */}
              <div className="absolute top-[45%] left-[30%] w-24 h-24 bg-amber-500/20 rounded-full border border-amber-500/50 flex items-center justify-center">
                <div className="w-12 h-12 bg-amber-500/40 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-amber-600 rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-[60%] left-[25%] bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-[10px] font-bold text-amber-700">Dhanmondi — MODERATE</div>

              {/* Green Zone (Gulshan) */}
              <div className="absolute bottom-[25%] left-[15%] w-28 h-28 bg-green-500/20 rounded-full border border-green-500/50 flex items-center justify-center">
                <div className="w-10 h-10 bg-green-500/40 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="absolute bottom-[20%] left-[5%] bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-[10px] font-bold text-green-700">Gulshan — SAFE</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Panel */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 pb-8 pt-2"
      >
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="px-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-foreground">Mirpur — Zone 5</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Showing local {activeToggle.toLowerCase()} data</p>
            </div>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">HIGH RISK</span>
          </div>

          <div className="bg-gray-50 rounded-[12px] p-4 border border-border">
            <h3 className="text-sm font-semibold mb-2">Recommended Actions:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                Use mosquito repellent daily
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                Avoid stagnant water
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                Wear full-sleeve clothing
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInlineStyle={{__html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .pulse-animation::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.4);
          animation: pulse-ring 2s infinite ease-out;
        }
      `}} />
    </div>
  );
}
