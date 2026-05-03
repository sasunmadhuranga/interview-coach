//frontend/app/login/page.tsx
"use client";

import Login from "@/app/components/Login";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Login
        onClose={() => {}}
        onSwitchToSignUp={() => {}}
      />
    </div>
  );
}