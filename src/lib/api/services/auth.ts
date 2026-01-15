/**
 * 认证相关 API 服务
 */

import apiClient, { setToken, clearToken, getToken } from '../client';
import { API_CONFIG } from '../config';
import { mockAuth } from '../mock';

// ============ 类型定义 ============

// 获取 nonce 响应
export interface NonceResponse {
  address: string;      // 钱包地址（小写）
  nonce: string;        // 一次性口令
  message: string;      // 待签名原文
  expiresAt: string;    // 过期时间（ISO 8601）
}

// 验签登录请求
export interface VerifyRequest {
  message: string;      // 签名原文
  signature: string;    // 钱包签名结果
}

// 验签登录响应
export interface VerifyResponse {
  token: string;        // JWT
}

// ============ API 方法 ============

/**
 * 获取 nonce（登录前置）
 * @param address 钱包地址
 */
export async function getNonce(address: string): Promise<NonceResponse> {
  if (API_CONFIG.USE_MOCK) {
    return mockAuth.getNonce(address.toLowerCase());
  }

  return apiClient.get<NonceResponse>('/auth/nonce', {
    params: { address: address.toLowerCase() },
    skipAuth: true,
  });
}

/**
 * 验签登录
 * @param data 签名数据
 */
export async function verify(data: VerifyRequest): Promise<VerifyResponse> {
  let response: VerifyResponse;

  if (API_CONFIG.USE_MOCK) {
    response = await mockAuth.verify(data);
  } else {
    response = await apiClient.post<VerifyResponse>('/auth/verify', data, {
      skipAuth: true,
    });
  }

  // 自动保存 token
  if (response.token) {
    setToken(response.token);
  }

  return response;
}

/**
 * 登出
 */
export function logout(): void {
  if (API_CONFIG.USE_MOCK) {
    mockAuth.logout();
  }
  clearToken();
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

// 导出认证服务对象
export const authService = {
  getNonce,
  verify,
  logout,
  isAuthenticated,
};
