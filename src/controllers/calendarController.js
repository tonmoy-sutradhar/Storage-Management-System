import * as calendarService from "../services/calendarService.js";
import { param, query } from "express-validator";

// @desc    Get files by date
// @route   GET /api/calendar/date/:date
// @access  Private
export const getFilesByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const files = await calendarService.getFilesByDate(req.user.id, date);

    res.status(200).json({
      success: true,
      count: files.length,
      date,
      files,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get files by date range
// @route   GET /api/calendar/range
// @access  Private
export const getFilesByDateRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: "Start and end dates are required",
      });
    }

    const files = await calendarService.getFilesByDateRange(
      req.user.id,
      start,
      end
    );

    res.status(200).json({
      success: true,
      count: files.length,
      start,
      end,
      files,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get calendar stats
// @route   GET /api/calendar/stats
// @access  Private
export const getCalendarStats = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const currentDate = new Date();

    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;

    const stats = await calendarService.getCalendarStats(
      req.user.id,
      targetYear,
      targetMonth
    );

    res.status(200).json({
      success: true,
      year: targetYear,
      month: targetMonth,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const validationRules = {
  date: [param("date").isISO8601().withMessage("Invalid date format")],

  range: [
    query("start").isISO8601().withMessage("Invalid start date format"),
    query("end").isISO8601().withMessage("Invalid end date format"),
  ],

  stats: [
    query("year").optional().isInt({ min: 2000, max: 2100 }),
    query("month").optional().isInt({ min: 1, max: 12 }),
  ],
};
