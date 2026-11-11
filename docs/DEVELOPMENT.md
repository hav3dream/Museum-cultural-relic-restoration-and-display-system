# 博物馆文物修复与展示系统 - 开发者文档

本文档为博物馆文物修复与展示系统（Museum Rebirth）项目的开发者提供全面的技术架构、编码规范和开发指南。

## 目录

- [技术栈](#技术栈)
- [项目架构](#项目架构)
- [前端架构](#前端架构)
- [后端架构](#后端架构)
- [数据库设计](#数据库设计)
- [代码规范](#代码规范)
- [开发指南](#开发指南)
- [API开发指南](#api开发指南)

---

## 技术栈

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.3.1 | UI框架 |
| TypeScript | ^5.6.3 | 类型系统 |
| Vite | ^7.1.7 | 构建工具和开发服务器 |
| Wouter | ^3.3.5 | 轻量级路由 |
| TanStack Query | ^4.41.0 | 服务端状态管理 |
| Tailwind CSS | ^4.1.14 | 样式框架 |
| Framer Motion | ^12.23.22 | 动画库 |
| shadcn/ui | - | UI组件库（基于Radix UI） |
| Axios | ^1.12.0 | HTTP客户端 |
| React Hook Form | ^7.64.0 | 表单管理 |
| Zod | ^4.1.12 | 数据验证 |
| Lucide React | ^0.453.0 | 图标库 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时环境 |
| Express | ^4.21.2 | Web框架 |
| TypeScript | ^5.6.3 | 类型系统 |
| SQLite | - | 数据库 |
| better-sqlite3 | ^12.6.2 | SQLite驱动 |
| Drizzle ORM | ^0.45.1 | ORM框架 |
| bcryptjs | ^3.0.3 | 密码加密 |
| jsonwebtoken | ^9.0.3 | JWT认证 |
| Multer | ^2.1.1 | 文件上传 |
| Stripe | ^19.3.0 | 支付处理 |
| Zod | ^4.1.12 | 数据验证 |

### 开发工具

| 工具 | 版本 | 用途 |
|------|------|------|
| pnpm | ^10.15.1 | 包管理器 |
| ESBuild | ^0.25.0 | 服务端构建 |
| Prettier | ^3.6.2 | 代码格式化 |
| Drizzle Kit | ^0.31.9 | 数据库工具 |

---

## 项目架构

### 目录结构

```
museum/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   │   ├── ui/       # 基础UI组件（shadcn/ui）
│   │   │   ├── decorative/ # 装饰组件
│   │   │   └── ...       # 业务组件
│   │   ├── hooks/        # 自定义Hooks
│   │   ├── lib/          # 工具函数
│   │   ├── pages/        # 页面组件
│   │   ├── contexts/     # React Context
│   │   ├── index.css     # 全局样式和设计系统
│   │   └── main.tsx      # 应用入口
│   └── index.html        # HTML模板
├── server/                # 后端应用
│   ├── config/           # 配置文件
│   │   └── env.ts        # 环境变量验证
│   ├── db/               # 数据库层
│   │   ├── schema.ts     # Drizzle Schema定义
│   │   ├── connection.ts # 数据库连接
│   │   └── migrate.ts    # 数据库迁移
│   ├── middleware/       # Express中间件
│   ├── routes/           # 路由定义
│   ├── services/         # 业务逻辑层
│   └── index.ts          # 服务器入口
├── shared/               # 前后端共享代码
│   ├── types/           # 类型定义
│   └── constants/       # 常量定义
├── attached_assets/      # 静态资源
├── dist/                # 构建输出
│   ├── public/          # 前端构建产物
│   └── index.js         # 后端构建产物
├── data/                # SQLite数据库文件
├── uploads/             # 用户上传文件
├── docs/                # 项目文档
├── .env.example         # 环境变量示例
├── vite.config.ts       # Vite配置
├── tsconfig.json        # TypeScript配置
└── package.json         # 项目配置
```

### 模块划分

- **client**: 前端React应用（SPA）
- **server**: 后端Express API服务
- **shared**: 类型定义和常量，前后端共享

---

## 前端架构

### 路由系统

使用 **Wouter** 作为轻量级路由库：

```typescript
// client/src/main.tsx
import { Route, Switch } from 'wouter';

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/restoration" component={RestorationPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/:rest*" component={NotFoundPage} />
    </Switch>
  );
}
```

### 状态管理

#### 1. 全局状态（Context API）

**认证状态** (`client/src/contexts/AuthContext.tsx`):
```typescript
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**主题状态** (使用 `next-themes`):
```typescript
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="light">
  <App />
</ThemeProvider>
```

#### 2. 服务端状态（React Query）

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 获取数据
const { data, isLoading, error } = useQuery({
  queryKey: ['restorations'],
  queryFn: fetchRestorations,
});

// 修改数据
const mutation = useMutation({
  mutationFn: createRestoration,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['restorations'] });
  },
});
```

### 组件库（shadcn/ui）

项目包含 **52个** shadcn/ui 组件：

#### 核心组件
- `Button`, `Input`, `Select`, `Checkbox`, `Switch`, `Slider`
- `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `HoverCard`
- `Card`, `Separator`, `Badge`, `Avatar`
- `Tabs`, `Accordion`, `Collapsible`
- `Table`, `DataTable`, `Pagination`

#### 高级组件
- `Form`, `Calendar`, `DatePicker`, `Command`
- `DropdownMenu`, `ContextMenu`, `Menubar`, `NavigationMenu`
- `Sheet`, `Drawer`, `Carousel`
- `Progress`, `Skeleton`, `ScrollArea`
- `Toast` / `Sonner`, `Alert`

所有组件位于 `client/src/components/ui/`，支持主题定制。

### 设计系统

#### 色彩系统

**品牌色** (定义在 `client/src/index.css`):

```css
/* 博物馆文物修复与展示系统品牌色 */
--color-museum-brown: #886f5b;      /* 主棕色 */
--color-museum-brown-light: #bea085; /* 浅棕色 */
--color-museum-brown-dark: #855e40;  /* 深棕色 */
--color-museum-beige: #f1dfbe;       /* 米色 */
--color-museum-beige-light: #fbeac8; /* 浅米色 */
--color-museum-beige-dark: #f0e5cf;  /* 深米色 */
--color-museum-gold: #d4af37;        /* 金色 */
--color-museum-gold-light: #e8cc6e;  /* 浅金色 */
--color-museum-ink: #2c241b;         /* 墨色 */
```

**语义化色彩**:

```css
:root {
  --primary: #886f5b;           /* 主要色 */
  --secondary: #f1dfbe;         /* 次要色 */
  --muted: #f0e5cf;            /* 弱化色 */
  --accent: #f1dfbe;           /* 强调色 */
  --destructive: oklch(...);   /* 危险色 */
}

.dark {
  --primary: #bea085;          /* 深色模式主色 */
  --background: #1a1613;       /* 深色背景 */
  --foreground: #e8dcc8;       /* 深色前景 */
}
```

**使用方式**:

```tsx
// 使用品牌色
<div className="bg-museum-brown text-museum-beige">

// 使用语义化色彩
<Button className="bg-primary text-primary-foreground">
```

#### 字体系统

```css
/* 字体定义 */
--font-sans: 'Noto Sans SC', sans-serif;   /* 无衬线字体 */
--font-serif: 'Noto Serif SC', serif;      /* 衬线字体 */
```

**使用方式**:

```tsx
<h1 className="font-serif">标题使用衬线字体</h1>
<p className="font-sans">正文使用无衬线字体</p>
```

**中文字体优化**:

```css
h1, h2, h3, .font-serif {
  letter-spacing: 0.05em;          /* 字间距 */
  font-feature-settings: "halt";   /* 半角标点 */
}

p, .font-sans {
  line-height: 1.75;               /* 行高优化 */
}
```

#### 阴影系统

```css
--shadow-museum-soft: -5px 5px 10px 0px rgba(0, 0, 0, 0.10);
--shadow-museum-medium: -5px 5px 20px 0px rgba(0, 0, 0, 0.20);
```

### 动画系统

#### CSS动画（7个内置动画）

1. **cloud-drift** - 云飘动画
2. **cloud-drift-reverse** - 反向云飘
3. **ink-breathe** - 墨韵呼吸
4. **seal-appear** - 印章出现
5. **shimmer-gold** - 金色光泽
6. **ink-stroke-draw** - 墨笔绘制
7. **float-gentle** - 轻柔漂浮

**使用方式**:

```tsx
<div className="animate-cloud-drift">云朵飘动</div>
<div className="animate-ink-breathe">墨韵呼吸</div>
<div className="animate-seal-appear">印章出现</div>
```

#### Framer Motion动画

用于复杂交互动画：

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  内容
</motion.div>
```

### 装饰组件系统

项目包含 **5个** 中国风装饰组件，位于 `client/src/components/decorative/`：

#### 1. CloudDrift - 云飘组件

模拟中国画中的云朵效果。

**Props**:
```typescript
interface CloudDriftProps {
  className?: string;  // 额外的CSS类
  count?: number;      // 云朵数量，默认3
  opacity?: number;    // 透明度，默认0.15
}
```

**使用示例**:
```tsx
import { CloudDrift } from '@/components/decorative';

<div className="relative min-h-screen">
  <CloudDrift count={5} opacity={0.2} />
  <div className="relative z-10">
    {/* 页面内容 */}
  </div>
</div>
```

**特点**:
- 自动循环动画
- 多层云朵效果
- 透明度可调节
- 不影响交互（`pointer-events-none`）

#### 2. InkBrushStroke - 墨笔描边

模拟毛笔书写效果的描边动画。

**Props**:
```typescript
interface InkBrushStrokeProps {
  className?: string;
  width?: number;              // 宽度（像素），默认300
  color?: string;             // 颜色，默认'#886f5b'
  duration?: number;          // 动画时长（秒），默认1.2
  delay?: number;             // 延迟（秒），默认0
  variant?: 'underline' | 'divider' | 'accent';  // 样式变体
}
```

**使用示例**:
```tsx
import { InkBrushStroke } from '@/components/decorative';

<div>
  <h2>标题文字</h2>
  <InkBrushStroke variant="underline" width={200} delay={0.3} />
</div>

<InkBrushStroke
  variant="divider"
  width={400}
  color="#d4af37"
  className="my-8"
/>
```

**三种样式**:
- `underline`: 用于标题下划线
- `divider`: 用于内容分隔
- `accent`: 用于装饰点缀

#### 3. SealStamp - 印章组件

中国传统印章效果，带有出现动画。

**Props**:
```typescript
interface SealStampProps {
  text?: string;      // 印章文字，默认'韵'
  size?: number;      // 尺寸（像素），默认48
  className?: string;
  delay?: number;     // 出现延迟（秒），默认0
  color?: string;     // 颜色，默认'#a03020'
}
```

**使用示例**:
```tsx
import { SealStamp } from '@/components/decorative';

<div className="flex items-center gap-4">
  <h1>博物馆文物修复与展示系统</h1>
  <SealStamp text="韵" size={56} delay={0.5} />
</div>

{/* 多个印章 */}
<div className="flex gap-2">
  <SealStamp text="画" size={40} />
  <SealStamp text="韵" size={40} delay={0.2} />
  <SealStamp text="新" size={40} delay={0.4} />
  <SealStamp text="生" size={40} delay={0.6} />
</div>
```

**特点**:
- 弹性出现动画
- 支持单字或多字
- 尺寸自适应
- 衬线字体显示

#### 4. MistEffect - 雾气效果

营造神秘朦胧的氛围。

**Props**:
```typescript
interface MistEffectProps {
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';  // 强度
  color?: string;                             // 颜色
}
```

**使用示例**:
```tsx
import { MistEffect } from '@/components/decorative';

<div className="relative">
  <MistEffect intensity="medium" />
  <div className="relative z-10">
    {/* 内容 */}
  </div>
</div>
```

#### 5. WavePattern - 水波纹图案

传统水波纹装饰图案。

**Props**:
```typescript
interface WavePatternProps {
  className?: string;
  direction?: 'horizontal' | 'vertical';  // 方向
  color?: string;                         // 颜色
  opacity?: number;                       // 透明度
}
```

**使用示例**:
```tsx
import { WavePattern } from '@/components/decorative';

<div className="border-t border-b py-8 relative">
  <WavePattern direction="horizontal" opacity={0.1} />
  <div className="relative z-10">
    {/* 内容 */}
  </div>
</div>
```

#### 装饰组件最佳实践

1. **层级管理**: 装饰组件通常使用 `absolute` 定位，确保内容使用 `relative z-10`
2. **性能优化**: 所有动画支持 `prefers-reduced-motion`，尊重用户偏好
3. **可访问性**: 装饰组件使用 `pointer-events-none`，不影响交互
4. **组合使用**: 可以组合多个装饰组件创造丰富效果

**完整示例**:

```tsx
import {
  CloudDrift,
  InkBrushStroke,
  SealStamp,
  WavePattern
} from '@/components/decorative';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-museum-beige-light to-white">
      {/* 背景装饰 */}
      <CloudDrift count={4} opacity={0.15} />
      <WavePattern direction="horizontal" className="absolute bottom-0" />

      {/* 内容区域 */}
      <div className="relative z-10 container py-20">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-5xl font-serif text-museum-ink">
            博物馆文物修复与展示系统
          </h1>
          <SealStamp text="韵" size={64} delay={0.5} />
        </div>

        <InkBrushStroke
          variant="underline"
          width={300}
          delay={0.3}
          className="mb-8"
        />

        <p className="text-xl text-museum-brown">
          传统文化的数字化传承
        </p>
      </div>
    </section>
  );
}
```

---

## 后端架构

### 中间件栈

Express中间件按顺序执行：

```typescript
// server/index.ts
app.use(cors());                      // 跨域支持
app.use(cookieParser());             // Cookie解析
app.use('/api/webhooks', webhooks);  // Webhook（原始body）
app.use(express.json());             // JSON解析
app.use(express.urlencoded({ extended: true }));  // URL编码
app.use('/uploads', express.static(uploadPath));  // 静态文件
// ... API路由 ...
app.use(express.static(staticPath)); // 前端静态文件
app.get('*', serveSPA);              // SPA回退
app.use(errorHandler);               // 错误处理（最后）
```

### 路由模块

项目采用模块化路由设计，每个路由文件导出一个工厂函数：

```
server/routes/
├── auth.ts           # 认证相关 (/api/auth)
├── restoration.ts    # 修复处理 (/api/restoration)
├── checkout.ts       # 支付结账 (/api/checkout)
├── subscription.ts   # 订阅管理 (/api/subscription)
├── gallery.ts        # 作品画廊 (/api/gallery)
├── user.ts          # 用户信息 (/api/user)
└── webhook.ts       # Stripe Webhook (/api/webhooks)
```

**路由示例**:

```typescript
// server/routes/auth.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

export function createAuthRoutes() {
  const router = Router();

  // 公开路由
  router.post('/register', registerHandler);
  router.post('/login', loginHandler);

  // 需要认证的路由
  router.get('/me', authMiddleware, getCurrentUser);
  router.post('/logout', authMiddleware, logoutHandler);

  return router;
}
```

### 服务层

业务逻辑封装在服务层：

```
server/services/
├── authService.ts
├── restorationService.ts
├── paymentService.ts
└── ...
```

**服务示例**:

```typescript
// server/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';
import { users } from '../db/schema';

export async function registerUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db.insert(users).values({
    email,
    password_hash: passwordHash,
  }).returning();

  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
  return { user, token };
}
```

### JWT认证流程

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│ Client  │         │ Server  │         │ Database │
└────┬────┘         └────┬────┘         └────┬─────┘
     │                   │                    │
     │ POST /api/auth/login                  │
     │ { email, password }                   │
     ├──────────────────>│                    │
     │                   │                    │
     │                   │ Query user         │
     │                   ├───────────────────>│
     │                   │                    │
     │                   │ User data          │
     │                   │<───────────────────┤
     │                   │                    │
     │                   │ Verify password    │
     │                   │ Generate JWT       │
     │                   │                    │
     │ { user, token }   │                    │
     │<──────────────────┤                    │
     │                   │                    │
     │ Set Cookie: token │                    │
     │                   │                    │
     │ GET /api/user/me  │                    │
     │ Cookie: token     │                    │
     ├──────────────────>│                    │
     │                   │                    │
     │                   │ Verify JWT         │
     │                   │ Extract userId     │
     │                   │                    │
     │                   │ Query user         │
     │                   ├───────────────────>│
     │                   │                    │
     │                   │ User data          │
     │                   │<───────────────────┤
     │                   │                    │
     │ { user }          │                    │
     │<──────────────────┤                    │
     │                   │                    │
```

### 认证中间件

```typescript
// server/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 错误处理

全局错误处理中间件：

```typescript
// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
}
```

---

## 数据库设计

### Schema定义（5张表）

#### 1. users - 用户表

```typescript
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').unique().notNull(),
  password_hash: text('password_hash').notNull(),
  name: text('name'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
});
```

#### 2. subscriptions - 订阅表

```typescript
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  plan_id: text('plan_id'),
  status: text('status').default('active').notNull(),
  stripe_subscription_id: text('stripe_subscription_id').unique(),
  current_period_start: integer('current_period_start', { mode: 'timestamp' }),
  current_period_end: integer('current_period_end', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
});
```

#### 3. credits - 积分表

```typescript
export const credits = sqliteTable('credits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  amount: integer('amount').default(0).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});
```

#### 4. restorations - 修复任务表

```typescript
export const restorations = sqliteTable('restorations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),  // 修复类型
  status: text('status').default('processing').notNull(),
  input_file_url: text('input_file_url'),
  result_urls: text('result_urls'),  // JSON数组
  algorithm: text('algorithm'),      // 使用的算法
  parameters: text('parameters'),    // JSON对象
  created_at: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  completed_at: integer('completed_at', { mode: 'timestamp' }),
});
```

#### 5. gallery_items - 画廊作品表

```typescript
export const gallery_items = sqliteTable('gallery_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  restoration_id: integer('restoration_id').references(() => restorations.id),
  title: text('title'),
  description: text('description'),
  category: text('category'),
  image_url: text('image_url'),
  is_public: integer('is_public', { mode: 'boolean' }).default(false).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});
```

### 数据库连接

```typescript
// server/db/connection.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

const dbPath = path.resolve(process.cwd(), env.DATABASE_URL);
const sqlite = new Database(dbPath);

// 启用WAL模式以提高并发性能
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
```

### WAL模式说明

**WAL (Write-Ahead Logging)** 优势：
- 提高并发性能
- 读写操作不互相阻塞
- 更好的写入性能
- 适合多用户场景

**注意事项**:
- 会产生 `-wal` 和 `-shm` 文件
- 需要定期checkpoint（自动）
- 适合读多写少的场景

### 数据库迁移

```typescript
// server/db/migrate.ts
export async function runMigrations() {
  console.log('Running database migrations...');

  // 创建所有表（使用IF NOT EXISTS，幂等操作）
  sqlite.exec(`CREATE TABLE IF NOT EXISTS users (...)`);
  sqlite.exec(`CREATE TABLE IF NOT EXISTS subscriptions (...)`);
  // ...

  console.log('Database migrations completed successfully!');
}
```

**迁移时机**:
- 服务器启动时自动执行 (`server/index.ts`)
- 幂等操作，多次执行不会出错
- 不会删除现有数据

### Drizzle ORM 使用

**查询示例**:

```typescript
// 查找单个用户
const user = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.email, 'user@example.com'),
});

// 查找多个用户
const userList = await db.query.users.findMany({
  where: (users, { gt }) => gt(users.created_at, timestamp),
  limit: 10,
});

// 关联查询
const userWithSubs = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, userId),
  with: {
    subscriptions: true,
    restorations: {
      limit: 5,
      orderBy: (restorations, { desc }) => [desc(restorations.created_at)],
    },
  },
});
```

**插入数据**:

```typescript
const [newUser] = await db.insert(users).values({
  email: 'new@example.com',
  password_hash: hashedPassword,
  name: 'New User',
}).returning();
```

**更新数据**:

```typescript
await db.update(users)
  .set({ name: 'Updated Name', updated_at: new Date() })
  .where(eq(users.id, userId));
```

**删除数据**:

```typescript
await db.delete(restorations)
  .where(eq(restorations.id, restorationId));
```

---

## 代码规范

### TypeScript配置

```json
{
  "compilerOptions": {
    "strict": true,               // 严格模式
    "noEmit": true,               // 不生成输出（由Vite/ESBuild处理）
    "module": "ESNext",           // ESM模块
    "moduleResolution": "bundler", // 打包器模式
    "jsx": "preserve",            // JSX保留（由Vite处理）
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### 路径别名

| 别名 | 路径 | 用途 |
|------|------|------|
| `@/` | `client/src/` | 前端代码 |
| `@shared/` | `shared/` | 共享代码 |
| `@assets/` | `attached_assets/` | 静态资源 |

**使用示例**:

```typescript
// 前端
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 共享类型
import type { User, Restoration } from '@shared/types';
```

### 代码格式化（Prettier）

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

运行格式化：

```bash
pnpm run format
```

### 命名规范

**组件**: PascalCase
```typescript
export default function UserProfile() { }
export function NavigationMenu() { }
```

**函数/变量**: camelCase
```typescript
const userName = 'John';
function fetchUserData() { }
```

**常量**: UPPER_SNAKE_CASE
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const API_BASE_URL = 'https://api.example.com';
```

**类型/接口**: PascalCase
```typescript
interface UserData { }
type ApiResponse = { };
```

**文件名**:
- 组件: PascalCase (`UserProfile.tsx`)
- 工具: camelCase (`formatDate.ts`)
- 配置: kebab-case (`vite.config.ts`)

### ESM模块

项目全面使用ESM模块：

```json
{
  "type": "module"
}
```

**导入规则**:
- 使用 `.js` 扩展名导入TypeScript文件（编译后）
- 前端可省略扩展名（Vite处理）
- 后端必须使用 `.js` 扩展名

```typescript
// 前端（client/）
import { db } from './connection';  // ✓ OK

// 后端（server/）
import { db } from './connection.js';  // ✓ 必须加 .js
import { db } from './connection';     // ✗ 错误
```

---

## 开发指南

### 添加新页面

#### 步骤1: 创建页面组件

```typescript
// client/src/pages/NewFeaturePage.tsx
import { CloudDrift, InkBrushStroke, SealStamp } from '@/components/decorative';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NewFeaturePage() {
  return (
    <div className="relative min-h-screen bg-museum-beige-light">
      {/* 背景装饰 */}
      <CloudDrift count={3} opacity={0.1} />

      {/* 内容区域 */}
      <div className="relative z-10 container py-20">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-4xl font-serif text-museum-ink">
            新功能标题
          </h1>
          <SealStamp text="新" size={56} delay={0.3} />
        </div>

        <InkBrushStroke variant="underline" width={200} className="mb-8" />

        <Card className="p-8">
          <p className="text-lg text-museum-brown">
            功能描述内容...
          </p>
        </Card>
      </div>
    </div>
  );
}
```

#### 步骤2: 添加路由

```typescript
// client/src/main.tsx
import { Route } from 'wouter';
import NewFeaturePage from '@/pages/NewFeaturePage';

function App() {
  return (
    <Switch>
      {/* 现有路由 */}
      <Route path="/" component={HomePage} />

      {/* 新路由 */}
      <Route path="/new-feature" component={NewFeaturePage} />
    </Switch>
  );
}
```

#### 步骤3: 添加导航链接

```typescript
// client/src/components/Navigation.tsx
import { Link } from 'wouter';

<nav>
  <Link href="/new-feature">
    <a className="text-museum-brown hover:text-museum-brown-dark">
      新功能
    </a>
  </Link>
</nav>
```

#### 步骤4: 连接API（如需要）

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function NewFeaturePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['newFeature'],
    queryFn: async () => {
      const res = await axios.get('/api/new-feature');
      return res.data;
    },
  });

  if (isLoading) return <div>加载中...</div>;

  return <div>{/* 使用 data */}</div>;
}
```

### 使用装饰组件的最佳实践

#### 页面布局模板

```tsx
export default function PageTemplate() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-museum-beige-light to-white">
      {/* 层级1: 背景装饰（绝对定位） */}
      <CloudDrift count={3} opacity={0.12} />
      <WavePattern
        direction="horizontal"
        className="absolute bottom-0"
        opacity={0.08}
      />

      {/* 层级2: 内容区域（相对定位 + z-index） */}
      <div className="relative z-10">
        <div className="container py-20">
          {/* 标题区域 */}
          <header className="mb-12">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-serif text-museum-ink">
                页面标题
              </h1>
              <SealStamp text="韵" size={64} delay={0.5} />
            </div>
            <InkBrushStroke
              variant="underline"
              width={250}
              delay={0.3}
              className="mt-4"
            />
          </header>

          {/* 主要内容 */}
          <main>
            {/* 内容 */}
          </main>
        </div>
      </div>
    </div>
  );
}
```

#### Hero区域模板

```tsx
<section className="relative overflow-hidden bg-gradient-to-br from-museum-beige via-museum-beige-light to-white py-32">
  {/* 装饰层 */}
  <CloudDrift count={4} opacity={0.15} />
  <div className="absolute inset-0 animate-shimmer-gold" />

  {/* 内容层 */}
  <div className="relative z-10 container text-center">
    <div className="inline-flex items-center gap-4 mb-6">
      <h1 className="text-6xl font-serif text-museum-ink">
        博物馆文物修复与展示系统
      </h1>
      <SealStamp text="韵" size={72} delay={0.5} />
    </div>

    <InkBrushStroke
      variant="divider"
      width={400}
      delay={0.3}
      className="mx-auto mb-8"
    />

    <p className="text-xl text-museum-brown max-w-2xl mx-auto">
      让传统艺术焕发新生
    </p>
  </div>
</section>
```

#### 内容分隔模板

```tsx
<div className="relative py-16">
  {/* 上分隔 */}
  <WavePattern
    direction="horizontal"
    className="absolute top-0 left-0 right-0"
    opacity={0.1}
  />

  <div className="container">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-serif text-museum-ink inline-block">
        章节标题
      </h2>
      <InkBrushStroke
        variant="underline"
        width={180}
        className="mx-auto mt-2"
      />
    </div>

    {/* 内容 */}
  </div>

  {/* 下分隔 */}
  <WavePattern
    direction="horizontal"
    className="absolute bottom-0 left-0 right-0"
    opacity={0.1}
  />
</div>
```

### 使用shadcn/ui组件

```typescript
// 1. 导入组件
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// 2. 使用组件
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">打开对话框</Button>
  </DialogTrigger>
  <DialogContent>
    <form className="space-y-4">
      <Input placeholder="输入内容..." />
      <Button type="submit">提交</Button>
    </form>
  </DialogContent>
</Dialog>
```

### 表单处理

```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('请输入有效的邮箱'),
  password: z.string().min(8, '密码至少8个字符'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await axios.post('/api/auth/login', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <Input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <Button type="submit">登录</Button>
    </form>
  );
}
```

---

## API开发指南

### 添加新API端点

#### 步骤1: 定义路由

```typescript
// server/routes/newFeature.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as service from '../services/newFeatureService';

export function createNewFeatureRoutes() {
  const router = Router();

  // GET /api/new-feature
  router.get('/', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.userId!;
      const data = await service.getFeatureData(userId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  // POST /api/new-feature
  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.userId!;
      const result = await service.createFeature(userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
```

#### 步骤2: 创建服务

```typescript
// server/services/newFeatureService.ts
import { db } from '../db/connection';
import { newFeatureTable } from '../db/schema';

export async function getFeatureData(userId: number) {
  const data = await db.query.newFeatureTable.findMany({
    where: (table, { eq }) => eq(table.user_id, userId),
  });
  return data;
}

export async function createFeature(userId: number, data: any) {
  const [result] = await db.insert(newFeatureTable).values({
    user_id: userId,
    ...data,
  }).returning();

  return result;
}
```

#### 步骤3: 挂载路由

```typescript
// server/index.ts
import { createNewFeatureRoutes } from './routes/newFeature';

app.use('/api/new-feature', createNewFeatureRoutes());
```

#### 步骤4: 前端调用

```typescript
// client/src/api/newFeature.ts
import axios from 'axios';

export async function fetchFeatureData() {
  const res = await axios.get('/api/new-feature');
  return res.data;
}

export async function createFeature(data: any) {
  const res = await axios.post('/api/new-feature', data);
  return res.data;
}
```

### API设计规范

#### RESTful约定

| 方法 | 路径 | 说明 | 响应码 |
|------|------|------|--------|
| GET | `/api/resource` | 获取列表 | 200 |
| GET | `/api/resource/:id` | 获取单个 | 200 |
| POST | `/api/resource` | 创建 | 201 |
| PUT | `/api/resource/:id` | 完整更新 | 200 |
| PATCH | `/api/resource/:id` | 部分更新 | 200 |
| DELETE | `/api/resource/:id` | 删除 | 204 |

#### 响应格式

**成功响应**:
```json
{
  "data": { /* 数据 */ },
  "message": "操作成功"
}
```

**错误响应**:
```json
{
  "error": "错误信息",
  "code": "ERROR_CODE",
  "details": { /* 详细信息 */ }
}
```

#### 数据验证

使用Zod进行输入验证：

```typescript
import { z } from 'zod';

const createFeatureSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['type1', 'type2', 'type3']),
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    // 验证输入
    const validatedData = createFeatureSchema.parse(req.body);

    const result = await service.createFeature(req.userId!, validatedData);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    next(error);
  }
});
```

### 文件上传处理

```typescript
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});
```

### AI服务调用

```typescript
// server/services/aiService.ts
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { env } from '../config/env';

export async function processWithSGRGAN(inputPath: string) {
  const form = new FormData();
  form.append('file', fs.createReadStream(inputPath));

  const response = await axios.post(
    `${env.AI_SGRGAN_URL}/process`,
    form,
    {
      headers: form.getHeaders(),
      timeout: 300000, // 5分钟超时
    }
  );

  return response.data;
}

export async function processWithDCADif(inputPath: string, params: any) {
  const form = new FormData();
  form.append('file', fs.createReadStream(inputPath));
  form.append('params', JSON.stringify(params));

  const response = await axios.post(
    `${env.AI_DCADIF_URL}/process`,
    form,
    {
      headers: form.getHeaders(),
      timeout: 300000,
    }
  );

  return response.data;
}
```

---

## 调试技巧

### 前端调试

```typescript
// 使用React DevTools
// Chrome扩展: React Developer Tools

// 使用console调试
console.log('数据:', data);
console.table(arrayData);
console.group('用户信息');
console.log('姓名:', user.name);
console.log('邮箱:', user.email);
console.groupEnd();

// 使用断点
debugger; // 程序会在此处暂停
```

### 后端调试

```typescript
// 使用调试日志
console.log('[DEBUG]', 'Processing request:', req.body);

// 使用Node.js调试器
// 在package.json中添加脚本:
"scripts": {
  "debug": "node --inspect dist/index.js"
}

// 使用VSCode断点调试
// 创建 .vscode/launch.json
```

### 网络调试

```bash
# 使用curl测试API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 查看详细信息
curl -v http://localhost:3000/api/health
```

---

## 测试

### 类型检查

```bash
pnpm run check
```

### 手动测试

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

---

## 常用命令速查

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm run check        # TypeScript类型检查
pnpm run format       # 格式化代码

# 构建
pnpm run build        # 构建生产版本

# 生产
pnpm start            # 启动生产服务器

# 依赖管理
pnpm install          # 安装依赖
pnpm add <package>    # 添加依赖
pnpm remove <package> # 移除依赖
pnpm update           # 更新依赖
```

---

## 学习资源

### 官方文档

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)

### 项目相关

- [部署文档](./DEPLOYMENT.md)
- GitHub Issues
- 项目Wiki

---

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 代码审查清单

- [ ] 代码遵循项目规范
- [ ] 通过TypeScript类型检查
- [ ] 通过Prettier格式化
- [ ] 添加必要的注释
- [ ] 测试新功能
- [ ] 更新相关文档

---

**祝开发愉快！**
