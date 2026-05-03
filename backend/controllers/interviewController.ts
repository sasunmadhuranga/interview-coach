//backend/controllers/interviewController.ts
import type { Request, Response } from "express"
import { startInterview, processAnswer } from "../services/interviewService.js"
import { QueryCommand } from "@aws-sdk/lib-dynamodb"
import { dynamo } from "../lib/dynamodb.js"
import { createSession } from "../lib/sessionRepo.js"
import { generateQuestionAI } from "../services/aiService.js"

/* ---------- START SESSION ---------- */
export const startSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.email
    const { role } = req.body

    const sessionId = await createSession(userId, role)

    const question = await generateQuestionAI(role)

    res.json({
      sessionId,
      question
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to start session" })
  }
}

export const getQuestion = async (req: Request, res: Response) => {
  try {
    const { role } = req.body

    // TEMP: simple mock (replace with LLM later)
    const questions: any = {
      DevOps: "Explain CI/CD pipeline.",
      Cloud: "What is AWS Lambda?",
      SRE: "What is error budget?",
    }

    const question =
      questions[role as keyof typeof questions] ||
      "Explain your role basics."

    res.json({ question })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to generate question" })
  }
}

/* ---------- ANSWER QUESTION ---------- */
export const answerQuestion = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.email
    const { sessionId, role, question, answer } = req.body

    const data = await processAnswer(
      userId,
      sessionId,
      role,
      question,
      answer
    )

    res.json({
      ...data,
      sessionId // ✅ FIXED: return the same sessionId
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to process answer" })
  }
}

/* ---------- GET SESSIONS ---------- */
export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.email


    const result = await dynamo.send(
      new QueryCommand({
        TableName: "InterviewSessions",
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: {
          ":u": userId,
        },
        ScanIndexForward: false,
      })
    )

    const sessions = result.Items?.map((s) => ({
      ...s,
      averageScore:
        s.questionCount > 0
          ? Number((s.totalScore / s.questionCount).toFixed(2))
          : 0
    }))

    res.json(sessions || [])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch sessions" })
  }
}

