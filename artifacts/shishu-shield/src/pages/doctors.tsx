import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, PhoneCall, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const T = {
  en: {
    title: "Available Doctors",
    tabs: ["All", "Pediatricians", "General", "Specialists"],
    online: "Online",
    busy: "Busy",
    waitLabel: (min: number) => `Wait ~${min} min`,
    connect: "Connect Now",
    waitQueue: "Wait in Queue",
    connecting: "Connecting...",
    connected: "Connected!",
    connectedSub: (name: string) => `${name} is ready for your consultation`,
    endCall: "End Consultation",
    emergency: "Emergency?",
    emergencySub: "Get priority help immediately",
    emergencyBtn: "Get Priority Help",
    emergencyTitle: "🚨 Emergency Mode Activated",
    emergencyDesc: "You are being connected to the nearest available emergency pediatric care. Please stay calm.",
    emergencyClose: "Cancel Emergency",
    callQuality: "HD Video Call",
    waitReady: "You're next in queue",
  },
  bn: {
    title: "উপলব্ধ ডাক্তার",
    tabs: ["সবাই", "শিশু বিশেষজ্ঞ", "সাধারণ", "বিশেষজ্ঞ"],
    online: "অনলাইন",
    busy: "ব্যস্ত",
    waitLabel: (min: number) => `অপেক্ষা ~${min} মিনিট`,
    connect: "এখনই সংযুক্ত হন",
    waitQueue: "লাইনে অপেক্ষা করুন",
    connecting: "সংযুক্ত হচ্ছে...",
    connected: "সংযুক্ত হয়েছে!",
    connectedSub: (name: string) => `${name} আপনার পরামর্শের জন্য প্রস্তুত`,
    endCall: "পরামর্শ শেষ করুন",
    emergency: "জরুরি অবস্থা?",
    emergencySub: "অবিলম্বে অগ্রাধিকার সাহায্য পান",
    emergencyBtn: "জরুরি সাহায্য নিন",
    emergencyTitle: "🚨 জরুরি মোড সক্রিয়",
    emergencyDesc: "আপনাকে নিকটতম উপলব্ধ জরুরি শিশু চিকিৎসায় সংযুক্ত করা হচ্ছে। শান্ত থাকুন।",
    emergencyClose: "বাতিল করুন",
    callQuality: "এইচডি ভিডিও কল",
    waitReady: "আপনি পরবর্তীতে আছেন",
  },
};

interface Doctor {
  id: number;
  initials: string;
  name: string;
  nameBn: string;
  specialty: string;
  specialtyBn: string;
  status: "online" | "busy";
  waitMin?: number;
  color: string;
  category: "Pediatricians" | "General" | "Specialists";
}

const DOCTORS: Doctor[] = [
  { id: 1, initials: "FI", name: "Dr. Farhana Islam",  nameBn: "ডা. ফারহানা ইসলাম",  specialty: "Pediatrician • MBBS, FCPS", specialtyBn: "শিশু বিশেষজ্ঞ • এমবিবিএস, এফসিপিএস", status: "online",  color: "bg-blue-100 text-blue-700",   category: "Pediatricians" },
  { id: 2, initials: "SR", name: "Dr. Shafiq Rahman",  nameBn: "ডা. শফিক রহমান",      specialty: "General Physician • MBBS",  specialtyBn: "সাধারণ চিকিৎসক • এমবিবিএস",   status: "online",  color: "bg-green-100 text-green-700", category: "General" },
  { id: 3, initials: "NJ", name: "Dr. Nusrat Jahan",   nameBn: "ডা. নুসরাত জাহান",    specialty: "Pediatrician • MBBS, MD",   specialtyBn: "শিশু বিশেষজ্ঞ • এমবিবিএস, এমডি", status: "busy", waitMin: 5, color: "bg-purple-100 text-purple-700", category: "Pediatricians" },
  { id: 4, initials: "RA", name: "Dr. Rafiq Ahmed",    nameBn: "ডা. রফিক আহমেদ",      specialty: "Cardiologist • MBBS, DCard",specialtyBn: "হৃদরোগ বিশেষজ্ঞ • এমবিবিএস", status: "online", color: "bg-red-100 text-red-700", category: "Specialists" },
  { id: 5, initials: "SB", name: "Dr. Sultana Begum",  nameBn: "ডা. সুলতানা বেগম",    specialty: "General Physician • MBBS",  specialtyBn: "সাধারণ চিকিৎসক • এমবিবিএস",   status: "busy", waitMin: 12, color: "bg-amber-100 text-amber-700", category: "General" },
];

type ConnectState = "idle" | "connecting" | "connected";

