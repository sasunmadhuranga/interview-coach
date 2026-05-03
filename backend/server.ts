import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import express from "express";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js"

const app = express();

/* ---------- SECURITY ---------- */
app.disable("x-powered-by");

const allowedOrigins = [
  "http://localhost:3000",
  "http://172.26.80.1:3000",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ---------- ROUTES ---------- */
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))
app.use("/api/users", userRoutes);
app.use("/api/interview", interviewRoutes)
app.get("/", (req: Request, res: Response) => {
  res.send("API is running 🚀");
});


/* ---------- ERROR HANDLER ---------- */
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
};

app.use(errorHandler);


/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});