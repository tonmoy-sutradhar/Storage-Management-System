import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Token from "../models/Token.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is blacklisted
      const blacklistedToken = await Token.findOne({
        token,
        blacklisted: true,
      });

      if (blacklistedToken) {
        return res.status(401).json({
          success: false,
          error: "Token is no longer valid",
        });
      }

      // Find user
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check storage limit before upload
export const checkStorageLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const fileSize = req.file ? req.file.size : 0;

    if (user.storageUsed + fileSize > user.storageLimit) {
      return res.status(400).json({
        success: false,
        error:
          "Storage limit exceeded. Please upgrade your plan or delete some files.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
// ================================
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const Token = require("../models/Token");

// // Protect routes - verify JWT token
// exports.protect = async (req, res, next) => {
//   try {
//     let token;

//     // Check if token exists in headers
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     // Check if token exists in cookies
//     else if (req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         error: "Not authorized to access this route",
//       });
//     }

//     try {
//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Check if token is blacklisted
//       const blacklistedToken = await Token.findOne({
//         token,
//         blacklisted: true,
//       });

//       if (blacklistedToken) {
//         return res.status(401).json({
//           success: false,
//           error: "Token is no longer valid",
//         });
//       }

//       // Find user
//       req.user = await User.findById(decoded.id).select("-password");

//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           error: "User not found",
//         });
//       }

//       next();
//     } catch (error) {
//       return res.status(401).json({
//         success: false,
//         error: "Not authorized to access this route",
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// // Role-based authorization
// exports.authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         error: `User role ${req.user.role} is not authorized to access this route`,
//       });
//     }
//     next();
//   };
// };

// // Check storage limit before upload
// exports.checkStorageLimit = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const fileSize = req.file ? req.file.size : 0;

//     if (user.storageUsed + fileSize > user.storageLimit) {
//       return res.status(400).json({
//         success: false,
//         error:
//           "Storage limit exceeded. Please upgrade your plan or delete some files.",
//       });
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// };
