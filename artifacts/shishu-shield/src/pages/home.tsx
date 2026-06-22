import React from "react";
import { Link } from "wouter";
import { BellRing, Baby, Hospital, AlertTriangle, Map, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useChildren } from "@/context/children";
import { useLanguage } from "@/context/language";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const T = {
  en: {
    tagline: "Smart Child Health Protection",
    location: "Dhaka, Bangladesh",
    riskTitle: "High Dengue Risk Today",
    riskSub: "Humidity and rainfall increase mosquito activity",
    viewDetails: "View Details",
    childCheck: "Child Health Check",
    childCheckSub: "Check symptoms instantly",
    doctorAccess: "Doctor Access",
    doctorAccessSub: "Connect in minutes",
    healthAlerts: "Health Alerts",
    healthAlertsSub: "Live risk updates",
    communityMap: "Community Map",
    communityMapSub: "See Bangladesh health risk zones",
    humidity: "Humidity",
    air: "Moderate Air",
  },
  bn: {
    tagline: "স্মার্ট শিশু স্বাস্থ্য সুরক্ষা",
    location: "ঢাকা, বাংলাদেশ",
    riskTitle: "আজ ডেঙ্গুর উচ্চ ঝুঁকি",
    riskSub: "আর্দ্রতা ও বৃষ্টিপাত মশার কার্যকলাপ বাড়ায়",
    viewDetails: "বিস্তারিত দেখুন",
    childCheck: "শিশু স্বাস্থ্য পরীক্ষা",
    childCheckSub: "তাৎক্ষণিক উপসর্গ পরীক্ষা করুন",
    doctorAccess: "ডাক্তার অ্যাক্সেস",
    doctorAccessSub: "মিনিটেই সংযুক্ত হন",
    healthAlerts: "স্বাস্থ্য সতর্কতা",
    healthAlertsSub: "লাইভ ঝুঁকি আপডেট",
    communityMap: "কমিউনিটি ম্যাপ",
    communityMapSub: "বাংলাদেশের স্বাস্থ্য ঝুঁকি অঞ্চল দেখুন",
    humidity: "আর্দ্রতা",
    air: "বায়ু মাঝারি",
  },
};

export default function Home() {
  const { activeChild } = useChildren();
  const { language, isBangla } = useLanguage();
  const t = T[language];

  return (
    <div className="pb-6 space-y-0">
      {/* ── SHISHU DOC Brand Header ── */}
      <div className="bg-gradient-to-br from-[#2F6BFF] to-[#1a4fd8] px-4 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[18px] font-black text-white tracking-tight leading-none">SHISHU DOC</h1>
              <p className="text-blue-100 text-[10px] font-medium leading-tight">{t.tagline}</p>
            </div>
          </div>
          <Link href="/alerts" className="relative p-2 bg-white/15 rounded-full" data-testid="btn-alerts">
            <BellRing className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border border-white"></span>
          </Link>
        </div>

        {/* Location + child chip */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <div className="flex items-center gap-1 text-white/75 text-[11px] font-medium">
            <span>📍</span> {t.location}
          </div>
          {activeChild && (
            <div className="inline-flex items-center gap-1 bg-white/15 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              {activeChild.gender === "boy" ? "👦" : activeChild.gender === "girl" ? "👧" : "🧒"}
              {activeChild.name} · {activeChild.age}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {/* Risk Banner */}
          <motion.div variants={item}>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-[16px] p-5 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🦟</span>
                  <h2 className="text-[17px] font-bold">{t.riskTitle}</h2>
                </div>
                <p className="text-red-50 text-xs mb-4 leading-relaxed">{t.riskSub}</p>
                <Link
                  href="/forecast"
                  className="inline-flex items-center px-4 py-2 bg-white text-red-600 text-xs font-bold rounded-[10px] hover:bg-red-50 transition-colors gap-1"
                  data-testid="btn-view-details"
                >
                  {t.viewDetails} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute right-8 -bottom-8 w-20 h-20 bg-red-900 opacity-20 rounded-full blur-xl"></div>
            </div>
          </motion.div>

          {/* Weather Strip */}
          <motion.div variants={item}>
            <div className="flex justify-between items-center bg-white rounded-[14px] px-5 py-3 shadow-sm text-sm font-medium text-foreground border border-border">
              <div className="flex items-center gap-1.5"><span>🌡️</span> 32°C</div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-1.5"><span>💧</span> 78% {t.humidity}</div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-1.5"><span>🌬️</span> {t.air}</div>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div variants={item}>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/assistant" className="block bg-white rounded-[16px] p-4 shadow-sm border border-border hover:border-primary/40 hover:shadow-md transition-all" data-testid="card-assistant">
                <div className="w-10 h-10 rounded-[10px] bg-blue-50 flex items-center justify-center mb-3">
                  <Baby className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-[14px] mb-0.5 text-foreground leading-tight">{t.childCheck}</h3>
                <p className="text-[11px] text-muted-foreground leading-tight">{t.childCheckSub}</p>
              </Link>

              <Link href="/doctors" className="block bg-white rounded-[16px] p-4 shadow-sm border border-border hover:border-green-400/40 hover:shadow-md transition-all" data-testid="card-doctors">
                <div className="w-10 h-10 rounded-[10px] bg-green-50 flex items-center justify-center mb-3">
                  <Hospital className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-[14px] mb-0.5 text-foreground leading-tight">{t.doctorAccess}</h3>
                <p className="text-[11px] text-muted-foreground leading-tight">{t.doctorAccessSub}</p>
              </Link>

              <Link href="/alerts" className="block bg-white rounded-[16px] p-4 shadow-sm border border-border hover:border-amber-400/40 hover:shadow-md transition-all" data-testid="card-alerts">
                <div className="w-10 h-10 rounded-[10px] bg-amber-50 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-bold text-[14px] mb-0.5 text-foreground leading-tight">{t.healthAlerts}</h3>
                <p className="text-[11px] text-muted-foreground leading-tight">{t.healthAlertsSub}</p>
              </Link>

              <Link href="/map" className="block bg-white rounded-[16px] p-4 shadow-sm border border-border hover:border-purple-400/40 hover:shadow-md transition-all" data-testid="card-map">
                <div className="w-10 h-10 rounded-[10px] bg-purple-50 flex items-center justify-center mb-3">
                  <Map className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-[14px] mb-0.5 text-foreground leading-tight">{t.communityMap}</h3>
                <p className="text-[11px] text-muted-foreground leading-tight">{t.communityMapSub}</p>
              </Link>
            </div>
          </motion.div>

          {/* Sponsor Credit */}
          <motion.div variants={item}>
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-[14px] border border-blue-100/60">
              <div className="flex flex-col items-center text-center">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Made by</p>
                <p className="text-[13px] font-black text-foreground tracking-tight">Neelima Khan</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-3 h-px bg-border"></div>
                  <p className="text-[10px] font-bold text-primary tracking-wide">NKI ENERGY</p>
                  <div className="w-3 h-px bg-border"></div>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
