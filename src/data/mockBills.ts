import { Bill } from '@/types';

export const mockBills: Bill[] = [
  {
    id: 'bill-1',
    jobId: 'job-1',
    jobTitle: 'AI 文章生成任务',
    amount: 50,
    status: 'paid',
    createdAt: '2024-01-20',
    paidAt: '2024-01-21',
    from: '0x742d...4e89',
    to: '0x8f3a...2b1c',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    chainId: 1, // Ethereum 主网
  },
  {
    id: 'bill-2',
    jobId: 'job-2',
    jobTitle: '数据分析与可视化',
    amount: 100,
    status: 'pending',
    createdAt: '2024-01-22',
    from: '0x8f3a...2b1c',
    to: '0x1a2b...9c8d',
    // pending状态暂无txHash
  },
  {
    id: 'bill-3',
    jobId: 'job-5',
    jobTitle: '多语言翻译',
    amount: 25,
    status: 'paid',
    createdAt: '2024-01-19',
    paidAt: '2024-01-20',
    from: '0x9d8c...7e6f',
    to: '0x5e6f...3a4b',
    txHash: '0x9f8e7d6c5b4a3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
    chainId: 11155111, // Sepolia 测试网
  },
  {
    id: 'bill-4',
    jobId: 'job-4',
    jobTitle: '代码审查服务',
    amount: 75,
    status: 'failed',
    createdAt: '2024-01-21',
    from: '0x742d...4e89',
    to: '0x3c4d...5a6b',
    txHash: '0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c',
    chainId: 1, // Ethereum 主网
  },
];
