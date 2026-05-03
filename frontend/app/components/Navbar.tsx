"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import Login from "./Login"
import SignUp from "./SignUp"
import { useUser } from "@/context/UserContext"

export default function Navbar() {
  const { user, logout, loading } = useUser()
  const [activeModal, setActiveModal] = useState<"login" | "signup" | null>(null)

  useEffect(() => {
    document.body.style.overflow = activeModal ? "hidden" : "auto"
  }, [activeModal])

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/60
        border-b border-gray-200 dark:border-gray-800
        flex items-center justify-between px-6 md:px-10 py-3">

          <Link
            href="/"
            className="font-bold text-xl text-gray-900 dark:text-white"
          >
            InterviewCoach
          </Link>

          <div>
            {loading ? null : user ? (
              <div className="flex gap-6 items-center">

                <Link
                  href="/dashboard"
                  className="text-gray-700 dark:text-gray-300 
                  hover:text-black dark:hover:text-white"
                >
                  Dashboard
                </Link>

                <Link
                  href="/role"
                  className="text-gray-700 dark:text-gray-300 
                  hover:text-black dark:hover:text-white"
                >
                  Role
                </Link>

                <Link
                  href=""
                  className="text-gray-700 dark:text-gray-300 
                  hover:text-black dark:hover:text-white"
                >
                  Profile
                </Link>

                <button
                  onClick={logout}
                  className="text-indigo-700 dark:text-indigo-400 
                  hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Logout
                </button>

              </div>
            ) : (
              <div className="flex gap-8">

                <button
                  onClick={() => setActiveModal("login")}
                  className="text-blue-700 dark:text-blue-400 
                  hover:text-blue-900 dark:hover:text-blue-300"
                >
                  Login
                </button>

                <button
                  onClick={() => setActiveModal("signup")}
                  className="text-blue-700 dark:text-blue-400 
                  hover:text-blue-900 dark:hover:text-blue-300"
                >
                  Sign Up
                </button>

              </div>
            )}
          </div>
        </nav>

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
    </>
  )
}