import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/language";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const T = {
  en: {
    title: "Health Risk Forecast",
    back: "Back",
    refresh: "Refresh",
    refreshing: "Updating...",
    updated: "Just updated",
    dengue: "Dengue Risk",
    dengueReason: "Rain + high humidity increases mosquito breeding",
    dengueActions: ["Remove standing water near home", "Use mosquito nets at night", "Apply repellent outdoors", "Wear full-sleeve clothing"],
    heat: "Heat Risk",
    heatReason: "Pre-monsoon temperatures rising across Bangladesh",
    heatActions: ["Avoid outdoor activity 12–4 PM", "Drink 8+ glasses of water daily", "Use ORS if sweating heavily", "Keep children in cool rooms"],
    air: "Air Quality",
    airReason: "Industrial and vehicle emissions elevated in urban areas",
    airActions: ["Limit outdoor activity for children", "Keep windows closed during peak hours", "Use air purifier if available", "Wear N95 mask if going out"],
    trend: { up: "Rising", down: "Falling", stable: "Stable" },
    high: "HIGH",
    moderate: "MODERATE",
    aqi: "AQI",
    unhealthy: "UNHEALTHY",
    location: "Dhaka, Bangladesh",
    viewMap: "View risk on Bangladesh map →",
  },
  bn: {
    title: "স্বাস্থ্য ঝুঁকি পূর্বাভাস",
    back: "ফিরে যান",
    refresh: "রিফ্রেশ",
    refreshing: "আপডেট হচ্ছে...",
    updated: "এইমাত্র আপডেট",
    dengue: "ডেঙ্গু ঝুঁকি",
    dengueReason: "বৃষ্টি + উচ্চ আর্দ্রতা মশার প্রজনন বাড়ায়",
    dengueActions: ["বাড়ির কাছে জমা পানি সরান", "রাতে মশারি ব্যবহার করুন", "বাইরে রিপেলেন্ট লাগান", "ফুল হাতা পোশাক পরুন"],
    heat: "তাপ ঝুঁকি",
    heatReason: "প্রাক-বর্ষা তাপমাত্রা বাংলাদেশে বাড়ছে",
    heatActions: ["দুপুর ১২–৪টা বাইরে এড়িয়ে চলুন", "প্রতিদিন ৮+ গ্লাস পানি পান করুন", "বেশি ঘামলে ORS নিন", "শিশুদের ঠান্ডা ঘরে রাখুন"],
    air: "বায়ু মান",
    airReason: "নগর এলাকায় শিল্প ও যানবাহনের নির্গমন বৃদ্ধি পেয়েছে",
    airActions: ["শিশুদের বাইরে যাওয়া সীমিত করুন", "পিক আওয়ারে জানালা বন্ধ রাখুন", "সম্ভব হলে এয়ার পিউরিফায়ার ব্যবহার করুন", "বাইরে গেলে N95 মাস্ক পরুন"],
    trend: { up: "বাড়ছে", down: "কমছে", stable: "স্থিতিশীল" },
    high: "উচ্চ",
    moderate: "মাঝারি",
    aqi: "AQI",
    unhealthy: "অস্বাস্থ্যকর",
    location: "ঢাকা, বাংলাদেশ",
    viewMap: "বাংলাদেশ ম্যাপে ঝুঁকি দেখুন →",
  },
};

export default function Forecast() {
  const { language, isBangla } = useLanguage();
  const t = T[language];
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setRefreshKey(k => k + 1); }, 1800);
  };

  return (
    <div className="px-4 pb-6 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors" data-testid="btn-back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-primary font-semibold disabled:opacity-60"
          data-testid="btn-refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? t.refreshing : (refreshKey > 0 ? t.updated : t.refresh)}
        </button>
      </header>

      <Link href="/map" className="flex items-center justify-center text-xs text-primary font-semibold bg-blue-50 rounded-[12px] py-2.5 hover:bg-blue-100 transition-colors" data-testid="btn-view-map">
        {t.viewMap}
      </Link>

      <motion.div key={refreshKey} variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Dengue */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border relative">
          <div className="w-1.5 bg-red-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-5 pl-6">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-[16px] font-bold flex items-center gap-2"><span>🦟</span> {t.dengue}</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> {t.trend.up}
                </div>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">{t.high} 72%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "72%" }} transition={{ duration: 1, delay: 0.2 }}
                className="bg-red-500 h-2 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{t.dengueReason}</p>
            <div className="space-y-1.5">
              {t.dengueActions.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Heat */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border relative">
          <div className="w-1.5 bg-amber-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-5 pl-6">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-[16px] font-bold flex items-center gap-2"><span>🌡️</span> {t.heat}</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
                  <Minus className="w-3.5 h-3.5" /> {t.trend.stable}
                </div>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">{t.moderate} 65%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1, delay: 0.3 }}
                className="bg-amber-500 h-2 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{t.heatReason}</p>
            <div className="space-y-1.5">
              {t.heatActions.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Air */}
        <motion.div variants={item} className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-border relative">
          <div className="w-1.5 bg-purple-500 absolute left-0 top-0 bottom-0"></div>
          <div className="p-5 pl-6">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-[16px] font-bold flex items-center gap-2"><span>🌫️</span> {t.air}</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-purple-600 text-xs font-semibold">
                  <TrendingDown className="w-3.5 h-3.5" /> {t.trend.down}
                </div>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">{t.aqi} 156 {t.unhealthy}</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "78%" }} transition={{ duration: 1, delay: 0.4 }}
                className="bg-purple-500 h-2 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{t.airReason}</p>
            <div className="space-y-1.5">
              {t.airActions.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
