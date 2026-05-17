import { GoogleGenerativeAI } from "@google/generative-ai";
import * as math from "mathjs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export interface VectorEntry {
  id: string;
  text: string;
  embedding: number[];
  metadata: any;
}

// Simple in-memory storage (In a production app, this would be a DB like Pinecone or PGVector)
let vectorStore: VectorEntry[] = [];

export const addVectors = async (texts: string[], metadata: any = {}) => {
  if (!process.env.GEMINI_API_KEY) return;
  
  try {
    for (const text of texts) {
      if (text.length < 10) continue;
      
      const result = await model.embedContent(text.substring(0, 5000));
      const embedding = result.embedding.values;

      vectorStore.push({
        id: Math.random().toString(36).substring(7),
        text,
        embedding,
        metadata
      });
    }
    
    // Keep only last 200 entries to save memory in this environment
    if (vectorStore.length > 200) {
      vectorStore = vectorStore.slice(-200);
    }
  } catch (error) {
    console.error("Vector storage error:", error);
  }
};

export const searchVectors = async (query: string, limit: number = 3): Promise<string> => {
  if (!process.env.GEMINI_API_KEY || vectorStore.length === 0) return "";

  try {
    const result = await model.embedContent(query);
    const queryEmbedding = result.embedding.values;

    const scored = vectorStore.map(entry => {
      // Manual Cosine Similarity: (A · B) / (||A|| * ||B||)
      const dotProduct = math.dot(queryEmbedding, entry.embedding) as number;
      const normA = Math.sqrt(math.dot(queryEmbedding, queryEmbedding) as number);
      const normB = Math.sqrt(math.dot(entry.embedding, entry.embedding) as number);
      const score = dotProduct / (normA * normB);
      return { ...entry, score };
    });

    const topResults = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter(entry => entry.score > 0.7); // Only highly relevant context

    return topResults.map(r => `[Previous Context: ${r.text}]`).join("\n\n");
  } catch (error) {
    console.error("Vector search error:", error);
    return "";
  }
};

export const addAcademicLog = async (topic: string, content: string, performance: any) => {
  const text = `ACADEMIC_LOG: ${topic} - ${content} - Performance: ${JSON.stringify(performance)}`;
  await addVectors([text], { type: "academic_log", topic, timestamp: Date.now(), performance });
};

export const getAcademicContext = async (query: string): Promise<string> => {
  if (!process.env.GEMINI_API_KEY || vectorStore.length === 0) return "";
  
  const results = await searchVectors(query, 5);
  return results ? `STUDENT_HISTORY_CONTEXT:\n${results}` : "";
};
