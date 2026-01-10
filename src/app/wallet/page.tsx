'use client';

import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useWalletStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const transactions = [
  {
    id: '1',
    type: 'receive' as const,
    amount: 50,
    from: '0x8f3a...2b1c',
    description: 'AI 文章生成任务报酬',
    date: '2024-01-21',
  },
  {
    id: '2',
    type: 'send' as const,
    amount: 100,
    to: '0x1a2b...9c8d',
    description: '雇佣 Data Analyst',
    date: '2024-01-22',
  },
  {
    id: '3',
    type: 'receive' as const,
    amount: 25,
    from: '0x5e6f...3a4b',
    description: '多语言翻译任务报酬',
    date: '2024-01-20',
  },
];

export default function WalletPage() {
  const { isConnected, address, balance } = useWalletStore();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">未连接钱包</h2>
          <p className="text-gray-600 mb-6">请先连接钱包以查看您的资产</p>
        </Card>
      </div>
    );
  }

  const totalReceived = transactions
    .filter((t) => t.type === 'receive')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSent = transactions
    .filter((t) => t.type === 'send')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Wallet</h1>
          <p className="text-gray-600">管理您的数字资产</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-purple-500 to-pink-500 border-0">
          <div className="p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-6 h-6" />
              <span className="text-lg opacity-90">总余额</span>
            </div>
            <p className="text-5xl font-bold mb-6">{balance.toLocaleString()} AGF</p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <span>地址:</span>
              <span className="font-mono">{address}</span>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">总交易</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{transactions.length}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">总收入</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalReceived} AGF</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-gray-600">总支出</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalSent} AGF</p>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>交易记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-purple-100 hover:bg-purple-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        tx.type === 'receive'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {tx.type === 'receive' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{tx.description}</p>
                      <p className="text-sm text-gray-600">
                        {tx.type === 'receive' ? `从 ${tx.from}` : `到 ${tx.to}`}
                      </p>
                      <p className="text-xs text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        tx.type === 'receive' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'receive' ? '+' : '-'}
                      {tx.amount} AGF
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
