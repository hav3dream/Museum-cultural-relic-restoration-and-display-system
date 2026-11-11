# 博物馆文物修复与展示系统 (Museum Rebirth)

<div align="center">

**基于AI的中国传统艺术修复与创作平台**

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646cff?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003b57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06b6d4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 项目概述

**博物馆文物修复与展示系统**是一个集成了多种深度学习算法的中国传统艺术数字化修复与创作平台。项目旨在通过先进的AI技术，对古画、壁画、碑林等文化遗产进行修复与保护，同时提供书法生成和艺术创作工具，让传统文化艺术在数字时代焕发新生。

### 项目背景

中国拥有丰富的文化遗产，但许多古代艺术品因年代久远而受损严重。传统修复方法耗时费力且成本高昂。本平台利用深度学习技术，能够快速、高质量地完成艺术品的数字化修复，为文化遗产保护提供新的解决方案。

### 核心目标

- 🎨 **数字化修复**：运用AI算法对古画、壁画、碑林进行智能修复
- 🖌️ **艺术创作**：提供书法生成、轮廓提取等创作工具
- 🏛️ **在线展示**：打造数字艺术画廊，展示修复成果
- 💎 **服务商业化**：提供灵活的订阅和按需付费模式

---

## ✨ 功能特性

### 核心功能模块

| 功能模块 | 算法支持 | 功能描述 |
|---------|---------|---------|
| 🖼️ **古画修复** | SGRGAN | 使用超分辨率生成对抗网络修复古代国画，提升画质并修复损坏部分 |
| 🏛️ **壁画修复** | DCADif | 基于扩散模型的壁画修复技术，针对敦煌壁画等文物进行智能修复 |
| 📐 **轮廓提取** | Relic2Contour | 从文物图像中提取精确轮廓，用于艺术研究和再创作 |
| ✍️ **书法生成** | 自定义AI模型 | 输入文字即可生成传统书法风格作品 |
| 🗿 **碑林修复** | 集成算法 | 专门针对石碑、碑刻文字的修复与增强 |
| 🎭 **虚拟修复** | 多算法融合 | 综合运用多种算法进行文物虚拟修复 |

### 平台功能

- 👤 **用户认证系统**：支持用户注册、登录、JWT令牌认证
- 💰 **积分系统**：基于使用次数的积分管理
- 💳 **订阅方案**：
  - 入门版：¥29.99/月，每月10次古画+10次壁画+5次书法
  - 专业版：¥79.99/月，每月100次古画+100次壁画+50次书法
  - 企业版：¥199.99/月，无限次使用+API接口+专属支持
- 🎫 **按需购买**：支持一次性购买100/500/1000次使用额度
- 🏆 **在线画廊**：展示修复成果，包括国画、壁画、剪纸、青铜器、碑刻书法等分类
- 📊 **用户控制台**：管理订阅、查看使用记录、下载作品

---

## 🏗️ 技术架构

### 技术栈

**前端技术**
- ⚛️ React 18 + TypeScript：现代化前端框架
- ⚡ Vite 7：极速构建工具
- 🎨 Tailwind CSS v4：原子化CSS框架
- 🎭 shadcn/ui：高质量UI组件库
- 🌊 Framer Motion：流畅动画库
- 🔄 TanStack Query：数据状态管理
- 🚦 Wouter：轻量级路由

**后端技术**
- 🟢 Express.js：Web应用框架
- 💾 SQLite + Drizzle ORM：数据库与ORM
- 🔐 JWT + httpOnly Cookie：安全认证
- 💳 Stripe：支付集成
- 📤 Multer：文件上传处理

