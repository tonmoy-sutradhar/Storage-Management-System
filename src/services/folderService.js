import Folder from "../models/Folder.js";
import File from "../models/File.js";
import User from "../models/User.js";

// Create folder
export const createFolder = async (folderData, userId) => {
  const { name, parentFolderId, color, icon } = folderData;

  // Check if folder with same name exists in same location
  const existingFolder = await Folder.findOne({
    user: userId,
    parentFolder: parentFolderId || null,
    name,
  });

  if (existingFolder) {
    throw new Error("A folder with this name already exists in this location");
  }

  // Build folder path
  let folderPath = `/${name}`;

  if (parentFolderId) {
    const parentFolder = await Folder.findOne({
      _id: parentFolderId,
      user: userId,
    });

    if (!parentFolder) {
      throw new Error("Parent folder not found");
    }

    folderPath = `${parentFolder.path}/${name}`;
  }

  // Create folder
  const folder = await Folder.create({
    name,
    user: userId,
    parentFolder: parentFolderId,
    path: folderPath,
    color,
    icon,
  });

  return folder;
};

// Get user folders
export const getUserFolders = async (userId, query) => {
  const {
    parentFolderId,
    isFavorite,
    isTrashed,
    search,
    page = 1,
    limit = 20,
  } = query;

  const filter = { user: userId };

  // Apply filters
  if (parentFolderId) {
    filter.parentFolder = parentFolderId;
  } else if (parentFolderId === "null") {
    filter.parentFolder = null;
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
  const folders = await Folder.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get folder sizes and item counts
  const foldersWithStats = await Promise.all(
    folders.map(async (folder) => {
      const folderObj = folder.toObject();

      // Get size
      const sizeResult = await File.aggregate([
        { $match: { folder: folder._id, isTrashed: false } },
        { $group: { _id: null, totalSize: { $sum: "$size" } } },
      ]);

      folderObj.size = sizeResult.length > 0 ? sizeResult[0].totalSize : 0;

      // Get item count
      const [fileCount, folderCount] = await Promise.all([
        File.countDocuments({ folder: folder._id, isTrashed: false }),
        Folder.countDocuments({ parentFolder: folder._id, isTrashed: false }),
      ]);

      folderObj.itemCount = fileCount + folderCount;

      return folderObj;
    })
  );

  const total = await Folder.countDocuments(filter);

  return {
    folders: foldersWithStats,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

// Get folder tree
export const getFolderTree = async (userId, parentFolderId = null) => {
  const folders = await Folder.find({
    user: userId,
    parentFolder: parentFolderId,
    isTrashed: false,
  }).sort({ name: 1 });

  const tree = await Promise.all(
    folders.map(async (folder) => {
      const folderObj = folder.toObject();
      folderObj.children = await getFolderTree(userId, folder._id);
      return folderObj;
    })
  );

  return tree;
};

// Get folder contents
export const getFolderContents = async (folderId, userId) => {
  const folder = await Folder.findOne({ _id: folderId, user: userId })
    .populate({
      path: "childFolders",
      match: { isTrashed: false },
    })
    .populate({
      path: "files",
      match: { isTrashed: false },
    });

  if (!folder) {
    throw new Error("Folder not found");
  }

  return folder;
};

// Update folder
export const updateFolder = async (folderId, userId, updateData) => {
  const folder = await Folder.findOne({ _id: folderId, user: userId });

  if (!folder) {
    throw new Error("Folder not found");
  }

  // Check if renaming
  if (updateData.name && updateData.name !== folder.name) {
    // Check if name exists in same location
    const existingFolder = await Folder.findOne({
      user: userId,
      parentFolder: folder.parentFolder,
      name: updateData.name,
      _id: { $ne: folderId },
    });

    if (existingFolder) {
      throw new Error(
        "A folder with this name already exists in this location"
      );
    }

    // Update path for this folder and all children
    const oldPath = folder.path;
    const newPath = folder.parentFolder
      ? `${folder.parentFolder.path}/${updateData.name}`
      : `/${updateData.name}`;

    await updateFolderPath(folderId, oldPath, newPath);
  }

  // Update folder
  Object.keys(updateData).forEach((key) => {
    folder[key] = updateData[key];
  });

  await folder.save();
  return folder;
};

// Update folder path for all children
const updateFolderPath = async (folderId, oldPath, newPath) => {
  // Update this folder's path
  await Folder.findByIdAndUpdate(folderId, { path: newPath });

  // Update all child folders' paths
  const childFolders = await Folder.find({
    path: { $regex: `^${oldPath}/` },
  });

  for (const childFolder of childFolders) {
    const childNewPath = childFolder.path.replace(oldPath, newPath);
    await Folder.findByIdAndUpdate(childFolder._id, { path: childNewPath });
  }
};

// Toggle favorite
export const toggleFavorite = async (folderId, userId) => {
  const folder = await Folder.findOne({ _id: folderId, user: userId });

  if (!folder) {
    throw new Error("Folder not found");
  }

  folder.isFavorite = !folder.isFavorite;
  await folder.save();

  return folder;
};

// Delete folder (move to trash)
export const deleteFolder = async (folderId, userId) => {
  const folder = await Folder.findOne({ _id: folderId, user: userId });

  if (!folder) {
    throw new Error("Folder not found");
  }

  // If already trashed, delete permanently with all contents
  if (folder.isTrashed) {
    // Get all child folder IDs
    const childFolderIds = await getAllChildFolderIds(folderId);
    const allFolderIds = [folderId, ...childFolderIds];

    // Delete all files in these folders
    const files = await File.find({ folder: { $in: allFolderIds } });
    let totalSize = 0;

    for (const file of files) {
      totalSize += file.size;
      await File.findByIdAndDelete(file._id);
    }

    // Delete all folders
    await Folder.deleteMany({ _id: { $in: allFolderIds } });

    // Update user storage
    await User.findByIdAndUpdate(userId, {
      $inc: { storageUsed: -totalSize },
    });

    return { message: "Folder permanently deleted" };
  }

  // Move to trash
  folder.isTrashed = true;
  folder.trashedAt = new Date();
  await folder.save();

  return folder;
};

// Get all child folder IDs recursively
const getAllChildFolderIds = async (folderId) => {
  const childFolders = await Folder.find({ parentFolder: folderId });
  let allIds = [];

  for (const child of childFolders) {
    allIds.push(child._id);
    const grandchildren = await getAllChildFolderIds(child._id);
    allIds = [...allIds, ...grandchildren];
  }

  return allIds;
};

// Restore folder from trash
export const restoreFolder = async (folderId, userId) => {
  const folder = await Folder.findOne({
    _id: folderId,
    user: userId,
    isTrashed: true,
  });

  if (!folder) {
    throw new Error("Folder not found in trash");
  }

  folder.isTrashed = false;
  folder.trashedAt = undefined;
  await folder.save();

  return folder;
};
