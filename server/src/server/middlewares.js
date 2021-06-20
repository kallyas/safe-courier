const notFound = (req, res, next) => {
  const error = new Error(`Resource at - ${req.originalUrl} Not Found`);
  res.status(404);
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: error.message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
