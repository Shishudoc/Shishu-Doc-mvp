import React from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Forecast() {
  return (
    <div className="px-4 pb-6 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3 mt-2">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100" data-testid="btn-back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Health Risk Forecast</h1>
      </header>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Dengue Card */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border flex relative">
          <div className="w-1.5 bg-red-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-5 pl-6 w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><span className="text-xl">🦟</span> Dengue Risk</h2>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">HIGH 72%</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">Rain + high humidity increases mosquito breeding</p>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Remove standing water</span>
              </div>
              <div className="flex items-start gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Use mosquito nets</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Heat Risk Card */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border flex relative">
          <div className="w-1.5 bg-amber-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-5 pl-6 w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><span className="text-xl">🌡️</span> Heat Risk</h2>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">MODERATE 65%</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Avoid outdoor 12-4 PM</span>
              </div>
              <div className="flex items-start gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Drink 8+ glasses water</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Air Quality Card */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border flex relative">
          <div className="w-1.5 bg-purple-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-5 pl-6 w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><span className="text-xl">🌫️</span> Air Quality</h2>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">AQI 156 UNHEALTHY</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Limit outdoor activity</span>
              </div>
              <div className="flex items-start gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Keep windows closed</span>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
