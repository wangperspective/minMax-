// API接口
import request from './request'

// ==================== 认证接口 ====================

// 登录
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 刷新token
export function refreshToken(data) {
  return request({
    url: '/auth/refresh',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request({
    url: '/auth/current',
    method: 'get'
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// ==================== 用户接口 ====================

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUserById(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id, data) {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

// 重置密码
export function resetPassword(id, data) {
  return request({
    url: `/users/${id}/reset-password`,
    method: 'post',
    data
  })
}

// ==================== 菜单接口 ====================

// 获取菜单列表
export function getMenuList(params) {
  return request({
    url: '/menus/list',
    method: 'get',
    params
  })
}

// 获取菜单树
export function getMenuTree(params) {
  return request({
    url: '/menus/tree',
    method: 'get',
    params
  })
}

// 获取菜单详情
export function getMenuById(id) {
  return request({
    url: `/menus/${id}`,
    method: 'get'
  })
}

// 创建菜单
export function createMenu(data) {
  return request({
    url: '/menus',
    method: 'post',
    data
  })
}

// 更新菜单
export function updateMenu(id, data) {
  return request({
    url: `/menus/${id}`,
    method: 'put',
    data
  })
}

// 删除菜单
export function deleteMenu(id) {
  return request({
    url: `/menus/${id}`,
    method: 'delete'
  })
}

// ==================== 角色接口 ====================

// 获取角色列表
export function getRoleList(params) {
  return request({
    url: '/roles',
    method: 'get',
    params
  })
}

// 获取角色详情
export function getRoleById(id) {
  return request({
    url: `/roles/${id}`,
    method: 'get'
  })
}

// 创建角色
export function createRole(data) {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

// 更新角色
export function updateRole(id, data) {
  return request({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

// 删除角色
export function deleteRole(id) {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

// ==================== 统计接口 ====================

// 获取首页统计数据
export function getDashboardData() {
  return request({
    url: '/statistics/dashboard',
    method: 'get'
  })
}

// 获取登录趋势
export function getLoginTrend(params) {
  return request({
    url: '/statistics/login-trend',
    method: 'get',
    params
  })
}

// 获取用户增长趋势
export function getUserGrowthTrend(params) {
  return request({
    url: '/statistics/user-growth',
    method: 'get',
    params
  })
}
