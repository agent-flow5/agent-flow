'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FileText, DollarSign, RefreshCw, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { billStatusConfig } from '@/lib/statusConfig';
import { billService, BillDto } from '@/lib/api/services/bills';
import { useWalletStore } from '@/store/walletStore';
import { useToast } from '@/contexts/ToastContext';

export default function BillsPage() {
  const [bills, setBills] = useState<BillDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { isConnected } = useWalletStore();
  const toast = useToast();

  const fetchBills = async () => {
    if (!isConnected) {
      setBills([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await billService.getBillList();
      setBills(data);
    } catch (error) {
      console.error('获取账单列表失败:', error);
      toast.error('获取账单列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [isConnected]);

  // 过滤账单
  const filteredBills = useMemo(() => {
    if (statusFilter === 'all') return bills;
    return bills.filter((bill) => bill.status === statusFilter);
  }, [bills, statusFilter]);

  // 计算统计数据
  const stats = useMemo(() => {
    const totalAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
    const releasedAmount = bills
      .filter((b) => b.status === 'released')
      .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
    const lockedAmount = bills
      .filter((b) => b.status === 'locked')
      .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

    return { totalAmount, releasedAmount, lockedAmount };
  }, [bills]);

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
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

  const handleRefresh = async () => {
    await fetchBills();
    toast.success('已刷新');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Bills</h1>
            <p className="text-gray-600">查看和管理账单记录</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">总账单</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{bills.length}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-600">已锁定</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.lockedAmount.toFixed(2)} APT</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">已释放</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.releasedAmount.toFixed(2)} APT</p>
          </Card>
        </div>

        {/* Filter */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">状态筛选:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-1 rounded-lg text-sm transition-all ${
                  statusFilter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {Object.entries(billStatusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-4 py-1 rounded-lg text-sm transition-all ${
                    statusFilter === key
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Bills List */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : !isConnected ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">请先连接钱包以查看账单</p>
          </Card>
        ) : filteredBills.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">暂无账单记录</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((bill) => {
              const statusInfo = billStatusConfig[bill.status] || { label: bill.status, variant: 'default' as const };
              return (
                <Card key={bill.id} className="p-6 hover:border-purple-200 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-800">账单 #{bill.id.slice(0, 8)}</h3>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Job ID: <span className="font-mono">{bill.jobId}</span></p>
                        <p>创建时间: {formatDate(bill.createdAt)}</p>
                        {bill.releasedAt && (
                          <p>释放时间: {formatDate(bill.releasedAt)}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <p className="text-sm text-gray-600 mb-1">金额</p>
                      <p className="text-2xl font-bold text-purple-600">{parseFloat(bill.amount).toFixed(2)} APT</p>
                      <Link href={`/bills/${bill.id}`}>
                        <Button variant="secondary" className="mt-4">
                          查看详情
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
