import React from "react";
import { Link } from "wouter";
import { BellRing, Baby, Hospital, AlertTriangle, Map, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="px-4 pb-6 space-y-6">
      {/* Top bar */}
      <header className="flex items-center justify-between mt-2">
        <div className="flex items-center text-sm font-medium text-muted-foreground">
          📍 Dhaka, Bangladesh
        </div>
        <Link href="/alerts" className="relative p-2" data-testid="btn-alerts">
          <BellRing className="w-6 h-6 text-foreground" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
        </Link>
      </header>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Risk Banner */}
        <motion.div variants={item}>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-[16px] p-5 text-white shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-1">High Dengue Risk Today</h2>
              <p className="text-red-50 text-sm mb-4">Humidity and rainfall increase mosquito activity</p>
              <Link 
                href="/forecast" 
                className="inline-flex items-center px-4 py-2 bg-white text-red-600 text-xs font-semibold rounded-[12px] hover:bg-red-50 transition-colors"
                data-testid="btn-view-details"
              >
                View Details <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            {/* Decorative background shapes */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute right-10 -bottom-10 w-24 h-24 bg-red-900 opacity-20 rounded-full blur-xl"></div>
          </div>
        </motion.div>

        {/* Weather Info Strip */}
        <motion.div variants={item} className="flex justify-between items-center bg-white rounded-full px-5 py-3 shadow-sm text-sm font-medium text-foreground border border-border">
          <div className="flex items-center gap-1.5"><span className="text-lg">🌡️</span> 32°C</div>
          <div className="w-1 h-1 bg-border rounded-full"></div>
          <div className="flex items-center gap-1.5"><span className="text-lg">💧</span> 78% Humidity</div>
          <div className="w-1 h-1 bg-border rounded-full"></div>
          <div className="flex items-center gap-1.5"><span className="text-lg">🌬️</span> Moderate Air</div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div variants={item} className="grid grid-cols-2 gap-4">
          <Link href="/assistant" className="block bg-white rounded-[16px] p-4 shadow-sm border border-border hover:border-primary/30 transition-all hover:shadow-md" data-testid="card-assistant">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 text-primary">
              <Baby className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[15px] mb-1 leading-tight text-foreground">Child Health Check</h3>
            <p className="text-[12px] text-muted-foreground leading-tight">Check symptoms instantly</p>
          </Link>

          <Link href="/doctors" className="block bg-white rounded-[16px] p-4 shadow-sm border border-border hover:border-green-500/30 transition-all hover:shadow-md" data-testid="card-doctors">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3 text-green-600">
              <Hospital className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[15px] mb-1 leading-tight text-foreground">Doctor Access</h3>
            <p className="text-[12px] text-muted-foreground leading-tight">Connect in minutes</p>
          </Link>

          <Link href="/alerts" className="block bg-white rounded-[16px] p-4 shadow-sm border border-border hover:border-amber-500/30 transition-all hover:shadow-md" data-testid="card-alerts">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[15px] mb-1 leading-tight text-foreground">Health Alerts</h3>
            <p className="text-[12px] text-muted-foreground leading-tight">Live risk updates</p>
          </Link>

          <Link href="/map" className="block bg-white rounded-[16px] p-4 shadow-sm border border-border hover:border-purple-500/30 transition-all hover:shadow-md" data-testid="card-map">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3 text-purple-600">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[15px] mb-1 leading-tight text-foreground">Community Map</h3>
            <p className="text-[12px] text-muted-foreground leading-tight">See local health risk zones</p>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
