import React, { useState } from "react";
import { AlertTriangle, Thermometer, Wind, Info, ChevronDown, ChevronUp, RefreshCw, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const T = {
  en: {
    title: "Health Alerts",
    tabs: ["All", "Health", "System"],
    justNow: "Just now",
    refresh: "Refresh",
    updated: "Updated just now",
    readMore: "Read more",
    collapse: "Collapse",
    markRead: "Mark as read",
    newBadge: "NEW",
  },
  bn: {
    title: "স্বাস্থ্য সতর্কতা",
    tabs: ["সব", "স্বাস্থ্য", "সিস্টেম"],
    justNow: "এখনই",
    refresh: "রিফ্রেশ",
    updated: "এইমাত্র আপডেট হয়েছে",
    readMore: "আরও পড়ুন",
    collapse: "সংকুচিত করুন",
    markRead: "পড়া হিসেবে চিহ্নিত করুন",
    newBadge: "নতুন",
  },
};

interface AlertItem {
  id: number;
  category: "Health" | "System";
  color: string;
  bgColor: string;
  textColor: string;
  badgeColor: string;
  icon: React.ElementType;
  title: string;
  titleBn: string;
  body: string;
  bodyBn: string;
  detail: string;
  detailBn: string;
  time: string;
  timeBn: string;
  isNew: boolean;
}

const ALERTS: AlertItem[] = [
  {
    id: 1, category: "Health", color: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-700", badgeColor: "bg-red-100 text-red-700", icon: AlertTriangle,
    title: "High Dengue Risk Alert", titleBn: "ডেঙ্গুর উচ্চ ঝুঁকি সতর্কতা",
    body: "Mirpur and Mohammadpur show increased mosquito activity. Take preventive action.", bodyBn: "মিরপুর ও মোহাম্মদপুরে মশার কার্যকলাপ বৃদ্ধি পেয়েছে। প্রতিরোধমূলক ব্যবস্থা নিন।",
    detail: "Heavy rainfall over the past week has created stagnant water pools across Dhaka North. Health authorities report a 34% increase in dengue cases vs last month. Use mosquito repellent, wear full-sleeve clothing, and eliminate standing water around your home immediately.", detailBn: "গত সপ্তাহের ভারী বৃষ্টিপাতে ঢাকা উত্তরে জমে থাকা পানির পুল তৈরি হয়েছে। স্বাস্থ্য কর্তৃপক্ষ গত মাসের তুলনায় ডেঙ্গু মামলায় ৩৪% বৃদ্ধির রিপোর্ট করেছে।",
    time: "2 hours ago", timeBn: "২ ঘন্টা আগে", isNew: true,
  },
  {
    id: 2, category: "Health", color: "bg-amber-500", bgColor: "bg-amber-50", textColor: "text-amber-700", badgeColor: "bg-amber-100 text-amber-700", icon: Thermometer,
    title: "Heatwave Advisory", titleBn: "তাপপ্রবাহ সতর্কতা",
    body: "Stay indoors between 12 PM – 4 PM. Keep children hydrated.", bodyBn: "দুপুর ১২টা – বিকাল ৪টার মধ্যে ঘরে থাকুন। শিশুদের হাইড্রেটেড রাখুন।",
    detail: "Bangladesh Meteorological Department has issued a heatwave warning. Maximum temperature expected to reach 40°C in Rajshahi, Jessore, and Khulna. Risk of heat stroke is high for children under 5 and elderly. Offer cool drinks every 30 minutes.", detailBn: "বাংলাদেশ আবহাওয়া অধিদপ্তর তাপপ্রবাহ সতর্কতা জারি করেছে। রাজশাহী, যশোর ও খুলনায় তাপমাত্রা ৪০°C পর্যন্ত পৌঁছানোর আশংকা।",
    time: "5 hours ago", timeBn: "৫ ঘন্টা আগে", isNew: true,
  },
  {
    id: 3, category: "Health", color: "bg-purple-500", bgColor: "bg-purple-50", textColor: "text-purple-700", badgeColor: "bg-purple-100 text-purple-700", icon: Wind,
    title: "Air Quality Alert", titleBn: "বায়ু মান সতর্কতা",
    body: "AQI 156 detected in central Dhaka. Limit outdoor exposure for children.", bodyBn: "কেন্দ্রীয় ঢাকায় AQI ১৫৬ শনাক্ত হয়েছে। শিশুদের বাইরে যাওয়া সীমিত করুন।",
    detail: "PM2.5 particles are elevated across Dhaka, Narayanganj, and Gazipur. Children with asthma or respiratory conditions are at high risk. Keep windows closed, use air purifiers if available, and limit outdoor activity to before 7 AM and after 7 PM.", detailBn: "ঢাকা, নারায়ণগঞ্জ ও গাজীপুরে PM2.5 কণার মাত্রা বৃদ্ধি পেয়েছে। হাঁপানি বা শ্বাসকষ্টের রোগীরা বেশি ঝুঁকিতে আছেন।",
    time: "Yesterday", timeBn: "গতকাল", isNew: false,
  },
  {
    id: 4, category: "System", color: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-primary", badgeColor: "bg-blue-100 text-blue-700", icon: Info,
    title: "App Update Available", titleBn: "অ্যাপ আপডেট উপলব্ধ",
    body: "New features: Voice symptom checker, expanded doctor network.", bodyBn: "নতুন ফিচার: ভয়েস উপসর্গ পরীক্ষক, বিস্তৃত ডাক্তার নেটওয়ার্ক।",
    detail: "SHISHU DOC v2.1 includes real-time Bangladesh health risk mapping, improved AI diagnosis for 40+ conditions, voice input in Bangla, and an expanded network of 200+ certified pediatricians across all 8 divisions.", detailBn: "SHISHU DOC v2.1-এ রয়েছে রিয়েল-টাইম বাংলাদেশ স্বাস্থ্য ঝুঁকি ম্যাপিং, ৪০+ অবস্থার উন্নত AI রোগ নির্ণয়, বাংলায় ভয়েস ইনপুট এবং ৮টি বিভাগে ২০০+ প্রত্যয়িত শিশু বিশেষজ্ঞের নেটওয়ার্ক।",
    time: "2 days ago", timeBn: "২ দিন আগে", isNew: false,
  },
];

export default function Alerts() {
  const { language, isBangla } = useLanguage();
  const t = T[language];
  const [activeTab, setActiveTab] = useState("All");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [read, setRead] = useState<Set<number>>(new Set());
  const [refreshed, setRefreshed] = useState(false);

  const tabKeys = ["All", "Health", "System"];

  const filtered = activeTab === "All" ? ALERTS : ALERTS.filter(a => a.category === activeTab);

  const toggle = (id: number) => {
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    setRead(prev => new Set([...prev, id]));
  };

  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 2000);
  };

  return (
    <div className="px-4 pb-6 space-y-5">
      {/* Header */}
      <header className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-foreground" />
          <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-1.5 text-xs text-primary font-semibold" data-testid="btn-refresh-alerts">
          <RefreshCw className={cn("w-3.5 h-3.5", refreshed && "animate-spin")} />
          {refreshed ? t.updated : t.refresh}
        </button>
      </header>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-border">
        {tabKeys.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn("pb-3 text-sm font-medium transition-colors relative",
              activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground")}
            data-testid={`tab-alerts-${tab.toLowerCase()}`}
          >
            {t.tabs[i]}
            {activeTab === tab && <motion.div layoutId="alertsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {filtered.map((alert) => {
          const Icon = alert.icon;
          const isExpanded = expanded.has(alert.id);
          const isRead = read.has(alert.id);
          return (
            <motion.div key={alert.id} variants={item}
              className={cn("bg-white rounded-[16px] overflow-hidden shadow-sm border transition-all",
                !isRead && alert.isNew ? "border-l-4 " + alert.color.replace("bg-", "border-") : "border-border"
              )}
            >
              <div className="p-4 cursor-pointer" onClick={() => toggle(alert.id)} data-testid={`alert-card-${alert.id}`}>
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 p-2 rounded-full shrink-0", alert.bgColor, alert.textColor)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[14px] text-foreground leading-tight">
                          {isBangla ? alert.titleBn : alert.title}
                        </h3>
                        {alert.isNew && !isRead && (
                          <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0", alert.badgeColor)}>
                            {t.newBadge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                        {isBangla ? alert.timeBn : alert.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isBangla ? alert.bodyBn : alert.body}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", alert.badgeColor)}>
                        {isBangla ? (alert.category === "Health" ? "স্বাস্থ্য" : "সিস্টেম") : alert.category}
                      </span>
                      <button className={cn("flex items-center gap-1 text-xs font-semibold", alert.textColor)}>
                        {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" />{t.collapse}</> : <><ChevronDown className="w-3.5 h-3.5" />{t.readMore}</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden"
                  >
                    <div className={cn("px-4 pb-4 pt-0 text-xs leading-relaxed border-t", alert.bgColor, alert.textColor, "border-" + alert.color.replace("bg-", "") + "/30")}>
                      <p className="mt-3">{isBangla ? alert.detailBn : alert.detail}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
