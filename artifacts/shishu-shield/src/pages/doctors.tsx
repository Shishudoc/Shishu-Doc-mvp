import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Doctors() {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Pediatricians", "General", "Specialists"];

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 pb-24 space-y-6">
        {/* Header */}
        <header className="mt-2">
          <h1 className="text-xl font-bold text-foreground">Available Doctors</h1>
        </header>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-border overflow-x-auto scrollbar-hide no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={`tab-${tab.toLowerCase()}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Doctor List */}
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {/* Doctor 1 */}
          <motion.div variants={item} className="bg-white p-5 rounded-[16px] shadow-sm border border-border">
            <div className="flex gap-4 items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl shrink-0">
                FI
              </div>
              <div>
                <h3 className="font-bold text-[16px]">Dr. Farhana Islam</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Pediatrician • MBBS, FCPS</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-green-600">Online</span>
                </div>
              </div>
            </div>
            <button className="w-full bg-primary text-white font-semibold text-sm py-2.5 rounded-[12px] hover:bg-blue-600 transition-colors" data-testid="btn-connect-1">
              Connect Now
            </button>
          </motion.div>

          {/* Doctor 2 */}
          <motion.div variants={item} className="bg-white p-5 rounded-[16px] shadow-sm border border-border">
            <div className="flex gap-4 items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl shrink-0">
                SR
              </div>
              <div>
                <h3 className="font-bold text-[16px]">Dr. Shafiq Rahman</h3>
                <p className="text-xs text-muted-foreground mt-0.5">General Physician • MBBS</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-green-600">Online</span>
                </div>
              </div>
            </div>
            <button className="w-full bg-primary text-white font-semibold text-sm py-2.5 rounded-[12px] hover:bg-blue-600 transition-colors" data-testid="btn-connect-2">
              Connect Now
            </button>
          </motion.div>

          {/* Doctor 3 */}
          <motion.div variants={item} className="bg-white p-5 rounded-[16px] shadow-sm border border-border">
            <div className="flex gap-4 items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl shrink-0">
                NJ
              </div>
              <div>
                <h3 className="font-bold text-[16px]">Dr. Nusrat Jahan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Pediatrician • MBBS, MD</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-medium text-amber-600">Busy — Est. 5 min</span>
                </div>
              </div>
            </div>
            <button className="w-full bg-amber-500 text-white font-semibold text-sm py-2.5 rounded-[12px] hover:bg-amber-600 transition-colors" data-testid="btn-connect-3">
              Wait in Queue
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Emergency Banner */}
      <div className="fixed bottom-[80px] left-0 right-0 max-w-[390px] mx-auto bg-gradient-to-r from-red-600 to-red-500 p-4 px-5 text-white flex items-center justify-between shadow-[0_-8px_30px_rgba(239,68,68,0.2)] rounded-t-2xl z-20">
        <div>
          <h4 className="font-bold text-[15px] flex items-center gap-1.5">🚨 Emergency?</h4>
          <p className="text-xs text-red-100 mt-0.5 font-medium">Get priority help immediately</p>
        </div>
        <button className="bg-white text-red-600 font-bold text-xs px-4 py-2 rounded-[10px] hover:bg-red-50 transition-colors shadow-sm" data-testid="btn-emergency">
          Get Priority Help
        </button>
      </div>
    </div>
  );
}
