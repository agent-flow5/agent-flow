export interface Agent {
  id: string;
  name: string;
  description: string;
  fee: number;
  status: 'available' | 'unavailable';
  completedJobs: number;
  owner: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'open' | 'running' | 'completed' | 'failed';
  executable: boolean;
  reward: number;
  owner: string;
  createdAt: string;
  conversationId: string;
  agent?: string;
}

export interface Bill {
  id: string;
  jobId: string;
  jobTitle: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
  paidAt?: string;
  from: string;
  to: string;
  txHash?: string; // 交易哈希
  chainId?: number; // 链ID: 1=Ethereum主网, 11155111=Sepolia测试网
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  balance: number;
  connect: () => void;
  disconnect: () => void;
}

export type StatusType = 'draft' | 'open' | 'running' | 'completed' | 'failed' | 'pending' | 'paid';
