import express from "express";
import * as userController from "../controllers/userController.js";
import { validate } from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

// Private routes - all routes protected
router.use(protect);

// Get user stats
router.get("/stats", userController.getUserStats);

// Update profile
router.put(
  "/profile",
  validate(userController.validationRules.updateProfile),
  userController.updateProfile
);

// Update profile picture
router.put(
  "/profile-picture",
  uploadSingle("profilePicture"),
  userController.updateProfilePicture
);

// Change password
router.put(
  "/change-password",
  validate(userController.validationRules.changePassword),
  userController.changePassword
);

// Delete account
router.delete(
  "/account",
  validate(userController.validationRules.deleteAccount),
  userController.deleteAccount
);

export default router;
