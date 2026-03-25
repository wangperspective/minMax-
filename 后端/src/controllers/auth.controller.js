// 认证控制器
const { login, refreshToken, getCurrentUser } = require('../services/auth.service');
const { logOperation } = require('../services/auth.service');
const logger = require('../utils/logger');

// 登录
async function handleLogin(req, res, next) {
  try {
    const { username, password } = req.body;

    const result = await login(username, password, req);

    res.json({
      success: true,
      code: 'LOGIN_SUCCESS',
      message: '登录成功',
      data: result
    });
  } catch (error) {
    // 记录失败的登录尝试（不阻塞主流程）
    if (req.body?.username) {
      setImmediate(async () => {
        try {
          await logOperation(null, req.body.username, 'auth', '登录失败', req, false, error.message);
        } catch (logError) {
          // 忽略日志错误
        }
      });
    }
    next(error);
  }
}

// 刷新令牌
async function handleRefreshToken(req, res, next) {
  try {
    const { refreshToken: refreshTokenStr } = req.body;

    if (!refreshTokenStr) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_REFRESH_TOKEN',
        message: '缺少刷新令牌'
      });
    }

    const result = await refreshToken(refreshTokenStr);

    res.json({
      success: true,
      code: 'REFRESH_SUCCESS',
      message: '刷新成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// 获取当前用户信息
async function handleGetCurrentUser(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);

    res.json({
      success: true,
      code: 'GET_USER_SUCCESS',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

// 退出登录
async function handleLogout(req, res, next) {
  try {
    // 记录退出日志
    await logOperation(req.user.id, req.user.username, 'auth', '退出', req, true);

    logger.info('User logged out', { userId: req.user.id, username: req.user.username });

    res.json({
      success: true,
      code: 'LOGOUT_SUCCESS',
      message: '退出成功'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleLogin,
  handleRefreshToken,
  handleGetCurrentUser,
  handleLogout
};
