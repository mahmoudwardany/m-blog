export const notFound = (req, res, next) => {
    if (!req || !req.originalUrl) {
        return next(new Error('Internal Server Error'));
    }
    const error = new Error(`Not Found ${req.originalUrl}`);
    console.error(error);
    res.status(404);
    next(error);
};

export const handleError = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

