import winston from "winston";
import { env } from "./env";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports: winston.transport[] = [
  new winston.transports.Console({ format: consoleFormat }),
];

// Only write log files outside of tests to keep test runs clean and fast.
if (!env.isTest) {
  transports.push(
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/all.log" }),
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL ?? (env.isDevelopment ? "debug" : "http"),
  levels,
  // Stay completely silent during tests.
  silent: env.isTest,
  transports,
  exceptionHandlers: env.isTest
    ? []
    : [new winston.transports.File({ filename: "logs/exceptions.log" })],
  rejectionHandlers: env.isTest
    ? []
    : [new winston.transports.File({ filename: "logs/rejections.log" })],
});

export default logger;
