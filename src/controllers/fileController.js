import * as fileService from "../services/fileService.js";
import { body } from "express-validator";
import cloudinary from "../config/cloudinary.js";
import path from "path";

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a file",
      });
    }

    // Determine file type
    let fileType = "other";
    const mimeType = req.file.mimetype;

    if (mimeType.startsWith("image/")) {
      fileType = "image";
    } else if (mimeType === "application/pdf") {
      fileType = "pdf";
    } else if (mimeType.includes("text") || mimeType.includes("document")) {
      fileType = "note";
    }

    // Extract Cloudinary data if available
    const cloudinaryData = req.file.cloudinaryData || {};

    // Prepare file data
    const fileData = {
      originalName: req.file.originalname,
      type: fileType,
      size: req.file.size,
      path: req.file.path || cloudinaryData.secure_url || req.file.filename,
      url: cloudinaryData.secure_url || `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      publicId: cloudinaryData.public_id, // Store Cloudinary public_id
      secureUrl: cloudinaryData.secure_url,
      ...req.body,
    };

    // Handle thumbnail for images (Cloudinary will auto-generate)
    if (fileType === "image" && cloudinaryData.public_id) {
      // Generate thumbnail URL using Cloudinary
      fileData.thumbnail = cloudinary.url(cloudinaryData.public_id, {
        width: 300,
        height: 300,
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        fetch_format: "auto",
      });
    }

    // Upload file
    const file = await fileService.uploadFile(fileData, req.user.id);

    res.status(201).json({
      success: true,
      file,
      message: "File uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user files
// @route   GET /api/files
// @access  Private
export const getFiles = async (req, res, next) => {
  try {
    const result = await fileService.getUserFiles(req.user.id, req.query);

    res.status(200).json({
      success: true,
      count: result.files.length,
      pagination: result.pagination,
      files: result.files,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single file
// @route   GET /api/files/:id
// @access  Private
export const getFile = async (req, res, next) => {
  try {
    const file = await fileService.getFileById(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update file
// @route   PUT /api/files/:id
// @access  Private
export const updateFile = async (req, res, next) => {
  try {
    const file = await fileService.updateFile(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite
// @route   PUT /api/files/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res, next) => {
  try {
    const file = await fileService.toggleFavorite(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      file,
      message: file.isFavorite
        ? "File added to favorites"
        : "File removed from favorites",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate file
// @route   POST /api/files/:id/duplicate
// @access  Private
export const duplicateFile = async (req, res, next) => {
  try {
    const file = await fileService.duplicateFile(req.params.id, req.user.id);

    res.status(201).json({
      success: true,
      file,
      message: "File duplicated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file (move to trash)
// @route   DELETE /api/files/:id
// @access  Private
export const deleteFile = async (req, res, next) => {
  try {
    const result = await fileService.deleteFile(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore file from trash
// @route   PUT /api/files/:id/restore
// @access  Private
export const restoreFile = async (req, res, next) => {
  try {
    const file = await fileService.restoreFile(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      file,
      message: "File restored successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent files
// @route   GET /api/files/recent
// @access  Private
export const getRecentFiles = async (req, res, next) => {
  try {
    const days = req.query.days || 7;
    const files = await fileService.getRecentFiles(req.user.id, days);

    res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get favorite files
// @route   GET /api/files/favorites
// @access  Private
export const getFavoriteFiles = async (req, res, next) => {
  try {
    const files = await fileService.getFavoriteFiles(req.user.id);

    res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate share link
// @route   POST /api/files/:id/share
// @access  Private
export const generateShareLink = async (req, res, next) => {
  try {
    const expiresIn = req.body.expiresIn || 7; // days

    const shareInfo = await fileService.generateShareLink(
      req.params.id,
      req.user.id,
      expiresIn
    );

    res.status(200).json({
      success: true,
      ...shareInfo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shared file
// @route   GET /api/files/shared/:token
// @access  Public
export const getSharedFile = async (req, res, next) => {
  try {
    const file = await fileService.getSharedFile(req.params.token);

    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
export const downloadFile = async (req, res, next) => {
  try {
    const file = await fileService.getFileById(req.params.id, req.user.id);

    // Increment download count
    file.downloads += 1;
    await file.save({ validateBeforeSave: false });

    // Determine content type
    const contentType = file.mimeType || "application/octet-stream";

    // Set headers for download
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`
    );

    // For local storage
    // if (file.path && !file.url.startsWith("http")) {
    //   return res.sendFile(file.path, { root: "." });
    // }
    if (file.path && !file.url.startsWith("http")) {
      return res.sendFile(path.resolve(file.path));
    }

    // For cloud storage (redirect to URL)
    res.redirect(file.url);
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const validationRules = {
  upload: [
    body("name").optional().trim(),
    body("description").optional().trim(),
    body("tags").optional(),
    body("folderId").optional().isMongoId(),
  ],

  update: [
    body("name").optional().trim().notEmpty(),
    body("description").optional().trim(),
    body("tags").optional(),
    body("folderId").optional().isMongoId(),
  ],

  share: [body("expiresIn").optional().isInt({ min: 1, max: 30 })],
};
