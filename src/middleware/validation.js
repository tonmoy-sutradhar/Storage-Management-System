import { validationResult } from "express-validator";

// Validate request
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  };
};

// Validate file type
export const validateFileType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedPdfTypes = ["application/pdf"];
    const allowedDocumentTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ];

    let isValid = false;

    if (
      allowedTypes.includes("image") &&
      allowedImageTypes.includes(req.file.mimetype)
    ) {
      isValid = true;
    } else if (
      allowedTypes.includes("pdf") &&
      allowedPdfTypes.includes(req.file.mimetype)
    ) {
      isValid = true;
    } else if (
      allowedTypes.includes("document") &&
      allowedDocumentTypes.includes(req.file.mimetype)
    ) {
      isValid = true;
    } else if (allowedTypes.includes("all")) {
      isValid = true;
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
      });
    }

    next();
  };
};
