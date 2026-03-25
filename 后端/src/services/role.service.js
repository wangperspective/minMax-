// 角色服务
const { query } = require('../config/database');
const { AppError } = require('../middleware/error');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

// 获取角色列表
async function getRoleList(params) {
  try {
    const { page, pageSize, status } = params;

    // 如果有分页参数，使用分页
    if (page || pageSize) {
      const { page: pageNum = 1, pageSize: pageSizeNum = 10 } = params;
      const { offset } = getPagination(pageNum, pageSizeNum);

      const conditions = [];
      const queryParams = [];

      if (status !== undefined && status !== '') {
        conditions.push('status = ?');
        queryParams.push(status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = await query(
        `SELECT COUNT(*) as total FROM roles ${whereClause}`,
        queryParams
      );
      const total = countResult[0].total;

      const list = await query(
        `SELECT * FROM roles ${whereClause} ORDER BY sort_order ASC, id ASC LIMIT ? OFFSET ?`,
        [...queryParams, pageSizeNum, offset]
      );

      return buildPaginationResponse(list, total, pageNum, pageSizeNum);
    }

    // 否则返回全部
    const conditions = [];
    const queryParams = [];

    if (status !== undefined && status !== '') {
      conditions.push('status = ?');
      queryParams.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const list = await query(
      `SELECT * FROM roles ${whereClause} ORDER BY sort_order ASC, id ASC`,
      queryParams
    );

    return { data: list };
  } catch (error) {
    logger.error('Get role list error', { error: error.message });
    throw new AppError('获取角色列表失败', 500, 'GET_ROLE_LIST_ERROR');
  }
}

// 获取角色详情
async function getRoleById(id) {
  try {
    const roles = await query(
      `SELECT * FROM roles WHERE id = ?`,
      [id]
    );

    if (roles.length === 0) {
      throw new AppError('角色不存在', 404, 'ROLE_NOT_FOUND');
    }

    const role = roles[0];

    // 获取角色的菜单权限
    const menus = await query(
      `SELECT menu_id FROM role_menus WHERE role_id = ?`,
      [id]
    );

    role.menuIds = menus.map(m => m.menuId);

    return role;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Get role by id error', { error: error.message, id });
    throw new AppError('获取角色详情失败', 500, 'GET_ROLE_ERROR');
  }
}

// 创建角色
async function createRole(data, req) {
  try {
    const { roleName, roleCode, description, sortOrder, status, menuIds } = data;

    // 检查角色编码是否存在
    const existing = await query(
      `SELECT id FROM roles WHERE role_code = ?`,
      [roleCode]
    );

    if (existing.length > 0) {
      throw new AppError('角色编码已存在', 409, 'ROLE_CODE_EXISTS');
    }

    const result = await query(
      `INSERT INTO roles (role_name, role_code, description, sort_order, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        roleName,
        roleCode,
        description,
        sortOrder || 0,
        status !== undefined ? status : 1
      ]
    );

    const roleId = result.insertId;

    // 分配菜单权限
    if (menuIds && menuIds.length > 0) {
      await assignMenusToRole(roleId, menuIds);
    }

    logger.info('Role created', { roleId, roleName, createdBy: req.user?.id });

    return await getRoleById(roleId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Create role error', { error: error.message });
    throw new AppError('创建角色失败', 500, 'CREATE_ROLE_ERROR');
  }
}

// 更新角色
async function updateRole(id, data, req) {
  try {
    const { roleName, roleCode, description, sortOrder, status, menuIds } = data;

    // 检查角色是否存在
    const existing = await query(
      `SELECT id, role_code FROM roles WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      throw new AppError('角色不存在', 404, 'ROLE_NOT_FOUND');
    }

    // 如果修改角色编码，检查是否重复
    if (roleCode && roleCode !== existing[0].roleCode) {
      const duplicate = await query(
        `SELECT id FROM roles WHERE role_code = ? AND id != ?`,
        [roleCode, id]
      );

      if (duplicate.length > 0) {
        throw new AppError('角色编码已存在', 409, 'ROLE_CODE_EXISTS');
      }
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    if (roleName !== undefined) {
      updateFields.push('role_name = ?');
      updateValues.push(roleName);
    }
    if (roleCode !== undefined) {
      updateFields.push('role_code = ?');
      updateValues.push(roleCode);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (sortOrder !== undefined) {
      updateFields.push('sort_order = ?');
      updateValues.push(sortOrder);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await query(
        `UPDATE roles SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // 更新菜单权限
    if (menuIds !== undefined) {
      await query(
        `DELETE FROM role_menus WHERE role_id = ?`,
        [id]
      );

      if (menuIds.length > 0) {
        await assignMenusToRole(id, menuIds);
      }
    }

    logger.info('Role updated', { roleId: id, updatedBy: req.user?.id });

    return await getRoleById(id);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Update role error', { error: error.message, id });
    throw new AppError('更新角色失败', 500, 'UPDATE_ROLE_ERROR');
  }
}

// 删除角色
async function deleteRole(id, req) {
  try {
    // 检查角色是否存在
    const existing = await query(
      `SELECT id FROM roles WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      throw new AppError('角色不存在', 404, 'ROLE_NOT_FOUND');
    }

    // 检查是否有用户使用该角色
    const users = await query(
      `SELECT id FROM users WHERE role_id = ?`,
      [id]
    );

    if (users.length > 0) {
      throw new AppError('该角色下有用户，无法删除', 400, 'ROLE_IN_USE');
    }

    await query(
      `DELETE FROM roles WHERE id = ?`,
      [id]
    );

    // 删除角色菜单关联
    await query(
      `DELETE FROM role_menus WHERE role_id = ?`,
      [id]
    );

    logger.info('Role deleted', { roleId: id, deletedBy: req.user?.id });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Delete role error', { error: error.message, id });
    throw new AppError('删除角色失败', 500, 'DELETE_ROLE_ERROR');
  }
}

// 分配菜单权限给角色
async function assignMenusToRole(roleId, menuIds) {
  const values = menuIds.map(menuId => `(${roleId}, ${menuId})`).join(',');

  await query(
    `INSERT INTO role_menus (role_id, menu_id) VALUES ${values}`,
    []
  );
}

module.exports = {
  getRoleList,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
