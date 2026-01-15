/**
 * Bills 账单相关 API 服务
 */

import apiClient from '../client';
import { API_CONFIG } from '../config';
import { mockBills } from '../mock';

// ============ 类型定义 ============

// 账单状态枚举
export type BillStatus = 'locked' | 'released';

// 账单数据传输对象
export interface BillDto {
  id: string;               // 账单 ID
  jobId: string;            // 关联 Job ID
  status: BillStatus;       // 账单状态
  amount: string;           // 账单金额（平台币）
  releasedAt: string | null;  // 释放时间（可空，ISO 8601）
  createdAt: string;        // 创建时间（ISO 8601）
}

// ============ API 方法 ============

/**
 * 获取账单列表（仅当前用户）
 */
export async function getBillList(): Promise<BillDto[]> {
  if (API_CONFIG.USE_MOCK) {
    return mockBills.getBillList() as Promise<BillDto[]>;
  }
  return apiClient.get<BillDto[]>('/bills');
}

/**
 * 获取账单详情
 */
export async function getBillDetail(id: string): Promise<BillDto> {
  if (API_CONFIG.USE_MOCK) {
    return mockBills.getBillDetail(id) as Promise<BillDto>;
  }
  return apiClient.get<BillDto>(`/bills/${id}`);
}

// 导出账单服务对象
export const billService = {
  getBillList,
  getBillDetail,
};
