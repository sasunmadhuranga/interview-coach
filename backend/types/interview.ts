export type AnswerEntry = {
  question: string
  answer: string
  score: number
  feedback: string
  topic: string
  createdAt: string
}

type InterviewSession = {
  userId: string
  sessionId: string
  status: "ACTIVE" | "COMPLETED"
  questionCount: number
  totalScore: number
  role: string
}

export async function getSession(
  userId: string,
  sessionId: string
): Promise<InterviewSession | null> {
  // TODO: your logic here
  return null;
}