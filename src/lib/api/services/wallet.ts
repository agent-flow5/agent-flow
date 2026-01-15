/**
 * 钱包相关 API 服务
 */

import apiClient from '../client';
import { API_CONFIG } from '../config';
import { mockWallet } from '../mock';

// ============ 类型定义 ============

// 钱包余额
export interface WalletBalance {
  available: string;    // 可用余额（平台币）
  frozen: string;       // 冻结余额（平台币）
}

// 提现记录
export interface Withdrawal {
  id: string;           // 提现记录 ID
  amount: string;       // 提现金额（平台币）
  status: 'requested' | 'sent' | 'confirmed' | 'failed';  // 提现状态
  txHash: string;       // 链上交易哈希（可空）
  requestedAt: string;  // 申请时间（ISO 8601）
  updatedAt: string;    // 更新时间（ISO 8601）
}

// 提现请求
export interface WithdrawRequest {
  amount: string;       // 提现金额（必须为正数）
}

// 发放余额请求（开发用）
export interface GrantRequest {
  amount: string;       // 发放金额（必须为正数）
}

// ============ API 方法 ============

/**
 * 获取钱包余额
 */
export async function getBalance(): Promise<WalletBalance> {
  if (API_CONFIG.USE_MOCK) {
    return mockWallet.getBalance();
  }
  return apiClient.get<WalletBalance>('/wallet/balance');
}

/**
 * 发起提现申请
 */
export async function withdraw(data: WithdrawRequest): Promise<Withdrawal> {
  if (API_CONFIG.USE_MOCK) {
    return mockWallet.withdraw(data) as Promise<Withdrawal>;
  }
  return apiClient.post<Withdrawal>('/wallet/withdraw', data);
}

/**
 * 获取提现记录列表
 */
export async function getWithdrawals(): Promise<Withdrawal[]> {
  if (API_CONFIG.USE_MOCK) {
    return mockWallet.getWithdrawals() as Promise<Withdrawal[]>;
  }
  return apiClient.get<Withdrawal[]>('/wallet/withdrawals');
}

/**
 * 开发用：发放余额
 */
export async function devGrant(data: GrantRequest): Promise<WalletBalance> {
  if (API_CONFIG.USE_MOCK) {
    return mockWallet.devGrant(data);
  }
  return apiClient.post<WalletBalance>('/wallet/dev/grant', data);
}

// 导出钱包服务对象
export const walletService = {
  getBalance,
  withdraw,
  getWithdrawals,
  devGrant,
};
