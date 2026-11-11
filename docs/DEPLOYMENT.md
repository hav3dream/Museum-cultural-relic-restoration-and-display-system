# 博物馆文物修复与展示系统 - 部署文档

本文档详细介绍如何部署博物馆文物修复与展示系统（Museum Rebirth）项目，包括本地开发环境和生产环境的完整部署流程。

## 目录

- [环境要求](#环境要求)
- [本地开发部署](#本地开发部署)
- [生产环境部署](#生产环境部署)
- [AI后端服务部署](#ai后端服务部署)
- [Nginx反向代理配置](#nginx反向代理配置)
- [Docker部署](#docker部署)
- [常见问题](#常见问题)

---

## 环境要求

### 基础环境

| 环境 | 版本要求 | 说明 |
|-----|---------|------|
| Node.js | 18.0+ | 推荐使用 LTS 版本 |
| pnpm | 10.4.1+ | 包管理器（必须） |
| Python | 3.8+ | AI 后端服务需要 |
| SQLite | 3.35+ | 数据库（通常系统自带） |

### 系统依赖

**Linux/macOS:**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential python3 python3-pip

# macOS
xcode-select --install
brew install python3
```

**Windows:**
- 安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
- 安装 [Python 3.8+](https://www.python.org/downloads/)

---

## 本地开发部署

### 1. 克隆仓库

```bash
git clone <repository-url>
cd museum
```

### 2. 安装依赖

```bash
# 使用 pnpm 安装（必须）
pnpm install

# 如果没有安装 pnpm
npm install -g pnpm@10.4.1
```

### 3. 配置环境变量

复制环境变量示例文件并根据需要修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 运行环境
NODE_ENV=development

# 服务器端口
PORT=3000

# JWT密钥（生产环境必须修改！至少32字符）
JWT_SECRET=your_secure_secret_key_at_least_32_characters_long

# Stripe支付配置（可选，用于支付功能）
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# 数据库路径
DATABASE_URL=./data/museum.db

# 文件上传目录
UPLOAD_DIR=./uploads

# AI服务地址（如果AI服务部署在其他机器）
AI_SGRGAN_URL=http://127.0.0.1:5002
AI_DCADIF_URL=http://127.0.0.1:5004
AI_RELIC2CONTOUR_URL=http://127.0.0.1:5001
```

### 4. 启动开发服务器

```bash
# 启动前端开发服务器（Vite）
pnpm dev
```

服务将在 `http://localhost:3000` 启动，支持热重载。

数据库会在首次启动时自动创建和初始化。

---

## 生产环境部署

### 1. 构建项目

```bash
# 构建前端和后端
pnpm run build
```

构建输出：
- **前端静态文件**: `dist/public/`
- **服务器入口**: `dist/index.js`

### 2. 配置生产环境变量

确保 `.env` 文件配置了生产环境参数：

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your_very_strong_production_secret_key
DATABASE_URL=./data/museum.db
UPLOAD_DIR=./uploads
```

### 3. 启动生产服务器

```bash
# 直接启动
pnpm start

# 或使用 PM2（推荐）
pm2 start dist/index.js --name museum

# 设置开机自启
pm2 startup
pm2 save
```

### 4. 目录结构说明

```
museum/
├── dist/
│   ├── public/          # 前端静态文件（由Nginx或Express服务）
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   └── index.js         # 服务器入口文件
├── data/
│   └── museum.db        # SQLite数据库（自动创建）
├── uploads/             # 用户上传文件目录（需要写权限）
└── .env                 # 环境变量配置
```

### 5. 确保必要的权限

```bash
# 确保上传目录有写权限
mkdir -p uploads
chmod 755 uploads

# 确保数据库目录有写权限
mkdir -p data
chmod 755 data
```

---

## AI后端服务部署

博物馆文物修复与展示系统使用三个独立的AI后端服务，每个服务负责不同的图像处理任务。

### 服务列表

| 服务 | 端口 | 功能 |
|------|------|------|
| SGRGAN | 5002 | 超分辨率图像增强 |
| DCADif | 5004 | 深度着色和细节增强 |
| Relic2Contour | 5001 | 文物轮廓提取 |

### 部署步骤

#### 1. SGRGAN 服务

```bash
# 进入SGRGAN服务目录
cd ai-services/sgrgan

# 安装Python依赖
pip3 install -r requirements.txt

# 启动服务（默认端口5002）
python3 app.py
```

#### 2. DCADif 服务

```bash
# 进入DCADif服务目录
cd ai-services/dcadif

# 安装Python依赖
pip3 install -r requirements.txt

# 启动服务（默认端口5004）
python3 app.py
```

#### 3. Relic2Contour 服务

```bash
# 进入Relic2Contour服务目录
cd ai-services/relic2contour

# 安装Python依赖
pip3 install -r requirements.txt

# 启动服务（默认端口5001）
python3 app.py
```

### 使用 PM2 管理 AI 服务

创建 `ecosystem.config.js` 文件：

```javascript
module.exports = {
  apps: [
    {
      name: 'museum-main',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'ai-sgrgan',
      script: 'app.py',
      interpreter: 'python3',
      cwd: './ai-services/sgrgan',
      env: {
        PORT: 5002,
      },
    },
    {
      name: 'ai-dcadif',
      script: 'app.py',
      interpreter: 'python3',
      cwd: './ai-services/dcadif',
      env: {
        PORT: 5004,
      },
    },
    {
      name: 'ai-relic2contour',
      script: 'app.py',
      interpreter: 'python3',
      cwd: './ai-services/relic2contour',
      env: {
        PORT: 5001,
      },
    },
  ],
};
```

启动所有服务：

```bash
pm2 start ecosystem.config.js
pm2 save
```

### AI 服务环境变量配置

如果AI服务部署在不同的服务器上，在主应用的 `.env` 文件中配置：

```env
AI_SGRGAN_URL=http://ai-server-1.example.com:5002
AI_DCADIF_URL=http://ai-server-2.example.com:5004
AI_RELIC2CONTOUR_URL=http://ai-server-3.example.com:5001
```

---

## Nginx反向代理配置

### 基础配置（HTTP）

```nginx
server {
    listen 80;
    server_name museum.example.com;

    # 客户端上传文件大小限制（根据需要调整）
    client_max_body_size 50M;

    # 前端静态文件
    location / {
        root /path/to/museum/dist/public;
        try_files $uri $uri/ /index.html;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 请求代理到 Node.js 服务器
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置（AI处理可能需要较长时间）
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # 上传文件访问
    location /uploads/ {
        alias /path/to/museum/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

### HTTPS配置（使用Let's Encrypt）

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d museum.example.com
```

Certbot会自动更新Nginx配置以支持HTTPS。生成的配置示例：

```nginx
server {
    listen 80;
    server_name museum.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name museum.example.com;

    ssl_certificate /etc/letsencrypt/live/museum.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/museum.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    # ... 其他配置与HTTP相同 ...
}
```

### 重启 Nginx

```bash
# 测试配置
sudo nginx -t

# 重启服务
sudo systemctl restart nginx
```

---

## Docker部署

### Dockerfile

创建 `Dockerfile`：

```dockerfile
# 多阶段构建

# 阶段1: 构建前端和后端
FROM node:18-alpine AS builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm@10.4.1

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm run build

# 阶段2: 生产运行环境
FROM node:18-alpine

WORKDIR /app

# 安装pnpm和生产依赖
RUN npm install -g pnpm@10.4.1

# 只复制必要的文件
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 创建数据和上传目录
RUN mkdir -p data uploads && \
    chown -R node:node data uploads

# 使用非root用户运行
USER node

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "dist/index.js"]
```

### docker-compose.yml

创建 `docker-compose.yml`（包含主应用和AI服务）：

```yaml
version: '3.8'

services:
  # 主应用服务
  museum-main:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=/app/data/museum.db
      - UPLOAD_DIR=/app/uploads
      - AI_SGRGAN_URL=http://ai-sgrgan:5002
      - AI_DCADIF_URL=http://ai-dcadif:5004
      - AI_RELIC2CONTOUR_URL=http://ai-relic2contour:5001
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    depends_on:
      - ai-sgrgan
      - ai-dcadif
      - ai-relic2contour
    restart: unless-stopped

  # SGRGAN AI服务
  ai-sgrgan:
    build: ./ai-services/sgrgan
    ports:
      - "5002:5002"
    environment:
      - PORT=5002
    restart: unless-stopped

  # DCADif AI服务
  ai-dcadif:
    build: ./ai-services/dcadif
    ports:
      - "5004:5004"
    environment:
      - PORT=5004
    restart: unless-stopped

  # Relic2Contour AI服务
  ai-relic2contour:
    build: ./ai-services/relic2contour
    ports:
      - "5001:5001"
    environment:
      - PORT=5001
    restart: unless-stopped

  # Nginx反向代理（可选）
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - museum-main
    restart: unless-stopped
```

### 构建和启动

```bash
# 创建环境变量文件
cat > .env << EOF
JWT_SECRET=your_secure_production_jwt_secret_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EOF

# 构建镜像
docker-compose build

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 常见问题

### 1. better-sqlite3 编译问题

**问题**: 安装依赖时 `better-sqlite3` 编译失败

**解决方案**:

```bash
# Linux/macOS
sudo apt-get install build-essential python3  # Ubuntu/Debian
brew install python3                           # macOS

# 清除缓存重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Windows
# 安装 Visual Studio Build Tools，然后
pnpm config set msvs_version 2019
pnpm install
```

### 2. 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:

```bash
# 查找占用端口的进程
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000   # Windows

# 杀死进程
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows

# 或者修改 .env 文件使用其他端口
PORT=3001
```

### 3. 数据库权限问题

**问题**: `Error: SQLITE_CANTOPEN: unable to open database file`

**解决方案**:

```bash
# 确保数据目录存在且有写权限
mkdir -p data
chmod 755 data

# 如果数据库文件已存在，修改其权限
chmod 644 data/museum.db
```

### 4. 文件上传失败

**问题**: 上传文件时返回 500 错误

**解决方案**:

```bash
# 检查上传目录是否存在和权限
mkdir -p uploads
chmod 755 uploads

# 确保 .env 中配置正确
UPLOAD_DIR=./uploads

# 检查 Nginx 配置的上传大小限制
# client_max_body_size 50M;
```

### 5. AI服务连接失败

**问题**: 修复请求失败，返回 `AI service unavailable`

**解决方案**:

```bash
# 检查AI服务是否运行
curl http://localhost:5002/health
curl http://localhost:5004/health
curl http://localhost:5001/health

# 检查防火墙规则
sudo ufw allow 5001
sudo ufw allow 5002
sudo ufw allow 5004

# 确保 .env 中配置正确的AI服务地址
AI_SGRGAN_URL=http://127.0.0.1:5002
AI_DCADIF_URL=http://127.0.0.1:5004
AI_RELIC2CONTOUR_URL=http://127.0.0.1:5001
```

### 6. 生产环境构建失败

**问题**: `pnpm run build` 失败

**解决方案**:

```bash
# 清除缓存
rm -rf node_modules dist .vite
pnpm install

# 检查 TypeScript 类型错误
pnpm run check

# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" pnpm run build
```

### 7. JWT认证失败

**问题**: 登录后立即退出或认证失败

**解决方案**:

```bash
# 确保JWT_SECRET配置正确且至少32个字符
# 生成一个安全的随机密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 将生成的密钥添加到 .env
JWT_SECRET=<生成的密钥>

# 重启服务
```

### 8. 数据库迁移问题

**问题**: 启动时数据库Schema不匹配

**解决方案**:

数据库会在启动时自动迁移，如果遇到问题：

```bash
# 备份现有数据库
cp data/museum.db data/museum.db.backup

# 删除数据库让系统重新创建（警告：会丢失所有数据）
rm data/museum.db

# 重启应用，数据库会自动创建
pnpm start
```

---

## 性能优化建议

### 1. SQLite优化

数据库已启用WAL模式以提高并发性能：

```javascript
// server/db/connection.ts
sqlite.pragma('journal_mode = WAL');
```

### 2. 静态资源CDN

在生产环境中，建议将静态资源上传到CDN：

```nginx
# Nginx配置中添加CDN缓存头
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Gzip压缩

在Nginx中启用Gzip压缩：

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_vary on;
```

### 4. PM2 集群模式

对于高负载场景，使用PM2集群模式：

```bash
pm2 start dist/index.js -i max --name museum
```

---

## 监控和日志

### PM2监控

```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs museum

# 查看详细信息
pm2 show museum
```

### 日志位置

- **应用日志**: `~/.pm2/logs/`
- **Nginx日志**: `/var/log/nginx/`
- **系统日志**: `journalctl -u museum`

---

## 安全建议

1. **永远不要**在版本控制中提交 `.env` 文件
2. 使用强密码和长JWT密钥（至少64个字符）
3. 定期更新依赖包：`pnpm update`
4. 启用HTTPS（生产环境必须）
5. 配置防火墙规则，只开放必要端口
6. 定期备份数据库文件
7. 使用环境变量管理敏感信息

---

## 支持和反馈

如有部署问题，请查看：
- 项目GitHub Issues
- 详细日志信息
- [开发者文档](./DEVELOPMENT.md)

---

**祝部署顺利！**
