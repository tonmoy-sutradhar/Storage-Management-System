import * as folderService from "../services/folderService.js";
import { body } from "express-validator";

// @desc    Create folder
// @route   POST /api/folders
// @access  Private
export const createFolder = async (req, res, next) => {
  try {
    const folder = await folderService.createFolder(req.body, req.user.id);

    res.status(201).json({
      success: true,
      folder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user folders
// @route   GET /api/folders
// @access  Private
export const getFolders = async (req, res, next) => {
  try {
    const result = await folderService.getUserFolders(req.user.id, req.query);

    res.status(200).json({
      success: true,
      count: result.folders.length,
      pagination: result.pagination,
      folders: result.folders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get folder tree
// @route   GET /api/folders/tree
// @access  Private
export const getFolderTree = async (req, res, next) => {
  try {
    const parentFolderId = req.query.parentFolderId || null;
    const tree = await folderService.getFolderTree(req.user.id, parentFolderId);

    res.status(200).json({
      success: true,
      tree,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get folder contents
// @route   GET /api/folders/:id/contents
// @access  Private
export const getFolderContents = async (req, res, next) => {
  try {
    const folder = await folderService.getFolderContents(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      folder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update folder
// @route   PUT /api/folders/:id
// @access  Private
export const updateFolder = async (req, res, next) => {
  try {
    const folder = await folderService.updateFolder(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      folder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite
// @route   PUT /api/folders/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res, next) => {
  try {
    const folder = await folderService.toggleFavorite(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      folder,
      message: folder.isFavorite
        ? "Folder added to favorites"
        : "Folder removed from favorites",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete folder (move to trash)
// @route   DELETE /api/folders/:id
// @access  Private
export const deleteFolder = async (req, res, next) => {
  try {
    const result = await folderService.deleteFolder(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore folder from trash
// @route   PUT /api/folders/:id/restore
// @access  Private
export const restoreFolder = async (req, res, next) => {
  try {
    const folder = await folderService.restoreFolder(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      folder,
      message: "Folder restored successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const validationRules = {
  create: [
    body("name").trim().notEmpty().withMessage("Folder name is required"),
    body("parentFolderId").optional().isMongoId(),
    body("color").optional().isHexColor(),
    body("icon").optional().trim(),
  ],

  update: [
    body("name").optional().trim().notEmpty(),
    body("color").optional().isHexColor(),
    body("icon").optional().trim(),
  ],
};
