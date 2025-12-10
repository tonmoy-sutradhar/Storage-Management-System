import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
    storageLimit: {
      type: Number,
      default: process.env.DEFAULT_STORAGE_LIMIT || 15728640000, // 15GB
    },
    profilePicture: {
      type: String,
      default: "default.jpg",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verifyEmailToken: String,
    verifyEmailExpire: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString("hex");

  this.verifyEmailToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.verifyEmailExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Virtual for storage percentage
userSchema.virtual("storagePercentage").get(function () {
  return ((this.storageUsed / this.storageLimit) * 100).toFixed(2);
});

// Virtual for storage left
userSchema.virtual("storageLeft").get(function () {
  return this.storageLimit - this.storageUsed;
});

const User = mongoose.model("User", userSchema);

export default User;

// =============================================
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// // const crypto = require("crypto");
// import crypto from "crypto";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Please provide your name"],
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Please provide your email"],
//       unique: true,
//       lowercase: true,
//       match: [
//         /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//         "Please provide a valid email",
//       ],
//     },
//     password: {
//       type: String,
//       required: [true, "Please provide a password"],
//       minlength: 6,
//       select: false,
//     },
//     googleId: {
//       type: String,
//       sparse: true,
//     },
//     storageUsed: {
//       type: Number,
//       default: 0,
//     },
//     storageLimit: {
//       type: Number,
//       default: process.env.DEFAULT_STORAGE_LIMIT || 15728640000, // 15GB
//     },
//     profilePicture: {
//       type: String,
//       default: "default.jpg",
//     },
//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     resetPasswordToken: String,
//     resetPasswordExpire: Date,
//     verifyEmailToken: String,
//     verifyEmailExpire: Date,
//     lastLogin: Date,
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Compare password method
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Generate password reset token
// userSchema.methods.generateResetPasswordToken = function () {
//   const resetToken = crypto.randomBytes(20).toString("hex");

//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

//   return resetToken;
// };

// // Generate email verification token
// userSchema.methods.generateEmailVerificationToken = function () {
//   const verificationToken = crypto.randomBytes(20).toString("hex");

//   this.verifyEmailToken = crypto
//     .createHash("sha256")
//     .update(verificationToken)
//     .digest("hex");

//   this.verifyEmailExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

//   return verificationToken;
// };

// // Virtual for storage percentage
// userSchema.virtual("storagePercentage").get(function () {
//   return ((this.storageUsed / this.storageLimit) * 100).toFixed(2);
// });

// // Virtual for storage left
// userSchema.virtual("storageLeft").get(function () {
//   return this.storageLimit - this.storageUsed;
// });

// module.exports = mongoose.model("User", userSchema);
