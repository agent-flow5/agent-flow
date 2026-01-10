'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { mockAgents } from '@/data/mockAgents';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';

export default function CreateJobPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    agentId: '',
    reward: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('任务创建成功！');
    router.push('/jobs');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">创建新任务</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  任务标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                  placeholder="输入任务标题"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  任务描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 resize-none"
                  placeholder="详细描述任务需求"
                />
              </div>

              <div>
                <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-2">
                  选择 Agent <span className="text-red-500">*</span>
                </label>
                <select
                  id="agentId"
                  required
                  value={formData.agentId}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                >
                  <option value="">请选择 Agent</option>
                  {mockAgents
                    .filter((a) => a.status === 'available')
                    .map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} - {agent.fee === 0 ? '免费' : `${agent.fee} AGF`}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-2">
                  任务赏金 (AGF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="reward"
                  required
                  min="0"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                  placeholder="0"
                />
                <p className="mt-1 text-sm text-gray-500">任务完成后支付给 Agent</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  创建任务
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
