import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import requireAuth from "./middleware/auth.js";

dotenv.config();

try {
    const app = express();

    app.disable("x-powered-by");

    app.use(helmet());

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // CORS
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

        if (req.method === "OPTIONS") {
            return res.sendStatus(204);
        }

        next();
    });

    const PORT = process.env.EXPRESS_PORT || 8000;

    // Open routes
    app.use("/api", authRoutes);

    // Protected routes
    app.use("/api/users", requireAuth, userRoutes);
    app.use("/api/courses", requireAuth, courseRoutes);
    app.use("/api/rewards", requireAuth, rewardRoutes);
    app.use("/api/progress", requireAuth, progressRoutes);
    app.use("/api/dashboard", requireAuth, dashboardRoutes);

    // Health check
    app.get("/health", (req, res) => {
        res.json({
            status: "OK",
            timestamp: new Date().toISOString(),
            message: "PIP Backend is running"
        });
    });

    // 404
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: `Route ${req.method} ${req.url} not found`
        });
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.error("Error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    });

    app.listen(PORT, () => {
        console.log(`PIP Backend running on http://localhost:${PORT}`);
    });

} catch (error) {
    console.error("Server startup error:", error);
}