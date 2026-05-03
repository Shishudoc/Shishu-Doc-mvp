import React, { useState } from "react";
import { AlertTriangle, Thermometer, Wind, Info } from "lucide-react";
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

export default function Alerts() {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Health", "System"];

  return (
    <div className="px-4 pb-6 space-y-6">
      {/* Header */}
      <header className="mt-2">
        <h1 className="text-xl font-bold text-foreground">Health Alerts</h1>
      </header>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative",
              activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            data-testid={`tab-alerts-${tab.toLowerCase()}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="alertsActiveTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {/* Alert 1 */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border flex relative">
          <div className="w-1 bg-red-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-4 pl-5 w-full">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-red-50 p-2 rounded-full text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-[15px] text-foreground">High Dengue Risk Alert</h3>
                  <span className="text-[10px] font-medium text-muted-foreground mt-0.5">2 hours ago</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">Mirpur and Mohammadpur show increased mosquito activity. Take preventive action.</p>
                <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">HEALTH</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert 2 */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border flex relative">
          <div className="w-1 bg-amber-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-4 pl-5 w-full">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-amber-50 p-2 rounded-full text-amber-500">
                <Thermometer className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-[15px] text-foreground">Heatwave Advisory</h3>
                  <span className="text-[10px] font-medium text-muted-foreground mt-0.5">5 hours ago</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">Stay indoors between 12 PM – 4 PM. Keep children hydrated.</p>
                <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">HEALTH</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert 3 */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border flex relative">
          <div className="w-1 bg-purple-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-4 pl-5 w-full">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-purple-50 p-2 rounded-full text-purple-500">
                <Wind className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-[15px] text-foreground">Air Quality Alert</h3>
                  <span className="text-[10px] font-medium text-muted-foreground mt-0.5">Yesterday</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">AQI 156 detected in central Dhaka. Limit outdoor exposure for children.</p>
                <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">HEALTH</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert 4 */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border flex relative opacity-80">
          <div className="w-1 bg-blue-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-4 pl-5 w-full">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-blue-50 p-2 rounded-full text-primary">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-[15px] text-foreground">App Update Available</h3>
                  <span className="text-[10px] font-medium text-muted-foreground mt-0.5">2 days ago</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">New features: Voice symptom checker, expanded doctor network.</p>
                <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">SYSTEM</span>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
