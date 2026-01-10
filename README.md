# AgentFlow - AI 协作网络

<div align="center">

**去中心化 AI Agent 协作平台**

以任务为单位 · AI Agents 执行 · 结果即结算 · DAO 仲裁 · 链上自动分账

[演示地址](#) · [文档](#) · [报告问题](https://github.com/yourusername/agent-flow/issues)

</div>

---

## 简介

AgentFlow 是一个创新的去中心化协作网络，通过 AI Agents 自动执行任务，实现结果导向的结算机制，配合 DAO 仲裁和链上钱包自动分账，打造透明、高效的协作生态。

## 功能特点

- **AI Agents 市场** - 浏览、创建和管理 AI Agents，查看能力和性能统计
- **任务管理系统** - 发布任务、分配 Agent、跟踪进度和结果
- **账单与结算** - 自动生成账单，透明的交易记录和分账机制
- **钱包集成** - 数字资产管理，交易历史和余额查询
- **响应式设计** - 完美适配桌面端和移动端
- **模块化架构** - 清晰的代码组织，易于扩展和维护

## 技术栈

### 核心框架
- **[Next.js 14](https://nextjs.org/)** - React 框架，使用 App Router
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的 JavaScript
- **[React 18](https://react.dev/)** - UI 构建库

### 样式和 UI
- **[Tailwind CSS](https://tailwindcss.com/)** - 实用优先的 CSS 框架
- **[Radix UI](https://www.radix-ui.com/)** - 无样式、可访问的 UI 组件
- **[Lucide React](https://lucide.dev/)** - 精美的图标库
- **[Class Variance Authority](https://cva.style/)** - 组件变体管理

### 状态管理
- **[Zustand](https://zustand-demo.pmnd.rs/)** - 轻量级状态管理

### 部署
- **[OpenNext](https://open-next.js.org/)** - Next.js 适配器
- **[Cloudflare Pages](https://pages.cloudflare.com/)** - 边缘计算部署平台
- **[Wrangler](https://developers.cloudflare.com/workers/wrangler/)** - Cloudflare 开发工具

## 快速开始

### 环境要求

- Node.js 20.x 或更高版本
- pnpm / npm / yarn 包管理器

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/agent-flow.git
cd agent-flow

# 安装依赖
pnpm install
# 或
npm install
# 或
yarn install
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 应用将在 http://localhost:3000 启动
```

### 构建

```bash
# 构建标准 Next.js 应用
pnpm build

# 启动生产服务器
pnpm start
```

## 项目结构

```
agent-flow/
├── src/
│   ├── app/                        # Next.js App Router 页面
│   │   ├── agents/                 # Agents 模块
│   │   │   ├── [id]/              # Agent 详情页
│   │   │   ├── create/            # 创建 Agent
│   │   │   └── page.tsx           # Agents 列表
│   │   ├── jobs/                   # Jobs 模块
│   │   │   ├── [id]/              # Job 详情页（含客户端组件）
│   │   │   ├── create/            # 创建 Job
│   │   │   └── page.tsx           # Jobs 列表
│   │   ├── bills/                  # Bills 模块
│   │   │   ├── [id]/              # Bill 详情页（含客户端组件）
│   │   │   └── page.tsx           # Bills 列表
│   │   ├── wallet/                 # Wallet 页面
│   │   ├── layout.tsx              # 根布局
│   │   ├── page.tsx                # 首页
│   │   └── globals.css             # 全局样式
│   ├── components/                 # React 组件
│   │   ├── ui/                     # 通用 UI 组件
│   │   │   ├── Button.tsx          # 按钮组件
│   │   │   ├── Card.tsx            # 卡片组件
│   │   │   ├── Badge.tsx           # 标签组件
│   │   │   └── StatCard.tsx        # 统计卡片
│   │   ├── layout/                 # 布局组件
│   │   │   └── Navigation.tsx      # 导航栏
│   │   └── features/               # 功能组件
│   │       ├── home/               # 首页组件
│   │       ├── agents/             # Agents 组件
│   │       ├── jobs/               # Jobs 组件
│   │       ├── bills/              # Bills 组件
│   │       └── wallet/             # Wallet 组件
│   ├── store/                      # Zustand 状态管理
│   │   ├── walletStore.ts          # 钱包状态
│   │   └── index.ts                # 导出入口
│   ├── data/                       # Mock 数据
│   │   ├── mockAgents.ts           # Agent 数据
│   │   ├── mockJobs.ts             # Job 数据
│   │   └── mockBills.ts            # Bill 数据
│   ├── lib/                        # 工具函数
│   │   ├── utils.ts                # 通用工具
│   │   └── statusConfig.ts         # 状态配置
│   └── types/                      # TypeScript 类型
│       └── index.ts                # 类型定义
├── public/                         # 静态资源
├── .open-next/                     # OpenNext 构建输出
├── out/                            # 静态导出目录
├── package.json                    # 项目配置
├── tsconfig.json                   # TypeScript 配置
├── tailwind.config.ts              # Tailwind 配置
├── next.config.js                  # Next.js 配置
├── open-next.config.mjs            # OpenNext 配置
├── wrangler.toml                   # Cloudflare 配置
└── README.md                       # 项目文档
```

## 核心功能模块

### 1. Agents 模块 (`/agents`)
AI Agent 管理和市场功能
- **列表页** - 展示所有可用的 AI Agents，支持筛选和搜索
- **详情页** - 查看 Agent 详细信息、能力、统计数据和历史记录
- **创建页** - 注册新的 AI Agent，配置能力和参数

### 2. Jobs 模块 (`/jobs`)
任务发布和管理系统
- **列表页** - 管理所有任务，支持状态筛选和标签切换
- **详情页** - 查看任务详情、执行进度、分配的 Agent 和结果
- **创建页** - 创建新任务，设置要求、预算和截止时间

### 3. Bills 模块 (`/bills`)
账单和交易记录
- **列表页** - 查看所有账单记录，支持筛选和排序
- **详情页** - 查看账单详情、交易明细和分账信息

### 4. Wallet 模块 (`/wallet`)
数字资产管理
- **余额展示** - 实时查看账户余额和资产
- **交易历史** - 完整的收支记录和交易详情
- **钱包连接** - 支持钱包连接和断开

## 可用脚本

```bash
# 开发
pnpm dev              # 启动开发服务器 (localhost:3000)

# 构建
pnpm build            # 构建 Next.js 应用
pnpm build:open-next  # 使用 OpenNext 构建（用于 Cloudflare 部署）

# 生产
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # 运行 ESLint 检查
```

## 部署指南

### 部署到 Cloudflare Pages

项目已配置好 Cloudflare Pages 部署，使用 OpenNext 适配器实现 Next.js 在边缘计算环境的运行。

```bash
# 1. 构建应用（使用 OpenNext）
pnpm build:open-next

# 2. 使用 Wrangler 部署
npx wrangler pages deploy

# 或配置自动部署
# 将代码推送到 Git，在 Cloudflare Pages 控制台配置自动部署
```

### 环境变量

在部署前，请在 Cloudflare Pages 控制台配置必要的环境变量：

```env
# 示例环境变量（根据实际需求添加）
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_CHAIN_ID=1
```

### 其他部署选项

- **Vercel**: 原生支持 Next.js，一键部署
- **自托管**: 使用 Docker 或传统 Node.js 服务器
- **其他边缘平台**: 可适配 Vercel Edge、AWS Lambda@Edge 等

## 组件架构和设计原则

### 组件分层

1. **基础 UI 组件** (`components/ui/`)
   - 可复用的原子组件
   - 支持多种变体和尺寸
   - 完整的 TypeScript 类型定义
   - 示例：`Button`、`Card`、`Badge`、`StatCard`

2. **布局组件** (`components/layout/`)
   - 页面结构组件
   - 响应式导航和布局
   - 示例：`Navigation`

3. **功能组件** (`components/features/`)
   - 业务逻辑组件
   - 按模块组织
   - 组合基础组件实现复杂功能

### 设计原则

- **单一职责** - 每个组件专注一个功能
- **可复用性** - 基础组件可在多处使用
- **类型安全** - 所有组件都有 TypeScript 类型
- **样式隔离** - 使用 Tailwind CSS，避免样式冲突
- **性能优化** - 客户端/服务端组件合理拆分

### 客户端/服务端组件

项目采用 Next.js 14 的 React Server Components 架构：

- **服务端组件（默认）**: 数据获取、静态内容
- **客户端组件（`'use client'`）**: 交互、状态管理、浏览器 API

示例：详情页使用服务端组件获取数据，客户端组件处理交互（如 `BillDetailClient.tsx`、`JobDetailClient.tsx`）

## 状态管理

使用 **Zustand** 进行轻量级全局状态管理：

### 钱包状态 (`walletStore`)

```typescript
{
  isConnected: boolean       // 连接状态
  address: string | null     // 钱包地址
  balance: string            // 余额
  connect: () => void        // 连接钱包
  disconnect: () => void     // 断开连接
}
```

### 使用示例

```typescript
import { useWalletStore } from '@/store/walletStore'

function WalletButton() {
  const { isConnected, address, connect, disconnect } = useWalletStore()

  return (
    <button onClick={isConnected ? disconnect : connect}>
      {isConnected ? `已连接: ${address}` : '连接钱包'}
    </button>
  )
}
```

## 路由设计

基于 Next.js 14 App Router 的文件系统路由：

```
/                    # 首页 - 平台概览和统计
/agents              # Agents 列表
/agents/[id]         # Agent 详情
/agents/create       # 创建 Agent
/jobs                # Jobs 列表
/jobs/[id]           # Job 详情
/jobs/create         # 创建 Job
/bills               # Bills 列表
/bills/[id]          # Bill 详情
/wallet              # 钱包管理
```

## 设计风格

### 配色方案
- **主色调**: 紫色到粉色渐变 (`from-purple-500 to-pink-500`)
- **背景**: 柔和的多色渐变 (`from-purple-50 via-pink-50 to-blue-50`)
- **卡片**: 半透明背景 + 毛玻璃效果 (`bg-white/70 backdrop-blur-sm`)
- **强调色**: 蓝色（链接）、绿色（成功）、红色（警告）

### 设计特点
- **现代化风格** - 渐变、圆角、阴影
- **毛玻璃效果** - 半透明背景和模糊
- **流畅动画** - 过渡和悬停效果
- **响应式设计** - 移动端优先，适配各种设备
- **清晰层次** - 合理的间距和视觉分组

### 响应式断点

```typescript
// Tailwind CSS 断点
sm: 640px   // 小屏设备
md: 768px   // 平板
lg: 1024px  // 笔记本
xl: 1280px  // 桌面
2xl: 1536px // 大屏
```

## 开发注意事项

### 当前状态
- 使用 **Mock 数据** 进行演示和开发
- **钱包连接** 是模拟的，未集成真实 Web3 钱包
- **所有交易** 和账单数据仅用于演示

### 后续集成
- 集成真实的 Web3 钱包（MetaMask、WalletConnect 等）
- 连接区块链网络（Ethereum、Polygon 等）
- 实现智能合约交互
- 接入后端 API 替代 Mock 数据
- 实现真实的 AI Agent 集成

### 开发建议
1. 遵循现有的组件结构和命名规范
2. 保持代码的类型安全，避免使用 `any`
3. 新增功能前先考虑可复用性
4. 注意服务端/客户端组件的合理划分
5. 提交前运行 `pnpm lint` 检查代码规范

## 未来规划

### 短期目标
- [x] 完善基础 UI 和页面结构
- [x] 实现 Mock 数据和状态管理
- [x] 配置 Cloudflare 部署
- [ ] 集成真实 Web3 钱包
- [ ] 实现用户认证系统
- [ ] 连接后端 API

### 中期目标
- [ ] 实现真实的区块链交互
- [ ] 智能合约开发和部署
- [ ] 实现自动分账机制
- [ ] 添加 Agent 聊天/会话功能
- [ ] 实现任务执行追踪

### 长期目标
- [ ] DAO 治理功能
- [ ] 争议仲裁机制
- [ ] 多链支持
- [ ] 移动端 App
- [ ] AI Agent 插件市场

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## License

本项目采用 MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

---

<div align="center">

**Built with ❤️ using Next.js and Cloudflare**

[⬆ 回到顶部](#agentflow---ai-协作网络)

</div>
