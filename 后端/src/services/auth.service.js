// 认证服务
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { AppError } = require('../middleware/error');
const { getClientIP, formatDate } = require('../utils/helpers');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

// 用户登录
async function login(username, password, req) {
  try {
    console.log('[登录] 开始处理登录请求:', { username });

    // 查询用户
    const users = await query(
      `SELECT id, username, password, real_name, email, phone, avatar, status, role_id
       FROM users WHERE username = ? AND status = 1`,
      [username]
    );

    console.log('[登录] 查询用户结果:', users.length, '条');

    if (users.length === 0) {
      throw new AppError('用户名或密码错误', 401, 'LOGIN_FAILED');
    }

    const user = users[0];
    console.log('[登录] 用户信息:', { id: user.id, username: user.username, roleId: user.roleId });

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('[登录] 密码验证结果:', isPasswordValid);

    if (!isPasswordValid) {
      throw new AppError('用户名或密码错误', 401, 'LOGIN_FAILED');
    }

    // 更新最后登录信息
    const lastLoginIP = getClientIP(req);
    console.log('[登录] 准备更新登录信息');

    await query(
      `UPDATE users SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?`,
      [lastLoginIP, user.id]
    );

    // 生成token
    const payload = {
      id: user.id,
      username: user.username,
      roleId: user.roleId
    };
    console.log('[登录] 准备生成token, payload:', payload);

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    console.log('[登录] token生成成功');

    // 记录登录日志
    await logOperation(user.id, user.username, 'auth', '登录', req, true);

    logger.info('User logged in', { userId: user.id, username: user.username, ip: lastLoginIP });

    return {
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        roleId: user.roleId
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      username
    });
    console.error('详细错误信息:', error);
    throw new AppError('登录失败，请稍后重试', 500, 'LOGIN_ERROR');
  }
}

// 刷新令牌
async function refreshToken(refreshTokenStr) {
  try {
    const { verifyRefreshToken, generateAccessToken: newAccessToken } = require('../utils/jwt');

    const decoded = verifyRefreshToken(refreshTokenStr);

    if (!decoded) {
      throw new AppError('刷新令牌无效或已过期', 401, 'INVALID_REFRESH_TOKEN');
    }

    // 查询用户
    const users = await query(
      `SELECT id, username, status, role_id FROM users WHERE id = ? AND status = 1`,
      [decoded.userId]
    );

    if (users.length === 0) {
      throw new AppError('用户不存在或已被禁用', 401, 'USER_NOT_FOUND');
    }

    const user = users[0];

    // 生成新的访问令牌
    const payload = {
      id: user.id,
      username: user.username,
      roleId: user.roleId
    };

    const accessToken = newAccessToken(payload);

    return { accessToken };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Refresh token error', { error: error.message });
    throw new AppError('刷新令牌失败', 500, 'REFRESH_ERROR');
  }
}

// 获取当前用户信息
async function getCurrentUser(userId) {
  try {
    const users = await query(
      `SELECT id, username, real_name, email, phone, avatar, status, role_id,
              (SELECT role_name FROM roles WHERE id = users.role_id) as role_name
       FROM users WHERE id = ? AND status = 1`,
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    const user = users[0];

    // 获取用户菜单权限
    const menus = await getUserMenus(user.role_id);

    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      roleId: user.roleId,
      roleName: user.role_name,
      menus
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Get current user error', { error: error.message, userId });
    throw new AppError('获取用户信息失败', 500, 'GET_USER_ERROR');
  }
}

// 获取用户菜单
async function getUserMenus(roleId) {
  try {
    const menus = await query(
      `SELECT m.id, m.parent_id, m.menu_name, m.menu_type, m.menu_icon,
              m.route_path, m.component, m.permission, m.sort_order, m.visible
       FROM menus m
       INNER JOIN role_menus rm ON m.id = rm.menu_id
       WHERE rm.role_id = ? AND m.status = 1
       ORDER BY m.sort_order ASC, m.id ASC`,
      [roleId]
    );

    // 构建树形菜单
    const { buildTree } = require('../utils/helpers');
    return buildTree(menus.map(m => ({
      id: m.id,
      parentId: m.parentId,
      name: m.menuName,
      type: m.menuType,
      icon: m.menuIcon,
      path: m.routePath,
      component: m.component,
      permission: m.permission,
      meta: {
        title: m.menuName,
        icon: m.menuIcon,
        hidden: m.visible === 0
      }
    })), 0);
  } catch (error) {
    logger.error('Get user menus error', { error: error.message, roleId });
    return [];
  }
}

// 记录操作日志
async function logOperation(userId, username, module, operation, req, result = true, errorMsg = null) {
  try {
    await query(
      `INSERT INTO operation_logs (user_id, username, module, operation, method, url, ip, params, result, error_msg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || 0,  // userId 为 null 时使用 0
        username,
        module,
        operation,
        req.method,
        req.path,
        getClientIP(req),
        JSON.stringify({ query: req.query, body: req.body ? { ...req.body, password: '***' } : {} }),
        result ? 1 : 0,
        errorMsg
      ]
    );
  } catch (error) {
    logger.error('Log operation error', { error: error.message });
  }
}

module.exports = {
  login,
  refreshToken,
  getCurrentUser,
  getUserMenus,
  logOperation
};
