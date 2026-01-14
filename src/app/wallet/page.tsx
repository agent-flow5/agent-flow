'use client';

import { useState } from 'react';
import { Copy, Wallet as WalletIcon, Lock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DepositDialog } from '@/components/features/wallet/DepositDialog';
import { WithdrawDialog } from '@/components/features/wallet/WithdrawDialog';

export default function WalletPage() {
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  // Mock data
  const usdtBalance = 1250.5;
  const aptBalance = 1250.5;
  const frozenBalance = 930.5;
  const walletAddress = '0x742d...4689';

  const transactions = [
    { id: 1, type: 'deposit', currency: 'APT', amount: 100, date: '2024-01-21 14:32', status: '已完成' },
    { id: 2, type: 'withdraw', currency: 'USDT', amount: -50, date: '2024-01-20 09:15', status: '已完成' },
    { id: 3, type: 'deposit', currency: 'APT', amount: 200, date: '2024-01-19 16:48', status: '已完成' },
    { id: 4, type: 'withdraw', currency: 'USDT', amount: -30, date: '2024-01-18 11:23', status: '已完成' },
    { id: 5, type: 'deposit', currency: 'APT', amount: 500, date: '2024-01-17 20:05', status: '已完成' },
  ];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">管理您的数字资产</h1>

        {/* Wallet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* USDT Card - Dark gradient */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">链上 USDT 资产</p>
                <span className="px-3 py-1 text-xs bg-white/10 rounded-full">ETHEREUM</span>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold">{usdtBalance.toLocaleString()}</p>
                <p className="text-sm text-gray-400">USDT</p>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center gap-2 text-gray-300">
                <span className="text-sm">{walletAddress}</span>
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
                <p className="text-sm text-white/90">平台总余额</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold">{aptBalance.toLocaleString()}</p>
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
              <h2 className="text-xl font-bold text-gray-800">充值提现记录</h2>
              <span className="text-sm text-gray-500">最近 5 条</span>
            </div>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50/50 transition-colors"
                >
                  <div className={`p-2.5 rounded-full ${
                    tx.type === 'deposit' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {tx.type === 'deposit' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {tx.currency} {tx.type === 'deposit' ? '充值' : '提现'}
                    </p>
                    <p className="text-sm text-gray-500">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      tx.amount > 0 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.currency}
                    </p>
                    <p className="text-xs text-gray-500">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <DepositDialog
        open={showDepositDialog}
        onOpenChange={setShowDepositDialog}
        usdtBalance={usdtBalance}
      />
      <WithdrawDialog
        open={showWithdrawDialog}
        onOpenChange={setShowWithdrawDialog}
        aptBalance={aptBalance}
      />
    </div>
  );
}
