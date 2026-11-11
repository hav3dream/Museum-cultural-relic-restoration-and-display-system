# 博物馆文物修复与展示系统 API 文档

## 概述

博物馆文物修复与展示系统（Museum）是一个基于AI的文物修复平台，提供古画、壁画、书法、碑拓等文物的智能修复服务。

### 基础信息

- **API 基础 URL**: `/api`
- **认证方式**: JWT Token (通过 httpOnly Cookie 传递)
- **Cookie 名称**: `app_session_id`
- **内容类型**:
  - `application/json` (大多数接口)
  - `multipart/form-data` (文件上传接口)
- **字符编码**: UTF-8

### 错误响应格式

所有API错误响应遵循统一格式：

```json
{
  "error": "错误消息",
  "status": 400
}
```

### HTTP 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 402 | 积分不足 |
| 403 | 无权访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如邮箱已存在）|
| 500 | 服务器内部错误 |

---

## 认证接口 `/api/auth`

### 1. 用户注册

**接口**: `POST /api/auth/register`

**描述**: 注册新用户账号，成功后自动登录并获得10个免费积分。

**认证要求**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 是 | 用户邮箱 |
| name | string | 是 | 用户姓名 |
| password | string | 是 | 密码（明文，后端会进行加密）|

**请求示例**:

```json
{
  "email": "user@example.com",
  "name": "张三",
  "password": "securePassword123"
}
```

**成功响应** (200):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "张三",
    "createdAt": 1709856000000
  },
  "credits": 10
}
```

**错误响应**:

- `400 Bad Request`: 缺少必填参数
  ```json
  {
    "error": "Email, name, and password are required"
  }
  ```

- `409 Conflict`: 邮箱已被注册
  ```json
  {
    "error": "User with this email already exists"
  }
  ```

**curl 示例**:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "张三",
    "password": "securePassword123"
  }' \
  -c cookies.txt
```

---

### 2. 用户登录

**接口**: `POST /api/auth/login`

**描述**: 用户登录，成功后设置认证Cookie。

**认证要求**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 是 | 用户邮箱 |
| password | string | 是 | 密码 |

**请求示例**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**成功响应** (200):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "张三",
    "createdAt": 1709856000000
  },
  "credits": 10
}
```

**错误响应**:

- `400 Bad Request`: 缺少必填参数
  ```json
  {
    "error": "Email and password are required"
  }
  ```

- `401 Unauthorized`: 邮箱或密码错误
  ```json
  {
    "error": "Invalid email or password"
  }
  ```

**curl 示例**:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }' \
  -c cookies.txt
```

---

### 3. 用户登出

**接口**: `POST /api/auth/logout`

**描述**: 登出当前用户，清除认证Cookie。

**认证要求**: 否（但通常需要已登录）

**请求参数**: 无

**成功响应** (200):

```json
{
  "success": true
}
```

**curl 示例**:

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

### 4. 获取当前用户信息

**接口**: `GET /api/auth/me`

**描述**: 获取当前登录用户的详细信息，包括积分余额和订阅状态。

**认证要求**: 是

**请求参数**: 无

