// errorhandler.js
const notFound = (req, res, next) => {
  if (!req || !req.originalUrl) {
    console.error('Request or originalUrl is undefined');
    return next(new Error('Internal Server Error'));
  }
  const error = new Error(`Not Found ${req.originalUrl}`);
  console.log(error);
  res.status(404);
  next(error);
};
const handleError = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
module.exports = {
  notFound,
  handleError
};