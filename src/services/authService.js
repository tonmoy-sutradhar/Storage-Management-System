import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Token from "../models/Token.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./emailService.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Send token response
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Save token to database
  Token.create({
    token,
    user: user._id,
    type: "access",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        storagePercentage: user.storagePercentage,
        storageLeft: user.storageLeft,
      },
    });
};

// Register user
export const register = async (userData) => {
  const { name, email, password } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  try {
    await sendVerificationEmail(user.email, verificationUrl);
  } catch (error) {
    user.verifyEmailToken = undefined;
    user.verifyEmailExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("Email could not be sent");
  }

  return user;
};

// Login user
export const login = async (email, password) => {
  // Check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

// Google login/register
export const googleAuth = async (googleData) => {
  const { googleId, email, name, profilePicture } = googleData;

  let user = await User.findOne({ email });

  if (!user) {
    // Create new user with Google
    user = await User.create({
      name,
      email,
      googleId,
      profilePicture,
      isVerified: true,
      password: crypto.randomBytes(20).toString("hex"), // Random password
    });
  } else {
    // Update Google ID if not set
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save({ validateBeforeSave: false });
    }
  }

  return user;
};

// Forgot password
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate reset token
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Send email
  try {
    await sendPasswordResetEmail(user.email, resetUrl);
    return resetToken;
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("Email could not be sent");
  }
};

// Reset password
export const resetPassword = async (resetToken, newPassword) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return user;
};

// Verify email
export const verifyEmail = async (verificationToken) => {
  // Get hashed token
  const verifyEmailToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    verifyEmailToken,
    verifyEmailExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired verification token");
  }

  // Mark as verified
  user.isVerified = true;
  user.verifyEmailToken = undefined;
  user.verifyEmailExpire = undefined;
  await user.save();

  return user;
};

// Logout
export const logout = async (token, userId) => {
  // Blacklist token
  await Token.findOneAndUpdate(
    { token, user: userId },
    { blacklisted: true },
    { upsert: true }
  );

  // Remove all user's refresh tokens
  await Token.deleteMany({
    user: userId,
    type: "refresh",
  });
};