**成功响应** (200):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "张三",
    "createdAt": 1709856000000
  },
  "credits": 15,
  "subscription": {
    "id": 1,
    "plan_id": "premium",
    "status": "active",
    "current_period_start": "2024-03-01T00:00:00.000Z",
    "current_period_end": "2024-04-01T00:00:00.000Z"
  }
}
```

**注意**: 如果用户没有订阅，`subscription` 字段为 `null`。

**错误响应**:

- `401 Unauthorized`: 未认证
  ```json
  {
    "error": "Authentication required"
  }
  ```

- `404 Not Found`: 用户不存在
  ```json
  {
    "error": "User not found"
  }
  ```

**curl 示例**:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

---

## 修复接口 `/api/restoration`

### 修复类型与算法映射

博物馆文物修复与展示系统支持以下修复类型，每种类型对应特定的AI算法：

| 修复类型 | type 参数 | 算法 | 所需文件 | 说明 |
|---------|-----------|------|----------|------|
| 古画修复 | ancient-painting | SGRGAN | image + mask | 适用于中国古典山水画 |
| 壁画修复 | mural | DCADif | image + sketch | 适用于敦煌壁画等 |
| 书法修复 | calligraphy | SGRGAN | image + mask | 适用于古代书法作品 |
| 碑拓修复 | stele | SGRGAN | image + mask | 适用于石碑拓片 |
| 轮廓提取 | outline | Relic2Contour | image | 从壁画中提取轮廓线稿 |

#### 算法说明

1. **SGRGAN** (Sketch-Guided Restoration GAN)
   - 用于中国古典绘画的修复
   - 输入：原图（image）+ 损坏区域掩码（mask）
   - 输出：修复后的图像

2. **DCADif** (Decoupled Conditional Adaptive Diffusion)
   - 专门用于壁画修复
   - 输入：线稿（sketch）+ 损坏壁画（image）
   - 输出：修复后的壁画

3. **Relic2Contour**
   - 半监督壁画轮廓提取
   - 输入：壁画图像（image）
   - 输出：提取的轮廓/线稿

---

### 1. 创建修复任务

**接口**: `POST /api/restoration/`

**描述**: 上传文件并创建修复任务。此接口会扣除1个积分，然后异步处理修复任务。

**认证要求**: 是

**内容类型**: `multipart/form-data`

**表单字段**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 修复类型，可选值：ancient-painting, mural, calligraphy, outline, stele |
| file | file | 是 | 主图像文件（最大10MB）|
| mask | file | 条件 | 掩码图像（SGRGAN算法需要）|
| sketch | file | 条件 | 线稿图像（DCADif算法需要）|
| algorithm | string | 否 | 指定算法（可选，默认根据type自动选择）|
| parameters | string | 否 | JSON格式的算法参数（可选）|

**文件要求**:

- 支持的图像格式：JPEG, PNG, WebP, TIFF
- 文本格式：text/plain
- 最大文件大小：10MB

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "42",
    "status": "pending",
    "type": "ancient-painting"
  }
}
```

**错误响应**:

- `400 Bad Request`: 缺少文件或类型
  ```json
  {
    "error": "No file uploaded"
  }
  ```

- `400 Bad Request`: 无效的修复类型
  ```json
  {
    "error": "Invalid restoration type"
  }
  ```

- `401 Unauthorized`: 未认证
  ```json
  {
    "error": "Authentication required"
  }
  ```

- `402 Payment Required`: 积分不足
  ```json
  {
    "error": "Insufficient credits"
  }
  ```

**curl 示例 - 古画修复 (SGRGAN)**:

```bash
curl -X POST http://localhost:3000/api/restoration/ \
  -b cookies.txt \
  -F "type=ancient-painting" \
  -F "file=@/path/to/painting.jpg" \
  -F "mask=@/path/to/mask.png"
```

**curl 示例 - 壁画修复 (DCADif)**:

```bash
curl -X POST http://localhost:3000/api/restoration/ \
  -b cookies.txt \
  -F "type=mural" \
  -F "file=@/path/to/mural.jpg" \
  -F "sketch=@/path/to/sketch.jpg"
```

**curl 示例 - 轮廓提取 (Relic2Contour)**:

```bash
curl -X POST http://localhost:3000/api/restoration/ \
  -b cookies.txt \
  -F "type=outline" \
  -F "file=@/path/to/image.png"
```

**curl 示例 - 带参数的修复**:

```bash
curl -X POST http://localhost:3000/api/restoration/ \
  -b cookies.txt \
  -F "type=ancient-painting" \
  -F "file=@/path/to/painting.jpg" \
  -F "mask=@/path/to/mask.png" \
  -F 'parameters={"quality": "high", "strength": 0.8}'
```

---

### 2. 获取修复任务状态

**接口**: `GET /api/restoration/:id`

**描述**: 获取指定修复任务的状态和结果。客户端应该轮询此接口以获取任务进度。

**认证要求**: 是

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 修复任务ID |

**任务状态说明**:

