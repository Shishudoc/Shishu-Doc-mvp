import React, { useState } from "react";
import { ChevronRight, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/language";

export default function Profile() {
  const { language, setLanguage, isBangla } = useLanguage();
  const [voiceMode, setVoiceMode] = useState(true);
  const [lowData, setLowData] = useState(false);
  const [healthAlerts, setHealthAlerts] = useState(true);
  const [doctorUpdates, setDoctorUpdates] = useState(true);

  return (
    <div className="px-4 pb-6 space-y-6">
      {/* Header */}
      <header className="mt-2">
        <h1 className="text-xl font-bold text-foreground">My Profile</h1>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-border text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-sm">
            RA
          </div>
          <h2 className="text-[20px] font-bold text-foreground mb-1">Rina Akter</h2>
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">📍 Dhaka, Bangladesh</p>
          <div className="bg-blue-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-full inline-block">
            Child age: 3 years
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-5">
          {/* Preferences */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Preferences</h3>
            <div className="bg-white rounded-[16px] overflow-hidden border border-border shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <div>
                  <span className="text-sm font-medium">{isBangla ? "ভাষা" : "Language"}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isBangla ? "AI বাংলায় উত্তর দেবে" : "AI replies in English"}
                  </p>
                </div>
                <button
                  onClick={() => setLanguage(isBangla ? "en" : "bn")}
                  data-testid="toggle-language"
                  className={`relative flex items-center rounded-full border-2 transition-all duration-300 px-1 py-0.5 gap-1 ${
                    isBangla
                      ? "bg-primary border-primary"
                      : "bg-gray-100 border-gray-200"
                  }`}
                  style={{ width: 88, height: 32 }}
                >
                  <span
                    className={`text-xs font-bold transition-all duration-300 ${
                      isBangla ? "text-white" : "text-gray-400"
                    }`}
                    style={{ width: 30, textAlign: "center" }}
                  >
                    বাং
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 absolute ${
                      isBangla ? "translate-x-[52px]" : "translate-x-[2px]"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold transition-all duration-300 ${
                      isBangla ? "text-blue-200" : "text-primary"
                    }`}
                    style={{ width: 30, textAlign: "center", marginLeft: "auto" }}
                  >
                    EN
                  </span>
                </button>
              </div>
              <div className="flex justify-between items-center p-4 border-b border-border">
                <span className="text-sm font-medium">Voice Mode</span>
                <button 
                  onClick={() => setVoiceMode(!voiceMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${voiceMode ? 'bg-primary' : 'bg-gray-200'}`}
                  data-testid="toggle-voice"
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${voiceMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center p-4">
                <span className="text-sm font-medium">Low Data Mode</span>
                <button 
                  onClick={() => setLowData(!lowData)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${lowData ? 'bg-primary' : 'bg-gray-200'}`}
                  data-testid="toggle-data"
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${lowData ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Notifications</h3>
            <div className="bg-white rounded-[16px] overflow-hidden border border-border shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <span className="text-sm font-medium">Health Alerts</span>
                <button 
                  onClick={() => setHealthAlerts(!healthAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${healthAlerts ? 'bg-primary' : 'bg-gray-200'}`}
                  data-testid="toggle-alerts"
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${healthAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center p-4">
                <span className="text-sm font-medium">Doctor Updates</span>
                <button 
                  onClick={() => setDoctorUpdates(!doctorUpdates)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${doctorUpdates ? 'bg-primary' : 'bg-gray-200'}`}
                  data-testid="toggle-doctor-updates"
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${doctorUpdates ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Account</h3>
            <div className="bg-white rounded-[16px] overflow-hidden border border-border shadow-sm">
              <button className="w-full flex justify-between items-center p-4 border-b border-border hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Privacy Policy</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="w-full flex justify-between items-center p-4 border-b border-border hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Help & Support</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">About SHISHU SHIELD</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button 
          className="w-full mt-8 bg-white border border-red-500 text-red-600 font-bold text-sm py-3.5 rounded-[12px] flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
          data-testid="btn-sign-out"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </motion.div>
    </div>
  );
}