**AI后端**
- 🐍 Python微服务架构
- 🤖 SGRGAN：古画修复算法
- 🎨 DCADif：壁画修复算法
- 🖊️ Relic2Contour：轮廓提取算法

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端层                              │
│  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      应用服务层                               │
│           Express.js + JWT Auth + Stripe Payment            │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Auth API │  │Restore API│  │Gallery API│  │ User API │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────────────────┐
│  数据库层     │ │ 文件存储层 │ │    AI算法服务层        │
│   SQLite     │ │   Uploads │ │ Python微服务 (Flask)   │
│ Drizzle ORM  │ │           │ │                        │
│              │ │           │ │ ┌────────────────────┐ │
│ • users      │ │           │ │ │  SGRGAN (古画)     │ │
│ • credits    │ │           │ │ │  :5002             │ │
│ • orders     │ │           │ │ └────────────────────┘ │
│ • galleries  │ │           │ │ ┌────────────────────┐ │
│              │ │           │ │ │  DCADif (壁画)     │ │
│              │ │           │ │ │  :5004             │ │
│              │ │           │ │ └────────────────────┘ │
│              │ │           │ │ ┌────────────────────┐ │
│              │ │           │ │ │  Relic2Contour     │ │
│              │ │           │ │ │  :5001             │ │
│              │ │           │ │ └────────────────────┘ │
└──────────────┘ └───────────┘ └───────────────────────┘
```

---

## 📁 项目结构

```
Museum-cultural-relic-restoration-and-display-system/
├── client/                    # 前端应用
│   ├── src/
│   │   ├── components/       # React组件
│   │   │   ├── ui/          # shadcn/ui组件
│   │   │   ├── layout/      # 布局组件
│   │   │   ├── decorative/  # 装饰组件
│   │   │   └── restoration/ # 修复功能组件
│   │   ├── pages/           # 页面组件
│   │   ├── contexts/        # React Context
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── lib/             # 工具库
│   │   │   └── api/         # API客户端
│   │   └── App.tsx          # 应用入口
│   └── public/              # 静态资源
│       └── images/          # 图片资源
│
├── server/                   # 后端应用
│   ├── config/              # 配置文件
│   │   └── env.ts          # 环境变量配置
│   ├── db/                 # 数据库
│   │   └── schema.ts       # 数据库模型
│   ├── routes/             # API路由
│   │   ├── auth.ts         # 认证路由
│   │   ├── restoration.ts  # 修复功能路由
│   │   ├── gallery.ts      # 画廊路由
│   │   ├── checkout.ts     # 支付路由
│   │   └── user.ts         # 用户路由
│   ├── middleware/         # 中间件
│   ├── services/           # 业务逻辑
│   ├── utils/              # 工具函数
│   └── index.ts            # 服务器入口
│
├── shared/                  # 共享代码
│   ├── products.ts         # 产品与定价配置
│   └── types/              # TypeScript类型定义
│
├── data/                   # 数据文件
│   └── museum.db          # SQLite数据库
│
├── uploads/               # 用户上传文件目录
│
├── package.json           # 项目依赖
├── vite.config.ts        # Vite配置
├── tsconfig.json         # TypeScript配置
└── .env.example          # 环境变量示例
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.x 或更高版本
- **npm**: 8.x 或更高版本（推荐使用 pnpm）
- **Python**: 3.8+ (用于AI后端服务)

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd Museum-cultural-relic-restoration-and-display-system
```

2. **安装依赖**

```bash
npm install
# 或使用 pnpm（推荐）
pnpm install
```

3. **配置环境变量**

复制 `.env.example` 文件并重命名为 `.env`，然后根据实际情况配置：

```bash
cp .env.example .env
```

4. **初始化数据库**

数据库会在首次运行时自动初始化。

5. **启动开发服务器**

```bash
npm run dev
```

应用将在 `http://localhost:3000` 上运行。

6. **构建生产版本**

```bash
npm run build
npm run start
```

---

## ⚙️ 环境变量说明

| 变量名 | 描述 | 默认值 | 必填 |
|-------|------|--------|------|
| `NODE_ENV` | 运行环境 | `development` | 否 |
| `PORT` | 服务器端口 | `3000` | 否 |
| `JWT_SECRET` | JWT密钥（至少32字符） | - | **是** |
| `STRIPE_SECRET_KEY` | Stripe支付密钥 | - | **是** |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook密钥 | - | **是** |
| `DATABASE_URL` | SQLite数据库路径 | `./data/museum.db` | 否 |
| `UPLOAD_DIR` | 文件上传目录 | `./uploads` | 否 |
| `AI_SGRGAN_URL` | SGRGAN服务地址 | `http://127.0.0.1:5002` | 否 |
| `AI_DCADIF_URL` | DCADif服务地址 | `http://127.0.0.1:5004` | 否 |
| `AI_RELIC2CONTOUR_URL` | Relic2Contour服务地址 | `http://127.0.0.1:5001` | 否 |

### 生成JWT密钥

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🗺️ 页面路由