export default function Doctors() {
  const { language, isBangla } = useLanguage();
  const t = T[language];
  const tabs = T.en.tabs;
  const tabLabels = t.tabs;
  const [activeTab, setActiveTab] = useState("All");
  const [connectState, setConnectState] = useState<ConnectState>("idle");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);

  const filtered = activeTab === "All" ? DOCTORS : DOCTORS.filter(d => d.category === activeTab);

  const handleConnect = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setConnectState("connecting");
    setTimeout(() => setConnectState("connected"), 2200);
  };

  const handleEnd = () => {
    setConnectState("idle");
    setSelectedDoctor(null);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 pb-36 space-y-5">
        <header className="mt-2">
          <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
        </header>

        {/* Tabs */}
        <div className="flex space-x-5 border-b border-border overflow-x-auto no-scrollbar">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn("pb-3 text-sm font-medium whitespace-nowrap transition-colors relative shrink-0",
                activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              data-testid={`tab-${tab.toLowerCase()}`}
            >
              {tabLabels[i]}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Doctor Cards */}
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {filtered.map((doc) => (
            <motion.div key={doc.id} variants={item} className="bg-white p-4 rounded-[16px] shadow-sm border border-border">
              <div className="flex gap-3 items-center mb-3">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0", doc.color)}>
                  {doc.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[15px] leading-tight truncate">
                    {isBangla ? doc.nameBn : doc.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {isBangla ? doc.specialtyBn : doc.specialty}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className={cn("w-2 h-2 rounded-full", doc.status === "online" ? "bg-green-500" : "bg-amber-500")}></div>
                    <span className={cn("text-xs font-semibold", doc.status === "online" ? "text-green-600" : "text-amber-600")}>
                      {doc.status === "online" ? t.online : (doc.waitMin ? t.waitLabel(doc.waitMin) : t.busy)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 items-end">
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                    <PhoneCall className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary">{t.callQuality}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => doc.status === "online" ? handleConnect(doc) : handleConnect(doc)}
                className={cn("w-full font-semibold text-sm py-2.5 rounded-[12px] transition-colors flex items-center justify-center gap-2",
                  doc.status === "online"
                    ? "bg-primary text-white hover:bg-blue-600"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                )}
                data-testid={`btn-connect-${doc.id}`}
              >
                <Phone className="w-4 h-4" />
                {doc.status === "online" ? t.connect : t.waitQueue}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Emergency Banner */}
      <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-gradient-to-r from-red-600 to-red-500 px-5 py-3.5 text-white flex items-center justify-between rounded-t-2xl z-20 shadow-lg">
        <div>
          <h4 className="font-bold text-[14px]">🚨 {t.emergency}</h4>
          <p className="text-[11px] text-red-100 font-medium">{t.emergencySub}</p>
        </div>
        <button
          onClick={() => setShowEmergency(true)}
          className="bg-white text-red-600 font-bold text-xs px-4 py-2 rounded-[10px] hover:bg-red-50 transition-colors shrink-0"
          data-testid="btn-emergency"
        >
          {t.emergencyBtn}
        </button>
      </div>

      {/* Connecting / Connected Overlay */}
      <AnimatePresence>
        {connectState !== "idle" && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-gray-900/95 flex flex-col items-center justify-center p-8 text-center"
          >
            {connectState === "connecting" ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-6"
                >
                  <PhoneCall className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="text-white text-xl font-bold mb-2">{t.connecting}</h2>
                <p className="text-gray-400 text-sm mb-1">{isBangla ? selectedDoctor.nameBn : selectedDoctor.name}</p>
                <div className="flex gap-1.5 mt-4">
                  {[0,1,2].map(i => (
                    <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i*0.3 }}
                      className="w-2 h-2 rounded-full bg-primary" />
                  ))}
                </div>
              </>
            ) : (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </motion.div>
                <h2 className="text-white text-xl font-bold mb-2">{t.connected}</h2>
                <p className="text-gray-300 text-sm">{t.connectedSub(isBangla ? selectedDoctor.nameBn : selectedDoctor.name)}</p>
                <div className="mt-6 bg-white/10 rounded-[12px] px-5 py-3 text-sm text-white font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  {t.callQuality} · Live
                </div>
                <button
                  onClick={handleEnd}
                  className="mt-8 w-full max-w-[200px] bg-red-500 text-white font-bold py-3 rounded-[12px] hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  data-testid="btn-end-call"
                >
                  <X className="w-4 h-4" /> {t.endCall}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergency && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-red-950/95 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-20 h-20 rounded-full bg-red-500/30 border-2 border-red-400 flex items-center justify-center mb-6 text-4xl"
            >🚨</motion.div>
            <h2 className="text-white text-xl font-bold mb-3">{t.emergencyTitle}</h2>
            <p className="text-red-200 text-sm leading-relaxed mb-8">{t.emergencyDesc}</p>
            <div className="flex gap-2 mb-3">
              {[0,1,2].map(i => (
                <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: i*0.25 }}
                  className="w-2.5 h-2.5 rounded-full bg-red-400" />
              ))}
            </div>
            <button onClick={() => setShowEmergency(false)}
              className="mt-4 bg-white/20 text-white font-semibold text-sm px-6 py-2.5 rounded-[10px] hover:bg-white/30 transition-colors"
              data-testid="btn-cancel-emergency"
            >
              {t.emergencyClose}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
