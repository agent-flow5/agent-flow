import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/api/services/auth';
import { walletService } from '@/lib/api/services/wallet';
import { getToken, setToken, clearToken } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';
import { setMockUser } from '@/lib/api/mock';
import { ensureSepoliaNetwork } from '@/lib/contracts/utils';

// 声明 ethereum 类型
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (
        event: string,
        callback: (...args: unknown[]) => void
      ) => void;
      isMetaMask?: boolean;
    };
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  balance: number;
  frozenBalance: number;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  setError: (error: string | null) => void;
}

// 账户变化处理函数（需要在 store 定义前声明）
let handleAccountsChanged: (accounts: unknown) => void;

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => {
      // 在这里定义处理函数
      handleAccountsChanged = (accounts: unknown) => {
        const accountList = accounts as string[];
        if (!accountList || accountList.length === 0) {
          get().disconnect();
        } else {
          // 用户切换了账户，需要重新登录
          get().disconnect();
        }
      };

      return {
        isConnected: false,
        address: '',
        balance: 0,
        frozenBalance: 0,
        token: null,
        isLoading: false,
        error: null,

        setError: (error) => set({ error }),

        connect: async () => {
          const { isLoading } = get();
          if (isLoading) return;

          set({ isLoading: true, error: null });

          try {
            // 检查是否有 MetaMask
            if (!window.ethereum) {
              throw new Error('请先安装 MetaMask 钱包');
            }

            // 自动切换到 Sepolia 测试网（如果不在 Sepolia）
            // 使用工具函数确保网络正确
            try {
              await ensureSepoliaNetwork();
            } catch (networkError: any) {
              // 如果用户拒绝了网络切换，继续执行（让用户在 Navigation 中手动切换）
              if (networkError?.code === 4001) {
                console.warn('用户取消了网络切换');
              } else {
                // 其他错误（如网络不存在）也继续，让用户手动切换
                console.warn(
                  '自动切换网络失败，请手动切换到 Sepolia 测试网:',
                  networkError
                );
              }
            }

            // 请求连接钱包
            const accounts = (await window.ethereum.request({
              method: 'eth_requestAccounts',
            })) as string[];

            if (!accounts || accounts.length === 0) {
              throw new Error('未获取到钱包地址');
            }

            const address = accounts[0].toLowerCase();

            // 获取 nonce
            const nonceResponse = await authService.getNonce(address);
            // 请求签名
            const signature = (await window.ethereum.request({
              method: 'personal_sign',
              params: [nonceResponse.message, address],
            })) as string;

            // 验证签名并获取 token
            const verifyResponse = await authService.verify({
              message: nonceResponse.message,
              signature,
            });

            // 保存 token
            setToken(verifyResponse.token);

            // 获取余额
            let balance = 0;
            let frozenBalance = 0;
            try {
              const balanceData = await walletService.getBalance();
              balance = parseFloat(balanceData.available) || 0;
              frozenBalance = parseFloat(balanceData.frozen) || 0;
            } catch (e) {
              console.warn('获取余额失败:', e);
            }

            set({
              isConnected: true,
              address,
              balance,
              frozenBalance,
              token: verifyResponse.token,
              isLoading: false,
              error: null,
            });

            // 监听账户变化
            window.ethereum.on('accountsChanged', handleAccountsChanged);
          } catch (error) {
            console.error('连接钱包失败:', error);

            // 提供更友好的错误信息
            let errorMessage = '连接失败';
            if (error instanceof Error) {
              const msg = error.message.toLowerCase();
              if (
                msg.includes('user rejected') ||
                msg.includes('user denied')
              ) {
                errorMessage = '用户取消了签名请求';
              } else if (msg.includes('already processing')) {
                errorMessage = '请在 MetaMask 中完成操作';
              } else if (
                msg.includes('fetch') ||
                msg.includes('failed to fetch') ||
                msg.includes('networkerror')
              ) {
                errorMessage =
                  '无法连接服务器，请确保后端服务已启动 (localhost:3001)';
              } else if (msg.includes('cors')) {
                errorMessage = '跨域请求被拒绝，请检查后端 CORS 配置';
              } else {
                errorMessage = error.message;
              }
            }

            set({
              isConnected: false,
              address: '',
              balance: 0,
              frozenBalance: 0,
              token: null,
              isLoading: false,
              error: errorMessage,
            });
          }
        },

        disconnect: () => {
          clearToken();
          authService.logout();

          // 移除监听器
          if (window.ethereum && handleAccountsChanged) {
            window.ethereum.removeListener(
              'accountsChanged',
              handleAccountsChanged
            );
          }

          set({
            isConnected: false,
            address: '',
            balance: 0,
            frozenBalance: 0,
            token: null,
            error: null,
          });
        },

        refreshBalance: async () => {
          const { isConnected } = get();
          if (!isConnected) return;

          try {
            const balanceData = await walletService.getBalance();
            set({
              balance: parseFloat(balanceData.available) || 0,
              frozenBalance: parseFloat(balanceData.frozen) || 0,
            });
          } catch (error) {
            console.error('刷新余额失败:', error);
          }
        },
      };
    },
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        isConnected: state.isConnected,
        address: state.address,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        // 恢复时检查 token 是否有效
        if (state?.token && state?.address) {
          setToken(state.token);

          // 如果是 Mock 模式，恢复 mock 用户状态
          if (API_CONFIG.USE_MOCK && state.token.startsWith('mock_jwt_')) {
            const parts = state.token.split('_');
            if (parts.length >= 3) {
              setMockUser(parts[2], state.address);
            }
          }

          // 异步刷新余额
          state.refreshBalance().catch(console.error);
        }
      },
    }
  )
);

// 初始化时检查
if (typeof window !== 'undefined') {
  // 监听登出事件
  window.addEventListener('auth:logout', () => {
    useWalletStore.getState().disconnect();
  });
}
