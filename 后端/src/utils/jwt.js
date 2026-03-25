// JWT工具
const jwt = require('jsonwebtoken');
const config = require('../config');

// 生成访问令牌
function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload.id,
      username: payload.username,
      roleId: payload.roleId
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// 生成刷新令牌
function generateRefreshToken(payload) {
  return jwt.sign(
    { userId: payload.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

// 验证访问令牌
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
}

// 验证刷新令牌
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
}

// 解析令牌（不验证）
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};
