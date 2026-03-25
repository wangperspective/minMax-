// JWT认证中间件
const jwt = require('jsonwebtoken');
const config = require('../config');

// 自定义错误类
class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
    this.code = 'AUTH_ERROR';
  }
}

// 验证JWT Token
function authenticate(req, res, next) {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('未提供认证令牌', 401);
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret);

    // 将用户信息附加到请求对象
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      roleId: decoded.roleId
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: '令牌已过期，请重新登录'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: '无效的令牌'
      });
    }

    return res.status(401).json({
      success: false,
      code: error.code || 'AUTH_ERROR',
      message: error.message || '认证失败'
    });
  }
}

// 角色权限验证
function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthError('未认证', 401);
      }

      // 超级管理员(roleId=1)拥有所有权限
      if (req.user.roleId === 1) {
        return next();
      }

      // 检查用户角色是否在允许的角色列表中
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.roleId)) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: '权限不足'
        });
      }

      next();
    } catch (error) {
      return res.status(error.statusCode || 401).json({
        success: false,
        code: error.code || 'AUTH_ERROR',
        message: error.message || '认证失败'
      });
    }
  };
}

// 可选认证（不强制要求登录）
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        roleId: decoded.roleId
      };
    }

    next();
  } catch (error) {
    // 静默失败，继续处理请求
    next();
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