| 状态 | 说明 |
|------|------|
| pending | 等待处理 |
| processing | 正在处理 |
| completed | 处理完成 |
| failed | 处理失败 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "42",
    "type": "ancient-painting",
    "status": "completed",
    "inputFileUrl": "/uploads/1709856000000-123456789.jpg",
    "resultUrls": [
      "/uploads/results/ai-result-1709856100000-987654321.png"
    ],
    "algorithm": "SGRGAN",
    "parameters": {
      "quality": "high",
      "strength": 0.8
    },
    "createdAt": "2024-03-08T00:00:00.000Z",
    "completedAt": "2024-03-08T00:05:00.000Z"
  }
}
```

**处理中的响应**:

```json
{
  "success": true,
  "data": {
    "id": "42",
    "type": "ancient-painting",
    "status": "processing",
    "inputFileUrl": "/uploads/1709856000000-123456789.jpg",
    "resultUrls": [],
    "algorithm": "SGRGAN",
    "parameters": null,
    "createdAt": "2024-03-08T00:00:00.000Z",
    "completedAt": null
  }
}
```

**错误响应**:

- `400 Bad Request`: 无效的ID格式
  ```json
  {
    "error": "Invalid restoration ID"
  }
  ```

- `403 Forbidden`: 无权访问他人的修复任务
  ```json
  {
    "error": "Forbidden"
  }
  ```

- `404 Not Found`: 任务不存在
  ```json
  {
    "error": "Restoration not found"
  }
  ```

**curl 示例**:

```bash
curl -X GET http://localhost:3000/api/restoration/42 \
  -b cookies.txt
```

**轮询建议**:

```javascript
// 前端轮询示例
async function pollRestoration(id) {
  const maxAttempts = 60; // 最多轮询60次
  const interval = 2000; // 每2秒轮询一次

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`/api/restoration/${id}`);
    const data = await response.json();

    if (data.data.status === 'completed') {
      return data.data.resultUrls;
    } else if (data.data.status === 'failed') {
      throw new Error('修复失败');
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('修复超时');
}
```

---

### 3. 获取修复历史列表

**接口**: `GET /api/restoration/`

**描述**: 获取当前用户的修复任务列表，支持分页。

**认证要求**: 是

**查询参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | integer | 否 | 1 | 页码（从1开始）|
| limit | integer | 否 | 10 | 每页数量（1-100）|

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "42",
        "type": "ancient-painting",
        "status": "completed",
        "inputFileUrl": "/uploads/1709856000000-123456789.jpg",
        "resultUrls": [
          "/uploads/results/ai-result-1709856100000-987654321.png"
        ],
        "algorithm": "SGRGAN",
        "parameters": null,
        "createdAt": "2024-03-08T00:00:00.000Z",
        "completedAt": "2024-03-08T00:05:00.000Z"
      },
      {
        "id": "41",
        "type": "mural",
        "status": "completed",
        "inputFileUrl": "/uploads/1709855000000-111111111.jpg",
        "resultUrls": [
          "/uploads/results/ai-result-1709855200000-222222222.png"
        ],
        "algorithm": "DCADif",
        "parameters": null,
        "createdAt": "2024-03-07T23:00:00.000Z",
        "completedAt": "2024-03-07T23:10:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**错误响应**:

- `400 Bad Request`: 无效的分页参数
  ```json
  {
    "error": "Invalid pagination parameters"
  }
  ```

- `401 Unauthorized`: 未认证
  ```json
  {
    "error": "Authentication required"
  }
  ```

**curl 示例**:

```bash
# 获取第1页（每页10条）
curl -X GET "http://localhost:3000/api/restoration/?page=1&limit=10" \
  -b cookies.txt

# 获取第2页（每页20条）
curl -X GET "http://localhost:3000/api/restoration/?page=2&limit=20" \
  -b cookies.txt
```

---

## 画廊接口 `/api/gallery`

### 1. 按分类获取画廊内容

**接口**: `GET /api/gallery/:category`

**描述**: 获取指定分类的画廊内容，包括静态画廊图片和用户提交的作品。

**认证要求**: 否（可选认证，已认证用户可看到自己的私有作品）

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| category | string | 画廊分类（如：ancient-painting, mural, calligraphy, stele）|

**成功响应** (200):

```json
{
  "category": "ancient-painting",
  "meta": {
    "title": "古画",
    "description": "中国古典山水画作品"
  },
  "items": [
    {
      "id": "static-0",
      "url": "/gallery/ancient-painting-1.jpg",
      "isUserSubmitted": false
    },
    {
      "id": 15,
      "url": "/uploads/user-painting.jpg",
      "title": "我的修复作品",
      "description": "修复的明代山水画",
      "isUserSubmitted": true
    }
  ],
  "total": 25
}
```

**curl 示例**:

```bash
# 未登录访问
curl -X GET http://localhost:3000/api/gallery/ancient-painting

