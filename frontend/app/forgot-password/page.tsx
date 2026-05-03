"use client";

import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/api/users/forgot-password`,
        { email }
      );

      setMessage(res.data.message);
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <h2 className="text-xl font-semibold text-center">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-800 rounded-lg text-white px-4 py-2 cursor-pointer"
        >
          Send Reset Link
        </button>

        {message && <p className="text-center">{message}</p>}
      </form>
    </div>
  );
}