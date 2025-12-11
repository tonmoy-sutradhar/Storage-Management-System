import User from "../models/User.js";
import File from "../models/File.js";
import Folder from "../models/Folder.js";
import emailService from "./emailService.js";

// Get storage statistics
export const getStorageStats = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Get file type distribution
  const fileTypes = await File.aggregate([
    {
      $match: {
        user: user._id,
        isTrashed: false,
      },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalSize: { $sum: "$size" },
      },
    },
    {
      $sort: { totalSize: -1 },
    },
  ]);

  // Get recent uploads (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUploads = await File.countDocuments({
    user: user._id,
    isTrashed: false,
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Get largest files
  const largestFiles = await File.find({
    user: user._id,
    isTrashed: false,
  })
    .sort({ size: -1 })
    .limit(5)
    .select("name type size createdAt");

  return {
    user: {
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit,
      storagePercentage: user.storagePercentage,
      storageLeft: user.storageLeft,
    },
    fileTypes,
    recentUploads,
    largestFiles,
  };
};

// Check storage alerts
export const checkStorageAlerts = async (userId) => {
  const user = await User.findById(userId);
  const usagePercentage = user.storagePercentage;

  // Alert thresholds
  const thresholds = [80, 90, 95];

  for (const threshold of thresholds) {
    if (usagePercentage >= threshold && usagePercentage < threshold + 5) {
      // Send alert email
      await emailService.sendStorageAlertEmail(
        user.email,
        user.name,
        usagePercentage
      );

      return {
        alert: true,
        message: `Storage usage at ${usagePercentage}%`,
        threshold,
      };
    }
  }

  return { alert: false };
};

// Clean up trash (permanently delete old trashed items)
export const cleanupTrash = async (userId, days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Find trashed files older than cutoff
  const trashedFiles = await File.find({
    user: userId,
    isTrashed: true,
    trashedAt: { $lt: cutoffDate },
  });

  let totalSize = 0;
  let deletedCount = 0;

  // Delete files and update storage
  for (const file of trashedFiles) {
    totalSize += file.size;
    deletedCount += 1;
    await File.findByIdAndDelete(file._id);
  }

  // Find trashed folders older than cutoff
  const trashedFolders = await Folder.find({
    user: userId,
    isTrashed: true,
    trashedAt: { $lt: cutoffDate },
  });

  // Delete folders (files inside will be deleted by cascade in application logic)
  for (const folder of trashedFolders) {
    // Get all files in this folder and subfolders
    const folderIds = await getAllChildFolderIds(folder._id);
    const filesInFolders = await File.find({
      folder: { $in: folderIds },
    });

    for (const file of filesInFolders) {
      totalSize += file.size;
      await File.findByIdAndDelete(file._id);
    }

    // Delete the folders
    await Folder.deleteMany({ _id: { $in: folderIds } });
    deletedCount += folderIds.length;
  }

  // Update user storage
  if (totalSize > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: { storageUsed: -totalSize },
    });
  }

  return {
    deletedCount,
    freedSpace: totalSize,
    message: `Cleaned up ${deletedCount} items, freed ${formatBytes(
      totalSize
    )}`,
  };
};

// Helper function to get all child folder IDs
async function getAllChildFolderIds(folderId) {
  const childFolders = await Folder.find({ parentFolder: folderId });
  let allIds = [folderId];

  for (const child of childFolders) {
    const grandchildren = await getAllChildFolderIds(child._id);
    allIds = [...allIds, ...grandchildren];
  }

  return allIds;
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Get storage usage by date range
export const getStorageUsageByDate = async (userId, startDate, endDate) => {
  const usageData = await File.aggregate([
    {
      $match: {
        user: userId,
        isTrashed: false,
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        uploadCount: { $sum: 1 },
        totalSize: { $sum: "$size" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return usageData;
};