# 已登录访问（可看到自己的私有作品）
curl -X GET http://localhost:3000/api/gallery/ancient-painting \
  -b cookies.txt
```

---

### 2. 搜索画廊内容

**接口**: `GET /api/gallery/search`

**描述**: 在画廊中搜索作品（仅搜索用户提交的作品，不包括静态画廊）。

**认证要求**: 否（可选认证）

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| q | string | 是 | 搜索关键词 |

**成功响应** (200):

```json
{
  "query": "山水",
  "results": [
    {
      "id": 15,
      "url": "/uploads/user-painting.jpg",
      "title": "山水画修复",
      "description": "修复的宋代山水画",
      "category": "ancient-painting",
      "isUserSubmitted": true
    }
  ],
  "total": 1
}
```

**错误响应**:

- `400 Bad Request`: 缺少搜索关键词
  ```json
  {
    "error": "Missing search query"
  }
  ```

**curl 示例**:

```bash
curl -X GET "http://localhost:3000/api/gallery/search?q=山水" \
  -b cookies.txt
```

---

## 支付接口

### 1. 创建支付会话

**接口**: `POST /api/checkout/`

**描述**: 创建支付会话，用于订阅会员或购买积分包。

**认证要求**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| planId | string | 条件 | 订阅计划ID或积分包ID |
| productId | string | 条件 | 产品ID（与planId二选一）|
| type | string | 否 | 类型：subscription（订阅）或 one-time（一次性购买）|

**订阅计划 (planId)**:

| Plan ID | 名称 | 价格 | 说明 |
|---------|------|------|------|
| basic | 基础版 | ¥29/月 | 每月30次修复 |
| premium | 高级版 | ¥99/月 | 每月100次修复 |
| pro | 专业版 | ¥299/月 | 无限次修复 |

**积分包 (productId)**:

| Product ID | 积分数量 | 价格 |
|-----------|---------|------|
| credits_100 | 100 | ¥99 |
| credits_500 | 500 | ¥399 |
| credits_1000 | 1000 | ¥699 |

**请求示例 - 订阅**:

```json
{
  "planId": "premium",
  "type": "subscription"
}
```

**请求示例 - 购买积分**:

```json
{
  "productId": "credits_500",
  "type": "one-time"
}
```

**成功响应** (200):

```json
{
  "sessionId": "mock_session_1709856000000",
  "checkoutUrl": "/dashboard",
  "message": "Mock checkout completed successfully"
}
```

**注意**: 当前系统运行在模拟模式（Mock Mode），支付会立即完成而不需要跳转到Stripe支付页面。在生产环境中，`checkoutUrl` 将是Stripe的支付页面URL。

**错误响应**:

- `400 Bad Request`: 缺少必填参数
  ```json
  {
    "error": "Missing planId or productId"
  }
  ```

- `401 Unauthorized`: 未认证
  ```json
  {
    "error": "Authentication required"
  }
  ```

**curl 示例 - 订阅**:

```bash
curl -X POST http://localhost:3000/api/checkout/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "planId": "premium",
    "type": "subscription"
  }'
```

**curl 示例 - 购买积分**:

```bash
curl -X POST http://localhost:3000/api/checkout/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "productId": "credits_500",
    "type": "one-time"
  }'
```

---

### 2. 获取订阅信息

**接口**: `GET /api/subscription/`

**描述**: 获取当前用户的订阅信息。

**认证要求**: 是

**请求参数**: 无

**成功响应** (200) - 有订阅:

```json
{
  "subscription": {
    "id": 1,
    "plan_id": "premium",
    "status": "active",
    "stripe_subscription_id": "sub_1234567890",
    "current_period_start": "2024-03-01T00:00:00.000Z",
    "current_period_end": "2024-04-01T00:00:00.000Z",
    "created_at": "2024-03-01T00:00:00.000Z",
    "updated_at": "2024-03-01T00:00:00.000Z"
  }
}
```

**成功响应** (200) - 无订阅:

```json
{
  "subscription": null
}
```

**订阅状态说明**:

| 状态 | 说明 |
|------|------|
| active | 激活中 |
| canceled | 已取消 |
| past_due | 逾期 |
| unpaid | 未支付 |

**curl 示例**:

```bash
curl -X GET http://localhost:3000/api/subscription/ \
  -b cookies.txt
