import express from "express";
import { processInput } from "../controllers/processInputController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, processInput);

export default router;
