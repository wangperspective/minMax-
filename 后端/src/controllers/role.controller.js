// 角色控制器
const {
  getRoleList,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} = require('../services/role.service');
const { logOperation } = require('../services/auth.service');
const logger = require('../utils/logger');

// 获取角色列表
async function handleGetRoleList(req, res, next) {
  try {
    const result = await getRoleList(req.query);

    res.json({
      success: true,
      code: 'GET_ROLE_LIST_SUCCESS',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// 获取角色详情
async function handleGetRoleById(req, res, next) {
  try {
    const role = await getRoleById(req.params.id);

    res.json({
      success: true,
      code: 'GET_ROLE_SUCCESS',
      data: role
    });
  } catch (error) {
    next(error);
  }
}

// 创建角色
async function handleCreateRole(req, res, next) {
  try {
    const role = await createRole(req.body, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'role', '创建角色', req, true);

    res.json({
      success: true,
      code: 'CREATE_ROLE_SUCCESS',
      message: '创建角色成功',
      data: role
    });
  } catch (error) {
    next(error);
  }
}

// 更新角色
async function handleUpdateRole(req, res, next) {
  try {
    const role = await updateRole(req.params.id, req.body, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'role', '更新角色', req, true);

    res.json({
      success: true,
      code: 'UPDATE_ROLE_SUCCESS',
      message: '更新角色成功',
      data: role
    });
  } catch (error) {
    next(error);
  }
}

// 删除角色
async function handleDeleteRole(req, res, next) {
  try {
    await deleteRole(req.params.id, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'role', '删除角色', req, true);

    res.json({
      success: true,
      code: 'DELETE_ROLE_SUCCESS',
      message: '删除角色成功'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetRoleList,
  handleGetRoleById,
  handleCreateRole,
  handleUpdateRole,
  handleDeleteRole
};
