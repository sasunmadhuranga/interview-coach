import { createSession, addAnswer, getSession, completeSession, updateTopicStats } from "../lib/sessionRepo.js"
import { generateQuestionAI, evaluateAnswerAI } from "./aiService.js"

export const startInterview = async (userId: string, role: string) => {
  const sessionId = await createSession(userId, role as any)

  let question = "Explain blue green deployment."

  try {
    question = await generateQuestionAI(role)
  } catch (e) {
    console.log("AI question generation failed:", e)
  }

  return { sessionId, question }
}

export const processAnswer = async (
  userId: string,
  sessionId: string,
  role: string,
  question: string,
  answer: string
) => {
  if (!sessionId) {
    throw new Error("sessionId required")
  }

  const finalSessionId = sessionId

  const session = await getSession(userId, finalSessionId)

  if (!session) {
    throw new Error("Session not found")
  }

  if (session.status === "COMPLETED") {
    return {
      completed: true,
      message: "Interview already completed."
    }
  }

  let result = {
    score: 5,
    feedback: "Answer received. AI unavailable.",
    topic: "General"
  }

  try {
    const aiResult = await evaluateAnswerAI(question, answer, role)

    if (aiResult) {
      result = {
        score: Math.max(1, Math.min(10, Number(aiResult.score) || 5)),
        feedback: aiResult.feedback ?? "Good attempt",
        topic: aiResult.topic ?? "General"
      }
    }
  } catch (e) {
    console.log(e)
  }

  await addAnswer(userId, finalSessionId, {
    question,
    answer,
    score: result.score,
    feedback: result.feedback,
    topic: result.topic,
    createdAt: new Date().toISOString()
  })

  try {
    await updateTopicStats(userId, finalSessionId, result.topic, result.score)
  } catch (e) {
    console.error("Topic stats failed:", e)
  }

  const newCount = (session.questionCount || 0) + 1

  if (newCount >= 10) {
    await completeSession(userId, finalSessionId)

    return {
      ...result,
      completed: true,
      message: "Interview completed."
    }
  }

  const nextQuestion = await generateQuestionAI(role)

  return {
    ...result,
    nextQuestion,
    sessionId: finalSessionId,
    completed: false
  }
}