```

---

### 3. 取消订阅

**接口**: `POST /api/subscription/cancel`

**描述**: 取消当前用户的订阅。订阅将在当前计费周期结束后停止。

**认证要求**: 是

**请求参数**: 无

**成功响应** (200):

```json
{
  "success": true,
  "message": "Subscription canceled successfully"
}
```

**curl 示例**:

```bash
curl -X POST http://localhost:3000/api/subscription/cancel \
  -b cookies.txt
```

---

### 4. Stripe Webhook

**接口**: `POST /api/webhooks/stripe`

**描述**: 接收Stripe的webhook事件通知（如支付成功、订阅更新等）。此接口仅供Stripe服务器调用。

**认证要求**: 否（通过Stripe签名验证）

**请求头**:

| 头名称 | 说明 |
|--------|------|
| stripe-signature | Stripe webhook签名 |

**请求体**: Stripe事件对象（原始JSON）

**成功响应** (200):

```json
{
  "received": true
}
```

**注意**: 此接口在路由挂载时位于 `express.json()` 中间件之前，以便访问原始请求体进行签名验证。

**Stripe 配置**:

在Stripe后台配置webhook URL：`https://yourdomain.com/api/webhooks/stripe`

需要监听的事件：
- `checkout.session.completed` - 支付完成
- `customer.subscription.created` - 订阅创建
- `customer.subscription.updated` - 订阅更新
- `customer.subscription.deleted` - 订阅删除
- `invoice.payment_succeeded` - 发票支付成功
- `invoice.payment_failed` - 发票支付失败

---

## 用户接口

### 获取用户仪表板数据

**接口**: `GET /api/user/dashboard`

**描述**: 获取用户仪表板所需的所有数据，包括用户信息、积分余额、订阅状态、最近修复记录等。

**认证要求**: 是

**请求参数**: 无

**成功响应** (200):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "张三",
    "created_at": "2024-03-01T00:00:00.000Z"
  },
  "creditBalance": 25,
  "subscription": {
    "id": 1,
    "plan_id": "premium",
    "status": "active",
    "current_period_start": "2024-03-01T00:00:00.000Z",
    "current_period_end": "2024-04-01T00:00:00.000Z"
  },
  "recentRestorations": [
    {
      "id": 42,
      "type": "ancient-painting",
      "status": "completed",
      "created_at": "2024-03-08T00:00:00.000Z",
      "completed_at": "2024-03-08T00:05:00.000Z"
    },
    {
      "id": 41,
      "type": "mural",
      "status": "processing",
      "created_at": "2024-03-07T23:00:00.000Z",
      "completed_at": null
    }
  ],
  "galleryItemsCount": 5
}
```

**字段说明**:

- `creditBalance`: 用户当前积分余额（所有积分记录的总和）
- `subscription`: 订阅信息（如无订阅则为null）
- `recentRestorations`: 最近5条修复记录
- `galleryItemsCount`: 用户在画廊中的作品数量

**错误响应**:

- `401 Unauthorized`: 未认证
  ```json
  {
    "error": "Authentication required"
  }
  ```

- `404 Not Found`: 用户不存在
  ```json
  {
    "error": "User not found"
  }
  ```

**curl 示例**:

```bash
curl -X GET http://localhost:3000/api/user/dashboard \
  -b cookies.txt
