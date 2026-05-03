import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

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
  month: string;
  season: string;
  divisions: DivisionRisk[];
  aiAlerts: string[];
  aiAlertsBn: string[];
}

let cache: { data: RiskData; expiresAt: number } | null = null;

const DIVISIONS_BASE = [
  { id: "dhaka",      name: "Dhaka",      nameBn: "ঢাকা",       lat: 23.8103, lng: 90.4125 },
  { id: "chittagong", name: "Chittagong", nameBn: "চট্টগ্রাম",  lat: 22.3569, lng: 91.7832 },
  { id: "khulna",     name: "Khulna",     nameBn: "খুলনা",      lat: 22.8456, lng: 89.5403 },
  { id: "rajshahi",   name: "Rajshahi",   nameBn: "রাজশাহী",    lat: 24.3745, lng: 88.6042 },
  { id: "sylhet",     name: "Sylhet",     nameBn: "সিলেট",      lat: 24.8949, lng: 91.8687 },
  { id: "barisal",    name: "Barisal",    nameBn: "বরিশাল",     lat: 22.7010, lng: 90.3535 },
  { id: "rangpur",    name: "Rangpur",    nameBn: "রংপুর",      lat: 25.7439, lng: 89.2752 },
  { id: "mymensingh", name: "Mymensingh", nameBn: "ময়মনসিংহ", lat: 24.7471, lng: 90.4203 },
];

function extractJSON(text: string): unknown {
  // Strip markdown code fences
  const stripped = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Try direct parse first
  try { return JSON.parse(stripped); } catch { /* continue */ }

  // Find outermost { ... }
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(stripped.slice(start, end + 1)); } catch { /* continue */ }
  }
  return null;
}

const now = new Date();
const MONTH_NAME = now.toLocaleDateString("en-BD", { month: "long", year: "numeric" });

router.get("/bangladesh/risks", async (req, res) => {
  if (cache && cache.expiresAt > Date.now()) {
    res.json(cache.data);
    return;
  }

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 2000,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a JSON-only API. You output ONLY raw JSON with no markdown, no code blocks, no explanation. Never use ```.",
        },
        {
          role: "user",
          content: `Output a JSON object for Bangladesh health risk data for ${MONTH_NAME}. Use this exact structure with 8 divisions:
{
  "season": "Pre-Monsoon",
  "divisions": [
    {"id":"dhaka","dengue":{"level":"high","percent":78,"reason":"Stagnant water after rains"},"heat":{"level":"moderate","percent":62,"celsius":34},"air":{"level":"unhealthy","aqi":155,"percent":74}},
    {"id":"chittagong","dengue":{"level":"high","percent":71,"reason":"Coastal humidity breeding"},"heat":{"level":"low","percent":40,"celsius":31},"air":{"level":"moderate","aqi":85,"percent":42}},
    {"id":"khulna","dengue":{"level":"moderate","percent":55,"reason":"Seasonal risk present"},"heat":{"level":"high","percent":72,"celsius":38},"air":{"level":"moderate","aqi":95,"percent":48}},
    {"id":"rajshahi","dengue":{"level":"low","percent":30,"reason":"Drier conditions"},"heat":{"level":"high","percent":85,"celsius":41},"air":{"level":"moderate","aqi":110,"percent":52}},
    {"id":"sylhet","dengue":{"level":"moderate","percent":48,"reason":"Moderate rainfall activity"},"heat":{"level":"low","percent":35,"celsius":29},"air":{"level":"good","aqi":55,"percent":28}},
    {"id":"barisal","dengue":{"level":"high","percent":65,"reason":"Coastal delta conditions"},"heat":{"level":"moderate","percent":58,"celsius":33},"air":{"level":"moderate","aqi":78,"percent":40}},
    {"id":"rangpur","dengue":{"level":"low","percent":25,"reason":"Northern dry season"},"heat":{"level":"high","percent":78,"celsius":39},"air":{"level":"moderate","aqi":100,"percent":50}},
    {"id":"mymensingh","dengue":{"level":"moderate","percent":52,"reason":"Urban drainage issues"},"heat":{"level":"moderate","percent":60,"celsius":33},"air":{"level":"moderate","aqi":112,"percent":55}}
  ],
  "aiAlerts": [
    "Dengue risk is elevated in Dhaka, Chittagong, and Barisal divisions — use mosquito repellent and remove standing water immediately.",
    "Heat stress is critical in Rajshahi and Rangpur; keep children indoors between 11 AM and 4 PM and maintain hydration.",
    "Air quality is unhealthy in Dhaka — limit outdoor activity for children under 5 and those with respiratory conditions."
  ],
  "aiAlertsBn": [
    "ঢাকা, চট্টগ্রাম ও বরিশাল বিভাগে ডেঙ্গুর ঝুঁকি বেশি — মশা নিরোধক ব্যবহার করুন এবং জমা পানি অবিলম্বে সরান।",
    "রাজশাহী ও রংপুরে তাপ চাপ মারাত্মক — সকাল ১১টা থেকে বিকাল ৪টার মধ্যে শিশুদের ঘরে রাখুন।",
    "ঢাকায় বায়ু মান অস্বাস্থ্যকর — ৫ বছরের কম বয়সী শিশুদের বাইরে যাওয়া সীমিত করুন।"
  ]
}

Now generate the SAME structure but with realistic values for ${MONTH_NAME}. Change the numbers to be accurate for current conditions. Output ONLY the JSON object.`,
        },
      ],
    });

    let fullText = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) fullText += content;
    }

    req.log.info({ responseLength: fullText.length }, "Bangladesh AI raw response received");

    const parsed = extractJSON(fullText) as Record<string, unknown> | null;
    if (!parsed) {
      req.log.error({ fullText: fullText.slice(0, 500) }, "JSON extraction failed");
      throw new Error("Could not parse JSON from AI response");
    }

    const divisions = Array.isArray(parsed.divisions) ? parsed.divisions : [];

    const riskData: RiskData = {
      generatedAt: new Date().toISOString(),
      month: MONTH_NAME,
      season: typeof parsed.season === "string" ? parsed.season : "Pre-Monsoon",
      divisions: DIVISIONS_BASE.map((base) => {
        const ai = divisions.find((d: { id: string }) => d.id === base.id) ?? {};
        return {
          ...base,
          dengue: ai.dengue ?? { level: "moderate", percent: 50, reason: "Seasonal risk present" },
          heat:   ai.heat   ?? { level: "moderate", percent: 55, celsius: 33 },
          air:    ai.air    ?? { level: "moderate", aqi: 100, percent: 45 },
        };
      }),
      aiAlerts:   Array.isArray(parsed.aiAlerts)   ? parsed.aiAlerts   : ["Monitor health conditions across Bangladesh."],
      aiAlertsBn: Array.isArray(parsed.aiAlertsBn) ? parsed.aiAlertsBn : ["বাংলাদেশ জুড়ে স্বাস্থ্য পরিস্থিতি পর্যবেক্ষণ করুন।"],
    };

    cache = { data: riskData, expiresAt: Date.now() + 30 * 60 * 1000 };
    res.json(riskData);
  } catch (err) {
    req.log.error({ err }, "Bangladesh risk data generation failed");
    res.status(500).json({ error: "Failed to generate risk data" });
  }
});

export default router;
