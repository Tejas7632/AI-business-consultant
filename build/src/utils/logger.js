/**
 * Logger utility — Winston-based structured logging
 */
import winston from "winston";
import { config } from "../config/watsonx-config.js";
import fs from "fs";
import path from "path";
// Ensure log directory exists
const logDir = path.dirname(config.LOG_FILE);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}
const { combine, timestamp, colorize, printf, errors } = winston.format;
const consoleFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} [${level}] ${message}${metaStr}`;
});
export const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    format: combine(errors({ stack: true }), timestamp({ format: "HH:mm:ss" })),
    transports: [
        new winston.transports.Console({
            format: combine(colorize({ all: true }), timestamp({ format: "HH:mm:ss" }), consoleFormat),
        }),
        new winston.transports.File({
            filename: config.LOG_FILE,
            format: combine(timestamp(), winston.format.json()),
        }),
    ],
});
//# sourceMappingURL=logger.js.map