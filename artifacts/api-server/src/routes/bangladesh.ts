/**
 * Bangladesh risk data sources:
 * - Heat: Open-Meteo Weather API, using current temperature and relative humidity.
 * - Air quality: Open-Meteo Air Quality API, using the current US AQI value.
 * - Dengue: manually maintained monthly baseline in data/dengue-baseline.json,
 *   based on DGHS published reports (https://dghs.gov.bd).
 *
 * Open-Meteo is used for numeric observations. The language model is only used
 * to turn the computed observations into human-readable English and Bangla alerts.
 */
import { Router, type IRouter, type Request } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import dengueBaseline from "../data/dengue-baseline.json";

const router: IRouter = Router();

type HeatLevel = "low" | "moderate" | "high";
type AirLevel = "good" | "moderate" | "unhealthy" | "hazardous";

interface HeatRisk {
  level: HeatLevel;
  percent: number;
  celsius: number;
}

interface AirRisk {
  level: AirLevel;
  aqi: number;
  percent: number;
}

interface DengueRisk {
  level: HeatLevel;
  percent: number;
  reason: string;
}

interface OverallRisk {
  level: HeatLevel;
  percent: number;
}

interface DivisionRisk {
  id: string;
  name: string;
  nameBn: string;
  lat: number;
  lng: number;
  dengue: DengueRisk;
  heat: HeatRisk;
  air: AirRisk;
  overall: OverallRisk;
}

interface RiskData {
  generatedAt: string;
  month: string;
  season: string;
  divisions: DivisionRisk[];
  aiAlerts: string[];
  aiAlertsBn: string[];
}

interface HeatReading {
  temperatureC: number;
  humidity: number;
  heatIndexC: number;
  celsius: number;
  percent: number;
  level: HeatLevel;
}

interface DengueBaselineEntry {
  level: HeatLevel;
  percent: number;
  reason: string;
}

interface DivisionMetrics {
  heat: HeatReading;
  aqi: number;
}

interface CachedDivision {
  metrics: DivisionMetrics;
  risk: DivisionRisk;
}

interface WeatherResponse {
  current?: {
    temperature_2m?: unknown;
    relative_humidity_2m?: unknown;
  };
}

interface AirQualityResponse {
  current?: {
    pm2_5?: unknown;
    pm10?: unknown;
    us_aqi?: unknown;
  };
}

interface DengueBaselineConfig {
  _comment: string;
  _sourceUrl: string;
  months: Record<string, Record<string, DengueBaselineEntry>>;
}

const typedDengueBaseline = dengueBaseline as DengueBaselineConfig;

let cache: { data: RiskData; expiresAt: number } | null = null;
const divisionCache = new Map<string, CachedDivision>();

const DIVISIONS_BASE = [
  { id: "dhaka",      name: "Dhaka",      nameBn: "ঢাকা",       lat: 23.8103, lng: 90.4125 },
  { id: "chittagong", name: "Chittagong", nameBn: "চট্টগ্রাম",  lat: 22.3569, lng: 91.7832 },
  { id: "khulna",     name: "Khulna",     nameBn: "খুলনা",      lat: 22.8456, lng: 89.5403 },
  { id: "rajshahi",   name: "Rajshahi",   nameBn: "রাজশাহী",    lat: 24.3745, lng: 88.6042 },
  { id: "sylhet",     name: "Sylhet",     nameBn: "সিলেট",      lat: 24.8949, lng: 91.8687 },
  { id: "barisal",    name: "Barisal",    nameBn: "বরিশাল",     lat: 22.7010, lng: 90.3535 },
  { id: "rangpur",    name: "Rangpur",    nameBn: "রংপুর",      lat: 25.7439, lng: 89.2752 },
  { id: "mymensingh", name: "Mymensingh", nameBn: "ময়মনসিংহ", lat: 24.7471, lng: 90.4203 },
] as const;

const CACHE_TTL_MS = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

// NOAA heat-index formula is defined in Fahrenheit; output is converted back to Celsius.
const NOAA_HEAT_INDEX_MIN_F = 80;
const HEAT_LOW_MAX_C = 32;
const HEAT_MODERATE_MAX_C = 40;
const HEAT_PERCENT_MIN_C = 25;
const HEAT_PERCENT_MAX_C = 45;

