// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import cloudinary from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";

// // Configure Cloudinary
// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Create uploads directory if it doesn't exist
// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Local storage configuration
// const localStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// // Cloudinary storage configuration
// const cloudinaryStorage = new CloudinaryStorage({
//   cloudinary: cloudinary.v2,
//   params: {
//     folder: "storage-management",
//     allowed_formats: [
//       "jpg",
//       "jpeg",
//       "png",
//       "gif",
//       "pdf",
//       "doc",
//       "docx",
//       "xls",
//       "xlsx",
//       "txt",
//       "csv",
//     ],
//     transformation: [{ width: 500, height: 500, crop: "limit" }],
//   },
// });

// // File filter
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/gif",
//     "image/webp",
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "application/vnd.ms-excel",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     "text/plain",
//     "text/csv",
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Invalid file type. Only images, PDFs, and documents are allowed."
//       ),
//       false
//     );
//   }
// };

// // Create upload middleware
// const upload = multer({
//   storage:
//     process.env.NODE_ENV === "production" ? cloudinaryStorage : localStorage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB
//   },
// });

// // Single file upload
// export const uploadSingle = (fieldName) => {
//   return upload.single(fieldName);
// };

// // Multiple files upload
// export const uploadMultiple = (fieldName, maxCount = 10) => {
//   return upload.array(fieldName, maxCount);
// };

// ========================================
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const filename =
      path.parse(file.originalname).name.replace(/\s+/g, "-") +
      "-" +
      uniqueSuffix +
      extension;
    cb(null, filename);
  },
});

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    let resourceType = "auto";
    let folder = "storage-management";

    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
      folder = "storage-management/images";
    } else if (file.mimetype === "application/pdf") {
      resourceType = "raw";
      folder = "storage-management/documents";
    } else if (
      file.mimetype.includes("text") ||
      file.mimetype.includes("document")
    ) {
      resourceType = "raw";
      folder = "storage-management/documents";
    }

    // Generate unique public_id
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = path
      .parse(file.originalname)
      .name.replace(/\s+/g, "-");
    const publicId = `${originalName}-${uniqueSuffix}`;

    return {
      folder: folder,
      format: async () => {
        if (resourceType === "image") {
          const format = path
            .extname(file.originalname)
            .toLowerCase()
            .replace(".", "");
          return ["jpg", "jpeg", "png", "gif", "webp"].includes(format)
            ? format
            : "jpg";
        }
        return undefined;
      },
      public_id: publicId,
      resource_type: resourceType,
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "pdf",
        "doc",
        "docx",
        "txt",
      ],
      transformation:
        resourceType === "image"
          ? [{ width: 500, height: 500, crop: "limit", quality: "auto" }]
          : [],
    };
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, PDFs, and documents are allowed."
      ),
      false
    );
  }
};

// Create upload middleware
const upload = multer({
  storage:
    process.env.NODE_ENV === "production" ? cloudinaryStorage : localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB
  },
});

// Single file upload
export const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Multiple files upload
export const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Direct Cloudinary upload function
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "storage-management",
      resource_type: "auto",
      ...options,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

// Generate optimized URL
export const generateOptimizedUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    fetch_format: "auto",
    quality: "auto",
  };

  return cloudinary.url(publicId, {
    ...defaultTransformations,
    ...transformations,
  });
};

// Generate thumbnail URL
export const generateThumbnailUrl = (publicId, width = 300, height = 300) => {
  return cloudinary.url(publicId, {
    width: width,
    height: height,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    fetch_format: "auto",
  });
};

export default cloudinary;
