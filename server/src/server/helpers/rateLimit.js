const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  max: 100,
  message: {
    error: "Too Many Requests",
    message: "You have exceeded the 100 requests in 24 hrs limit!",
  },
  headers: true,
});

module.exports = rateLimiter;
