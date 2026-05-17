import express from "express";
import multer from "multer";
import { handleAiRequest } from "../controllers/aiController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/ask", upload.array("files"), handleAiRequest);

export default router;
