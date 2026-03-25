// 全局错误处理中间件
const logger = require('../utils/logger');

// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

// 错误响应格式
function errorResponse(error, req) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    success: false,
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || '服务器内部错误',
    ...(isDevelopment && error.stack && { stack: error.stack }),
    requestId: req.id
  };
}

// 全局错误处理中间件
function errorHandler(err, req, res, next) {
  // 记录错误日志
  logger.error('Error occurred', {
    code: err.code,
    message: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method
  });

  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      code: 'DUPLICATE_ENTRY',
      message: '数据已存在',
      requestId: req.id
    });
  }

  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({
      success: false,
      code: 'DATABASE_ERROR',
      message: '数据库操作失败',
      requestId: req.id
    });
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: '无效的令牌',
      requestId: req.id
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_EXPIRED',
      message: '令牌已过期',
      requestId: req.id
    });
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: err.message,
      errors: err.errors,
      requestId: req.id
    });
  }

  // 自定义操作错误
  if (err.isOperational) {
    return res.status(err.statusCode).json(errorResponse(err, req));
  }

  // 未知错误
  return res.status(500).json(errorResponse(err, req));
}

// 404处理
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `路径 ${req.method} ${req.path} 不存在`,
    requestId: req.id
  });
}

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler
};
