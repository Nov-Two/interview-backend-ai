# NestJS AI 全栈面试项目

本项目是一个基于 NestJS 和 Vue 3 的全栈 AI 聊天应用，集成了 DeepSeek API。

## 技术栈

- **后端**: NestJS, TypeORM, MySQL, JWT, Passport, Swagger
- **前端**: Vue 3, Vite, Pinia, Vant UI, TailwindCSS
- **AI**: DeepSeek API

## 功能特性

1.  **用户认证**:
    - 注册: 支持 `username`, `password`, `confirmPassword`，自动校验密码一致性。
    - 登录: JWT 认证。
2.  **AI 对话**:
    - 集成 DeepSeek API 进行智能问答。
    - **历史记录**: 自动保存用户的提问和 AI 的回答到 `chat_history` 表。
3.  **全局拦截器**: 统一响应格式 `{ code: 200, message: 'success', data: ... }`
4.  **异常过滤器**: 统一错误处理
5.  **日志中间件**: 记录请求日志
6.  **Swagger 文档**: 自动生成 API 文档
7.  **数据验证**: 使用 `class-validator` 和 `ValidationPipe`

## 目录结构

```
.
├── src/                # 后端源码
│   ├── ai/             # AI 模块 (含 ChatHistory 实体)
│   ├── auth/           # 认证模块 (含 RegisterDto)
│   ├── common/         # 公共模块 (Filters, Interceptors, Middleware)
│   ├── users/          # 用户模块
│   ├── app.module.ts   # 主模块
│   └── main.ts         # 入口文件
├── frontend/           # 前端源码
├── test/               # 测试文件
└── README.md           # 说明文档
```

## 快速开始

### 1. 环境准备

- Node.js (v18+)
- pnpm
- MySQL 数据库

### 2. 后端启动

```bash
# 安装依赖
pnpm install

# 配置环境变量 (.env)
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=123456
# DB_DATABASE=ai_app
# JWT_SECRET=supersecretkey
# DEEPSEEK_API_KEY=your_api_key

# 启动服务
pnpm start:dev
```

后端服务地址: `http://localhost:3000/api`
Swagger 文档: `http://localhost:3000/api/docs`

### 3. 前端启动

```bash
cd frontend
pnpm install
pnpm dev
```

前端访问地址: `http://localhost:5173` (或 5174)

## API 文档

访问 `http://localhost:3000/api/docs` 查看完整的 Swagger API 文档。

## Docker 部署

本项目支持使用 Docker 和 Docker Compose 进行一键部署。

### 1. 确保服务器已安装 Docker 和 Docker Compose

```bash
docker --version
docker-compose --version
```

### 2. 构建并启动容器

在项目根目录下运行：

```bash
docker-compose up -d --build
```

此命令将：
1.  构建 NestJS 后端应用的 Docker 镜像。
2.  启动 MySQL 数据库容器 (默认端口 3306)。
3.  启动 NestJS 后端应用容器 (默认端口 3000)。

### 3. 验证部署

查看容器状态：

```bash
docker-compose ps
```

查看应用日志：

```bash
docker-compose logs -f app
```

访问 API 文档：
`http://<服务器IP>:3000/api/docs`

### 4. 数据持久化

- 数据库数据持久化在 `mysql_data` 卷中。
- 上传的图片持久化在 `./uploads` 目录映射中。

### 5. 停止服务

```bash
docker-compose down
```
