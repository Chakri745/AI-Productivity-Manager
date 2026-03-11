// backend/src/services/geminiClient.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createHash } from "crypto";
import { config } from "../config";

let genAI: GoogleGenerativeAI | null = null;


function getGenAI() {
  if (!genAI && config.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  }
  return genAI;
}

export async function askGemini(prompt: string, options?: { jsonMode?: boolean }): Promise<string | null> {
  const client = getGenAI();
  if (!client) {
    console.error("Gemini client not initialized - missing API key");
    return null;
  }

  try {
    // ✅ Use the working model name
    const model = client.getGenerativeModel({
      model: "models/gemini-flash-latest",  // ← CHANGED THIS LINE
      generationConfig: options?.jsonMode ? {
        responseMimeType: "application/json",
        temperature: 0.2
      } : {
        temperature: 0.7
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response?.text();

    if (!text) throw new Error("Empty Gemini response");
    return text;
  } catch (err: any) {
    console.error("Gemini API Error:", err.message);
    return null;
  }
}

// Simple deterministic embedding (mock) for hackathons
// In production, use meaningful embeddings (e.g. text-embedding-004 via Gemini)
export function localEmbedding(text: string): number[] {
  const hash = createHash('sha256').update(text).digest('hex');
  // Convert hash to a vector of 32 numbers (0-255)
  const vector: number[] = [];
  for (let i = 0; i < hash.length; i += 2) {
    vector.push(parseInt(hash.substring(i, i + 2), 16));
  }
  return vector;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}