'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import { jobService } from '@/lib/api/services/jobs';
import { agentService, AgentDto } from '@/lib/api/services/agents';
import { useWalletStore } from '@/store/walletStore';

function CreateJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { isConnected } = useWalletStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [agents, setAgents] = useState<AgentDto[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    expectedResult: '',
    agentId: searchParams.get('agentId') || '',
  });

  // 获取可用的 Agents
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoadingAgents(true);
      try {
        const response = await agentService.getAgentList({ page: 1, pageSize: 100 });
        setAgents(response.items.filter((a) => a.status === 'enabled'));
      } catch (error) {
        console.error('获取 Agents 失败:', error);
        toast.error('获取 Agents 列表失败');
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('请输入任务标题');
      return;
    }

    if (!formData.agentId) {
      toast.error('请选择 Agent');
      return;
    }

    if (!formData.category.trim()) {
      toast.error('请输入任务分类');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('请输入任务描述');
      return;
    }

    if (!formData.expectedResult.trim()) {
      toast.error('请输入预期结果');
      return;
    }

    setIsSubmitting(true);
    try {
      await jobService.createJob({
        agentId: formData.agentId,
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        expectedResult: formData.expectedResult.trim(),
      });

      toast.success('任务创建成功！');
      router.push('/jobs');
    } catch (error) {
      console.error('创建任务失败:', error);
      toast.error(error instanceof Error ? error.message : '创建失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAgent = agents.find((a) => a.id === formData.agentId);

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">请先连接钱包以创建任务</p>
            <Link href="/jobs">
              <Button variant="outline">返回列表</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

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
                  maxLength={120}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                  placeholder="输入任务标题（最多 120 字符）"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting || isLoadingAgents}
                >
                  <option value="">
                    {isLoadingAgents ? '加载中...' : '请选择 Agent'}
                  </option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {parseFloat(agent.price) === 0 ? '免费' : `${agent.price} APT`}
                    </option>
                  ))}
                </select>
                {selectedAgent && (
                  <p className="mt-1 text-sm text-purple-600">
                    Agent 费用: {parseFloat(selectedAgent.price) === 0 ? '免费' : `${selectedAgent.price} APT`}
                    （创建任务时将从余额中冻结）
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  任务分类 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="category"
                  required
                  maxLength={80}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                  placeholder="如：文本处理、数据分析、代码生成等"
                  disabled={isSubmitting}
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
                  maxLength={2000}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 resize-none"
                  placeholder="详细描述任务需求（最多 2000 字符）"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="expectedResult" className="block text-sm font-medium text-gray-700 mb-2">
                  预期结果 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="expectedResult"
                  required
                  rows={3}
                  maxLength={2000}
                  value={formData.expectedResult}
                  onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 resize-none"
                  placeholder="描述期望的交付结果（最多 2000 字符）"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    '创建任务'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
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

// 加载状态组件
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  );
}

// 主页面组件，使用 Suspense 包裹表单
export default function CreateJobPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateJobForm />
    </Suspense>
  );
}
