// backend/services/aiService.ts
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
})

const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "qwen/qwen3-32b"
]

// ---------- CORE CALL (with fallback) ----------
const callModel = async (
  prompt: string,
  json = false
) => {
  for (const model of MODELS) {
    try {
      const res = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        ...(json && {
          response_format: { type: "json_object" }
        })
      })

      return res.choices[0]?.message?.content?.trim()
    } catch (err: any) {
      console.log(`${model} failed:`, err?.message)
    }
  }

  return null
}

// ---------- QUESTION ----------
export const generateQuestionAI = async (role: string) => {
  const prompt = `
    You are a senior ${role} interviewer.

    Ask ONE realistic technical interview question for ${role}
    about AWS, CI/CD, Kubernetes, monitoring, incidents, or automation.

    Mix difficulty.
    Keep under 25 words.
    Return only the question.
    `

  const res = await callModel(prompt, false)

  return (
    res ||
    "Explain a production issue you solved in your last system."
  )
}

// ---------- EVALUATION ----------
export const evaluateAnswerAI = async (
  question: string,
  answer: string,
  role: string
) => {
  const prompt = `
You are a strict ${role} interviewer.

Question: ${question}
Answer: ${answer}

Return JSON:
{
  "score": 1-10,
  "feedback": "short practical feedback",
  "topic": "AWS | Kubernetes | CI/CD | Monitoring | Incident Response | Linux | Terraform"
}
`

  const res = await callModel(prompt, true)

  if (!res) {
    return {
      score: 5,
      feedback: "AI service unavailable.",
    }
  }

  try {
    return JSON.parse(res)
  } catch {
    return {
      score: 5,
      feedback: "Could not evaluate properly.",
    }
  }
}