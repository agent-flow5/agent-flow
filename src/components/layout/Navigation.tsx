'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Wallet, Menu, X, Loader2, Network } from 'lucide-react';
import { useWalletStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { SEPOLIA_CHAIN_ID, SEPOLIA_NETWORK } from '@/lib/contracts/config';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', label: '首页' },
  { href: '/agents', label: 'Agents' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/bills', label: 'Bills' },
  { href: '/wallet', label: 'Wallet' },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>('未知网络');
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const pathname = usePathname();
  const { isConnected, address, isLoading, connect, disconnect } = useWalletStore();
  const toast = useToast();

  // 获取当前网络信息
  const fetchNetworkInfo = async () => {
    if (!window.ethereum) return;

    try {
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      const chainIdNum = parseInt(chainId, 16);

      // 网络名称映射
      const networkNames: Record<number, string> = {
        1: 'Ethereum 主网',
        11155111: 'Sepolia 测试网',
        5: 'Goerli 测试网',
        137: 'Polygon',
        80001: 'Mumbai 测试网',
      };

      setCurrentNetwork(networkNames[chainIdNum] || `Chain ${chainIdNum}`);
    } catch (error) {
      console.error('获取网络信息失败:', error);
    }
  };

  // 切换网络
  const handleSwitchNetwork = async () => {
    if (!window.ethereum) {
      toast.error('请先安装 MetaMask 钱包');
      return;
    }

    setIsSwitchingNetwork(true);
    try {
      // 检查当前网络
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      const currentChainId = parseInt(chainId, 16);

      if (currentChainId === SEPOLIA_CHAIN_ID) {
        toast.info('当前已在 Sepolia 测试网');
        setIsSwitchingNetwork(false);
        return;
      }

      // 尝试切换到 Sepolia
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_NETWORK.chainId }],
        });
        toast.success('已切换到 Sepolia 测试网');
        await fetchNetworkInfo();
      } catch (switchError: any) {
        // 如果网络不存在，添加网络
        if (switchError.code === 4902 || switchError.code === -32603) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [SEPOLIA_NETWORK],
            });
            toast.success('已添加并切换到 Sepolia 测试网');
            await fetchNetworkInfo();
          } catch (addError) {
            console.error('添加网络失败:', addError);
            toast.error('无法添加 Sepolia 测试网，请手动在 MetaMask 中添加');
          }
        } else if (switchError.code === 4001) {
          toast.info('用户取消了网络切换');
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      console.error('切换网络失败:', error);
      toast.error(error?.message || '切换网络失败');
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // 监听网络变化
  useEffect(() => {
    if (!window.ethereum) return;

    fetchNetworkInfo();

    const handleChainChanged = () => {
      fetchNetworkInfo();
    };

    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      await connect();
      // 检查连接后的状态
      const state = useWalletStore.getState();
      if (state.isConnected) {
        toast.success('钱包连接成功');
      } else if (state.error) {
        toast.error(state.error);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '连接失败');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info('钱包已断开');
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="AgentFlow Logo"
              width={40}
              height={40}
              className="drop-shadow-md"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              AgentFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* 网络切换按钮 */}
                <button
                  onClick={handleSwitchNetwork}
                  disabled={isSwitchingNetwork}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    currentNetwork === 'Sepolia 测试网'
                      ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={currentNetwork === 'Sepolia 测试网' ? '当前在 Sepolia 测试网' : '点击切换到 Sepolia 测试网'}
                >
                  {isSwitchingNetwork ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Network className="w-4 h-4" />
                  )}
                  <span className="hidden lg:inline">{currentNetwork}</span>
                </button>
                {/* 钱包地址 */}
                <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                  <span className="text-sm font-medium text-purple-700">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  断开
                </button>
              </div>
            ) : (
              <Button onClick={handleConnect} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                {isLoading ? '连接中...' : '连接钱包'}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-purple-50 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-100">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-left transition-all ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-purple-100">
                {isConnected ? (
                  <div className="space-y-2">
                    {/* 网络切换按钮 */}
                    <button
                      onClick={() => {
                        handleSwitchNetwork();
                      }}
                      disabled={isSwitchingNetwork}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        currentNetwork === 'Sepolia 测试网'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      } disabled:opacity-50`}
                    >
                      <div className="flex items-center gap-2">
                        {isSwitchingNetwork ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Network className="w-4 h-4" />
                        )}
                        <span>{currentNetwork}</span>
                      </div>
                      {currentNetwork !== 'Sepolia 测试网' && (
                        <span className="text-xs">点击切换</span>
                      )}
                    </button>
                    {/* 钱包地址 */}
                    <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                      <span className="text-sm font-medium text-purple-700">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleDisconnect();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-purple-50 rounded-lg text-left"
                    >
                      断开钱包
                    </button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => {
                      handleConnect();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                    {isLoading ? '连接中...' : '连接钱包'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
