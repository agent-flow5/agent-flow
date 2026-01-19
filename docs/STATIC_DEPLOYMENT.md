# AgentFlow 静态部署方案文档

## 概述

本文档描述了 AgentFlow 项目部署到 Cloudflare Pages 的静态部署方案。该方案将 Next.js 应用导出为纯静态文件，由 Cloudflare Pages 托管，前端直接调用后端 API。

## 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                      用户浏览器                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages (CDN)                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    静态文件                              │   │
│  │  • HTML 页面 (index.html, agents.html, etc.)            │   │
│  │  • JavaScript 包 (_next/static/)                        │   │
│  │  • CSS 样式文件                                         │   │
│  │  • 静态资源 (favicon.ico, logo.png)                     │   │
│  │  • _redirects (SPA 路由 fallback)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  URL: https://agent-flow-xxx.pages.dev                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP API 请求 (需要 CORS)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        后端 API 服务器                           │
│                                                                 │
│  地址: http://150.158.142.132:3000                              │
│                                                                 │
│  提供接口:                                                       │
│  • /auth/* - 认证相关                                           │
│  • /agents/* - Agent 管理                                       │
│  • /jobs/* - 任务管理                                           │
│  • /bills/* - 账单管理                                          │
│  • /wallet/* - 钱包管理                                         │
└─────────────────────────────────────────────────────────────────┘
```

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) |
| 构建方式 | 静态导出 (`output: 'export'`) |
| 托管平台 | Cloudflare Pages |
| 部署工具 | Wrangler CLI |
| 包管理器 | pnpm |

## 关键配置文件

### 1. next.config.js

```javascript
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,  // 静态导出不支持图片优化
  },
}

// 生产环境启用静态导出
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export'
} else {
  // 开发环境代理配置
  nextConfig.rewrites = async () => [
    {
      source: '/api/:path*',
      destination: 'http://150.158.142.132:3000/:path*',
    },
  ]
}

module.exports = nextConfig
```

### 2. .env.local (生产环境)

```bash
# API 服务器地址 - 静态部署直接请求后端
NEXT_PUBLIC_API_BASE_URL=http://150.158.142.132:3000

# 关闭 Mock 模式，使用真实后端
NEXT_PUBLIC_USE_MOCK=false
```

### 3. public/_redirects (SPA Fallback)

```
# SPA fallback for Cloudflare Pages
# 让所有未匹配的路径返回 index.html，由客户端路由处理
/* /index.html 200
```

### 4. 动态路由页面配置

所有动态路由页面需要添加 `generateStaticParams`：

```typescript
// src/app/agents/[id]/page.tsx
import AgentDetailClient from './AgentDetailClient';

export async function generateStaticParams() {
  return [{ id: '_' }];  // 预生成占位页面
}

export default function AgentDetailPage() {
  return <AgentDetailClient />;
}
```

适用于：
- `/agents/[id]`
- `/bills/[id]`
- `/jobs/[id]`

## 部署步骤

### 前置条件

1. 安装 Node.js 18+
2. 安装 pnpm: `npm install -g pnpm`
3. 登录 Cloudflare: `npx wrangler login`

### 构建与部署

```bash
# 1. 安装依赖
pnpm install

# 2. 构建静态文件
pnpm build

# 3. 部署到 Cloudflare Pages
npx wrangler pages deploy out --project-name=agent-flow
```

### 一键部署脚本

```bash
pnpm install && pnpm build && npx wrangler pages deploy out --project-name=agent-flow
```

## 输出目录结构

构建后 `out/` 目录结构：

```
out/
├── _next/
│   └── static/
│       ├── chunks/          # JavaScript 代码块
│       ├── css/             # 样式文件
│       └── media/           # 字体等媒体资源
├── _redirects               # SPA 路由配置
├── agents/
│   ├── _/index.html        # 动态路由占位页
│   └── create/index.html
├── bills/
│   └── _/index.html
├── jobs/
│   ├── _/index.html
│   └── create/index.html
├── agents.html
├── bills.html
├── jobs.html
├── wallet.html
├── index.html               # 首页
├── 404.html                 # 404 页面
├── favicon.ico
└── logo.png
```

## 后端 CORS 配置

静态部署后，前端直接请求后端 API，需要后端配置 CORS。

### 需要允许的请求头

```
Access-Control-Allow-Origin: https://agent-flow-xxx.pages.dev
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### 开发阶段临时配置

```
Access-Control-Allow-Origin: *
```

### NestJS 示例

```typescript
// main.ts
app.enableCors({
  origin: [
    'https://agent-flow-xxx.pages.dev',
    'http://localhost:3000',  // 开发环境
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

### Express 示例

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://agent-flow-xxx.pages.dev',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

## 环境变量说明

| 变量名 | 说明 | 生产值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 地址 | `http://150.158.142.132:3000` |
| `NEXT_PUBLIC_USE_MOCK` | 是否使用 Mock 数据 | `false` |

## 自定义域名

### 通过 Cloudflare Dashboard

1. 进入项目设置 → Custom domains
2. 添加自定义域名
3. 配置 DNS 记录（CNAME 指向 `agent-flow-xxx.pages.dev`）

### 通过命令行

```bash
npx wrangler pages project list
npx wrangler pages deployment list --project-name=agent-flow
```

## 常见问题

### Q1: 访问动态路由 404

**原因**: `_redirects` 文件未正确配置或未被复制到 `out/` 目录

**解决**: 确保 `public/_redirects` 存在，内容为：
```
/* /index.html 200
```

### Q2: API 请求跨域错误

**原因**: 后端未配置 CORS

**解决**: 后端添加 CORS 配置，允许 Cloudflare Pages 域名

### Q3: 构建时动态路由报错

**错误**: `Page "/agents/[id]" is missing "generateStaticParams()"`

**解决**: 为所有动态路由页面添加 `generateStaticParams` 函数

### Q4: useSearchParams 报错

**错误**: `useSearchParams() should be wrapped in a suspense boundary`

**解决**: 使用 `<Suspense>` 包裹使用 `useSearchParams` 的组件

## 与 SSR 方案对比

| 特性 | 静态部署 | SSR (OpenNext) |
|------|----------|----------------|
| 构建产物 | 纯静态 HTML/JS/CSS | Worker 脚本 |
| API 代理 | 不支持（需后端 CORS） | 支持（Workers 代理） |
| 服务端渲染 | 不支持 | 支持 |
| 部署复杂度 | 简单 | 中等 |
| 免费额度 | 非常高 | 有 Worker 调用限制 |
| 适用场景 | 纯前端应用 | 需要 SSR 或 API 代理 |

## 维护与更新

### 更新部署

```bash
# 重新构建并部署
pnpm build && npx wrangler pages deploy out --project-name=agent-flow
```

### 回滚部署

通过 Cloudflare Dashboard → Deployments → 选择历史版本 → Rollback

### 查看部署日志

```bash
npx wrangler pages deployment list --project-name=agent-flow
```

## 联系方式

如有问题，请联系项目维护人员。
