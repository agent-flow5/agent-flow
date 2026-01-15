/**
 * API 配置文件
 * 统一管理 API 域名地址，方便后续一键更换
 */

// API 基础配置
export const API_CONFIG = {
  // 后端 API 基础地址 - 只需修改这里即可更换 API 域名
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',

  // 请求超时时间（毫秒）
  TIMEOUT: 30000,

  // API 版本前缀（如果有的话）
  API_PREFIX: '',

  // 是否使用 Mock 模式（开发测试用）
  // 设置为 true 时使用本地 mock 数据，设置为 false 时连接真实后端
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK !== 'false', // 默认开启 mock
} as const;

// JWT Token 存储 Key
export const TOKEN_STORAGE_KEY = 'agent_flow_token';

// API 错误码
export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;
