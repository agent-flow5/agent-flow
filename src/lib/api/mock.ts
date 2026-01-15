/**
 * Mock API 服务
 * 用于前端开发测试，模拟后端 API 响应
 * 后续接入真实后端时，只需修改 config.ts 中的 USE_MOCK = false
 */

// 类型定义
type AgentStatus = 'enabled' | 'disabled';
type JobStatus = 'open' | 'running' | 'pending_review' | 'completed';
type BillStatus = 'locked' | 'released';

interface MockAgent {
  id: string;
  ownerUserId: string;
  name: string;
  url: string;
  description: string;
  price: string;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

interface MockJob {
  id: string;
  userId: string;
  agentId: string;
  title: string;
  category: string;
  description: string;
  expectedResult: string;
  status: JobStatus;
  resultText: string | null;
  resultMetaJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface MockBill {
  id: string;
  jobId: string;
  status: BillStatus;
  amount: string;
  releasedAt: string | null;
  createdAt: string;
}

// Mock 数据存储（模拟数据库）
const mockDB: {
  users: Map<string, { id: string; address: string; nonce: string }>;
  wallets: Map<string, { available: string; frozen: string }>;
  withdrawals: Array<{
    id: string;
    amount: string;
    status: string;
    txHash: string;
    requestedAt: string;
    updatedAt: string;
  }>;
  agents: MockAgent[];
  jobs: MockJob[];
  bills: MockBill[];
} = {
  // 用户数据
  users: new Map<string, { id: string; address: string; nonce: string }>(),

  // 钱包余额
  wallets: new Map<string, { available: string; frozen: string }>(),

  // 提现记录
  withdrawals: [] as Array<{
    id: string;
    amount: string;
    status: string;
    txHash: string;
    requestedAt: string;
    updatedAt: string;
  }>,

  // Agents
  agents: [
    {
      id: '1',
      ownerUserId: '1',
      name: 'GPT-4 助手',
      url: 'https://api.example.com/gpt4',
      description: '基于 GPT-4 的智能助手，可以帮助你完成各种任务',
      price: '10.00',
      status: 'enabled' ,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      ownerUserId: '1',
      name: '代码审查专家',
      url: 'https://api.example.com/code-review',
      description: '专业的代码审查 Agent，支持多种编程语言',
      price: '15.00',
      status: 'enabled' ,
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      ownerUserId: '2',
      name: '数据分析师',
      url: 'https://api.example.com/data-analyst',
      description: '专业的数据分析 Agent，支持数据清洗、可视化等',
      price: '20.00',
      status: 'enabled' ,
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
    },
  ],

  // Jobs
  jobs: [
    {
      id: '101',
      userId: '1',
      agentId: '1',
      title: '分析 2024 Q1 财报',
      category: '数据分析',
      description: '请提炼核心经营数据并列出增长/下滑原因。',
      expectedResult: 'JSON 格式数据，包含营收、利润、增长率等字段',
      status: 'running' ,
      resultText: null,
      resultMetaJson: null,
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
    },
    {
      id: '102',
      userId: '1',
      agentId: '2',
      title: '审查用户模块代码',
      category: '代码审查',
      description: '审查 src/user 目录下的所有代码，检查潜在问题。',
      expectedResult: '代码审查报告，包含问题列表和修改建议',
      status: 'completed' ,
      resultText: '代码审查完成，发现 3 个潜在问题：1. 未处理的异常... 2. SQL 注入风险... 3. 性能优化建议...',
      resultMetaJson: { issues: 3, severity: 'medium' },
      createdAt: '2025-01-08T00:00:00.000Z',
      updatedAt: '2025-01-09T00:00:00.000Z',
    },
  ],

  // Bills
  bills: [
    {
      id: '1',
      jobId: '102',
      status: 'released' ,
      amount: '15.00',
      releasedAt: '2025-01-09T00:00:00.000Z',
      createdAt: '2025-01-08T00:00:00.000Z',
    },
    {
      id: '2',
      jobId: '101',
      status: 'locked' ,
      amount: '10.00',
      releasedAt: null,
      createdAt: '2025-01-10T00:00:00.000Z',
    },
  ],
};

// 当前登录用户
let currentUserId: string | null = null;
let currentUserAddress: string | null = null;

// 生成随机 ID
const generateId = () => String(Date.now() + Math.random() * 1000).replace('.', '');

// 生成随机 nonce
const generateNonce = () => Math.random().toString(36).substring(2, 15);

// 模拟网络延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ============ Auth Mock ============

export const mockAuth = {
  async getNonce(address: string) {
    await delay();
    const nonce = generateNonce();
    const message = `Agent Market Web3 Login\nAddress: ${address}\nNonce: ${nonce}`;

    // 保存 nonce
    let user = mockDB.users.get(address);
    if (!user) {
      user = { id: generateId(), address, nonce };
      mockDB.users.set(address, user);
      // 初始化钱包余额
      mockDB.wallets.set(address, { available: '100.00', frozen: '0.00' });
    } else {
      user.nonce = nonce;
    }

    return {
      address,
      nonce,
      message,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  },

  async verify(data: { message: string; signature: string }) {
    await delay();
    // 从 message 中解析 address
    const addressMatch = data.message.match(/Address: (0x[a-fA-F0-9]+)/);
    if (!addressMatch) {
      throw new Error('Invalid message format');
    }

    const address = addressMatch[1].toLowerCase();
    const user = mockDB.users.get(address);

    if (!user) {
      throw new Error('User not found');
    }

    // 设置当前用户
    currentUserId = user.id;
    currentUserAddress = address;

    // 生成 mock token
    const token = `mock_jwt_${user.id}_${Date.now()}`;

    return { token };
  },

  logout() {
    currentUserId = null;
    currentUserAddress = null;
  },

  getCurrentUserId() {
    return currentUserId;
  },
};

// ============ Wallet Mock ============

export const mockWallet = {
  async getBalance() {
    await delay();
    if (!currentUserAddress) {
      throw new Error('未登录');
    }

    const wallet = mockDB.wallets.get(currentUserAddress);
    return wallet || { available: '0.00', frozen: '0.00' };
  },

  async withdraw(data: { amount: string }) {
    await delay();
    if (!currentUserAddress) {
      throw new Error('未登录');
    }

    const wallet = mockDB.wallets.get(currentUserAddress);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    const available = parseFloat(wallet.available);
    const amount = parseFloat(data.amount);

    if (amount > available) {
      throw new Error('余额不足');
    }

    // 扣减余额
    wallet.available = (available - amount).toFixed(2);

    // 创建提现记录
    const withdrawal = {
      id: generateId(),
      amount: data.amount,
      status: 'requested',
      txHash: '',
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDB.withdrawals.push(withdrawal);

    return withdrawal;
  },

  async getWithdrawals() {
    await delay();
    return mockDB.withdrawals;
  },

  async devGrant(data: { amount: string }) {
    await delay();
    if (!currentUserAddress) {
      throw new Error('未登录');
    }

    const wallet = mockDB.wallets.get(currentUserAddress);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    const available = parseFloat(wallet.available);
    const amount = parseFloat(data.amount);

    wallet.available = (available + amount).toFixed(2);

    return { ...wallet };
  },
};

// ============ Agents Mock ============

export const mockAgents = {
  async getAgentList(params?: { page?: number; pageSize?: number }) {
    await delay();
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;

    const enabledAgents = mockDB.agents.filter(a => a.status === 'enabled');
    const start = (page - 1) * pageSize;
    const items = enabledAgents.slice(start, start + pageSize);

    return {
      items,
      meta: {
        page,
        pageSize,
        total: enabledAgents.length,
        totalPages: Math.ceil(enabledAgents.length / pageSize),
      },
    };
  },

  async getMyAgents(params?: { page?: number; pageSize?: number; status?: string }) {
    await delay();
    if (!currentUserId) {
      throw new Error('未登录');
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;

    let myAgents = mockDB.agents.filter(a => a.ownerUserId === currentUserId);
    if (params?.status) {
      myAgents = myAgents.filter(a => a.status === params.status);
    }

    const start = (page - 1) * pageSize;
    const items = myAgents.slice(start, start + pageSize);

    return {
      items,
      meta: {
        page,
        pageSize,
        total: myAgents.length,
        totalPages: Math.ceil(myAgents.length / pageSize),
      },
    };
  },

  async getAgentDetail(id: string) {
    await delay();
    const agent = mockDB.agents.find(a => a.id === id);
    if (!agent) {
      throw new Error('Agent 不存在');
    }

    // 如果不是 owner，隐藏 url
    if (agent.ownerUserId !== currentUserId) {
      return { ...agent, url: '' };
    }

    return agent;
  },

  async createAgent(data: { name: string; url: string; description?: string; price: string }) {
    await delay();
    if (!currentUserId) {
      throw new Error('未登录');
    }

    const agent: MockAgent = {
      id: generateId(),
      ownerUserId: currentUserId,
      name: data.name,
      url: data.url,
      description: data.description || '',
      price: data.price,
      status: 'enabled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDB.agents.push(agent);

    return agent;
  },

  async updateAgent(id: string, data: Partial<{ name: string; url: string; description: string; price: string; status: string }>) {
    await delay();
    const agent = mockDB.agents.find(a => a.id === id);
    if (!agent) {
      throw new Error('Agent 不存在');
    }
    if (agent.ownerUserId !== currentUserId) {
      throw new Error('无权限');
    }

    Object.assign(agent, data, { updatedAt: new Date().toISOString() });

    return agent;
  },

  async disableAgent(id: string) {
    await delay();
    const agent = mockDB.agents.find(a => a.id === id);
    if (!agent) {
      throw new Error('Agent 不存在');
    }
    if (agent.ownerUserId !== currentUserId) {
      throw new Error('无权限');
    }

    agent.status = 'disabled';
    agent.updatedAt = new Date().toISOString();

    return agent;
  },
};

// ============ Jobs Mock ============

export const mockJobs = {
  async getJobList() {
    await delay();
    if (!currentUserId) {
      throw new Error('未登录');
    }

    return mockDB.jobs.filter(j => j.userId === currentUserId);
  },

  async getJobDetail(id: string) {
    await delay();
    const job = mockDB.jobs.find(j => j.id === id);
    if (!job) {
      throw new Error('Job 不存在');
    }

    return job;
  },

  async createJob(data: { agentId: string; title: string; category: string; description: string; expectedResult: string }) {
    await delay();
    if (!currentUserId) {
      throw new Error('未登录');
    }

    const agent = mockDB.agents.find(a => a.id === data.agentId);
    if (!agent) {
      throw new Error('Agent 不存在');
    }
    if (agent.status !== 'enabled') {
      throw new Error('Agent 已下架');
    }

    // 检查余额
    if (!currentUserAddress) {
      throw new Error('未登录');
    }
    const wallet = mockDB.wallets.get(currentUserAddress);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    const available = parseFloat(wallet.available);
    const price = parseFloat(agent.price);

    if (available < price) {
      throw new Error('余额不足');
    }

    // 冻结余额
    wallet.available = (available - price).toFixed(2);
    wallet.frozen = (parseFloat(wallet.frozen) + price).toFixed(2);

    const job: MockJob = {
      id: generateId(),
      userId: currentUserId,
      agentId: data.agentId,
      title: data.title,
      category: data.category,
      description: data.description,
      expectedResult: data.expectedResult,
      status: 'running',
      resultText: null,
      resultMetaJson: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDB.jobs.push(job);

    // 创建账单
    const bill: MockBill = {
      id: generateId(),
      jobId: job.id,
      status: 'locked',
      amount: agent.price,
      releasedAt: null,
      createdAt: new Date().toISOString(),
    };
    mockDB.bills.push(bill);

    return job;
  },

  async submitJobResult(id: string, data?: { resultText?: string; resultMetaJson?: Record<string, unknown> }) {
    await delay();
    const job = mockDB.jobs.find(j => j.id === id);
    if (!job) {
      throw new Error('Job 不存在');
    }

    job.status = 'completed';
    job.resultText = data?.resultText || '任务已完成';
    job.resultMetaJson = data?.resultMetaJson || null;
    job.updatedAt = new Date().toISOString();

    // 释放账单
    const bill = mockDB.bills.find(b => b.jobId === id);
    if (bill) {
      bill.status = 'released';
      bill.releasedAt = new Date().toISOString();

      // 解冻并释放余额（这里简化处理，实际应该转给 agent owner）
      if (currentUserAddress) {
        const wallet = mockDB.wallets.get(currentUserAddress);
        if (wallet) {
          const frozen = parseFloat(wallet.frozen);
          const amount = parseFloat(bill.amount);
          wallet.frozen = Math.max(0, frozen - amount).toFixed(2);
        }
      }
    }

    return job;
  },

  async confirmJob(id: string) {
    await delay();
    return this.submitJobResult(id);
  },
};

// ============ Bills Mock ============

export const mockBills = {
  async getBillList() {
    await delay();
    if (!currentUserId) {
      throw new Error('未登录');
    }

    // 获取当前用户的 jobs
    const userJobIds = mockDB.jobs.filter(j => j.userId === currentUserId).map(j => j.id);

    return mockDB.bills.filter(b => userJobIds.includes(b.jobId));
  },

  async getBillDetail(id: string) {
    await delay();
    const bill = mockDB.bills.find(b => b.id === id);
    if (!bill) {
      throw new Error('账单不存在');
    }

    return bill;
  },
};

// 设置当前用户（用于 mock token 恢复）
export function setMockUser(userId: string, address: string) {
  currentUserId = userId;
  currentUserAddress = address;
}

// 从 token 恢复用户
export function restoreFromToken(token: string) {
  if (token.startsWith('mock_jwt_')) {
    const parts = token.split('_');
    if (parts.length >= 3) {
      currentUserId = parts[2];
      // 从 mockDB 找回地址
      for (const [address, user] of mockDB.users.entries()) {
        if (user.id === currentUserId) {
          currentUserAddress = address;
          break;
        }
      }
    }
  }
}
