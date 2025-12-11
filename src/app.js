import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Import middleware
import errorHandler from "./middleware/errorHandler.js";

// --- Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Initialize Express app
const app = express();

// --- Middleware

// Enable CORS
app.use(cors());

// Parse JSON and URL-encoded data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Security headers
app.use(helmet());

// Optional: XSS filter from Helmet
app.use(helmet.xssFilter());

// Compression
app.use(compression());

// Rate limiting for APIs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { stream: logger.stream }));
}

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- Routes

// Root route
app.get("/", (req, res) => {
  res.send("Storage Management System API is running...");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/user", userRoutes);

// 404 handler (must be after all routes)
app.use((req, res, next) => {
  res.status(404).send("Page not found");
});

// Global error handling
app.use(errorHandler);

export default app;
