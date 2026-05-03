import type { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { resend } from "../lib/resend.js";
import { findUserByEmail, updateUser } from "../lib/userRepo.js";

export const resetPassword = async (req: Request, res: Response) => {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await findUserByEmail(req.body.email);

    if (
      !user ||
      user.resetToken !== hashedToken ||
      new Date(user.resetTokenExpiry) < new Date()
    ) {
      await delay(300);
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include 1 uppercase letter and 1 number",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateUser(user.email, {
      password: hashedPassword,
      tokenVersion: (user.tokenVersion || 0) + 1,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return res.json({
      message: "Password reset successful",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};


const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

export const forgotPassword = async (req: Request, res: Response) => {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      await delay(300);
      return res.json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await updateUser(normalizedEmail, {
      resetToken: hashedToken,
      resetTokenExpiry: expiry,
    });

    const resetLink = `${CLIENT_URL}/reset-password?token=${rawToken}`;

    await resend.emails.send({
      from: `LangApp <${process.env.EMAIL_FROM}>`,
      to: normalizedEmail,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <a href="${resetLink}">Reset Password</a>
        <p>Expires in 15 minutes.</p>
      `,
    });

    return res.json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};