# 高校社团匹配平台（React + Flask + Supabase + Vercel）

本项目实现了一个高校平台风格的网站：

- 首页引导 + 弹框进入问卷
- 7步问卷（参考你提供的页面结构）
- 结果页三个按钮：返回修改 / 跳转 AI 推荐 / 自己逛逛
- 所有社团页面（搜索框 + 社团卡片 + 过去活动 + 招新信息）
- 相似的人页面（按兴趣相似度展示）

详细说明见：

- `docs/前后端文件说明.md`
- `docs/AI与环境配置.md`

## 快速启动

## 1) 启动后端
```powershell
cd backend
pip install -r requirements.txt
python app.py
```

## 2) 启动前端
```powershell
cd frontend
npm install
npm run dev
```

## 3) 访问

打开 `http://localhost:5173`
