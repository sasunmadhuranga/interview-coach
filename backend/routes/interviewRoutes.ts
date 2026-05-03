import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  startSession,
  answerQuestion,
  getSessions,
  getQuestion
} from "../controllers/interviewController.js"

const router = express.Router()

router.get("/sessions", authMiddleware, getSessions)
router.post("/start", authMiddleware, startSession)
router.post("/answer", authMiddleware, answerQuestion)
router.post("/question", authMiddleware, getQuestion)

export default router