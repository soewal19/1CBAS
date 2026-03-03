const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

const transport = new DailyRotateFile({
    filename: path.join(__dirname, '../logs', 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,      // Zips the logs
    maxSize: '20m',           // Max size before rotating within the same day
    maxFiles: '5d',           // Keeps logs for 5 days (or exactly 5 files depending on rotation rules)
    // To strictly keep only 5 files (regardless of days), we set maxFiles to '5'
});

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat)
        }),
        new DailyRotateFile({
            filename: path.join(__dirname, '../logs', 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '5',
        })
    ]
});

module.exports = logger;
