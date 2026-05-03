import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertTriangle, ChevronUp, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language";

// Fix Leaflet default icon issues in Vite
import L from "leaflet";
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: "", iconUrl: "", shadowUrl: "" });

interface DivisionRisk {
  id: string;
  name: string;
  nameBn: string;
  lat: number;
  lng: number;
  dengue: { level: "low" | "moderate" | "high"; percent: number; reason: string };
  heat: { level: "low" | "moderate" | "high"; percent: number; celsius: number };
  air: { level: "good" | "moderate" | "unhealthy" | "hazardous"; aqi: number; percent: number };
}

interface RiskData {
  generatedAt: string;
  season: string;
  divisions: DivisionRisk[];
  aiAlerts: string[];
  aiAlertsBn: string[];
}

type RiskType = "dengue" | "heat" | "air";

const RISK_COLORS: Record<string, string> = {
  low: "#22C55E",
  good: "#22C55E",
  moderate: "#FBBF24",
  high: "#EF4444",
  unhealthy: "#EF4444",
  hazardous: "#7C3AED",
};

const RISK_FILL_OPACITY: Record<string, number> = {
  low: 0.25, good: 0.25, moderate: 0.35, high: 0.45, unhealthy: 0.45, hazardous: 0.55,
};

const RADIUS_BY_LEVEL: Record<string, number> = {
  low: 20, good: 20, moderate: 24, high: 28, unhealthy: 28, hazardous: 30,
};

const T = {
  en: {
    title: "Bangladesh Health Map",
    toggles: ["Dengue", "Heat", "Air Quality"],
    loading: "Loading AI risk data…",
    error: "Failed to load. Tap to retry.",
    refresh: "Refresh",
    season: "Season",
    aiAlerts: "AI Alerts",
    close: "Close",
    level: "Risk Level",
    percent: "Intensity",
    aqi: "AQI",
    celsius: "Temp",
    reason: "Reason",
    actions: "What to do",
    dengueActions: ["Use mosquito repellent", "Remove standing water", "Use bed nets at night"],
    heatActions: ["Stay hydrated", "Avoid outdoor 12–4 PM", "Wear light clothing"],
    airActions: ["Limit outdoor activity", "Wear N95 mask", "Keep windows closed"],
    tapHint: "Tap a division for details",
    newData: "AI data refreshed",
  },
  bn: {
    title: "বাংলাদেশ স্বাস্থ্য ম্যাপ",
    toggles: ["ডেঙ্গু", "তাপ", "বায়ু মান"],
    loading: "AI ঝুঁকি ডেটা লোড হচ্ছে…",
    error: "লোড ব্যর্থ। পুনরায় চেষ্টা করুন।",
    refresh: "রিফ্রেশ",
    season: "ঋতু",
    aiAlerts: "AI সতর্কতা",
    close: "বন্ধ",
    level: "ঝুঁকির স্তর",
    percent: "তীব্রতা",
    aqi: "AQI",
    celsius: "তাপমাত্রা",
    reason: "কারণ",
    actions: "করণীয়",
    dengueActions: ["মশা নিরোধক ব্যবহার করুন", "জমা পানি সরান", "রাতে মশারি ব্যবহার করুন"],
    heatActions: ["প্রচুর পানি পান করুন", "দুপুর ১২–৪টা বাইরে এড়ান", "হালকা পোশাক পরুন"],
    airActions: ["বাইরে যাওয়া সীমিত করুন", "N95 মাস্ক পরুন", "জানালা বন্ধ রাখুন"],
    tapHint: "বিস্তারিত জানতে একটি বিভাগে ট্যাপ করুন",
    newData: "AI ডেটা রিফ্রেশ হয়েছে",
  },
};

function getLevelForType(div: DivisionRisk, type: RiskType): string {
  if (type === "dengue") return div.dengue.level;
  if (type === "heat") return div.heat.level;
  return div.air.level;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [map, center, zoom]);
  return null;
}

