import express from "express";
import * as fileController from "../controllers/fileController.js";
import { validate, validateFileType } from "../middleware/validation.js";
import { protect, checkStorageLimit } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

// Private routes - all routes protected
router.use(protect);

// File upload
router.post(
  "/upload",
  uploadSingle("file"),
  validateFileType(["image", "pdf", "note", "document"]),
  checkStorageLimit,
  validate(fileController.validationRules.upload),
  fileController.uploadFile
);

// Public route for shared files
router.get("/shared/:token", fileController.getSharedFile);
// Get files
router.get("/", fileController.getFiles);

// Get recent files
router.get("/recent", fileController.getRecentFiles);

// Get favorite files
router.get("/favorites", fileController.getFavoriteFiles);

// Get single file
// router.get("/:id", fileController.getFile);
router.get("/:id", fileController.getFile);

// Update file
router.put(
  "/:id",
  validate(fileController.validationRules.update),
  fileController.updateFile
);

// Toggle favorite
router.put("/:id/favorite", fileController.toggleFavorite);

// Duplicate file
router.post("/:id/duplicate", fileController.duplicateFile);

// Generate share link
router.post(
  "/:id/share",
  validate(fileController.validationRules.share),
  fileController.generateShareLink
);

// Download file
router.get("/:id/download", fileController.downloadFile);

// Restore file from trash
router.put("/:id/restore", fileController.restoreFile);

// Delete file (move to trash)
router.delete("/:id", fileController.deleteFile);

export default router;
