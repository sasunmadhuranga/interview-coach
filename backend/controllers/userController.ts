// controllers/userController.ts
import type { Request, Response } from "express"; 
import expressPkg from "express";                 
const express = expressPkg;
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";         
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.js";
import { OAuth2Client } from "google-auth-library";
import { findUserByEmail, createUser } from "../lib/userRepo.js";


export const signup = async (req: Request, res: Response) => {
  try {
    const { displayName, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(400).json({ message: "Signup failed" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email: normalizedEmail,
      displayName,
      password: hashedPassword,
      tokenVersion: 0,
      createdAt: new Date().toISOString(),
    };

    await createUser(newUser);

    const token = await new SignJWT({
      email: normalizedEmail,
      tokenVersion: 0,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(new TextEncoder().encode(JWT_SECRET));

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        displayName,
        email: normalizedEmail,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const login = async (req: Request, res: Response) => {
  try{
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await findUserByEmail(normalizedEmail);

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = await new SignJWT({
      email: user.email,
      tokenVersion: user.tokenVersion,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(new TextEncoder().encode(JWT_SECRET));

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true only in HTTPS (production)
      sameSite: "none", // 🔥 REQUIRED for cross-origin
    });

    return res.json({
      message: "Login successful",
      user: {
        email: user.email,
        displayName: user.displayName,
      },
    });
    }
    catch(err){
      return res.status(500).json({ message: "Server error" });
    }
};

export const googleAuth = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const displayName = payload.name || "User";

    let user = await findUserByEmail(email);

    if (!user) {
      user = {
        email,
        displayName,
        googleId,
        tokenVersion: 0,
        createdAt: new Date().toISOString(),
      };

      await createUser(user);
    }

    // ✅ FIXED JWT (same structure as login/signup)
    const tokenJWT = await new SignJWT({
      email: user.email,
      tokenVersion: user.tokenVersion ?? 0,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(new TextEncoder().encode(JWT_SECRET));

    res.cookie("token", tokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.json({
      user: {
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Google auth failed" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const email = req.user?.email;

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await findUserByEmail(email);

  res.json(user);
};