// The UI has four AQI buckets, so the two US bands above 200 are grouped as hazardous.
const AQI_GOOD_MAX = 50;
const AQI_MODERATE_MAX = 100;
const AQI_UNHEALTHY_MAX = 200;
const AQI_PERCENT_MAX = 200;

const DENGUE_WEIGHT = 0.4;
const HEAT_WEIGHT = 0.35;
const AIR_WEIGHT = 0.25;
const OVERALL_MODERATE_MIN_PERCENT = 34;
const OVERALL_HIGH_MIN_PERCENT = 67;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getHeatIndexCelsius(temperatureC: number, humidity: number): number {
  const temperatureF = temperatureC * 9 / 5 + 32;

  // NOAA recommends using the ambient temperature below the formula's validity range.
  if (temperatureF < NOAA_HEAT_INDEX_MIN_F) return temperatureC;

  const heatIndexF =
    -42.379 +
    2.04901523 * temperatureF +
    10.14333127 * humidity -
    0.22475541 * temperatureF * humidity -
    0.00683783 * temperatureF ** 2 -
    0.05481717 * humidity ** 2 +
    0.00122874 * temperatureF ** 2 * humidity +
    0.00085282 * temperatureF * humidity ** 2 -
    0.00000199 * temperatureF ** 2 * humidity ** 2;

  // NOAA low-humidity and high-humidity adjustments.
  let adjustedHeatIndexF = heatIndexF;
  if (humidity < 13 && temperatureF >= 80 && temperatureF <= 112) {
    adjustedHeatIndexF -=
      ((13 - humidity) / 4) * Math.sqrt((17 - Math.abs(temperatureF - 95)) / 17);
  } else if (humidity > 85 && temperatureF >= 80 && temperatureF <= 87) {
    adjustedHeatIndexF += ((humidity - 85) / 10) * ((87 - temperatureF) / 5);
  }

  return (adjustedHeatIndexF - 32) * 5 / 9;
}

function getHeatLevel(heatIndexC: number): HeatLevel {
  if (heatIndexC < HEAT_LOW_MAX_C) return "low";
  if (heatIndexC <= HEAT_MODERATE_MAX_C) return "moderate";
  return "high";
}

function getAirLevel(aqi: number): AirLevel {
  if (aqi <= AQI_GOOD_MAX) return "good";
  if (aqi <= AQI_MODERATE_MAX) return "moderate";
  if (aqi <= AQI_UNHEALTHY_MAX) return "unhealthy";
  return "hazardous";
}

function buildHeatReading(temperatureC: number, humidity: number): HeatReading {
  const heatIndexC = getHeatIndexCelsius(temperatureC, humidity);
  return {
    level: getHeatLevel(heatIndexC),
    percent: clamp(
      Math.round(((heatIndexC - HEAT_PERCENT_MIN_C) / (HEAT_PERCENT_MAX_C - HEAT_PERCENT_MIN_C)) * 100),
      0,
      100,
    ),
    celsius: round(heatIndexC, 1),
    temperatureC,
    humidity,
    heatIndexC,
  };
}

function getOverallLevel(percent: number): HeatLevel {
  if (percent < OVERALL_MODERATE_MIN_PERCENT) return "low";
  if (percent < OVERALL_HIGH_MIN_PERCENT) return "moderate";
  return "high";
}

/**
 * Combines the three independently sourced risk signals. The score is
 * 40% dengue baseline, 35% heat index, and 25% US AQI.
 */
export function computeDivisionRisk(
  heat: HeatReading,
  aqi: number,
  dengue: DengueBaselineEntry,
  month: string,
): Pick<DivisionRisk, "dengue" | "heat" | "air" | "overall"> {
  const airPercent = clamp(Math.round((aqi / AQI_PERCENT_MAX) * 100), 0, 100);
  const denguePercent = clamp(Math.round(dengue.percent), 0, 100);
  const overallPercent = Math.round(
    denguePercent * DENGUE_WEIGHT +
    heat.percent * HEAT_WEIGHT +
    airPercent * AIR_WEIGHT,
  );

  return {
    dengue: {
      level: dengue.level,
      percent: denguePercent,
      reason: dengue.reason.trim() || `DGHS baseline for ${month}`,
    },
    heat: {
      level: heat.level,
      percent: heat.percent,
      celsius: heat.celsius,
    },
    air: {
      level: getAirLevel(aqi),
      aqi: round(aqi),
      percent: airPercent,
    },
    overall: {
      level: getOverallLevel(overallPercent),
      percent: overallPercent,
    },
  };
}

