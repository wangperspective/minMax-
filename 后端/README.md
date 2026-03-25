# 后台管理系统 - 后端服务

基于 Node.js + Express + MySQL 的后台管理系统后端服务。

## 技术栈

- **运行环境**: Node.js
- **框架**: Express
- **数据库**: MySQL
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **参数验证**: express-validator
- **跨域**: cors

## 项目结构

```
后端/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.js  # 数据库配置
│   │   └── index.js     # 全局配置
│   ├── middleware/      # 中间件
│   │   ├── auth.js      # JWT认证中间件
│   │   ├── error.js     # 错误处理中间件
│   │   ├── logger.js    # 日志中间件
│   │   └── validation.js # 参数验证中间件
│   ├── routes/          # 路由
│   │   ├── auth.routes.js    # 认证路由
│   │   ├── user.routes.js    # 用户路由
│   │   ├── menu.routes.js    # 菜单路由
│   │   ├── role.routes.js    # 角色路由
│   │   ├── statistics.routes.js # 统计路由
│   │   └── index.js         # 路由汇总
│   ├── controllers/     # 控制器
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── menu.controller.js
│   │   ├── role.controller.js
│   │   └── statistics.controller.js
│   ├── services/        # 业务逻辑层
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── menu.service.js
│   │   ├── role.service.js
│   │   └── statistics.service.js
│   ├── utils/           # 工具函数
│   │   ├── logger.js    # 日志工具
│   │   ├── helpers.js   # 辅助函数
│   │   └── jwt.js       # JWT工具
│   └── app.js           # 入口文件
├── .env.example         # 环境变量模板
├── database.sql         # 数据库初始化脚本
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd 后端
npm install
```

### 2. 配置数据库

1. 创建数据库并执行初始化脚本：

```bash
mysql -u root -p < database.sql
```

2. 或手动在 MySQL 中执行 `database.sql` 文件内容

### 3. 配置环境变量

1. 复制环境变量模板：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置数据库连接信息：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=admin_system
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=2h
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=http://localhost:5173
```

### 4. 启动服务

```bash
# 开发模式（支持热更新）
npm run dev

# 生产模式
npm start
```

服务启动成功后，访问 http://localhost:3001/health 检查服务状态。

## 默认账号

- **管理员**: admin / admin123
- **普通用户**: user / admin123

**重要**: 生产环境请立即修改默认密码！

## API 接口文档

### 认证接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/auth/login` | POST | 用户登录 | 否 |
| `/api/auth/refresh` | POST | 刷新令牌 | 否 |
| `/api/auth/current` | GET | 获取当前用户信息 | 是 |
| `/api/auth/logout` | POST | 退出登录 | 是 |

### 用户接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/users` | GET | 获取用户列表 | 是 |
| `/api/users/:id` | GET | 获取用户详情 | 是 |
| `/api/users` | POST | 创建用户 | 管理员 |
| `/api/users/:id` | PUT | 更新用户 | 是 |
| `/api/users/:id` | DELETE | 删除用户 | 管理员 |
| `/api/users/:id/reset-password` | POST | 重置密码 | 管理员 |

### 菜单接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/menus/list` | GET | 获取菜单列表 | 是 |
| `/api/menus/tree` | GET | 获取菜单树 | 是 |
| `/api/menus/:id` | GET | 获取菜单详情 | 是 |
| `/api/menus` | POST | 创建菜单 | 管理员 |
| `/api/menus/:id` | PUT | 更新菜单 | 管理员 |
| `/api/menus/:id` | DELETE | 删除菜单 | 管理员 |

### 角色接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/roles` | GET | 获取角色列表 | 是 |
| `/api/roles/:id` | GET | 获取角色详情 | 是 |
| `/api/roles` | POST | 创建角色 | 管理员 |
| `/api/roles/:id` | PUT | 更新角色 | 管理员 |
| `/api/roles/:id` | DELETE | 删除角色 | 管理员 |

### 统计接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/statistics/dashboard` | GET | 获取首页统计数据 | 是 |
| `/api/statistics/login-trend` | GET | 获取登录趋势 | 是 |
| `/api/statistics/user-growth` | GET | 获取用户增长趋势 | 是 |

## 数据库表结构

- `users` - 用户表
- `roles` - 角色表
- `menus` - 菜单表
- `role_menus` - 角色菜单关联表
- `operation_logs` - 操作日志表
- `statistics` - 统计数据表

## 开发说明

### 三层架构

项目采用经典的三层架构：

```
Controller (控制器) → Service (服务层) → Repository (数据访问)
```

- **Controller**: 处理 HTTP 请求，调用 Service 层
- **Service**: 业务逻辑层，处理核心业务
- **Repository**: 数据访问层（当前直接使用 query 函数）

### 错误处理

统一的错误处理机制：

```javascript
// 抛出业务错误
throw new AppError('错误信息', 400, 'ERROR_CODE')

// 错误会被全局错误处理器捕获并返回统一格式
```

### 日志

使用结构化 JSON 日志：

```javascript
logger.info('信息', { key: 'value' })
logger.error('错误', { error: err.message })
```

## 生产环境部署

1. 设置 `NODE_ENV=production`
2. 修改 JWT_SECRET 为强随机字符串
3. 配置正确的数据库连接信息
4. 使用 PM2 进程管理：

```bash
npm install -g pm2
pm2 start src/app.js --name admin-backend
pm2 startup
pm2 save
```

## License

MIT
