# 快速部署指南 - 3 步上线

## Step 1️⃣: 推送代码到 GitHub
```bash
git add .
git commit -m "project ready for Vercel deployment"
git push origin main
```

## Step 2️⃣: Vercel 中创建项目
访问 https://vercel.com/dashboard
- Import 项目
- 选择此仓库
- 配置环境变量

### 必需的环境变量（在 Vercel Settings 中添加）
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...
SUPABASE_KEY=ey... (可选别名)
OPENAI_API_KEY=sk-proj-... (可选)
VITE_API_BASE_URL=/api
```

注意：`GITHUB_TOKEN` 不需要配置到 Vercel 环境变量。

## Step 3️⃣: 点击 Deploy 并等待完成 ✨

---

### 完成！你的应用现在在线了！

测试应用：访问 Vercel 给你的域名

API 测试：
```bash
curl https://your-app.vercel.app/api/health
```

---

### 需要帮助？
- 📖 详见 [DEPLOYMENT.md](./DEPLOYMENT.md)
- ✅ 检查清单：[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- 🎯 完整说明：[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)
