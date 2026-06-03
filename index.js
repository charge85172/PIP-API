import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Routing - All auth routes will be prefixed with /api
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/progress', progressRoutes);

app.listen(PORT, () => {
    console.log(`PIP Backend running on http://localhost:${PORT}`);
});