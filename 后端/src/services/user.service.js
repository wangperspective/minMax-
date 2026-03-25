// 用户服务
const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { AppError } = require('../middleware/error');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');
const config = require('../config');
const logger = require('../utils/logger');

// 获取用户列表
async function getUserList(params) {
  try {
    const { page = 1, pageSize = 10, username, status, roleId } = params;
    const { offset } = getPagination(page, pageSize);

    // 构建查询条件
    const conditions = [];
    const queryParams = [];

    if (username) {
      conditions.push('username LIKE ?');
      queryParams.push(`%${username}%`);
    }

    if (status !== undefined && status !== '') {
      conditions.push('status = ?');
      queryParams.push(status);
    }

    if (roleId) {
      conditions.push('role_id = ?');
      queryParams.push(roleId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // 查询列表
    const list = await query(
      `SELECT u.id, u.username, u.real_name, u.email, u.phone, u.avatar, u.status,
              u.role_id, u.remark, u.last_login_time, u.created_at,
              r.role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ${whereClause}
       ORDER BY u.id DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, pageSize, offset]
    );

    return buildPaginationResponse(list, total, page, pageSize);
  } catch (error) {
    logger.error('Get user list error', { error: error.message });
    throw new AppError('获取用户列表失败', 500, 'GET_USER_LIST_ERROR');
  }
}

// 获取用户详情
async function getUserById(id) {
  try {
    const users = await query(
      `SELECT u.id, u.username, u.real_name, u.email, u.phone, u.avatar, u.status,
              u.role_id, u.remark, u.last_login_time, u.last_login_ip, u.created_at,
              r.role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      throw new AppError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    return users[0];
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Get user by id error', { error: error.message, id });
    throw new AppError('获取用户详情失败', 500, 'GET_USER_ERROR');
  }
}

// 创建用户
async function createUser(data, req) {
  try {
    const { username, password, realName, email, phone, roleId, status, remark } = data;

    // 检查用户名是否存在
    const existing = await query(
      `SELECT id FROM users WHERE username = ?`,
      [username]
    );

    if (existing.length > 0) {
      throw new AppError('用户名已存在', 409, 'USERNAME_EXISTS');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // 插入用户
    const result = await query(
      `INSERT INTO users (username, password, real_name, email, phone, role_id, status, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, realName, email, phone, roleId, status !== undefined ? status : 1, remark]
    );

    const userId = result.insertId;

    logger.info('User created', { userId, username, createdBy: req.user?.id });

    return await getUserById(userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Create user error', { error: error.message });
    throw new AppError('创建用户失败', 500, 'CREATE_USER_ERROR');
  }
}

// 更新用户
async function updateUser(id, data, req) {
  try {
    const { username, realName, email, phone, roleId, status, remark } = data;

    // 检查用户是否存在
    const existing = await query(
      `SELECT id, username FROM users WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      throw new AppError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    // 如果修改用户名，检查是否重复
    if (username && username !== existing[0].username) {
      const duplicate = await query(
        `SELECT id FROM users WHERE username = ? AND id != ?`,
        [username, id]
      );

      if (duplicate.length > 0) {
        throw new AppError('用户名已存在', 409, 'USERNAME_EXISTS');
      }
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    if (username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (realName !== undefined) {
      updateFields.push('real_name = ?');
      updateValues.push(realName);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (roleId !== undefined) {
      updateFields.push('role_id = ?');
      updateValues.push(roleId);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (remark !== undefined) {
      updateFields.push('remark = ?');
      updateValues.push(remark);
    }

    if (updateFields.length === 0) {
      return await getUserById(id);
    }

    updateValues.push(id);

    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    logger.info('User updated', { userId: id, updatedBy: req.user?.id });

    return await getUserById(id);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Update user error', { error: error.message, id });
    throw new AppError('更新用户失败', 500, 'UPDATE_USER_ERROR');
  }
}

// 删除用户
async function deleteUser(id, req) {
  try {
    // 检查用户是否存在
    const existing = await query(
      `SELECT id FROM users WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      throw new AppError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    // 不能删除自己
    if (req.user && req.user.id === id) {
      throw new AppError('不能删除当前登录用户', 400, 'CANNOT_DELETE_SELF');
    }

    await query(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );

    logger.info('User deleted', { userId: id, deletedBy: req.user?.id });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Delete user error', { error: error.message, id });
    throw new AppError('删除用户失败', 500, 'DELETE_USER_ERROR');
  }
}

// 重置密码
async function resetPassword(id, newPassword, req) {
  try {
    // 检查用户是否存在
    const existing = await query(
      `SELECT id FROM users WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      throw new AppError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    await query(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, id]
    );

    logger.info('User password reset', { userId: id, resetBy: req.user?.id });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Reset password error', { error: error.message, id });
    throw new AppError('重置密码失败', 500, 'RESET_PASSWORD_ERROR');
  }
}

module.exports = {
  getUserList,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
};
