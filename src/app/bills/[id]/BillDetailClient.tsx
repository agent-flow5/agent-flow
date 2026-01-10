'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, FileText, CheckCircle, XCircle, Clock, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { mockBills } from '@/data/mockBills';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toast, ToastContainer } from '@/components/ui/Toast';
import { billStatusConfig } from '@/lib/statusConfig';
import { getExplorerTxUrl, getChainName, shortenHash } from '@/lib/blockExplorer';

export default function BillDetailClient() {
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const bill = mockBills.find((b) => b.id === billId);

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">账单不存在</h2>
          <p className="text-gray-600 mb-6">未找到该账单信息</p>
          <Button onClick={() => router.push('/bills')}>返回账单列表</Button>
        </Card>
      </div>
    );
  }

  const statusInfo = billStatusConfig[bill.status];

  const getStatusIcon = () => {
    switch (bill.status) {
      case 'paid':
        return <CheckCircle className="w-6 h-6" />;
      case 'failed':
        return <XCircle className="w-6 h-6" />;
      case 'pending':
        return <Clock className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <>
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </ToastContainer>
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/bills')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回账单列表
        </button>

        {/* Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-800">{bill.jobTitle}</h1>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="text-sm">账单 ID: {bill.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              {getStatusIcon()}
              <div>
                <p className="text-sm text-gray-600">金额</p>
                <p className="text-3xl font-bold text-purple-600">{bill.amount} AGF</p>
              </div>
            </div>
          </div>

          {/* Status Description */}
          <div className={`p-4 rounded-lg ${
            bill.status === 'paid' ? 'bg-green-50 border border-green-200' :
            bill.status === 'failed' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <p className="text-sm text-gray-700">
              {bill.status === 'paid' && '该账单已成功支付'}
              {bill.status === 'failed' && '支付失败，请重试或联系支持'}
              {bill.status === 'pending' && '等待支付确认中...'}
            </p>
          </div>
        </Card>

        {/* Bill Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Transaction Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              交易信息
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">从</p>
                <p className="text-gray-800 font-mono text-sm bg-gray-50 p-2 rounded">
                  {bill.from}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">到</p>
                <p className="text-gray-800 font-mono text-sm bg-gray-50 p-2 rounded">
                  {bill.to}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">金额</p>
                <p className="text-2xl font-bold text-purple-600">{bill.amount} AGF</p>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              时间线
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">账单创建</p>
                  <p className="text-sm text-gray-600">{bill.createdAt}</p>
                </div>
              </div>

              {bill.paidAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">支付完成</p>
                    <p className="text-sm text-gray-600">{bill.paidAt}</p>
                  </div>
                </div>
              )}

              {bill.status === 'pending' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">等待支付</p>
                    <p className="text-sm text-gray-600">处理中...</p>
                  </div>
                </div>
              )}

              {bill.status === 'failed' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">支付失败</p>
                    <p className="text-sm text-gray-600">交易未成功</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Blockchain Info */}
        {bill.txHash && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              链上信息
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">交易哈希</p>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-purple-100">
                  <p className="text-gray-800 font-mono text-sm flex-1">
                    {shortenHash(bill.txHash, 10, 8)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(bill.txHash!);
                      showToast('交易哈希已复制到剪贴板');
                    }}
                    className="text-xs"
                  >
                    复制
                  </Button>
                </div>
              </div>

              {bill.chainId && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">网络</p>
                  <Badge variant="default" className="bg-purple-100 text-purple-700">
                    {getChainName(bill.chainId)}
                  </Badge>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={() => window.open(getExplorerTxUrl(bill.txHash!, bill.chainId), '_blank')}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  在区块链浏览器中查看
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Related Job */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">关联任务</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">任务 ID</p>
              <p className="text-gray-800 font-mono text-sm">{bill.jobId}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.push(`/jobs/${bill.jobId}`)}
            >
              查看任务详情
            </Button>
          </div>
        </Card>

        {/* Actions */}
        {bill.status === 'pending' && (
          <Card className="p-6 mt-6 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">待支付账单</h3>
                <p className="text-sm text-gray-600">完成支付以结算此账单</p>
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                立即支付
              </Button>
            </div>
          </Card>
        )}

        {bill.status === 'failed' && (
          <Card className="p-6 mt-6 bg-red-50 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">支付失败</h3>
                <p className="text-sm text-gray-600">请重试支付或联系客服</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">联系支持</Button>
                <Button className="bg-red-500 hover:bg-red-600">
                  重试支付
                </Button>
              </div>
            </div>
          </Card>
        )}
        </div>
      </div>
    </>
  );
}
