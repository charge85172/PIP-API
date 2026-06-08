import db from '../db.js';

export const getCourses = (req, res) => {
    try{
    db.all('SELECT * FROM courses ORDER BY order_index', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
}
    catch (error) {
            console.error('Error fetching course:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
        };

export const getCourse = (req, res) => {
    try{
    const { courseId } = req.params;

    const sql = ` SELECT * FROM courses WHERE id = ? `;

    db.get(sql, [courseId], (err, course) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json(course);
    });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};