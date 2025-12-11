import File from "../models/File.js";
import User from "../models/User.js";
import Folder from "../models/Folder.js";
import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";
import { deleteFromCloudinary } from "../middleware/upload.js";

// Upload file
export const uploadFile = async (fileData, userId) => {
  const { name, folderId, user, description, tags, publicId } = fileData;

  // Check folder exists
  let folder = null;
  if (folderId) {
    folder = await Folder.findOne({ _id: folderId, user: userId });
    if (!folder) {
      throw new Error("Folder not found");
    }
  }

  // Generate thumbnail URL for images
  let thumbnail = null;
  if (fileData.type === "image" && publicId) {
    thumbnail = cloudinary.url(publicId, {
      width: 300,
      height: 300,
      crop: "fill",
      gravity: "auto",
      quality: "auto",
      fetch_format: "auto",
    });
  }

  // Create file
  const file = await File.create({
    name: name || fileData.originalName,
    originalName: fileData.originalName,
    type: fileData.type,
    size: fileData.size,
    path: fileData.path || fileData.url,
    url: fileData.url,
    thumbnail: thumbnail,
    mimeType: fileData.mimeType,
    publicId: publicId,
    user: userId,
    folder: folderId,
    description,
    tags,
  });

  // Update user storage
  await User.findByIdAndUpdate(userId, {
    $inc: { storageUsed: fileData.size },
  });

  return file;
};

// Get user files
export const getUserFiles = async (userId, query) => {
  const {
    folderId,
    type,
    isFavorite,
    isTrashed,
    search,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = { user: userId };

  // Apply filters
  if (folderId) {
    filter.folder = folderId;
  } else if (folderId === "null") {
    filter.folder = null;
  }

  if (type) {
    filter.type = type;
  }

  if (isFavorite !== undefined) {
    filter.isFavorite = isFavorite === "true";
  }

  if (isTrashed !== undefined) {
    filter.isTrashed = isTrashed === "true";
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const files = await File.find(filter)
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("folder", "name path");

  const total = await File.countDocuments(filter);

  return {
    files,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

// Get file by ID
export const getFileById = async (fileId, userId) => {
  const file = await File.findOne({ _id: fileId, user: userId }).populate(
    "folder",
    "name path"
  );

  if (!file) {
    throw new Error("File not found");
  }

  // Increment views
  file.views += 1;
  await file.save({ validateBeforeSave: false });

  return file;
};

// Update file
export const updateFile = async (fileId, userId, updateData) => {
  const file = await File.findOne({ _id: fileId, user: userId });

  if (!file) {
    throw new Error("File not found");
  }

  // Update file
  Object.keys(updateData).forEach((key) => {
    file[key] = updateData[key];
  });

  await file.save();
  return file;
};

// Toggle favorite
export const toggleFavorite = async (fileId, userId) => {
  const file = await File.findOne({ _id: fileId, user: userId });

  if (!file) {
    throw new Error("File not found");
  }

  file.isFavorite = !file.isFavorite;
  await file.save();

  return file;
};

// Duplicate file
export const duplicateFile = async (fileId, userId) => {
  const originalFile = await File.findOne({ _id: fileId, user: userId });

  if (!originalFile) {
    throw new Error("File not found");
  }

  // Check user storage
  const user = await User.findById(userId);
  if (user.storageUsed + originalFile.size > user.storageLimit) {
    throw new Error("Storage limit exceeded");
  }

  // Create duplicate
  const duplicateFile = await File.create({
    ...originalFile.toObject(),
    _id: undefined,
    name: `${originalFile.name} (Copy)`,
    isFavorite: false,
    views: 0,
    downloads: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Update user storage
  await User.findByIdAndUpdate(userId, {
    $inc: { storageUsed: originalFile.size },
  });

  return duplicateFile;
};

// Delete file (move to trash)
export const deleteFile = async (fileId, userId) => {
  const file = await File.findOne({ _id: fileId, user: userId });

  if (!file) {
    throw new Error("File not found");
  }

  // If already trashed, delete permanently
  if (file.isTrashed) {
    // Delete from Cloudinary if publicId exists
    if (file.publicId && file.url.includes("cloudinary")) {
      try {
        let resourceType = "image";
        if (file.type === "pdf") {
          resourceType = "raw";
        } else if (file.type === "note" || file.type === "document") {
          resourceType = "raw";
        }

        await deleteFromCloudinary(file.publicId, resourceType);
      } catch (cloudinaryError) {
        console.error("Failed to delete from Cloudinary:", cloudinaryError);
      }
    }

    await File.findByIdAndDelete(fileId);

    // Update user storage
    await User.findByIdAndUpdate(userId, {
      $inc: { storageUsed: -file.size },
    });

    return { message: "File permanently deleted" };
  }

  // Move to trash
  file.isTrashed = true;
  file.trashedAt = new Date();
  await file.save();

  return file;
};

// Restore file from trash
export const restoreFile = async (fileId, userId) => {
  const file = await File.findOne({
    _id: fileId,
    user: userId,
    isTrashed: true,
  });

  if (!file) {
    throw new Error("File not found in trash");
  }

  file.isTrashed = false;
  file.trashedAt = undefined;
  await file.save();

  return file;
};

// Get recent files
export const getRecentFiles = async (userId, days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const files = await File.find({
    user: userId,
    isTrashed: false,
    updatedAt: { $gte: date },
  })
    .sort({ updatedAt: -1 })
    .limit(20)
    .populate("folder", "name path");

  return files;
};

// Get favorite files
export const getFavoriteFiles = async (userId) => {
  const files = await File.find({
    user: userId,
    isFavorite: true,
    isTrashed: false,
  })
    .sort({ updatedAt: -1 })
    .populate("folder", "name path");

  return files;
};

// Generate share link
export const generateShareLink = async (fileId, userId, expiresIn = 7) => {
  const file = await File.findOne({ _id: fileId, user: userId });

  if (!file) {
    throw new Error("File not found");
  }

  // Generate share token
  const shareToken = crypto.randomBytes(20).toString("hex");
  const shareExpire = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);

  file.shareToken = shareToken;
  file.shareExpire = shareExpire;
  file.isShared = true;
  await file.save();

  return {
    shareToken,
    shareUrl: `${process.env.FRONTEND_URL}/shared/${shareToken}`,
    expires: shareExpire,
  };
};

// Get shared file
export const getSharedFile = async (shareToken) => {
  const file = await File.findOne({
    shareToken,
    shareExpire: { $gt: new Date() },
    isShared: true,
  }).populate("user", "name email");

  if (!file) {
    throw new Error("Shared file not found or link expired");
  }

  // Increment views
  file.views += 1;
  await file.save({ validateBeforeSave: false });

  return file;
};
