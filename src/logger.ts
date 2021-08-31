import * as winston from "winston";

const hformat = winston.format.printf(({ level, label, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]${label ? `[${label}]` : ""}: ${message} `;
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  format: winston.format.combine(winston.format.splat(), winston.format.timestamp(), hformat),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.timestamp(),
        hformat
      ),
    }),
  ],
});
