import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";

dotenv.config();

// Routes
import aiRoutes from "./server/routes/aiRoutes";
import authRoutes from "./server/routes/authRoutes";
import progressRoutes from "./server/routes/progressRoutes";
import codeRoutes from "./server/routes/codeRoutes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());


  // MongoDB Connection (Optional but recommended if URI is provided)
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    mongoose
      .connect(mongoUri)
      .then(() => console.log("Connected to MongoDB"))
      .catch((err) => console.error("MongoDB connection error:", err));
  } else {
    console.warn("MONGO_URI not found in environment variables. Database features may be limited.");
  }

  // API Routes
  app.use("/api/ai", aiRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/code", codeRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      geminiKeySet: !!process.env.GEMINI_API_KEY,
      groqKeySet: !!process.env.GROQ_API_KEY,
      mongoUriSet: !!process.env.MONGO_URI
    });
  });

  app.get("/api/test-ai", async (req, res) => {
    try {
      const { askAI } = await import("./server/services/aiService");
      const response = await askAI("Say hello world");
      res.json({ success: true, response });
    } catch (error: any) {
      res.json({ success: false, error: error.message });
    }
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    console.error("Centralized Error Handler 🚨:", {
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
    });

    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: "0.0.0.0",
        port: 3000
      },
      appType: "spa",
      root: path.resolve(process.cwd())
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