| 路径 | 页面名称 | 描述 |
|------|---------|------|
| `/` | 首页 | 平台介绍与功能展示 |
| `/login` | 登录/注册 | 用户认证页面 |
| `/dashboard` | 用户控制台 | 管理个人信息、订阅和使用记录 |
| `/virtual-restoration` | 虚拟修复 | 综合修复工具页面 |
| `/ancient-painting-restoration` | 古画修复 | 使用SGRGAN算法修复古画 |
| `/mural-restoration` | 壁画修复 | 使用DCADif算法修复壁画 |
| `/calligraphy-generation` | 书法生成 | AI书法创作工具 |
| `/outline-analysis` | 轮廓提取 | 使用Relic2Contour提取文物轮廓 |
| `/stele-restoration` | 碑林修复 | 碑刻文字修复与增强 |
| `/pricing` | 订阅方案 | 查看和购买订阅计划 |
| `/gallery/:category` | 在线画廊 | 浏览修复作品（国画/壁画/剪纸/青铜/碑刻） |

---

## 🤖 AI后端接口

### SGRGAN - 古画修复服务

**服务地址**: `http://127.0.0.1:5002`

**功能**: 基于超分辨率生成对抗网络的古代国画修复

**启动方式**:
```bash
cd ai_services/sgrgan
python app.py
```

**接口**: `POST /restore`
- 接收图片文件
- 返回修复后的高清图像

---

### DCADif - 壁画修复服务

**服务地址**: `http://127.0.0.1:5004`

**功能**: 基于扩散模型的壁画智能修复

**启动方式**:
```bash
cd ai_services/dcadif
python app.py
```

**接口**: `POST /restore`
- 接收壁画图片
- 返回修复后的壁画图像

---

### Relic2Contour - 轮廓提取服务

**服务地址**: `http://127.0.0.1:5001`

**功能**: 从文物图像中提取精确轮廓线条

**启动方式**:
```bash
cd ai_services/relic2contour
python app.py
```

**接口**: `POST /extract`
- 接收文物图片
- 返回轮廓提取结果

---

## 📦 NPM脚本命令

```bash
# 开发模式（启动Vite开发服务器）
npm run dev

# 构建生产版本（前端+后端）
npm run build

# 启动生产服务器
npm run start

# 预览构建结果
npm run preview

# TypeScript类型检查
npm run check

# 代码格式化
npm run format
```

---

## 📸 应用截图

> 以下为应用界面预览

### 首页
<!-- TODO: 添加首页截图 -->
*展示平台核心功能和艺术作品*

### 古画修复
<!-- TODO: 添加古画修复页面截图 -->
*上传古画并使用SGRGAN算法进行智能修复*

### 壁画修复
<!-- TODO: 添加壁画修复页面截图 -->
*运用DCADif技术修复敦煌壁画等文物*

### 在线画廊
<!-- TODO: 添加画廊页面截图 -->
*浏览和分享修复完成的艺术作品*

### 用户控制台
<!-- TODO: 添加用户控制台截图 -->
*管理订阅、查看使用统计和下载作品*

---

## 🛠️ 开发指南

### 添加新的UI组件

本项目使用 [shadcn/ui](https://ui.shadcn.com/)，可以通过以下方式添加组件：

```bash
npx shadcn-ui@latest add [component-name]
```

### 数据库迁移

修改 `server/db/schema.ts` 后，数据库会在下次启动时自动迁移。

### API开发

1. 在 `server/routes/` 目录创建新的路由文件
2. 在 `server/index.ts` 中注册路由
3. 在 `client/src/lib/api/` 中添加对应的API客户端函数

---

## 🤝 开发团队

**博物馆文物修复与展示系统**项目由多个专业团队协作完成：

- **前端团队**：负责React应用开发和UI/UX设计
- **后端团队**：负责Express API和数据库设计
- **AI团队**：负责深度学习算法研发和模型训练
- **产品团队**：负责需求分析和产品规划

---

## 🙏 致谢

感谢以下开源项目和技术：

- [React](https://reactjs.org/) - 用户界面库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [shadcn/ui](https://ui.shadcn.com/) - 精美的React组件
- [Express.js](https://expressjs.com/) - Web应用框架
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Stripe](https://stripe.com/) - 支付平台

感谢所有为文化遗产数字化保护做出贡献的研究者和开发者。

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 📮 联系我们

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](../../issues)
- 发送邮件至项目维护者
- 加入我们的技术交流群

---

<div align="center">

**让传统艺术在数字时代焕发新生** ✨

Made with ❤️ by Museum Team

</div>
