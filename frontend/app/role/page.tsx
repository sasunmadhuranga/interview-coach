"use client";

import { useRouter } from "next/navigation";

export default function RolePage() {
  const router = useRouter();

  const selectRole = (role: string) => {
    router.push(`/interview?role=${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6
      bg-gradient-to-br from-gray-100 via-white to-gray-200
      dark:from-gray-900 dark:via-black dark:to-gray-950">

      <div className="w-full max-w-xl text-center">

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Choose Your Role
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Select your interview domain to start practicing
        </p>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5
          border border-gray-200 dark:border-gray-800
          shadow-xl rounded-2xl p-8">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {["DevOps", "Cloud", "SRE"].map((role) => (
              <button
                key={role}
                onClick={() => selectRole(role)}
                className="group relative px-6 py-5 rounded-xl
                border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-900
                text-gray-800 dark:text-gray-200
                hover:border-blue-500 dark:hover:border-blue-400
                hover:shadow-lg transition-all duration-200
                hover:scale-[1.03] active:scale-95"
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition
                  bg-gradient-to-r from-blue-500/10 to-indigo-500/10" />

                <span className="relative font-semibold text-lg">
                  {role}
                </span>
              </button>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}