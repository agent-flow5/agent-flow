/**
 * 全局类型定义
 * 包含前端使用的类型和从 API 服务导入的类型
 */

// 从 API 服务重新导出类型（保持类型一致性）
export type {
  AgentDto,
  AgentStatus,
  CreateAgentRequest,
  UpdateAgentRequest,
  PaginatedResponse,
  PaginationMeta,
} from '@/lib/api/services/agents';

export type {
  JobDto,
  JobStatus,
  CreateJobRequest,
  SubmitResultRequest,
} from '@/lib/api/services/jobs';

export type {
  BillDto,
  BillStatus,
} from '@/lib/api/services/bills';

export type {
  WalletBalance,
  Withdrawal,
  WithdrawRequest,
} from '@/lib/api/services/wallet';

export type {
  NonceResponse,
  VerifyRequest,
  VerifyResponse,
} from '@/lib/api/services/auth';

// ============ 前端特有类型（兼容旧代码） ============

// Agent 前端展示类型（兼容旧代码）
export interface Agent {
  id: string;
  name: string;
  description: string;
  fee: number;
  status: 'available' | 'unavailable';
  completedJobs: number;
  owner: string;
  url?: string;
  price?: string;
}

// Job 前端展示类型（兼容旧代码）
export interface Job {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'open' | 'running' | 'completed' | 'failed' | 'pending_review';
  executable: boolean;
  reward: number;
  owner: string;
  createdAt: string;
  conversationId: string;
  agent?: string;
  category?: string;
  expectedResult?: string;
  resultText?: string;
  resultMetaJson?: Record<string, unknown>;
  agentId?: string;
  userId?: string;
}

// Bill 前端展示类型（兼容旧代码）
export interface Bill {
  id: string;
  jobId: string;
  jobTitle: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'locked' | 'released';
  createdAt: string;
  paidAt?: string;
  from: string;
  to: string;
  txHash?: string;
  chainId?: number;
  releasedAt?: string;
}

// 钱包状态类型
export interface WalletState {
  isConnected: boolean;
  address: string;
  balance: number;
  frozenBalance: number;
  token: string | null;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

// 用于 UI 的状态类型
export type StatusType = 'draft' | 'open' | 'running' | 'completed' | 'failed' | 'pending' | 'paid' | 'pending_review' | 'locked' | 'released';

// ============ 工具函数类型转换 ============

import type { AgentDto as AgentDtoType } from '@/lib/api/services/agents';
import type { JobDto as JobDtoType } from '@/lib/api/services/jobs';
import type { BillDto as BillDtoType } from '@/lib/api/services/bills';

// 将 AgentDto 转换为前端 Agent 类型
export function agentDtoToAgent(dto: AgentDtoType): Agent {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    fee: parseFloat(dto.price) || 0,
    status: dto.status === 'enabled' ? 'available' : 'unavailable',
    completedJobs: 0, // API 暂未返回此字段
    owner: dto.ownerUserId,
    url: dto.url,
    price: dto.price,
  };
}

// 将 JobDto 转换为前端 Job 类型
export function jobDtoToJob(dto: JobDtoType): Job {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    status: dto.status as Job['status'],
    executable: dto.status === 'running',
    reward: 0, // 需要从关联的 Agent 获取
    owner: dto.userId,
    createdAt: dto.createdAt,
    conversationId: '', // API 暂未返回此字段
    agent: dto.agentId,
    agentId: dto.agentId,
    userId: dto.userId,
    category: dto.category,
    expectedResult: dto.expectedResult,
    resultText: dto.resultText || undefined,
    resultMetaJson: dto.resultMetaJson || undefined,
  };
}

// 将 BillDto 转换为前端 Bill 类型
export function billDtoToFrontend(dto: BillDtoType): Bill {
  return {
    id: dto.id,
    jobId: dto.jobId,
    jobTitle: '', // 需要从关联的 Job 获取
    amount: parseFloat(dto.amount) || 0,
    status: dto.status,
    createdAt: dto.createdAt,
    paidAt: dto.releasedAt || undefined,
    from: '',
    to: '',
    releasedAt: dto.releasedAt || undefined,
  };
}
