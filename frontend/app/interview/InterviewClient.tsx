//frontend/app/interview/InterviewClient.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

type HistoryItem = {
  type: "question" | "answer" | "feedback";
  text: string;
};

export default function InterviewClient() {
  const params = useSearchParams();
  const role = params.get("role");

  const [sessionId, setSessionId] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const startSession = async () => {
    if (!role) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/api/interview/start`,
        { role },
        { withCredentials: true }
      );

      setSessionId(res.data.sessionId);
      setQuestion(res.data.question);

      setHistory([
        {
          type: "question",
          text: res.data.question,
        },
      ]);
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !sessionId) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/api/interview/answer`,
        {
          sessionId,
          question,
          answer,
          role,
        },
        { withCredentials: true }
      );

      const { score, feedback, nextQuestion } = res.data;

      setScore(score);
      setFeedback(feedback);

      setHistory((prev) => [
        ...prev,
        { type: "answer", text: answer },
        {
          type: "feedback",
          text: `${feedback} (Score: ${score}/10)`,
        },
        {
          type: "question",
          text: nextQuestion,
        },
      ]);

      setQuestion(nextQuestion);
      setAnswer("");
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) startSession();
  }, [role]);

  if (!API) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black flex justify-center px-4 py-10">
      {/* MAIN CARD */}
      <div className="w-full max-w-3xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg text-gray-800 dark:text-gray-200">
              AI Interview Session
            </h1>
            <p className="text-sm text-gray-500">Role: {role}</p>
          </div>

          {loading && (
            <span className="text-sm text-blue-500 animate-pulse">
              Thinking...
            </span>
          )}
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          {history.map((item, i) => (
            <div
              key={i}
              className={`flex ${
                item.type === "answer" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  item.type === "question"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : item.type === "answer"
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100"
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>

        {/* INPUT AREA */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <textarea
            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
          />

          <div className="flex justify-between items-center mt-3">
            <button
              onClick={submitAnswer}
              disabled={loading || !answer.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
            >
              Submit Answer
            </button>

            {score !== null && (
              <span className="text-sm text-green-600 font-semibold">
                Score: {score}/10
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}