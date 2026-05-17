import express from "express";
import { updateProgress, getProgress } from "../controllers/progress";

const router = express.Router();

router.post("/update", updateProgress);
router.get("/:userId", getProgress);

export default router;
