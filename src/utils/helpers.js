// Format bytes to human readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Generate random string
export const generateRandomString = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

// Get file type from extension
export const getFileTypeFromExtension = (extension) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const pdfExtensions = ["pdf"];
  const documentExtensions = ["doc", "docx", "txt", "rtf", "odt"];
  const spreadsheetExtensions = ["xls", "xlsx", "csv", "ods"];
  const presentationExtensions = ["ppt", "pptx", "odp"];

  if (imageExtensions.includes(extension.toLowerCase())) {
    return "image";
  } else if (pdfExtensions.includes(extension.toLowerCase())) {
    return "pdf";
  } else if (documentExtensions.includes(extension.toLowerCase())) {
    return "note";
  } else if (spreadsheetExtensions.includes(extension.toLowerCase())) {
    return "document";
  } else if (presentationExtensions.includes(extension.toLowerCase())) {
    return "document";
  } else {
    return "other";
  }
};

// Sanitize filename
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9.\-_]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

// Calculate storage percentage
export const calculateStoragePercentage = (used, limit) => {
  return ((used / limit) * 100).toFixed(2);
};

// Validate email
export const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Get current date in YYYY-MM-DD format
export const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

// Get date range for last N days
export const getDateRange = (days = 7) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

// Generate folder path
export const generateFolderPath = (folderName, parentPath = "") => {
  if (parentPath) {
    return `${parentPath}/${folderName}`;
  }
  return `/${folderName}`;
};
