import User from "../models/User.js";
import File from "../models/File.js";
import Folder from "../models/Folder.js";
import Token from "../models/Token.js";
import { body } from "express-validator";

// @desc    Update profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email is already taken",
        });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "New passwords do not match",
      });
    }

    // Get user with password
    const user = await User.findById(userId).select("+password");

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Logout from all devices
    await Token.deleteMany({ user: userId, type: "access" });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/user/account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findById(userId).select("+password");

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Password is incorrect",
      });
    }

    // Delete all user files and folders
    // Get all user files
    const files = await File.find({ user: userId });

    // Calculate total size for storage adjustment
    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size;
    }

    // Delete all user files
    await File.deleteMany({ user: userId });

    // Delete all user folders
    await Folder.deleteMany({ user: userId });

    // Delete all user tokens
    await Token.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats
// @route   GET /api/user/stats
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get counts
    const [fileCount, folderCount, favoriteCount, trashedCount] =
      await Promise.all([
        File.countDocuments({ user: userId, isTrashed: false }),
        Folder.countDocuments({ user: userId, isTrashed: false }),
        File.countDocuments({
          user: userId,
          isFavorite: true,
          isTrashed: false,
        }),
        File.countDocuments({ user: userId, isTrashed: true }),
      ]);

    // Get storage info
    const user = await User.findById(userId);

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
    ]);

    res.status(200).json({
      success: true,
      stats: {
        fileCount,
        folderCount,
        favoriteCount,
        trashedCount,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        storagePercentage: user.storagePercentage,
        storageLeft: user.storageLeft,
        fileTypes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile picture
// @route   PUT /api/user/profile-picture
// @access  Private
export const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a profile picture",
      });
    }

    // Check if file is an image
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        error: "Please upload an image file",
      });
    }

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePicture: req.file.url || `/uploads/${req.file.filename}`,
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      user,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const validationRules = {
  updateProfile: [
    body("name").optional().trim().notEmpty(),
    body("email").optional().isEmail(),
  ],

  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],

  deleteAccount: [
    body("password").notEmpty().withMessage("Password is required"),
  ],
};
