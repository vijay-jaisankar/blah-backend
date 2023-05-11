const winston = require('winston');
const ecsFormat = require('@elastic/ecs-winston-format');

// Winston setup
const logger = winston.createLogger({
    format: ecsFormat(),
	transports: [new winston.transports.File({
        filename: './log/node_combined.log',
	})],
});

module.exports = logger;