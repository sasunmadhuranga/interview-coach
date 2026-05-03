//frontend/app/page.tsx
"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Login from "@/app/components/Login"
import SignUp from "@/app/components/SignUp"

export default function Home() {
  const router = useRouter()
  const [activeModal, setActiveModal] =
    useState<null | "login" | "signup">(null)

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden
      bg-gradient-to-br from-gray-100 via-white to-gray-200
      dark:from-gray-900 dark:via-black dark:to-gray-950">

      {/* MODALS (✅ MUST BE INSIDE RETURN) */}
      {activeModal === "login" && (
        <Login
          onClose={() => setActiveModal(null)}
          onSwitchToSignUp={() => setActiveModal("signup")}
        />
      )}

      {activeModal === "signup" && (
        <SignUp
          onClose={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal("login")}
        />
      )}

      {/* 🔵 Background Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-purple-500/30 rounded-full blur-3xl" />

      {/* 🧠 Content */}
      <div className="text-center max-w-2xl z-10">

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight
          text-gray-900 dark:text-white">
          Ace Your Interviews 🚀
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Practice with AI, get real feedback, and track your improvement like a pro.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-12">

          <button
            onClick={() => setActiveModal("signup")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 
            hover:from-blue-700 hover:to-indigo-700 text-white 
            rounded-xl shadow-lg transition transform hover:scale-105"
          >
            Get Started
          </button>

          <button
            onClick={() => setActiveModal("login")}
            className="px-8 py-3 border border-gray-300 dark:border-gray-700 
            text-gray-800 dark:text-gray-200 rounded-xl 
            hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Login
          </button>

        </div>

        {/* 📊 Feature Preview Card */}
        <div className="backdrop-blur-lg bg-white/70 dark:bg-white/5 
          border border-gray-200 dark:border-gray-800 
          shadow-xl rounded-2xl p-6 text-left">

          <p className="text-sm text-gray-500 mb-2">Latest Session</p>

          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
            Frontend Developer Interview
          </h3>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-green-600">8.5 / 10</span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded">
              <div className="h-2 bg-green-500 rounded w-[85%]" />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Strong fundamentals. Improve system design answers.
          </p>
        </div>

      </div>
    </main>
  )
}