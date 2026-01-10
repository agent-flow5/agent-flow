'use client';

import Link from 'next/link';
import { FileText, DollarSign, ExternalLink } from 'lucide-react';
import { mockBills } from '@/data/mockBills';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { billStatusConfig } from '@/lib/statusConfig';
import { shortenHash, getExplorerTxUrl, getChainName } from '@/lib/blockExplorer';

export default function BillsPage() {
  const totalAmount = mockBills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = mockBills
    .filter((b) => b.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bills</h1>
          <p className="text-gray-600">查看和管理账单记录</p>
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
            <p className="text-3xl font-bold text-gray-800">{mockBills.length}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">总金额</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalAmount} AGF</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">已支付</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{paidAmount} AGF</p>
          </Card>
        </div>

        {/* Bills List */}
        <div className="space-y-4">
          {mockBills.map((bill) => {
            const statusInfo = billStatusConfig[bill.status];
            return (
              <Card key={bill.id} className="p-6 hover:border-purple-200 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{bill.jobTitle}</h3>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p>从: {bill.from}</p>
                        <p>到: {bill.to}</p>
                      </div>
                      <div>
                        <p>创建时间: {bill.createdAt}</p>
                        {bill.paidAt && <p>支付时间: {bill.paidAt}</p>}
                      </div>
                    </div>
                    {bill.txHash && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="text-gray-600">交易:</span>
                        <code className="text-purple-600 font-mono bg-purple-50 px-2 py-1 rounded">
                          {shortenHash(bill.txHash)}
                        </code>
                        {bill.chainId && (
                          <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">
                            {getChainName(bill.chainId)}
                          </Badge>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(getExplorerTxUrl(bill.txHash!, bill.chainId), '_blank');
                          }}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                          title="在区块链浏览器中查看"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-sm text-gray-600 mb-1">金额</p>
                    <p className="text-2xl font-bold text-purple-600">{bill.amount} AGF</p>
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
      </div>
    </div>
  );
}
