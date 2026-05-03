"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function ResetPassword() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!API_URL) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
    }

    try {
      const res = await axios.post(`${API_URL}/api/users/reset-password`, {
        token,
        newPassword: password,
      });

      setMessage(res.data.message);

      // redirect AFTER success
      setTimeout(() => {
        router.push("/login");
      }, 1000);

    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <h2 className="text-xl font-semibold text-center">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New password"
          className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-800 rounded-lg text-white px-4 py-2 cursor-pointer"
        >
          Reset Password
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}