import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../config/config.js";
import { findUserByEmail } from "../lib/userRepo.js";

interface AppJwtPayload {
  email: string;
  tokenVersion: number;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AppJwtPayload;
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      req.cookies?.token ||
      (typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    // ✅ runtime validation (IMPORTANT)
    if (
      typeof payload.email !== "string" ||
      typeof payload.tokenVersion !== "number"
    ) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const jwt: AppJwtPayload = {
      email: payload.email,
      tokenVersion: payload.tokenVersion,
    };

    const dbUser = await findUserByEmail(jwt.email);

    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (jwt.tokenVersion !== dbUser.tokenVersion) {
      return res.status(401).json({ message: "Session expired" });
    }

    req.user = jwt;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};