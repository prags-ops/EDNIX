import express from "express";
import { executeCode } from "../controllers/codeController";

const router = express.Router();

router.post("/execute", executeCode);

export default router;
