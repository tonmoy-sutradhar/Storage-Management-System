// import mongoose from "mongoose";

// const folderSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Please provide folder name"],
//       trim: true,
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     parentFolder: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Folder",
//       default: null,
//     },
//     path: {
//       type: String,
//       required: true,
//     },
//     color: {
//       type: String,
//       default: "#3b82f6", // Default blue color
//     },
//     icon: String,
//     isFavorite: {
//       type: Boolean,
//       default: false,
//     },
//     isTrashed: {
//       type: Boolean,
//       default: false,
//     },
//     trashedAt: Date,
//     metadata: mongoose.Schema.Types.Mixed,
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // Virtual for child folders
// folderSchema.virtual("childFolders", {
//   ref: "Folder",
//   localField: "_id",
//   foreignField: "parentFolder",
// });

// // Virtual for files in folder
// folderSchema.virtual("files", {
//   ref: "File",
//   localField: "_id",
//   foreignField: "folder",
// });

// // Calculate folder size
// folderSchema.virtual("size").get(async function () {
//   const File = mongoose.model("File");
//   const result = await File.aggregate([
//     { $match: { folder: this._id, isTrashed: false } },
//     { $group: { _id: null, totalSize: { $sum: "$size" } } },
//   ]);

//   return result.length > 0 ? result[0].totalSize : 0;
// });

// // Calculate item count
// folderSchema.virtual("itemCount").get(async function () {
//   const File = mongoose.model("File");
//   const Folder = mongoose.model("Folder");

//   const [fileCount, folderCount] = await Promise.all([
//     File.countDocuments({ folder: this._id, isTrashed: false }),
//     Folder.countDocuments({ parentFolder: this._id, isTrashed: false }),
//   ]);

//   return fileCount + folderCount;
// });

// // Indexes
// folderSchema.index({ user: 1, parentFolder: 1 });
// folderSchema.index({ user: 1, isFavorite: 1 });
// folderSchema.index({ user: 1, isTrashed: 1 });
// folderSchema.index({ user: 1, path: 1 });

// const Folder = mongoose.model("Folder", folderSchema);

// export default Folder;

// ==================================================
import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide folder name"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    path: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "#3b82f6", // Default blue color
    },
    icon: String,
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for child folders
folderSchema.virtual("childFolders", {
  ref: "Folder",
  localField: "_id",
  foreignField: "parentFolder",
});

// Virtual for files in folder
folderSchema.virtual("files", {
  ref: "File",
  localField: "_id",
  foreignField: "folder",
});

// Calculate folder size
folderSchema.virtual("size").get(async function () {
  const File = mongoose.model("File");
  const result = await File.aggregate([
    { $match: { folder: this._id, isTrashed: false } },
    { $group: { _id: null, totalSize: { $sum: "$size" } } },
  ]);

  return result.length > 0 ? result[0].totalSize : 0;
});

// Calculate item count
folderSchema.virtual("itemCount").get(async function () {
  const File = mongoose.model("File");
  const Folder = mongoose.model("Folder");

  const [fileCount, folderCount] = await Promise.all([
    File.countDocuments({ folder: this._id, isTrashed: false }),
    Folder.countDocuments({ parentFolder: this._id, isTrashed: false }),
  ]);

  return fileCount + folderCount;
});

// Indexes
folderSchema.index({ user: 1, parentFolder: 1 });
folderSchema.index({ user: 1, isFavorite: 1 });
folderSchema.index({ user: 1, isTrashed: 1 });
folderSchema.index({ user: 1, path: 1 });

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;
