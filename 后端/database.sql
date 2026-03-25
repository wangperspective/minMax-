-- =============================================
-- 后台管理系统数据库初始化脚本
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS admin_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE admin_system;

-- =============================================
-- 用户表
-- =============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用, 1=正常',
  `role_id` INT UNSIGNED DEFAULT NULL COMMENT '角色ID',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 角色表
-- =============================================
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `role_code` VARCHAR(50) NOT NULL COMMENT '角色编码',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用, 1=正常',
  `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序号',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- =============================================
-- 菜单表
-- =============================================
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `parent_id` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '父菜单ID, 0表示根菜单',
  `menu_name` VARCHAR(50) NOT NULL COMMENT '菜单名称',
  `menu_type` ENUM('directory','menu','button') NOT NULL DEFAULT 'menu' COMMENT '菜单类型: directory=目录, menu=菜单, button=按钮',
  `menu_icon` VARCHAR(50) DEFAULT NULL COMMENT '菜单图标',
  `route_path` VARCHAR(200) DEFAULT NULL COMMENT '路由路径',
  `component` VARCHAR(200) DEFAULT NULL COMMENT '组件路径',
  `permission` VARCHAR(100) DEFAULT NULL COMMENT '权限标识',
  `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序号',
  `visible` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否显示: 0=隐藏, 1=显示',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用, 1=正常',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_menu_type` (`menu_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单表';

-- =============================================
-- 角色菜单关联表
-- =============================================
DROP TABLE IF EXISTS `role_menus`;
CREATE TABLE `role_menus` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id` INT UNSIGNED NOT NULL COMMENT '角色ID',
  `menu_id` INT UNSIGNED NOT NULL COMMENT '菜单ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_menu` (`role_id`, `menu_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_menu_id` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单关联表';

-- =============================================
-- 操作日志表
-- =============================================
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `module` VARCHAR(50) DEFAULT NULL COMMENT '模块名称',
  `operation` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `method` VARCHAR(10) NOT NULL COMMENT '请求方法',
  `url` VARCHAR(500) NOT NULL COMMENT '请求URL',
  `ip` VARCHAR(50) NOT NULL COMMENT 'IP地址',
  `location` VARCHAR(100) DEFAULT NULL COMMENT 'IP归属地',
  `params` TEXT COMMENT '请求参数',
  `result` TINYINT NOT NULL DEFAULT 1 COMMENT '操作结果: 0=失败, 1=成功',
  `error_msg` VARCHAR(500) DEFAULT NULL COMMENT '错误信息',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- =============================================
-- 统计数据表（用于图表展示）
-- =============================================
DROP TABLE IF EXISTS `statistics`;
CREATE TABLE `statistics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `user_count` INT UNSIGNED DEFAULT 0 COMMENT '用户总数',
  `new_users` INT UNSIGNED DEFAULT 0 COMMENT '新增用户',
  `login_count` INT UNSIGNED DEFAULT 0 COMMENT '登录次数',
  `active_users` INT UNSIGNED DEFAULT 0 COMMENT '活跃用户数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='统计数据表';

-- =============================================
-- 初始化数据
-- =============================================

-- 初始化角色
INSERT INTO `roles` (`role_name`, `role_code`, `description`, `sort_order`) VALUES
('超级管理员', 'admin', '拥有所有权限', 1),
('普通用户', 'user', '普通用户权限', 2);

-- 初始化管理员账号 (密码: admin123)
INSERT INTO `users` (`username`, `password`, `real_name`, `email`, `phone`, `status`, `role_id`) VALUES
('admin', '$2a$10$IXr1ZGLYv5qWqpVQEYlJu8YwMZ5IH9FMFYUyXPZ/XuWkPZYIlHqWO', '系统管理员', 'admin@example.com', '13800138000', 1, 1),
('user', '$2a$10$IXr1ZGLYv5qWqpVQEYlJu8YwMZ5IH9FMFYUyXPZ/XuWkPZYIlHqWO', '测试用户', 'user@example.com', '13800138001', 1, 2);

-- 初始化菜单
INSERT INTO `menus` (`parent_id`, `menu_name`, `menu_type`, `menu_icon`, `route_path`, `component`, `sort_order`) VALUES
-- 一级菜单
(0, '系统首页', 'menu', 'DashboardOutlined', '/dashboard', 'dashboard/index', 1),
(0, '系统管理', 'directory', 'SettingOutlined', '/system', NULL, 100),

-- 系统管理子菜单
((SELECT id FROM (SELECT id FROM menus WHERE route_path='/system' LIMIT 1) AS tmp), '用户管理', 'menu', NULL, '/system/users', 'system/users/index', 1),
((SELECT id FROM (SELECT id FROM menus WHERE route_path='/system' LIMIT 1) AS tmp), '角色管理', 'menu', NULL, '/system/roles', 'system/roles/index', 2),
((SELECT id FROM (SELECT id FROM menus WHERE route_path='/system' LIMIT 1) AS tmp), '菜单管理', 'menu', NULL, '/system/menus', 'system/menus/index', 3),
((SELECT id FROM (SELECT id FROM menus WHERE route_path='/system' LIMIT 1) AS tmp), '操作日志', 'menu', NULL, '/system/logs', 'system/logs/index', 4);

-- 初始化角色菜单关联（超级管理员拥有所有菜单权限）
INSERT INTO `role_menus` (`role_id`, `menu_id`)
SELECT 1, id FROM `menus`;

-- 初始化统计数据（最近30天）
INSERT INTO `statistics` (`stat_date`, `user_count`, `new_users`, `login_count`, `active_users`)
SELECT
  DATE_SUB(CURDATE(), INTERVAL n DAY) AS stat_date,
  100 + n * 2 AS user_count,
  FLOOR(RAND() * 5) + 1 AS new_users,
  FLOOR(RAND() * 100) + 50 AS login_count,
  FLOOR(RAND() * 30) + 10 AS active_users
FROM (
  SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION
  SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION
  SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION
  SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION
  SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION
  SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
) AS numbers;

-- =============================================
-- 注意事项
-- =============================================
-- 1. 初始管理员账号：admin / admin123
-- 2. 测试用户账号：user / admin123
-- 3. 请在生产环境中修改默认密码和JWT密钥
-- 4. 密码使用 bcrypt 加密，cost factor = 10
