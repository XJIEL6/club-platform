# Vercel 部署前检查清单

在部署到 Vercel 前，请确保完成以下所有检查项。

## ✅ 项目配置

- [x] `vercel.json` 已更新为新的 v2 格式
- [x] `api/index.py` 已创建作为 Vercel 入口点
- [x] `backend/index.py` 已创建作为备用入口点
- [x] `frontend/vite.config.js` 已配置构建设置
- [x] `.env.example` 已包含所有必需的环境变量
- [x] `.gitignore` 已更新

## ✅ 后端配置

- [x] `backend/requirements.txt` 已包含所有依赖：
  - Flask 3.1.0
  - flask-cors 5.0.0
  - supabase 2.15.0
  - openai 1.70.0
  - python-dotenv 1.0.1
  - gunicorn 21.2.0 (生产用)

- [x] `backend/app.py` 已更新：
  - CORS 已启用
  - 所有 API 路由都有 `/api/` 前缀
  - 条件化的 `app.run()` 调用（不在 Vercel 上运行）
  - 环境变量正确加载

## ✅ 前端配置

- [x] `frontend/package.json` 已包含：
  - React 18.3.1
  - react-router-dom 6.27.0
  - Vite 5.4.8
  - build 脚本：`vite build`

- [x] `frontend/src/services/api.js` 已配置：
  - 使用 `VITE_API_BASE_URL` 环境变量
  - 默认使用 `/api` 前缀

## 🔧 Vercel 部署前准备

### 1. 环境变量准备

确保你有以下环境变量的值（如需要）：

```
VITE_API_BASE_URL=/api         # ✓ 已配置
SUPABASE_URL=???               # 如果使用 Supabase，填入你的 URL
SUPABASE_SERVICE_ROLE_KEY=???  # 如果使用 Supabase，填入密钥
OPENAI_API_KEY=???             # 如果使用 AI 功能，填入密钥
OPENAI_MODEL=gpt-4o-mini      # 默认值
```

### 2. GitHub 准备

- [ ] 项目已推送到 GitHub
- [ ] 所有更改已提交且已推送
- [ ] 默认分支为 `main`

### 3. Vercel 账户准备

- [ ] 已在 vercel.com 注册账户
- [ ] 已连接 GitHub 账户

## 📋 部署流程

1. **连接仓库**
   - 访问 Vercel Dashboard
   - 导入 GitHub 仓库
   - 选择 club-platform 项目

2. **配置环境变量**
   - 进入项目 Settings > Environment Variables
   - 添加所有必需的环境变量
   - 标记需要在构建时使用的变量

3. **确认构建设置**
   - Framework: Other
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

4. **点击 Deploy**
   - 等待构建完成
   - 检查构建日志以查找任何错误
   - 测试部署的应用

## 🧪 部署后测试

部署完成后，请测试以下功能：

- [ ] 前端正常加载（访问 Vercel 域名）
- [ ] 健康检查 API 工作：`GET /api/health`
- [ ] 社团列表 API 工作：`GET /api/clubs`
- [ ] 问卷提交功能工作：`POST /api/surveys`
- [ ] 相似用户查询工作：`GET /api/similar-users`
- [ ] AI 推荐功能工作（如已配置）：`POST /api/ai-recommend`

## ⚠️ 常见问题解决

### 如果构建失败

检查以下几点：
1. 查看 Vercel 构建日志
2. 确认 Node.js 和 Python 版本兼容
3. 确认所有依赖都在 requirements.txt 中
4. 检查是否有语法错误

### 如果 API 无法访问

确保：
1. API 入口点正确（/api/index.py）
2. Flask 应用可以导入所有依赖
3. 环境变量已正确设置
4. 检查 vercel.json 中的路由配置

### 如果前端不加载

确保：
1. `frontend/dist` 目录已创建
2. vite build 命令成功执行
3. 静态文件服务正确配置

## 📚 相关文档

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署指南
- [.env.example](./.env.example) - 环境变量模板
- [vercel.json](./vercel.json) - Vercel 配置

## ✨ 部署完成

一旦部署成功，你就可以：
- 与他人分享 Vercel 域名链接
- 从任何地方访问应用
- 继续在 GitHub 上开发（更改会自动部署）
- 监控应用性能和错误

祝部署顺利！🚀
