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
});

const SYSTEM_PROMPT = `You are SHISHU SHIELD's AI Health Assistant — a warm, expert pediatric health advisor for parents in Bangladesh. You specialize in child health concerns in the context of Bangladesh's climate, endemic diseases (dengue, typhoid, cholera), and available healthcare resources.

When a parent describes their child's symptoms, you must respond ONLY with a valid JSON object in this exact format:
{
  "riskLevel": "low" | "moderate" | "high",
  "riskPercent": <number 0-100>,
  "condition": "<brief condition name>",
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

router.post("/symptoms/analyze", async (req, res) => {
  const parsed = AnalyzeRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { messages, childAge } = parsed.data;

  const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: childAge
        ? `${SYSTEM_PROMPT}\n\nChild's age: ${childAge}`
        : SYSTEM_PROMPT,
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
