import express from "express";
import { signup, login, googleAuth, getMe } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import { forgotPassword, resetPassword } from "../controllers/resetPasswordController.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/google-auth", googleAuth);
router.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  login
);
router.get("/me", authMiddleware, getMe);

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests. Please try again later.",
});

router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password", resetLimiter, resetPassword);

router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.json({ message: "Logged out successfully" });
});


export default router;