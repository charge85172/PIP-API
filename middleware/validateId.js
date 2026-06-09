export const validateId = (paramName) => {
    return (req, res, next) => {
        const value = Number(req.params[paramName]);

        if (!Number.isInteger(value) || value <= 0) {
            return res.status(400).json({
                success: false,
                message: `Valid ${paramName} is required`
            });
        }

        req.params[paramName] = value;

        next();
    };
};