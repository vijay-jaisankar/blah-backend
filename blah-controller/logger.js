const winston = require('winston');
const ecsFormat = require('@elastic/ecs-winston-format');

// Winston setup
const logger = winston.createLogger({
    levels: {
        'info': 0,
        'ok': 1,
        'error': 2
      },
    level: 'info',
    format: ecsFormat(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: './log/node_combined.log' }),
    ],
});

module.exports = logger;