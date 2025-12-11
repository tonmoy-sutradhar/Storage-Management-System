import File from "../models/File.js";

// Get files by date
export const getFilesByDate = async (userId, date) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const files = await File.find({
    user: userId,
    isTrashed: false,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ createdAt: -1 })
    .populate("folder", "name path");

  return files;
};

// Get files by date range
export const getFilesByDateRange = async (userId, start, end) => {
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  const files = await File.find({
    user: userId,
    isTrashed: false,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ createdAt: -1 })
    .populate("folder", "name path");

  return files;
};

// Get calendar stats (files per day)
export const getCalendarStats = async (userId, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  const stats = await File.aggregate([
    {
      $match: {
        user: userId,
        isTrashed: false,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
        totalSize: { $sum: "$size" },
        files: {
          $push: {
            id: "$_id",
            name: "$name",
            type: "$type",
            size: "$size",
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return stats;
};
