# Vercel 部署指南

本项目为一个 Full-Stack 应用，包含 React 前端和 Flask 后端。本指南将帮助你将项目部署到 Vercel。

## 前置要求

1. **Vercel 账户**: 在 [vercel.com](https://vercel.com) 注册账户
2. **GitHub 账户**: 将项目托管在 GitHub 上
3. **环境变量**: 准备好所有必需的环境变量

## 部署步骤

### 步骤 1: 准备环境变量

在 Vercel 项目设置中添加以下环境变量：

```env
# API 端点（生产环境自动配置为 /api）
VITE_API_BASE_URL=/api

# Supabase 配置（可选，如果项目使用 Supabase）
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# 如果你当前使用的是 SUPABASE_KEY 命名，也可以配置：
# SUPABASE_KEY=your_key

# OpenAI 配置（如果使用 AI 推荐功能）
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# 服务器配置
FLASK_ENV=production

# 可选（当前应用不直接使用）
DATABASE_URL=postgresql://...
```

说明：
- 代码优先读取 `SUPABASE_SERVICE_ROLE_KEY`，未设置时会回退读取 `SUPABASE_KEY`。
- `GITHUB_TOKEN` 不属于应用运行时变量，不建议放在 Vercel 项目环境变量中。

### 步骤 2: 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." > "Project"
3. 选择 GitHub 仓库
4. 选择此项目 (club-platform)

### 步骤 3: 配置构建设置

Vercel 会自动检测项目配置。确认以下设置：

- **Framework**: 自动检测为 Other
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install` (在根目录执行，会自动安装前端依赖)

### 步骤 4: 设置环境变量

在 Vercel 项目设置中：
1. 进入 "Settings" > "Environment Variables"
2. 添加上述所有环境变量
3. 标记需要在构建时使用的变量

### 步骤 5: 部署

1. 点击 "Deploy"
2. Vercel 会自动：
   - 安装前端依赖
   - 构建 React 应用
   - 配置 Flask 后端 API 路由
   - 部署到全球 CDN

## 项目结构说明

```
.
├── api/                      # Vercel serverless functions
│   └── index.py             # API 入口点
├── backend/                 # Flask 后端
│   ├── app.py               # Flask 应用主文件
│   ├── index.py             # Vercel 备用入口点
│   ├── requirements.txt      # Python 依赖
│   ├── data/                # 数据模块
│   └── services/            # 业务逻辑服务
├── frontend/                # React 前端
│   ├── package.json         # Node.js 依赖
│   ├── vite.config.js       # Vite 构建配置
│   └── src/                 # React 源代码
└── vercel.json              # Vercel 部署配置
```

## API 路由说明

所有 API 请求都通过 `/api/` 前缀：

- `GET /api/clubs` - 获取社团列表
- `POST /api/surveys` - 提交问卷
- `GET /api/similar-users` - 获取相似用户
- `POST /api/ai-recommend` - 获取 AI 推荐
- `GET /api/health` - 健康检查

## 常见问题

### Q1: 构建失败怎么办？

检查以下几点：
1. 确认 `frontend/package.json` 存在且格式正确
2. 检查 `backend/requirements.txt` 中的依赖
3. 查看 Vercel 构建日志获取详细错误信息

### Q2: API 请求返回 404？

确保：
1. API 端点在 `backend/app.py` 中定义了路由
2. 路由前缀为 `/api/`
3. 检查 `vercel.json` 中的路由配置

### Q3: CORS 错误？

CORS 已在 `vercel.json` 的 headers 中配置。如果仍有问题：
1. 确认 Flask 应用启用了 CORS：`CORS(app)`
2. 检查环境变量正确加载

### Q4: 环境变量未加载？

1. 确认变量已在 Vercel 项目设置中添加
2. 对于构建时需要的变量，确保已标记
3. 重新部署以应用新的环境变量

## 本地开发

### 运行前端
```bash
cd frontend
npm install
npm run dev
```

### 运行后端
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 同时运行前后端
```bash
# 终端 1 - 后端
cd backend && python app.py

# 终端 2 - 前端
cd frontend && npm install && npm run dev
```

前端会在 `http://localhost:5173` 运行，API 请求会通过 `vite.config.js` 中的代理转发到 `http://localhost:5000`。

## 更新部署

任何推送到 GitHub 主分支的更改都会自动触发 Vercel 的重新部署。查看部署进度：
1. 在 Vercel Dashboard 中查看部署历史
2. 点击特定部署查看详细日志

## 性能优化建议

1. **前端优化**:
   - 启用 Gzip 压缩
   - 使用 Code Splitting
   - 优化图片资源

2. **后端优化**:
   - 使用缓存减少数据库查询
   - 实现请求超时
   - 使用连接池

3. **CDN 配置**:
   - 静态资源使用 CDN 缓存
   - 设置合适的缓存策略

## 支持

如有问题，请：
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 检查 Vercel 控制面板中的构建日志
3. 查看 GitHub Issues

## 相关链接

- [Vercel Flask 支持](https://vercel.com/docs/functions/serverless-functions/python)
- [React & Vite 最佳实践](https://vitejs.dev/)
- [Flask 官方文档](https://flask.palletsprojects.com/)
