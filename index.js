import express from 'express';
// import cors from "cors";
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

// CORS headers for React frontend
// app.use(cors({
//         origin: process.env.CORS_ORIGIN || "*",
//         methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//         allowedHeaders: ['Accept', 'Content-Type', 'Authorization', 'X-API-Key'],
//     }
// ));

const PORT = process.env.EXPRESS_PORT || 8000;

// routing
app.use('/api', authRoutes);
app.use('/api/courses', courseRoutes);

// Health check endpoint for server
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'PIP Backend is running'
    });
});

// 404 error if route does not exist
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`PIP Backend running on http://localhost:${PORT}`);
});