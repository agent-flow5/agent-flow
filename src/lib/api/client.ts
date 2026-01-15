/**
 * HTTP 请求客户端
 * 统一封装所有 API 请求，支持 JWT 认证和错误处理
 */

import { API_CONFIG, TOKEN_STORAGE_KEY, API_ERROR_CODES } from './config';

// 请求选项类型
interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  skipAuth?: boolean;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  ok: boolean;
}

// API 错误类型
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// 获取存储的 Token
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// 设置 Token
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

// 清除 Token
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// 构建完整 URL
function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
  const baseUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;
  const url = new URL(endpoint, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

// 统一请求处理
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, skipAuth = false, headers: customHeaders, ...fetchOptions } = options;

  // 构建请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // 添加 JWT 认证头
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  // 构建请求配置
  const config: RequestInit = {
    ...fetchOptions,
    headers,
  };

  // 添加请求体
  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  // 发起请求
  const url = buildUrl(endpoint, params);

  try {
    const response = await fetch(url, config);

    // 尝试解析响应
    let data: T;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    // 处理错误响应
    if (!response.ok) {
      // 401 未授权 - 清除 token 并触发重新登录
      if (response.status === API_ERROR_CODES.UNAUTHORIZED) {
        clearToken();
        // 可以在这里触发全局登出事件
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      throw new ApiError(
        (data as { message?: string })?.message || `请求失败: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // 网络错误或其他错误
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败',
      0,
      error
    );
  }
}

// HTTP 方法封装
export const apiClient = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'POST', body });
  },

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PUT', body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiClient;
