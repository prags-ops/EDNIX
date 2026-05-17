import { Request, Response } from "express";
import { Progress } from "../models/Progress";

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { userId, module, score, data } = req.body as { userId: string; module: string; score?: number; data?: unknown };
    
    if (!userId || !module) {
      return res.status(400).json({ success: false, message: "User ID and module are required" });
    }

    const progress = new Progress({ userId, module, score, data });
    await progress.save();

    return res.status(201).json({ success: true, message: "Progress updated successfully" });
  } catch (error: any) {
    console.error("Progress Update Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProgress = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const progress = await Progress.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: progress });
  } catch (error: any) {
    console.error("Get Progress Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
