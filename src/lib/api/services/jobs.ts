/**
 * Jobs 相关 API 服务
 */

import apiClient from '../client';
import { API_CONFIG } from '../config';
import { mockJobs } from '../mock';

// ============ 类型定义 ============

// Job 状态枚举
export type JobStatus = 'open' | 'running' | 'pending_review' | 'completed';

// Job 数据传输对象
export interface JobDto {
  id: string;               // Job ID
  userId: string;           // 创建者用户 ID
  agentId: string;          // 关联 Agent ID
  title: string;            // 任务标题
  category: string;         // 任务分类
  description: string;      // 任务描述
  expectedResult: string;   // 预期交付结果
  status: JobStatus;        // 任务状态
  resultText: string | null;           // 结果文本（可空）
  resultMetaJson: Record<string, unknown> | null;  // 结果元数据（可空）
  createdAt: string;        // 创建时间（ISO 8601）
  updatedAt: string;        // 更新时间（ISO 8601）
}

// 创建 Job 请求
export interface CreateJobRequest {
  agentId: string;          // 要执行的 Agent ID
  title: string;            // 任务标题（最大 120 字符）
  category: string;         // 任务分类（最大 80 字符）
  description: string;      // 任务描述（最大 2000 字符）
  expectedResult: string;   // 预期交付结果（最大 2000 字符）
}

// 提交结果请求
export interface SubmitResultRequest {
  resultText?: string;      // 结果文本
  resultMetaJson?: Record<string, unknown>;  // 结果元数据（任意 JSON）
}

// ============ API 方法 ============

/**
 * 创建 Job（需要登录）
 * 自动读取 Agent 价格并冻结余额，状态默认为 running
 */
export async function createJob(data: CreateJobRequest): Promise<JobDto> {
  if (API_CONFIG.USE_MOCK) {
    return mockJobs.createJob(data) as Promise<JobDto>;
  }
  return apiClient.post<JobDto>('/jobs', data);
}

/**
 * 获取 Job 列表（仅当前用户创建的 Job）
 */
export async function getJobList(): Promise<JobDto[]> {
  if (API_CONFIG.USE_MOCK) {
    return mockJobs.getJobList() as Promise<JobDto[]>;
  }
  return apiClient.get<JobDto[]>('/jobs');
}

/**
 * 获取 Job 详情
 */
export async function getJobDetail(id: string): Promise<JobDto> {
  if (API_CONFIG.USE_MOCK) {
    return mockJobs.getJobDetail(id) as Promise<JobDto>;
  }
  return apiClient.get<JobDto>(`/jobs/${id}`);
}

/**
 * 提交执行结果（提交即结算）
 */
export async function submitJobResult(id: string, data?: SubmitResultRequest): Promise<JobDto> {
  if (API_CONFIG.USE_MOCK) {
    return mockJobs.submitJobResult(id, data) as Promise<JobDto>;
  }
  return apiClient.post<JobDto>(`/jobs/${id}/submit-result`, data);
}

/**
 * 确认结果（已废弃，保留兼容）
 */
export async function confirmJob(id: string): Promise<JobDto> {
  if (API_CONFIG.USE_MOCK) {
    return mockJobs.confirmJob(id) as Promise<JobDto>;
  }
  return apiClient.post<JobDto>(`/jobs/${id}/confirm`);
}

// 导出 Job 服务对象
export const jobService = {
  createJob,
  getJobList,
  getJobDetail,
  submitJobResult,
  confirmJob,
};
