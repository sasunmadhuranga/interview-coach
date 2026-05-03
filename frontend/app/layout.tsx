// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "../context/UserContext";
import Navbar from "./components/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google"; // ✅ import provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flight Deals App",
  description: "Compare and book cheapest flights worldwide",
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""; 

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> {/* ✅ wrap with GoogleOAuthProvider */}
          <UserProvider>
            <Navbar />
            {children}
          </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}