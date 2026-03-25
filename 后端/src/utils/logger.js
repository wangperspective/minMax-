// 日志工具
const config = require('../config');

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'info';
  }

  formatMessage(level, message, meta = {}) {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: config.server.env,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  log(level, message, meta = {}) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.level);
    const msgLevelIndex = levels.indexOf(level);

    if (msgLevelIndex <= currentLevelIndex) {
      const formatted = this.formatMessage(level, message, meta);
      console.log(formatted);
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
}

module.exports = new Logger();
