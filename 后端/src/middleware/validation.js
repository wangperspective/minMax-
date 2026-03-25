// 验证中间件
const { body, param, query, validationResult } = require('express-validator');

// 验证结果处理中间件
function handleValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: '请求参数验证失败',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
}

// 登录验证规则
const loginValidation = [
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 50 }).withMessage('用户名长度应在3-50之间')
    .trim(),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码长度至少6位'),
  handleValidation
];

// 用户创建验证规则
const createUserValidation = [
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 50 }).withMessage('用户名长度应在3-50之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线')
    .trim(),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 50 }).withMessage('密码长度应在6-50之间'),
  body('realName')
    .optional()
    .isLength({ max: 50 }).withMessage('真实姓名长度不能超过50')
    .trim(),
  body('email')
    .optional()
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('roleId')
    .optional()
    .isInt({ min: 1 }).withMessage('角色ID必须是正整数'),
  body('status')
    .optional()
    .isIn([0, 1]).withMessage('状态只能是0或1'),
  handleValidation
];

// 用户更新验证规则
const updateUserValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('用户ID必须是正整数'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 }).withMessage('用户名长度应在3-50之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线')
    .trim(),
  body('realName')
    .optional()
    .isLength({ max: 50 }).withMessage('真实姓名长度不能超过50')
    .trim(),
  body('email')
    .optional()
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('roleId')
    .optional()
    .isInt({ min: 1 }).withMessage('角色ID必须是正整数'),
  body('status')
    .optional()
    .isIn([0, 1]).withMessage('状态只能是0或1'),
  handleValidation
];

// ID参数验证
const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID必须是正整数'),
  handleValidation
];

// 分页验证
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  handleValidation
];

// 菜单验证规则
const createMenuValidation = [
  body('menuName')
    .notEmpty().withMessage('菜单名称不能为空')
    .isLength({ max: 50 }).withMessage('菜单名称长度不能超过50')
    .trim(),
  body('menuType')
    .notEmpty().withMessage('菜单类型不能为空')
    .isIn(['directory', 'menu', 'button']).withMessage('菜单类型只能是directory、menu或button'),
  body('parentId')
    .optional()
    .isInt({ min: 0 }).withMessage('父菜单ID必须是大于等于0的整数'),
  body('routePath')
    .optional()
    .isLength({ max: 200 }).withMessage('路由路径长度不能超过200')
    .trim(),
  body('component')
    .optional()
    .isLength({ max: 200 }).withMessage('组件路径长度不能超过200')
    .trim(),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('排序号必须是大于等于0的整数'),
  handleValidation
];

// 角色验证规则
const createRoleValidation = [
  body('roleName')
    .notEmpty().withMessage('角色名称不能为空')
    .isLength({ max: 50 }).withMessage('角色名称长度不能超过50')
    .trim(),
  body('roleCode')
    .notEmpty().withMessage('角色编码不能为空')
    .isLength({ max: 50 }).withMessage('角色编码长度不能超过50')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('角色编码只能包含字母、数字和下划线')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 255 }).withMessage('描述长度不能超过255')
    .trim(),
  handleValidation
];

module.exports = {
  loginValidation,
  createUserValidation,
  updateUserValidation,
  idValidation,
  paginationValidation,
  createMenuValidation,
  createRoleValidation
};
