import app from './app.js';

const PORT = process.env.EXPRESS_PORT || 8000;

app.listen(PORT, () => {
    console.log(`PIP Backend running on http://localhost:${PORT}`);
});