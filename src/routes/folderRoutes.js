import express from "express";
import * as folderController from "../controllers/folderController.js";
import { validate } from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Private routes - all routes protected
router.use(protect);

// Create folder
router.post(
  "/",
  validate(folderController.validationRules.create),
  folderController.createFolder
);

// Get folders
router.get("/", folderController.getFolders);

// Get folder tree
router.get("/tree", folderController.getFolderTree);

// Get folder contents
router.get("/:id/contents", folderController.getFolderContents);

// Update folder
router.put(
  "/:id",
  validate(folderController.validationRules.update),
  folderController.updateFolder
);

// Toggle favorite
router.put("/:id/favorite", folderController.toggleFavorite);

// Restore folder from trash
router.put("/:id/restore", folderController.restoreFolder);

// Delete folder (move to trash)
router.delete("/:id", folderController.deleteFolder);

export default router;
