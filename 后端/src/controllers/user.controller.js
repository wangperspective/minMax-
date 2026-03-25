// 用户控制器
const {
  getUserList,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
} = require('../services/user.service');
const { logOperation } = require('../services/auth.service');
const logger = require('../utils/logger');

// 获取用户列表
async function handleGetUserList(req, res, next) {
  try {
    const result = await getUserList(req.query);

    res.json({
      success: true,
      code: 'GET_USER_LIST_SUCCESS',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// 获取用户详情
async function handleGetUserById(req, res, next) {
  try {
    const user = await getUserById(req.params.id);

    res.json({
      success: true,
      code: 'GET_USER_SUCCESS',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

// 创建用户
async function handleCreateUser(req, res, next) {
  try {
    const user = await createUser(req.body, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'user', '创建用户', req, true);

    res.json({
      success: true,
      code: 'CREATE_USER_SUCCESS',
      message: '创建用户成功',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

// 更新用户
async function handleUpdateUser(req, res, next) {
  try {
    const user = await updateUser(req.params.id, req.body, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'user', '更新用户', req, true);

    res.json({
      success: true,
      code: 'UPDATE_USER_SUCCESS',
      message: '更新用户成功',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

// 删除用户
async function handleDeleteUser(req, res, next) {
  try {
    await deleteUser(req.params.id, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'user', '删除用户', req, true);

    res.json({
      success: true,
      code: 'DELETE_USER_SUCCESS',
      message: '删除用户成功'
    });
  } catch (error) {
    next(error);
  }
}

// 重置密码
async function handleResetPassword(req, res, next) {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: '新密码长度至少6位'
      });
    }

    await resetPassword(req.params.id, newPassword, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'user', '重置密码', req, true);

    res.json({
      success: true,
      code: 'RESET_PASSWORD_SUCCESS',
      message: '重置密码成功'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetUserList,
  handleGetUserById,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleResetPassword
};
