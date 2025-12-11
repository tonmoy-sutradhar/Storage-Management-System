import express from "express";
import * as calendarController from "../controllers/calendarController.js";
import { validate } from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Private routes - all routes protected
router.use(protect);

// Get files by date
router.get(
  "/date/:date",
  validate(calendarController.validationRules.date),
  calendarController.getFilesByDate
);

// Get files by date range
router.get(
  "/range",
  validate(calendarController.validationRules.range),
  calendarController.getFilesByDateRange
);

// Get calendar stats
router.get(
  "/stats",
  validate(calendarController.validationRules.stats),
  calendarController.getCalendarStats
);

export default router;