export default function MapPage() {
  const { language, isBangla } = useLanguage();
  const t = T[language];
  const toggleLabels = t.toggles;
  const [activeType, setActiveType] = useState<RiskType>("dengue");
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<DivisionRisk | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (bust = false) => {
    setLoading(true);
    setError(false);
    try {
      const url = bust ? `/api/bangladesh/risks?bust=${Date.now()}` : "/api/bangladesh/risks";
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const json: RiskData = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(true); };

  const riskTypeKeys: RiskType[] = ["dengue", "heat", "air"];

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-border z-[500]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[17px] font-bold text-foreground">{t.title}</h1>
          <div className="flex items-center gap-2">
            {data && (
              <button onClick={() => setShowAlerts(v => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
                data-testid="btn-ai-alerts"
              >
                <AlertTriangle className="w-3 h-3" />
                {t.aiAlerts} {showAlerts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            <button onClick={handleRefresh} disabled={refreshing || loading}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              data-testid="btn-refresh-map"
            >
              <RefreshCw className={cn("w-4 h-4 text-muted-foreground", refreshing && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* AI Alerts dropdown */}
        <AnimatePresence>
          {showAlerts && data && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-3 mb-2 space-y-1.5">
                {(isBangla ? data.aiAlertsBn : data.aiAlerts).map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-800 leading-relaxed">
                    <span className="shrink-0 mt-0.5">⚠️</span> {alert}
                  </div>
                ))}
                {data.season && (
                  <div className="text-[10px] text-amber-600 font-semibold mt-1 pt-1 border-t border-amber-200">
                    {t.season}: {data.season}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type toggles */}
        <div className="flex gap-2">
          {riskTypeKeys.map((type, i) => (
            <button key={type}
              onClick={() => setActiveType(type)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-colors border flex-1",
                activeType === type ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:bg-gray-50"
              )}
              data-testid={`toggle-${type}`}
            >
              {toggleLabels[i]}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 z-10">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm font-medium text-muted-foreground">{t.loading}</p>
          </div>
        ) : error ? (
          <button onClick={() => fetchData()} className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 w-full">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-sm font-medium text-red-600">{t.error}</p>
          </button>
        ) : (
          <MapContainer
            center={[23.6850, 90.3563]}
            zoom={7}
            style={{ height: "100%", width: "100%", zIndex: 1 }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {data?.divisions.map((div) => {
              const level = getLevelForType(div, activeType);
              const color = RISK_COLORS[level] ?? "#94A3B8";
              const fillOpacity = RISK_FILL_OPACITY[level] ?? 0.3;
              const radius = RADIUS_BY_LEVEL[level] ?? 22;
              const isSelected = selected?.id === div.id;

              return (
                <CircleMarker
                  key={`${div.id}-${activeType}`}
                  center={[div.lat, div.lng]}
                  radius={isSelected ? radius + 6 : radius}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: isSelected ? fillOpacity + 0.2 : fillOpacity,
                    color,
                    weight: isSelected ? 3 : 1.5,
                    opacity: 0.9,
                  }}
                  eventHandlers={{ click: () => setSelected(div) }}
                >
                  <Popup>
                    <div className="text-center font-bold text-sm">
                      {isBangla ? div.nameBn : div.name}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}

        {/* Legend */}
        {!loading && !error && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-[10px] px-3 py-2 z-[400] shadow-sm border border-border">
            <div className="flex flex-col gap-1">
              {[["#22C55E", isBangla ? "নিরাপদ" : "Safe"], ["#FBBF24", isBangla ? "মাঝারি" : "Moderate"], ["#EF4444", isBangla ? "উচ্চ ঝুঁকি" : "High Risk"]].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
                  <span className="text-[10px] font-semibold text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tap hint */}
        {!loading && !error && !selected && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 z-[400] shadow-sm border border-border">
            <p className="text-[10px] font-semibold text-muted-foreground">{t.tapHint}</p>
          </div>
        )}
      </div>

      {/* Bottom Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl z-[500] pb-6"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
              <div>
                <h2 className="text-[17px] font-bold text-foreground">
                  {isBangla ? selected.nameBn : selected.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{isBangla ? "বিভাগ, বাংলাদেশ" : "Division, Bangladesh"}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-gray-100" data-testid="btn-close-panel">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-5 pt-4 space-y-4">
              {/* 3 risk pills */}
              <div className="grid grid-cols-3 gap-2">
                {(["dengue", "heat", "air"] as RiskType[]).map((type, i) => {
                  const label = toggleLabels[i];
                  let level: string;
                  let value: string;
                  if (type === "dengue") {
                    level = selected.dengue.level;
                    value = `${selected.dengue.percent}%`;
                  } else if (type === "heat") {
                    level = selected.heat.level;
                    value = `${selected.heat.celsius}°C`;
                  } else {
                    level = selected.air.level;
                    value = `AQI ${selected.air.aqi}`;
                  }
                  const color = RISK_COLORS[level] ?? "#94A3B8";
                  return (
                    <div key={type} className="flex flex-col items-center bg-gray-50 rounded-[12px] p-2.5 border border-border">
                      <span className="text-[10px] font-semibold text-muted-foreground mb-1">{label}</span>
                      <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: color }}></div>
                      <span className="text-xs font-bold text-foreground">{value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Active type detail */}
              {(() => {
                const type = activeType;
                let reason = "";
                let actions: string[] = [];
                let badgeLabel = "";
                let badgeColor = "";

                if (type === "dengue") {
                  reason = selected.dengue.reason;
                  actions = t.dengueActions;
                  badgeLabel = isBangla ? (selected.dengue.level === "high" ? "উচ্চ" : selected.dengue.level === "moderate" ? "মাঝারি" : "নিম্ন") : selected.dengue.level.toUpperCase();
                  badgeColor = selected.dengue.level === "high" ? "bg-red-100 text-red-700" : selected.dengue.level === "moderate" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
                } else if (type === "heat") {
                  reason = isBangla ? `${selected.heat.celsius}°C তাপমাত্রা রেকর্ড করা হয়েছে` : `Temperature recorded at ${selected.heat.celsius}°C`;
                  actions = t.heatActions;
                  badgeLabel = isBangla ? (selected.heat.level === "high" ? "উচ্চ" : selected.heat.level === "moderate" ? "মাঝারি" : "নিম্ন") : selected.heat.level.toUpperCase();
                  badgeColor = selected.heat.level === "high" ? "bg-red-100 text-red-700" : selected.heat.level === "moderate" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
                } else {
                  reason = isBangla ? `AQI ${selected.air.aqi} — ${selected.air.level === "unhealthy" ? "অস্বাস্থ্যকর" : selected.air.level === "hazardous" ? "বিপজ্জনক" : selected.air.level === "moderate" ? "মাঝারি" : "ভালো"}` : `AQI ${selected.air.aqi} — ${selected.air.level}`;
                  actions = t.airActions;
                  badgeLabel = isBangla ? (selected.air.level === "unhealthy" || selected.air.level === "hazardous" ? "অস্বাস্থ্যকর" : selected.air.level === "moderate" ? "মাঝারি" : "ভালো") : selected.air.level.toUpperCase();
                  badgeColor = (selected.air.level === "unhealthy" || selected.air.level === "hazardous") ? "bg-red-100 text-red-700" : selected.air.level === "moderate" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
                }

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1 mr-2">{reason}</p>
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full shrink-0", badgeColor)}>{badgeLabel}</span>
                    </div>
                    <div className="bg-gray-50 rounded-[12px] p-3 border border-border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">{t.actions}</p>
                      <div className="space-y-1.5">
                        {actions.map((a, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-foreground font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div> {a}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
