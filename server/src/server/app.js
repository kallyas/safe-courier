import express from "express";
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import compression from "compression";
import passport from "passport";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import httpStatus from "http-status";
import config from "./config/config.js";
import morgan from "./config/morgan.js";
import { jwtStrategy } from "./config/passport.js";
import authLimiter from "./middlewares/rateLimiter.js";
import routes from "./routes/v2/index.js";
import { errorConverter, errorHandler } from "./middlewares/error.js";
import ApiError from "./utils/ApiError.js";

const app = express();



if (process.env.NODE_ENV !== "production") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(mongoSanitize());
app.use(compression());
app.use(cors());
app.options("*", cors());
app.use(cookieParser());
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

if (process.env.NODE_ENV === "production") {
  app.use("/api/v2/auth", authLimiter);
}

app.use("/api/v2", routes);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Resource at " + req.originalUrl + " not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;