```

---

## 健康检查

### 服务健康检查

**接口**: `GET /api/health`

**描述**: 检查服务是否正常运行。

**认证要求**: 否

**请求参数**: 无

**成功响应** (200):

```json
{
  "status": "ok",
  "timestamp": "2024-03-08T12:00:00.000Z"
}
```

**curl 示例**:

```bash
curl -X GET http://localhost:3000/api/health
```

---

## 数据库模型

### 表结构说明

#### 1. users（用户表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY | 用户ID |
| email | TEXT | UNIQUE, NOT NULL | 邮箱地址 |
| password_hash | TEXT | NOT NULL | 密码哈希值 |
| name | TEXT | - | 用户姓名 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | - | 更新时间 |

#### 2. subscriptions（订阅表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY | 订阅ID |
| user_id | INTEGER | NOT NULL, FK | 用户ID |
| plan_id | TEXT | - | 订阅计划ID |
| status | TEXT | NOT NULL | 订阅状态（active/canceled等）|
| stripe_subscription_id | TEXT | UNIQUE | Stripe订阅ID |
| current_period_start | TIMESTAMP | - | 当前计费周期开始时间 |
| current_period_end | TIMESTAMP | - | 当前计费周期结束时间 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | - | 更新时间 |

#### 3. credits（积分表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY | 积分记录ID |
| user_id | INTEGER | NOT NULL, FK | 用户ID |
| amount | INTEGER | NOT NULL | 积分数量（可以是正数或负数）|
| created_at | TIMESTAMP | NOT NULL | 创建时间 |

**注意**: 用户的总积分是所有记录的 `amount` 之和。

#### 4. restorations（修复任务表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY | 任务ID |
| user_id | INTEGER | NOT NULL, FK | 用户ID |
| type | TEXT | NOT NULL | 修复类型 |
| status | TEXT | NOT NULL | 任务状态（pending/processing/completed/failed）|
| input_file_url | TEXT | - | 输入文件URL |
| result_urls | TEXT | - | 结果文件URL数组（JSON字符串）|
| algorithm | TEXT | - | 使用的算法 |
| parameters | TEXT | - | 算法参数（JSON字符串）|
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| completed_at | TIMESTAMP | - | 完成时间 |

#### 5. gallery_items（画廊作品表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY | 作品ID |
| user_id | INTEGER | NOT NULL, FK | 用户ID |
| restoration_id | INTEGER | FK | 关联的修复任务ID（可选）|
| title | TEXT | - | 作品标题 |
| description | TEXT | - | 作品描述 |
| category | TEXT | - | 作品分类 |
| image_url | TEXT | - | 图片URL |
| is_public | BOOLEAN | NOT NULL | 是否公开 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |

### 表关系图

```
┌─────────────┐
│   users     │
│             │
│ id          │◄──┐
│ email       │   │
│ name        │   │
└─────────────┘   │
                  │
        ┌─────────┴──────────┬──────────────┬──────────────┐
        │                    │              │              │
        │                    │              │              │
┌───────▼────────┐  ┌────────▼─────┐ ┌─────▼────────┐ ┌──▼──────────────┐
│ subscriptions  │  │   credits    │ │ restorations │ │  gallery_items  │
│                │  │              │ │              │ │                 │
│ id             │  │ id           │ │ id           │◄┤ id              │
│ user_id (FK)   │  │ user_id (FK) │ │ user_id (FK) │ │ user_id (FK)    │
│ plan_id        │  │ amount       │ │ type         │ │ restoration_id  │
│ status         │  └──────────────┘ │ status       │ │ title           │
│ ...            │                   │ result_urls  │ │ is_public       │
└────────────────┘                   └──────────────┘ └─────────────────┘
```

---

## 错误代码表

### 标准 HTTP 错误码

| 状态码 | 错误消息 | 说明 | 处理建议 |
|--------|----------|------|----------|
| 400 | Bad Request | 请求参数错误或缺失 | 检查请求参数格式和必填字段 |
| 400 | Invalid restoration type | 无效的修复类型 | 使用正确的type值 |
| 400 | Invalid pagination parameters | 无效的分页参数 | page >= 1, 1 <= limit <= 100 |
| 400 | Invalid restoration ID | 无效的任务ID | 确保ID是有效的整数 |
| 400 | Missing search query | 缺少搜索关键词 | 提供q参数 |
| 400 | Missing planId or productId | 缺少计划或产品ID | 提供planId或productId |
| 400 | No file uploaded | 未上传文件 | 确保上传了file字段 |
| 400 | Only image files are allowed | 文件类型不支持 | 仅支持JPEG/PNG/WebP/TIFF |
| 401 | Authentication required | 需要登录 | 先调用登录接口获取认证Cookie |
| 401 | Invalid or expired token | Token无效或过期 | 重新登录 |
| 401 | Invalid email or password | 邮箱或密码错误 | 检查登录凭据 |
| 402 | Insufficient credits | 积分不足 | 购买积分或订阅会员 |
| 403 | Forbidden | 无权访问 | 只能访问自己的资源 |
| 404 | Not Found | 资源不存在 | 检查资源ID是否正确 |
| 404 | User not found | 用户不存在 | 用户可能已被删除 |
| 404 | Restoration not found | 修复任务不存在 | 检查任务ID |
| 409 | User with this email already exists | 邮箱已被注册 | 使用其他邮箱或直接登录 |
| 500 | Internal Server Error | 服务器内部错误 | 联系技术支持 |

### AI 服务错误

AI服务调用失败时，修复任务的status会变为 `failed`。常见原因：

- AI服务不可用或超时
- 输入文件格式不正确
- 输入文件损坏
- 服务器资源不足

**处理建议**: 可以重新提交修复任务，或联系技术支持。

---

## 附录

### A. 认证流程

```
┌────────┐                                    ┌────────┐
│ Client │                                    │ Server │
└───┬────┘                                    └───┬────┘
    │                                             │
    │  POST /api/auth/register                    │
    │  { email, name, password }                  │
    ├────────────────────────────────────────────►│
    │                                             │
    │  200 OK                                     │
    │  Set-Cookie: app_session_id=<JWT>           │
    │◄────────────────────────────────────────────┤
    │                                             │
    │  GET /api/restoration/                      │
    │  Cookie: app_session_id=<JWT>               │
    ├────────────────────────────────────────────►│
    │                                             │
    │  200 OK + restoration data                  │
    │◄────────────────────────────────────────────┤
    │                                             │
    │  POST /api/auth/logout                      │
    ├────────────────────────────────────────────►│
    │                                             │
    │  200 OK                                     │
    │  Clear-Cookie: app_session_id               │
    │◄────────────────────────────────────────────┤
    │                                             │
