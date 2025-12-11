import express from "express";
import * as authController from "../controllers/authController.js";
import { validate } from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validate(authController.validationRules.register),
  authController.register
);

router.post(
  "/login",
  validate(authController.validationRules.login),
  authController.login
);

router.post(
  "/forgot-password",
  validate(authController.validationRules.forgotPassword),
  authController.forgotPassword
);

router.put(
  "/reset-password/:resetToken",
  validate(authController.validationRules.resetPassword),
  authController.resetPassword
);

router.get("/verify-email/:verificationToken", authController.verifyEmail);

router.post("/google", authController.googleAuth);

// Private routes
router.get("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

export default router;
