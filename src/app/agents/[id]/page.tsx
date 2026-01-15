'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Bot, ArrowLeft, CheckCircle, XCircle, DollarSign, User, TrendingUp, RefreshCw, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { agentService, AgentDto } from '@/lib/api/services/agents';
import { useToast } from '@/contexts/ToastContext';
import { useWalletStore } from '@/store/walletStore';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { isConnected, address } = useWalletStore();

  const [agent, setAgent] = useState<AgentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisabling, setIsDisabling] = useState(false);

  const agentId = params.id as string;

  const fetchAgent = async () => {
    setIsLoading(true);
    try {
      const data = await agentService.getAgentDetail(agentId);
      setAgent(data);
    } catch (error) {
      console.error('获取 Agent 详情失败:', error);
      toast.error('获取 Agent 详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  const handleDisable = async () => {
    if (!agent) return;

    setIsDisabling(true);
    try {
      await agentService.disableAgent(agent.id);
      toast.success('Agent 已下架');
      fetchAgent();
    } catch (error) {
      console.error('下架失败:', error);
      toast.error(error instanceof Error ? error.message : '下架失败');
    } finally {
      setIsDisabling(false);
    }
  };

  const handleHire = () => {
    if (!agent) return;
    router.push(`/jobs/create?agentId=${agent.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Agent 未找到</h1>
          <Link href="/agents">
            <Button>返回列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = isConnected && agent.ownerUserId === address;
  const fee = parseFloat(agent.price) || 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <Link href="/agents" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{agent.name}</CardTitle>
                    <p className="text-gray-600">{agent.description || '暂无描述'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant={agent.status === 'enabled' ? 'success' : 'default'}>
                    {agent.status === 'enabled' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {agent.status === 'enabled' ? '可接任务' : '已下架'}
                  </Badge>
                  <div className="flex items-center gap-1 text-purple-600 font-medium">
                    {fee === 0 ? (
                      <span>免费服务</span>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5" />
                        <span>{fee} APT / 次</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Agent 详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">能力描述</h4>
                  <p className="text-gray-600">{agent.description || '暂无描述'}</p>
                </div>
                {isOwner && agent.url && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">执行地址</h4>
                    <p className="text-gray-600 font-mono text-sm break-all">{agent.url}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">创建时间</h4>
                  <p className="text-gray-600">
                    {new Date(agent.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">统计数据</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">单次费用</p>
                    <p className="text-xl font-bold text-gray-800">{fee} APT</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">所有者 ID</p>
                    <p className="text-sm font-mono text-gray-800 break-all">{agent.ownerUserId}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">操作</h3>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  disabled={agent.status === 'disabled'}
                  onClick={handleHire}
                >
                  雇佣 Agent
                </Button>

                {isOwner && (
                  <>
                    <Link href={`/agents/${agent.id}/edit`} className="block">
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4" />
                        编辑 Agent
                      </Button>
                    </Link>
                    {agent.status === 'enabled' && (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={handleDisable}
                        disabled={isDisabling}
                      >
                        {isDisabling ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            处理中...
                          </>
                        ) : (
                          '下架 Agent'
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
