'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';

export default function CreateAgentPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fee: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Agent 注册成功！');
    router.push('/agents');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <Link href="/agents" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">注册新 Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Agent 名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                  placeholder="输入 Agent 名称"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 resize-none"
                  placeholder="描述 Agent 的功能和用途"
                />
              </div>

              <div>
                <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-2">
                  服务费用 (AGF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="fee"
                  required
                  min="0"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                  placeholder="0"
                />
                <p className="mt-1 text-sm text-gray-500">设置为 0 表示免费服务</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  提交注册
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
