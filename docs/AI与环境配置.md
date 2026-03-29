# AI 与环境配置文档（Supabase + OpenAI + Vercel）

## 1. 环境变量

复制根目录 `.env.example` 为 `.env`，并填写以下值：

如果你手里已有其他命名方式（例如 `SUPABASE_KEY`），请按下面映射统一：

- `SUPABASE_KEY` -> `SUPABASE_SERVICE_ROLE_KEY`（推荐）
- `SUPABASE_SERVICE_ROLE_KEY` 与 `SUPABASE_KEY` 二选一即可，优先使用 `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` 当前版本不直接使用（可保留，供后续扩展）
- `GITHUB_TOKEN` 不是运行时变量，不需要配置到 Vercel

- `VITE_API_BASE_URL`: 前端 API 基地址
  - 本地开发推荐：`/api`
  - 线上部署推荐：`/api`
- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 服务端密钥（仅后端使用）
- `OPENAI_API_KEY`: OpenAI Key
- `OPENAI_MODEL`: 使用模型名（默认 `gpt-4o-mini`）

## 2. Supabase 表结构建议

建议建表 `surveys`：

- `id` (text / uuid, primary key)
- `created_at` (timestamp)
- `name` (text)
- `studentId` (text)
- `contact` (text)
- `college` (text)
- `grade` (text)
- `interests` (jsonb)
- `activityRatings` (jsonb)
- `role` (text)
- `weeklyTime` (text)
- `goals` (jsonb)
- `strengths` (text)
- `experience` (text)
- `expectations` (text)

## 3. AI 调用逻辑

后端文件：`backend/services/recommender.py`

- 有 `OPENAI_API_KEY`:
  - 调用 OpenAI Chat Completions
  - 输入用户信息 + 社团候选
  - 输出推荐 JSON
- 没有 `OPENAI_API_KEY`:
  - 自动使用规则引擎回退
  - 按兴趣标签重合度返回推荐

## 4. 本地运行

## 启动后端
```powershell
cd backend
pip install -r requirements.txt
python app.py
```

## 启动前端
```powershell
cd frontend
npm install
npm run dev
```

前端默认访问 `http://localhost:5173`，通过代理访问后端 `http://127.0.0.1:5000`。

## 5. Vercel 部署

当前仓库已包含 `vercel.json`：

- 前端使用 Vite 构建
- `/api/*` 走 Flask
- 其余路由回到 React SPA

在 Vercel 项目设置中添加与本地一致的环境变量：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `VITE_API_BASE_URL`（可设为 `/api`）

## 6. 安全说明

- `SUPABASE_SERVICE_ROLE_KEY` 只能用于后端，绝不能在前端代码中引用。
- 前端仅通过 `/api/*` 与后端通信。
- 若需要前端直连 Supabase，请单独配置匿名公钥并启用 RLS。
