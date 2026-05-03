"use client"
import { useUser } from "@/context/UserContext"
import { useEffect, useState } from "react"
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";

type LoginProps = {
  onClose?: () => void
  onSwitchToSignUp?: () => void
}

export default function Login({ onClose, onSwitchToSignUp }: LoginProps) {
  const {setUser} = useUser();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/users/login`,
        { email, password },
        { withCredentials: true }
      );
      const user = res.data.user
      setUser(user);

      setTimeout(() => {
        router.push("/role");
      }, 0);

      onClose?.();
    } catch (err: any) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(email && password){
        setError("")
    }
  }, [email, password])

  const handleGoogleSuccess = async (response: any) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/users/google-auth`,
        { token: response.credential },
        { withCredentials: true }
      );
      const user = res.data.user
      setUser(user);

      setTimeout(() => {
        router.push("/role");
      }, 0);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      onClose?.();
    } catch (err: any) {
      console.error(err);
      setError("Google login failed");
    }
  };

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-xl shadow-lg relative"
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
        >
          ✕
        </button>

        <h3 className="font-semibold text-2xl text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-center mb-6">
          Login
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
          disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-800 rounded-lg text-white dark:text-gray-200 px-4 py-2"
          >
            {loading ? "Signing you in..." : "Login"}
          </button>
        </form>

        <div className="flex flex-col gap-3">
          <p className="text-center mt-2">or</p>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Unable to sign in with Google. Try again.")}
            text="signin_with"
            size="large"
            shape="rectangular"
            containerProps={{ className: "w-full flex justify-center" }}
          />
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <p className="text-center">
            Don't have an account?{" "}
            <span
              onClick={onSwitchToSignUp}
              className="text-blue-700 font-semibold hover:underline cursor-pointer"
            >
              Sign Up
            </span>
          </p>

          <p className="text-center">
            <span
              onClick={() => {
                onClose?.();
                router.push("/forgot-password");
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Forgot password?
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}