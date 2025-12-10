import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide file name"],
    },
    originalName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "pdf", "note", "document", "video", "audio", "other"],
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: String,
    mimeType: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: Date,
    tags: [String],
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    shareToken: String,
    shareExpire: Date,
    isShared: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
fileSchema.index({ user: 1, folder: 1 });
fileSchema.index({ user: 1, isFavorite: 1 });
fileSchema.index({ user: 1, isTrashed: 1 });
fileSchema.index({ user: 1, type: 1 });
fileSchema.index({ user: 1, createdAt: -1 });
fileSchema.index({ user: 1, updatedAt: -1 });

// Method to check if file is image
fileSchema.virtual("isImage").get(function () {
  return this.type === "image";
});

// Method to check if file is PDF
fileSchema.virtual("isPdf").get(function () {
  return this.type === "pdf";
});

// Method to check if file is note
fileSchema.virtual("isNote").get(function () {
  return this.type === "note";
});

const File = mongoose.model("File", fileSchema);

export default File;
// =========================
// import mongoose from "mongoose";

// const fileSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Please provide file name"],
//     },
//     originalName: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       enum: ["image", "pdf", "note", "document", "video", "audio", "other"],
//       required: true,
//     },
//     size: {
//       type: Number,
//       required: true,
//     },
//     path: {
//       type: String,
//       required: true,
//     },
//     url: {
//       type: String,
//       required: true,
//     },
//     thumbnail: String,
//     mimeType: String,
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     folder: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Folder",
//       default: null,
//     },
//     isFavorite: {
//       type: Boolean,
//       default: false,
//     },
//     isTrashed: {
//       type: Boolean,
//       default: false,
//     },
//     trashedAt: Date,
//     tags: [String],
//     description: String,
//     metadata: mongoose.Schema.Types.Mixed,
//     shareToken: String,
//     shareExpire: Date,
//     isShared: {
//       type: Boolean,
//       default: false,
//     },
//     views: {
//       type: Number,
//       default: 0,
//     },
//     downloads: {
//       type: Number,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // Indexes for better query performance
// fileSchema.index({ user: 1, folder: 1 });
// fileSchema.index({ user: 1, isFavorite: 1 });
// fileSchema.index({ user: 1, isTrashed: 1 });
// fileSchema.index({ user: 1, type: 1 });
// fileSchema.index({ user: 1, createdAt: -1 });
// fileSchema.index({ user: 1, updatedAt: -1 });

// // Method to check if file is image
// fileSchema.virtual("isImage").get(function () {
//   return this.type === "image";
// });

// // Method to check if file is PDF
// fileSchema.virtual("isPdf").get(function () {
//   return this.type === "pdf";
// });

// // Method to check if file is note
// fileSchema.virtual("isNote").get(function () {
//   return this.type === "note";
// });

// module.exports = mongoose.model("File", fileSchema);
