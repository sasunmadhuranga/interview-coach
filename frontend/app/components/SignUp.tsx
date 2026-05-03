import { useUser } from "@/context/UserContext";
import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from "next/navigation";

type SignUpProps = {
  onClose: () => void;
  onSwitchToLogin: () => void;
};

export default function SignUp({ onClose, onSwitchToLogin }: SignUpProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasLength = password.length >= 8;
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }

    if (!strongPasswordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters, include 1 uppercase letter and 1 number"
      );
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    if (displayName.length < 3) {
      setError("Display name must be at least 3 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/api/users/signup`,
        { 
          displayName: displayName.trim(),
          email: email.trim(),
          password
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setUser(res.data.user);
      onClose();
      router.push("/role");if (res.data.isNewUser) {
        router.push("/role");
      } else {
        router.push("/dashboard");
      }

    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Request failed");
        } else {
          setError("Unexpected error occurred");
        }
      } finally {
      setLoading(false); 
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    const googleToken = response.credential; // Get the token

    try {
      const res = await axios.post(
        `${API_URL}/api/users/google-auth`,
        { token: googleToken },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setUser(res.data.user);
      onClose();
      if (res.data.isNewUser) {
        router.push("/role");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Request failed");
      } else {
        setError("Unexpected error occurred");
      }
    }
  };

 const handleGoogleFailure = () => {
    console.error("Google Sign-In Error");
    setError("Google sign-in failed");
  };

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md relative"
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-200 hover:text-black dark:hover:text-gray-200 cursor-pointer"
        >
          ✕
        </button>

        <h3 className="font-semibold text-2xl text-gray-700 dark:text-gray-200 text-center mb-6">
          Sign Up
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter display name"
            value={displayName}
            disabled={loading}
            onChange={(e) => setDisplayName(e.currentTarget.value)}
            className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            disabled={loading}
            aria-label="Email"
            onChange={(e) => setEmail(e.currentTarget.value)}
            className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="w-full border border-gray-400 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              👁️
            </button>
          </div>
          {password.length > 0 && (
          <div className="flex gap-1 mt-1">
            <div className={`h-1 flex-1 rounded ${hasLength ? "bg-green-500" : "bg-gray-300"}`} />
            <div className={`h-1 flex-1 rounded ${hasUppercase ? "bg-green-500" : "bg-gray-300"}`} />
            <div className={`h-1 flex-1 rounded ${hasNumber ? "bg-green-500" : "bg-gray-300"}`} />
          </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 mt-2 bg-blue-600 hover:bg-blue-800 text-white dark:text-gray-200 text-center rounded-lg disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
  
        </form>

        <div className="flex flex-col gap-3">
          <p className="text-center mt-2">or</p>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            text="signup_with"
            size="large"
            shape="rectangular"
            containerProps={{ className: "w-full flex justify-center" }}
          />
        </div>

        <p className="text-center mt-3">
          Have an account?{" "}
          <span
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}