function getSeason(monthNumber: number): string {
  if (monthNumber >= 3 && monthNumber <= 5) return "Pre-Monsoon";
  if (monthNumber >= 6 && monthNumber <= 10) return "Monsoon";
  return "Cool & Dry";
}

function getMonthInfo(date: Date): { number: number; label: string } {
  return {
    number: date.getMonth() + 1,
    label: date.toLocaleDateString("en-BD", { month: "long", year: "numeric" }),
  };
}

function requireFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Open-Meteo response did not contain a numeric ${field}`);
  }
  return value;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Open-Meteo returned HTTP ${response.status}`);
  }
  return await response.json() as T;
}

async function fetchLiveMetrics(
  division: typeof DIVISIONS_BASE[number],
): Promise<DivisionMetrics> {
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.search = new URLSearchParams({
    latitude: String(division.lat),
    longitude: String(division.lng),
    current: "temperature_2m,relative_humidity_2m",
    daily: "temperature_2m_max",
    timezone: "auto",
  }).toString();

  const airUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  airUrl.search = new URLSearchParams({
    latitude: String(division.lat),
    longitude: String(division.lng),
    current: "pm2_5,pm10,us_aqi",
  }).toString();

  const [weather, air] = await Promise.all([
    fetchJson<WeatherResponse>(weatherUrl.toString()),
    fetchJson<AirQualityResponse>(airUrl.toString()),
  ]);

  const temperatureC = requireFiniteNumber(weather.current?.temperature_2m, "temperature");
  const humidity = requireFiniteNumber(weather.current?.relative_humidity_2m, "humidity");
  const aqi = requireFiniteNumber(air.current?.us_aqi, "US AQI");

  return {
    heat: buildHeatReading(temperatureC, clamp(humidity, 0, 100)),
    aqi: Math.max(0, aqi),
  };
}

function getDengueEntry(divisionId: string, monthNumber: number): DengueBaselineEntry {
  const month = typedDengueBaseline.months[String(monthNumber)];
  const entry = month?.[divisionId];
  if (!entry) throw new Error(`Missing DGHS dengue baseline for ${divisionId}, month ${monthNumber}`);
  return entry;
}

function extractJSON(text: string): unknown {
  const stripped = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try { return JSON.parse(stripped); } catch { /* continue */ }

  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(stripped.slice(start, end + 1)); } catch { /* continue */ }
  }
  return null;
}

function getStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const strings = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return strings.length > 0 ? strings.slice(0, 5) : null;
}

function buildFallbackAlerts(divisions: DivisionRisk[]): { aiAlerts: string[]; aiAlertsBn: string[] } {
  const highDengue = divisions.filter((division) => division.dengue.level === "high");
  const highHeat = divisions.filter((division) => division.heat.level === "high");
  const unhealthyAir = divisions.filter((division) => division.air.level === "unhealthy" || division.air.level === "hazardous");

  const aiAlerts: string[] = [];
  const aiAlertsBn: string[] = [];

  if (highDengue.length > 0) {
    const names = highDengue.map((division) => division.name).join(", ");
    aiAlerts.push(`Dengue risk is high in ${names}; remove standing water and use mosquito protection.`);
    aiAlertsBn.push(`${highDengue.map((division) => division.nameBn).join(" ও ")} বিভাগে ডেঙ্গুর ঝুঁকি বেশি; জমা পানি সরান এবং মশা থেকে সুরক্ষা নিন।`);
  }
  if (highHeat.length > 0) {
    aiAlerts.push(`Heat stress is high in ${highHeat.map((division) => division.name).join(", ")}; keep children hydrated and limit midday outdoor activity.`);
    aiAlertsBn.push(`${highHeat.map((division) => division.nameBn).join(" ও ")} বিভাগে তাপের চাপ বেশি; শিশুদের পানি পান করান এবং দুপুরে বাইরে থাকা কমান।`);
  }
  if (unhealthyAir.length > 0) {
    aiAlerts.push(`Air quality is unhealthy or worse in ${unhealthyAir.map((division) => division.name).join(", ")}; reduce prolonged outdoor activity for children.`);
    aiAlertsBn.push(`${unhealthyAir.map((division) => division.nameBn).join(" ও ")} বিভাগে বায়ু মান অস্বাস্থ্যকর বা তার চেয়ে খারাপ; শিশুদের দীর্ঘ সময় বাইরে থাকা কমান।`);
  }

  if (aiAlerts.length === 0) {
    aiAlerts.push("Monitor local health conditions and continue routine protection against heat, air pollution, and mosquitoes.");
    aiAlertsBn.push("স্থানীয় স্বাস্থ্য পরিস্থিতি পর্যবেক্ষণ করুন এবং তাপ, বায়ু দূষণ ও মশা থেকে নিয়মিত সুরক্ষা নিন।");
  }

  return { aiAlerts, aiAlertsBn };
}

