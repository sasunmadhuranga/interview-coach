//frontend/app/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([])
  const [openSession, setOpenSession] = useState<string | null>(null)
  const [visibleAnswers, setVisibleAnswers] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)

  const API = process.env.NEXT_PUBLIC_API_BASE_URL

  const totalSessions = sessions.length

  const avgScore =
    sessions.length > 0
      ? sessions.reduce((acc, s) => {
          const sessionAvg = s.questions?.length
            ? s.totalScore / s.questions.length
            : 0
          return acc + sessionAvg
        }, 0) / sessions.length
      : 0

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(`${API}/api/interview/sessions`, {
          withCredentials: true,
        })

        const filtered = res.data.filter(
          (s: any) => (s.questionCount ?? 0) > 0
        )

        setSessions(filtered)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [API])

  const toggleAnswer = (key: string) => {
    setVisibleAnswers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (loading) {
    return (
      <div className="p-10 text-gray-500 dark:text-gray-300">
        Loading dashboard...
      </div>
    )
  }

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return (
    <div className="min-h-screen mx-w-6xl px-6 py-10 bg-gray-100 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Your Performance
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">

      {/* Sessions */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800 shadow-sm">

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total Sessions
        </p>

        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {totalSessions}
        </p>
      </div>

      {/* Avg Score */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800 shadow-sm">

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Average Score
        </p>

        <p className="text-2xl font-bold text-green-600">
          {avgScore.toFixed(1)} / 10
        </p>
      </div>

      {/* Optional: Performance Badge */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800 shadow-sm">

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Performance
        </p>

        <p className="text-2xl font-bold text-indigo-600">
          {avgScore > 7 ? "Strong 💪" : avgScore > 5 ? "Good 👍" : "Needs Work 📈"}
        </p>
      </div>

    </div>

      {/* Sessions */}
      <div className="space-y-4">

        {sessions.map((s) => {
          const isOpen = openSession === s.sessionId

          return (
            <div
              key={s.sessionId}
              className="bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-800
              rounded-2xl shadow-sm"
            >

              {/* HEADER */}
              <div
                onClick={() =>
                  setOpenSession(isOpen ? null : s.sessionId)
                }
                className="p-5 flex justify-between items-center cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {s.role}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {s.questions?.length ?? 0} Questions • Avg{" "}
                    {(s.totalScore / (s.questions?.length || 1)).toFixed(2)}
                  </p>
                </div>

                <span className="text-gray-400">
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* DETAILS */}
              {isOpen && (
                <div className="border-t border-gray-200 dark:border-gray-800 p-5 space-y-4">

                  {(s.questions ?? []).map((q: any, i: number) => {
                    const key = `${s.sessionId}-${i}`
                    const show = visibleAnswers[key]

                    return (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800"
                      >

                        {/* Question */}
                        <p className="font-medium text-gray-900 dark:text-white">
                          Q: {q.question}
                        </p>

                        {/* Toggle button */}
                        <button
                          onClick={() => toggleAnswer(key)}
                          className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {show ? "Hide Answer" : "Show Answer"}
                        </button>

                        {/* Answer */}
                        {show && q.answer && (
                          <div className="mt-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Your Answer:</span>{" "}
                            {q.answer}
                          </div>
                        )}

                        {/* Score */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {q.score}/10
                          </span>

                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded">
                            <div
                              className="h-2 bg-green-500 rounded"
                              style={{ width: `${q.score * 10}%` }}
                            />
                          </div>
                        </div>

                        {/* Feedback */}
                        {q.feedback && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {q.feedback}
                          </p>
                        )}

                      </div>
                    )
                  })}

                </div>
              )}

            </div>
          )
        })}

      </div>
      </div>
    </div>
  )
}