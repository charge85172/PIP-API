export default function isUser(req, res, next) {
    const requestedUserId = Number(req.params.id|| req.params.userId);
    const loggedInUserId = Number(req.user.id);

    if (requestedUserId !== loggedInUserId) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    next();
}