async function generateAlerts(req: Request, divisions: DivisionRisk[]): Promise<{ aiAlerts: string[]; aiAlertsBn: string[] }> {
  const fallback = buildFallbackAlerts(divisions);
  const computedData = divisions.map(({ id, name, nameBn, dengue, heat, air, overall }) => ({
    id,
    name,
    nameBn,
    dengue,
    heat,
    air,
    overall,
  }));

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write health alerts only. Return a JSON object with exactly two arrays: aiAlerts and aiAlertsBn. Each array must contain concise warning sentences. Never add, remove, or change numeric data. Do not return divisions, scores, or any keys other than aiAlerts and aiAlertsBn.",
        },
        {
          role: "user",
          content: `Write natural-language English and Bangla alerts based ONLY on these already-computed Bangladesh risk values. Mention only high or moderate risks that deserve a warning. The numbers are authoritative and must not be invented or changed. Return only {"aiAlerts":["..."],"aiAlertsBn":["..."]}.\n\n${JSON.stringify(computedData)}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const parsed = typeof content === "string" ? extractJSON(content) : null;
    const alertObject = parsed as { aiAlerts?: unknown; aiAlertsBn?: unknown } | null;
    const aiAlerts = getStringArray(alertObject?.aiAlerts);
    const aiAlertsBn = getStringArray(alertObject?.aiAlertsBn);

    if (aiAlerts && aiAlertsBn) return { aiAlerts, aiAlertsBn };

    req.log.warn("Bangladesh alert model returned an invalid text-only payload");
  } catch (err) {
    req.log.warn({ err }, "Bangladesh alert text generation failed; using deterministic alerts");
  }

  return fallback;
}

router.get("/bangladesh/risks", async (req, res) => {
  if (cache && cache.expiresAt > Date.now()) {
    res.json(cache.data);
    return;
  }

  const currentDate = new Date();
  const month = getMonthInfo(currentDate);
  const season = getSeason(month.number);

  try {
    const divisionResults = await Promise.all(
      DIVISIONS_BASE.map(async (base): Promise<DivisionRisk> => {
        try {
          const metrics = await fetchLiveMetrics(base);
          const computed = computeDivisionRisk(
            metrics.heat,
            metrics.aqi,
            getDengueEntry(base.id, month.number),
            month.label,
          );
          const risk: DivisionRisk = { ...base, ...computed };
          divisionCache.set(base.id, { metrics, risk });
          return risk;
        } catch (err) {
          const previous = divisionCache.get(base.id);
          req.log.warn(
            { err, division: base.id, usingCachedValue: Boolean(previous) },
            "Open-Meteo data unavailable for division",
          );
          if (previous) {
            const computed = computeDivisionRisk(
              previous.metrics.heat,
              previous.metrics.aqi,
              getDengueEntry(base.id, month.number),
              month.label,
            );
            return { ...base, ...computed };
          }
          throw new Error(`No live or cached risk data available for ${base.name}`);
        }
      }),
    );

    const alerts = await generateAlerts(req, divisionResults);
    const riskData: RiskData = {
      generatedAt: currentDate.toISOString(),
      month: month.label,
      season,
      divisions: divisionResults,
      ...alerts,
    };

    cache = { data: riskData, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json(riskData);
  } catch (err) {
    req.log.error({ err }, "Bangladesh risk data refresh failed");
    if (cache) {
      req.log.warn("Returning the last complete Bangladesh risk response");
      res.json(cache.data);
      return;
    }
    res.status(503).json({ error: "Risk data is temporarily unavailable" });
  }
});

export default router;