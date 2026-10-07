// Turns Gemini's reply into clean data that is safe to save.
// Gemini is asked for JSON only, but a reply can still arrive wrapped in

class AnalysisError extends Error {
  constructor(message) {
    super(message);
    this.name = "AnalysisError";
  }
}

function cleanText(value, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Gemini sometimes writes the word "null" or "unknown" as plain text
function optionalText(value) {
  const cleaned = cleanText(value);

  if (
    !cleaned ||
    /^(null|none|n\/a|unknown|not specified|unspecified)$/i.test(cleaned)
  ) {
    return null;
  }

  return cleaned;
}

function extractJson(reply) {
  if (typeof reply !== "string" || !reply.trim()) {
    throw new AnalysisError("The AI reply was empty");
  }

  let text = reply.trim();

  // Remove ```json ... ``` fences
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) {
    text = fenced[1].trim();
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    // Fall back to the part between the first { and the last }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch (innerError) {
      }
    }
  }

  throw new AnalysisError("The AI reply was not valid JSON");
}

function parseAnalysis(reply) {
  const data = extractJson(reply);

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AnalysisError("The AI reply was not the expected object");
  }

  const actionItems = (Array.isArray(data.actionItems) ? data.actionItems : [])
    .map((item) => {
      if (typeof item === "string") {
        return { task: cleanText(item), owner: null, deadline: null };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      return {
        task: cleanText(item.task),
        owner: optionalText(item.owner),
        deadline: optionalText(item.deadline),
      };
    })
    .filter((item) => item && item.task)
    .map((item) => ({ ...item, completed: false }));

  const decisions = (Array.isArray(data.decisions) ? data.decisions : [])
    .map((decision) => cleanText(decision))
    .filter(Boolean);

  const summary = cleanText(data.summary, 5000);

  if (!summary && actionItems.length === 0 && decisions.length === 0) {
    throw new AnalysisError("The AI reply had no usable content");
  }

  return {
    summary: summary || "No summary was generated for this meeting.",
    actionItems,
    decisions,
  };
}

module.exports = { parseAnalysis, AnalysisError };