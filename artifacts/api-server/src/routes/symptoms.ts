import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { z } from "zod";

const router: IRouter = Router();

const AnalyzeRequestBody = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  childAge: z.string().optional(),
  language: z.enum(["en", "bn"]).optional().default("en"),
});

const SYSTEM_PROMPT_EN = `You are SHISHU SHIELD's AI Health Assistant — a warm, expert pediatric health advisor for parents in Bangladesh. You specialize in child health concerns in the context of Bangladesh's climate, endemic diseases (dengue, typhoid, cholera), and available healthcare resources.

When a parent describes their child's symptoms, you must respond ONLY with a valid JSON object in this exact format:
{
  "riskLevel": "low" | "moderate" | "high",
  "riskPercent": <number 0-100>,
  "condition": "<brief condition name in English>",
  "advice": ["<action 1>", "<action 2>", "<action 3>"],
  "warning": "<when to seek immediate care>",
  "reassurance": "<one warm, reassuring sentence for the parent>"
}

Rules:
- riskLevel "high" only for serious symptoms: high fever >103°F, difficulty breathing, severe dehydration, seizures, unconsciousness, or symptoms lasting >5 days
- riskLevel "moderate" for: fever <103°F, persistent cough, vomiting/diarrhea, rash with fever
- riskLevel "low" for: mild cold, minor cough, normal teething, minor skin issues
- advice should be practical actions a parent in Dhaka can realistically take
- warning should be specific and clear about when to go to a doctor
- Be aware of seasonal risks: dengue in monsoon, diarrhea in summer, respiratory infections in winter
- Respond ONLY with valid JSON. No markdown. No explanation outside the JSON.`;

const SYSTEM_PROMPT_BN = `আপনি SHISHU SHIELD-এর AI স্বাস্থ্য সহকারী — বাংলাদেশের অভিভাবকদের জন্য একজন উষ্ণ, বিশেষজ্ঞ শিশু স্বাস্থ্য পরামর্শদাতা। আপনি বাংলাদেশের জলবায়ু, স্থানীয় রোগ (ডেঙ্গু, টাইফয়েড, কলেরা) এবং স্বাস্থ্যসেবার প্রেক্ষাপটে শিশু স্বাস্থ্য সমস্যায় বিশেষজ্ঞ।

যখন একজন অভিভাবক তাদের শিশুর উপসর্গ বর্ণনা করেন, আপনাকে অবশ্যই শুধুমাত্র এই সঠিক বাংলা ফরম্যাটে একটি বৈধ JSON অবজেক্ট দিয়ে উত্তর দিতে হবে:
{
  "riskLevel": "low" | "moderate" | "high",
  "riskPercent": <সংখ্যা ০-১০০>,
  "condition": "<বাংলায় সংক্ষিপ্ত অবস্থার নাম>",
  "advice": ["<পরামর্শ ১>", "<পরামর্শ ২>", "<পরামর্শ ৩>"],
  "warning": "<কখন ডাক্তার দেখাতে হবে>",
  "reassurance": "<অভিভাবকের জন্য একটি উষ্ণ, আশ্বস্তকারী বাক্য>"
}

নিয়মাবলী:
- condition, advice, warning এবং reassurance — সবকিছু অবশ্যই বাংলায় লিখতে হবে
- riskLevel "high" শুধুমাত্র গুরুতর লক্ষণের জন্য: উচ্চ জ্বর >১০৩°F, শ্বাসকষ্ট, তীব্র পানিশূন্যতা, খিঁচুনি, অজ্ঞানতা, বা ৫ দিনের বেশি উপসর্গ
- riskLevel "moderate" এর জন্য: <১০৩°F জ্বর, দীর্ঘস্থায়ী কাশি, বমি/ডায়রিয়া, জ্বরসহ ফুসকুড়ি
- riskLevel "low" এর জন্য: হালকা সর্দি, সামান্য কাশি, দাঁত ওঠা, সামান্য ত্বকের সমস্যা
- পরামর্শ অবশ্যই ঢাকার একজন অভিভাবকের পক্ষে বাস্তবে করা সম্ভব এমন হতে হবে
- শুধুমাত্র বৈধ JSON দিয়ে উত্তর দিন। কোনো মার্কডাউন নয়। JSON-এর বাইরে কোনো ব্যাখ্যা নয়।`;

router.post("/symptoms/analyze", async (req, res) => {
  const parsed = AnalyzeRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { messages, childAge, language } = parsed.data;

  const basePrompt = language === "bn" ? SYSTEM_PROMPT_BN : SYSTEM_PROMPT_EN;
  const systemContent = childAge
    ? `${basePrompt}\n\n${language === "bn" ? "শিশুর বয়স:" : "Child's age:"} ${childAge}`
    : basePrompt;

  const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: systemContent,
    },
    ...messages,
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages: chatMessages,
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, full: fullResponse })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "OpenAI symptom analysis failed");
    res.write(`data: ${JSON.stringify({ error: "AI analysis failed. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;
