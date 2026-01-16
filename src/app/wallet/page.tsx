'use client';

import { DepositDialog } from '@/components/features/wallet/DepositDialog';
import { WithdrawDialog } from '@/components/features/wallet/WithdrawDialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import { walletService, Withdrawal } from '@/lib/api/services/wallet';
import { useWalletStore } from '@/store/walletStore';
import { ArrowDownLeft, ArrowUpRight, Copy, Lock, RefreshCw, Wallet as WalletIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// MockUSDT 合约地址 (Sepolia 测试网)
const USDT_CONTRACT_ADDRESS = '0xbac7d7AAE206282201E83b31005fF2651565fc2C';
// balanceOf(address) 函数选择器
const BALANCE_OF_SELECTOR = '0x70a08231';

export default function WalletPage() {
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [isLoadingUsdt, setIsLoadingUsdt] = useState(false);

  const { isConnected, address, balance, frozenBalance, refreshBalance, isLoading } = useWalletStore();
  const toast = useToast();

  // 获取链上 USDT 余额
  const fetchUsdtBalance = useCallback(async () => {
    if (!isConnected || !address || !window.ethereum) return;

    setIsLoadingUsdt(true);
    try {
      // 构造 balanceOf 调用数据: selector + address (padded to 32 bytes)
      const paddedAddress = address.slice(2).padStart(64, '0');
      const data = BALANCE_OF_SELECTOR + paddedAddress;

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: USDT_CONTRACT_ADDRESS,
            data: data,
          },
          'latest',
        ],
      }) as string;

      // 解析返回值 (uint256)，USDT 有 6 位小数
      const balanceWei = BigInt(result);
      const balanceUsdt = Number(balanceWei) / 1e6;
      setUsdtBalance(balanceUsdt.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
    } catch (error) {
      console.error('获取 USDT 余额失败:', error);
      setUsdtBalance('--');
    } finally {
      setIsLoadingUsdt(false);
    }
  }, [isConnected, address]);

  // 获取提现记录
  const fetchWithdrawals = async () => {
    if (!isConnected) return;

    setIsLoadingHistory(true);
    try {
      const data = await walletService.getWithdrawals();
      setWithdrawals(data);
    } catch (error) {
      console.error('获取提现记录失败:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchWithdrawals();
      fetchUsdtBalance();
    }
  }, [isConnected, fetchUsdtBalance]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('地址已复制');
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refreshBalance(),
      fetchWithdrawals(),
      fetchUsdtBalance(),
    ]);
    toast.success('已刷新');
  };

  // 格式化地址显示
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // 获取状态显示
  const getStatusDisplay = (status: Withdrawal['status']) => {
    const statusMap = {
      requested: { label: '申请中', color: 'text-yellow-600' },
      sent: { label: '已发送', color: 'text-blue-600' },
      confirmed: { label: '已确认', color: 'text-green-600' },
      failed: { label: '失败', color: 'text-red-600' },
    };
    return statusMap[status] || { label: status, color: 'text-gray-600' };
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">管理您的数字资产</h1>
          <Card className="p-8 text-center">
            <WalletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">请先连接钱包以查看资产</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">管理您的数字资产</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {/* Wallet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Address Card - Dark gradient */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">链上USDT资产</p>
                <span className="px-3 py-1 text-xs bg-white/10 rounded-full">ETHEREUM</span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-mono">
                  {isLoadingUsdt ? '加载中...' : `${usdtBalance ?? '--'} USDT`}
                </p>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center gap-2 text-gray-300">
                <span className="text-sm truncate flex-1">{formatAddress(address)}</span>
                <button
                  onClick={handleCopyAddress}
                  className="hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>

          {/* APT Balance Card - Purple gradient */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-transparent text-white">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <WalletIcon className="w-5 h-5" />
                <p className="text-sm text-white/90">平台可用余额</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold">{balance.toLocaleString()}</p>
                <p className="text-sm text-white/60">APT</p>
              </div>
              <div className="border-t border-white/20 pt-3 flex gap-3">
                <Button
                  onClick={() => setShowDepositDialog(true)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 bg-white text-purple-600 hover:bg-white/90"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  充值
                </Button>
                <Button
                  onClick={() => setShowWithdrawDialog(true)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 bg-white text-purple-600 hover:bg-white/90 font-medium"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  提现
                </Button>
              </div>
            </div>
          </Card>

          {/* Frozen Balance Card - White */}
          <Card className="bg-white border-gray-200">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Lock className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">已冻结平台币</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-gray-800">{frozenBalance.toLocaleString()}</p>
                <p className="text-sm text-gray-500">APT</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">冻结资产无法使用，需等待任务完成后解冻</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction List */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">提现记录</h2>
              {withdrawals.length > 0 && (
                <span className="text-sm text-gray-500">共 {withdrawals.length} 条</span>
              )}
            </div>
            {isLoadingHistory ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无提现记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((tx) => {
                  const statusInfo = getStatusDisplay(tx.status);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50/50 transition-colors"
                    >
                      <div className="p-2.5 rounded-full bg-orange-100">
                        <ArrowUpRight className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">提现</p>
                        <p className="text-sm text-gray-500">{formatDate(tx.requestedAt)}</p>
                        {tx.txHash && (
                          <p className="text-xs text-gray-400 font-mono truncate">
                            TX: {tx.txHash}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">
                          -{tx.amount} APT
                        </p>
                        <p className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <DepositDialog
        open={showDepositDialog}
        onOpenChange={setShowDepositDialog}
        onSuccess={() => {
          refreshBalance();
          toast.success('充值成功');
        }}
      />
      <WithdrawDialog
        open={showWithdrawDialog}
        onOpenChange={setShowWithdrawDialog}
        aptBalance={balance}
        onSuccess={() => {
          refreshBalance();
          fetchWithdrawals();
          toast.success('提现申请已提交');
        }}
      />
    </div>
  );
}
