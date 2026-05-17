import { Request, Response, NextFunction } from "express";
import { askAI } from "../services/aiService";
import { createRequire } from "module";
import { addVectors, searchVectors, addAcademicLog, getAcademicContext } from "../services/vectorService";
import { catchAsync, AppError } from "../utils/appError";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

interface AiRequestBody {
  prompt: string;
  type?: string;
  chatHistory?: string;
  humanLanguage?: string;
  learningMode?: string;
  topic?: string;
}

export const handleAiRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { prompt, type, chatHistory, humanLanguage, learningMode, topic } = req.body as AiRequestBody;
  
  if (!prompt) {
    return next(new AppError("Prompt is required", 400));
  }

  let context = chatHistory || "";

  // 1. Adaptive Memory Retrieval
  if (type === "tutor") {
    const academicContext = await getAcademicContext(prompt);
    if (academicContext) {
      context = `${academicContext}\n\n${context}`;
    }
  }

  // 2. Semantic Memory Retrieval (General)
  const semanticContext = await searchVectors(prompt);
  if (semanticContext) {
    context = `RELEVANT KNOWLEDGE RETRIEVED:\n${semanticContext}\n\n${context}`;
  }

  // Handle file uploads if any
  const files = req.files as any[] | undefined;
  if (files && files.length > 0) {
    const fileTexts = await Promise.all(
      files.map(async (file: any) => {
        let text = "";
        if (file.mimetype === "application/pdf") {
          const data = await pdf(file.buffer);
          text = data.text;
        } else {
          text = file.buffer.toString();
        }
        
        // Index this file content for Vector Memory
        const chunks = text.match(/[\s\S]{1,1000}/g) || [];
        await addVectors(chunks, { source: file.originalname });
        
        return `Content from ${file.originalname}: ${text.substring(0, 5000)}...`; 
      })
    );
    context += "\n\nNew Files Uploaded Context:\n" + fileTexts.join("\n\n");
  }

  const result = await askAI(
    `${prompt}${humanLanguage ? ` (Please respond in ${humanLanguage})` : ""}`,
    type || "general",
    context,
    learningMode || "learn"
  );
  
  // 3. Adaptive Memory Logging
  if (type === "viva-continue") {
    const keywordsMatch = result.match(/- Missing Keywords:\s*(.*)/i);
    const gapMatch = result.match(/- Reality Gap:\s*(.*)/i);
    const scoreMatch = result.match(/- Score:\s*(\d+)/i);
    
    if (keywordsMatch || gapMatch) {
       const performance = {
          score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
          keywords: keywordsMatch ? keywordsMatch[1] : "",
          gap: gapMatch ? gapMatch[1] : ""
       };
       await addAcademicLog(topic || "Computer Science", `Mistake/Gap: ${performance.gap}. Missing keywords: ${performance.keywords}`, performance);
    }
  }

  // Store this interaction for semantic future use
  if (type !== "viva-recovery" && type !== "explain-mistake" && type !== "summarize-title") {
    await addVectors([`User asked: ${prompt}`, `AI answered: ${result}`], { role: "interaction" });
  }
  
  res.json({ success: true, data: result });
});
