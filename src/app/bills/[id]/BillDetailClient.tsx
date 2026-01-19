'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, DollarSign, RefreshCw, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { billStatusConfig } from '@/lib/statusConfig';
import { useToast } from '@/contexts/ToastContext';
import { billService, BillDto } from '@/lib/api/services/bills';
import { useWalletStore } from '@/store/walletStore';

export default function BillDetailClient() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const billId = params.id as string;
  const { isConnected } = useWalletStore();

  const [bill, setBill] = useState<BillDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBillDetail = async () => {
    if (!isConnected) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await billService.getBillDetail(billId);
      setBill(data);
    } catch (error) {
      console.error('获取账单详情失败:', error);
      toast.error('获取账单详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillDetail();
  }, [billId, isConnected]);

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
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">请先连接钱包以查看账单详情</p>
          <Link href="/bills">
            <Button>返回账单列表</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">账单不存在</h2>
          <p className="text-gray-600 mb-6">未找到 ID 为 {billId} 的账单</p>
          <Link href="/bills">
            <Button>返回账单列表</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusInfo = billStatusConfig[bill.status] || { label: bill.status, variant: 'default' as const };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/bills" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回账单列表
        </Link>

        {/* Bill Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <CardTitle className="text-3xl">账单详情</CardTitle>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
                <p className="text-gray-600 text-sm font-mono">ID: {bill.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">金额</p>
                <p className="text-3xl font-bold text-purple-600">{parseFloat(bill.amount).toFixed(2)} APT</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Bill Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">账单信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">账单 ID</p>
                  <p className="font-medium text-gray-800 font-mono text-sm break-all">{bill.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">关联任务</p>
                  <Link href={`/jobs/${bill.jobId}`} className="font-medium text-purple-600 hover:text-purple-700 font-mono text-sm">
                    {bill.jobId}
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">金额</p>
                  <p className="font-medium text-gray-800">{parseFloat(bill.amount).toFixed(2)} APT</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">状态</p>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">创建时间</p>
                  <p className="font-medium text-gray-800">{formatDate(bill.createdAt)}</p>
                </div>
              </div>

              {bill.releasedAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">释放时间</p>
                    <p className="font-medium text-green-600">{formatDate(bill.releasedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Link href={`/jobs/${bill.jobId}`}>
                <Button variant="secondary">
                  <Briefcase className="w-4 h-4" />
                  查看关联任务
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={() => fetchBillDetail()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>

              <Button variant="outline" onClick={() => router.back()}>
                返回
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
