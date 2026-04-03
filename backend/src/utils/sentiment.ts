type Sentiment = {
  label: "frustrated" | "angry" | "sad" | "neutral" | "happy";
  emoji: string;
};

const normalize = (value: unknown): string => String(value ?? "").toLowerCase();

export function inferSentiment(message: string): Sentiment {
  const text = normalize(message);
  if (!text) return { label: "neutral", emoji: "😐" };

  if (/(furious|angry|rage|outrage|scam|fraud)/.test(text)) {
    return { label: "angry", emoji: "😡" };
  }
  if (/(frustrat|irritat|annoy|upset|fed up|tired of|sick of)/.test(text)) {
    return { label: "frustrated", emoji: "😤" };
  }
  if (/(sad|disappointed|unhappy|let down)/.test(text)) {
    return { label: "sad", emoji: "😞" };
  }
  if (/(thank|great|awesome|love|happy|excellent)/.test(text)) {
    return { label: "happy", emoji: "😊" };
  }

  return { label: "neutral", emoji: "😐" };
}