```

### B. 修复任务生命周期

```
┌─────────┐
│ Pending │  任务创建，等待处理
└────┬────┘
     │
     ▼
┌────────────┐
│ Processing │  AI服务正在处理
└────┬───┬───┘
     │   │
     │   └───────────┐
     │               │
     ▼               ▼
┌───────────┐  ┌──────────┐
│ Completed │  │  Failed  │
└───────────┘  └──────────┘
  成功完成       处理失败
```

### C. 积分计算规则

1. **新用户注册**: 赠送10个免费积分
2. **每次修复**: 扣除1个积分
3. **购买积分包**: 根据购买的套餐增加积分
4. **订阅会员**: 会员期间可能有额外积分奖励（取决于业务规则）

积分余额计算公式：
```
总积分 = SUM(credits.amount)
```

### D. Cookie 设置参数

```javascript
{
  httpOnly: true,           // 防止XSS攻击
  secure: true,             // 生产环境需要HTTPS
  sameSite: 'lax',          // 防止CSRF攻击
  path: '/',                // Cookie作用路径
  maxAge: 604800000         // 7天（毫秒）
}
```

### E. 文件上传限制

- **最大文件大小**: 10MB
- **支持的图片格式**: JPEG, PNG, WebP, TIFF
- **支持的文本格式**: text/plain
- **上传目录**: `./uploads/`
- **结果目录**: `./uploads/results/`

### F. 环境变量配置

修复服务需要以下环境变量：

```bash
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库
DATABASE_URL=./database.sqlite

# 文件上传
UPLOAD_DIR=./uploads

# JWT密钥
JWT_SECRET=your-secret-key

# AI服务URL
AI_SGRGAN_URL=http://ai-service:8000
AI_DCADIF_URL=http://ai-service:8001
AI_RELIC2CONTOUR_URL=http://ai-service:8002

# Stripe（可选，用于真实支付）
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### G. 速率限制建议

为保护服务器资源，建议实施以下速率限制：

| 接口类型 | 建议限制 |
|---------|---------|
| 认证接口 | 5次/分钟 |
| 修复接口 | 10次/小时 |
| 查询接口 | 100次/分钟 |
| 画廊接口 | 60次/分钟 |

**注意**: 当前版本未实施速率限制，建议在生产环境中添加。

---

## 更新日志

### v1.0.0 (2024-03-08)

- 初始版本发布
- 支持5种文物修复类型
- 集成3种AI算法（SGRGAN, DCADif, Relic2Contour）
- 实现用户认证、积分系统、订阅管理
- 提供画廊功能
- Stripe支付集成（Mock模式）

---

## 技术支持

如有任何问题，请联系：

- **技术文档**: https://github.com/your-repo/docs
- **问题反馈**: https://github.com/your-repo/issues
- **邮箱**: support@museum.com

---

**文档版本**: v1.0.0
**最后更新**: 2024-03-08
**维护团队**: 博物馆文物修复与展示系统开发团队
