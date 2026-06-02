import express from 'express';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Routing - All auth routes will be prefixed with /api
app.use('/api', authRoutes);

app.listen(PORT, () => {
    console.log(`PIP Backend running on http://localhost:${PORT}`);
});