import { GoogleGenAI } from "@google/genai";

// ⚠️ Frontend exposure of API key is unsafe; for production, use a server proxy
const GEMINI_API_KEY =  import.meta.env.VITE_GEMINI_API_KEY;

export async function generateRoadmap(goal, duration) {
  const prompt = `
You are a personal growth planner.
Goal: "${goal}"
Time available: ${duration} days.
Break this goal into 3-5 milestones.
For each milestone, give:
- milestone title
- start and end dates (YYYY-MM-DD)
- 3-5 subtasks with title and deadline (between milestone start and end)
Return JSON in this exact format:
{
  "milestones": [
    {
      "milestoneTitle": "...",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "subtasks": [
        {"name": "...", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}
      ]
    }
  ]
}
`;

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ type: "text", text: prompt }],
      maxOutputTokens: 800,
    });

    console.log("Gemini raw response:", res);

    const candidate = res?.candidates?.[0];
    if (!candidate) return [];

    let outputText = "";

    // Access nested parts array
    if (candidate.content?.parts && Array.isArray(candidate.content.parts)) {
      outputText = candidate.content.parts.map((p) => p.text || "").join("\n").trim();
    } else if (candidate.content?.text) {
      outputText = candidate.content.text.trim();
    }

    if (!outputText) {
      console.error("No text returned from Gemini API candidate", candidate);
      return [];
    }

    // Extract JSON safely
    const jsonStart = outputText.indexOf("{");
    const jsonEnd = outputText.lastIndexOf("}") + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Could not find JSON in Gemini response:", outputText);
      return [];
    }

    const jsonString = outputText.slice(jsonStart, jsonEnd);
    const roadmap = JSON.parse(jsonString);

    // Flatten subtasks
    const subtasks = [];
    roadmap.milestones.forEach((m) =>
      m.subtasks.forEach((s) => subtasks.push({ ...s, completed: false }))
    );

    return subtasks;
  } catch (err) {
    console.error("Gemini API error:", err);
    return [];
  }
}