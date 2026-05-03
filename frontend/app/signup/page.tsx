//frontend/app/signup/page.tsx
"use client";

import SignUp from "@/app/components/SignUp";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        onClose={() => {}}
        onSwitchToLogin={() => {}}
      />
    </div>
  );
}