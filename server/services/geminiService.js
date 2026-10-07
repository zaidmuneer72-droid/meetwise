const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function analyzeTranscript(transcript) {
  const prompt = `
You are an AI meeting assistant for an application called Meetwise.

Analyze the following meeting transcript.

Return ONLY valid JSON in exactly this structure:

{
  "summary": "string",
  "actionItems": [
    {
      "task": "string",
      "owner": "string or null",
      "deadline": "string or null"
    }
  ],
  "decisions": ["string"]
}

Rules:
- Keep the summary concise and factual.
- Do not invent information.
- Only include an owner if the transcript clearly identifies who is responsible.
- Only include a deadline if it is explicitly mentioned.
- If the owner is unknown, use null.
- If the deadline is unknown, use null.
- Suggestions or questions are NOT decisions.
- If there are no action items, return an empty array.
- If there are no decisions, return an empty array.

Meeting transcript:
${transcript}
`;
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      // Ask for raw JSON (no ```json fences) and keep the answer steady
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });
  return response.text;
}

module.exports = { analyzeTranscript };