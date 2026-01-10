import Link from 'next/link';
import { Bot, ArrowLeft, CheckCircle, XCircle, DollarSign, User, TrendingUp } from 'lucide-react';
import { mockAgents } from '@/data/mockAgents';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function generateStaticParams() {
  return mockAgents.map((agent) => ({
    id: agent.id,
  }));
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = mockAgents.find((a) => a.id === params.id);

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
                    <p className="text-gray-600">{agent.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant={agent.status === 'available' ? 'success' : 'default'}>
                    {agent.status === 'available' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {agent.status === 'available' ? '可接任务' : '不可接任务'}
                  </Badge>
                  <div className="flex items-center gap-1 text-purple-600 font-medium">
                    {agent.fee === 0 ? (
                      <span>免费服务</span>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5" />
                        <span>{agent.fee} AGF / 次</span>
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
                  <p className="text-gray-600">{agent.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">服务类型</h4>
                  <p className="text-gray-600">AI 自动化服务</p>
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
                    <p className="text-sm text-gray-600">完成任务</p>
                    <p className="text-xl font-bold text-gray-800">{agent.completedJobs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">所有者</p>
                    <p className="text-sm font-mono text-gray-800 break-all">{agent.owner}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">操作</h3>
              <div className="space-y-3">
                <Button className="w-full" disabled={agent.status === 'unavailable'}>
                  雇佣 Agent
                </Button>
                <Button variant="outline" className="w-full">
                  查看历史任务
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
