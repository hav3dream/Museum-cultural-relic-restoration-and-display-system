# 博物馆文物修复与展示系统

## 技术栈

前端：

- React (v18.3) + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (Radix UI) + Framer Motion
- Wouter (路由) + @tanstack/react-query (数据请求)
- Lucide React (图标)、Sonner (toast 通知)

后端：

- Node.js + Express (v4.21)
- Better-SQLite3 + Drizzle ORM
- bcryptjs + jsonwebtoken (JWT 鉴权) + multer (文件上传)

工程化：

- 包管理器：pnpm
- 构建：esbuild + tsc
- 代码风格：Prettier

## 常用命令

- 开发：前端 `npm run dev`（端口 3000，/api 代理到 8888），后端 `npx tsx server/index.ts`（端口 8888）
- 类型检查：`npm run check`
- 构建生产版本：`npm run build`
- 格式化：`npm run format`

## 设计系统

- 博物馆配色：`#7F3222`（深红）、`#D4A76A`（金）、`#E8E3D1`（米黄）、`#4A3428`（暖棕）、`#2C1810`（深墙）、`#C85840`（珊瑚悬停色）
- 字体：'Ma Shan Zheng'（书法标题）、'LXGW WenKai'（正文）、'Noto Serif SC'
- CSS 变量：`--color-museum-brown`、`--color-museum-gold`、`--color-museum-beige`

## 环境与数据库

- 环境变量参考 `.env.example`，复制为 `.env` 后按需修改
- SQLite 数据库位于 `data/museum.db`，首次启动自动建库与迁移
- AI 模型服务（SGRGAN/DCADif/Relic2Contour 等）为独立 Python 微服务，地址见 `.env.example`
