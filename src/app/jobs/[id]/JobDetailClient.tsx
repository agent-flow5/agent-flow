'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Calendar, User, DollarSign, Bot, CheckCircle2 } from 'lucide-react';
import { mockJobs } from '@/data/mockJobs';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { jobStatusConfig } from '@/lib/statusConfig';
import { useToast } from '@/contexts/ToastContext';

export default function JobDetailClient() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const jobId = params.id as string;

  const job = mockJobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">任务不存在</h2>
          <p className="text-gray-600 mb-6">未找到 ID 为 {jobId} 的任务</p>
          <Link href="/jobs">
            <Button>返回任务列表</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusInfo = jobStatusConfig[job.status];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  {job.executable && <Badge variant="success">可执行</Badge>}
                </div>
                <p className="text-gray-600 text-sm">任务 ID: {job.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">赏金</p>
                <p className="text-3xl font-bold text-purple-600">{job.reward} AGF</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Job Details */}
        <div className="grid gap-6 mb-6">
          {/* Description */}
          {job.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">任务描述</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Information Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">任务信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">创建者</p>
                    <p className="font-medium text-gray-800">{job.owner}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">创建时间</p>
                    <p className="font-medium text-gray-800">{job.createdAt}</p>
                  </div>
                </div>

                {job.agent && (
                  <div className="flex items-start gap-3">
                    <Bot className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">执行 Agent</p>
                      <p className="font-medium text-gray-800">{job.agent}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">任务赏金</p>
                    <p className="font-medium text-gray-800">{job.reward} AGF</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">会话 ID</p>
                    <p className="font-medium text-gray-800">{job.conversationId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">状态</p>
                    <p className="font-medium text-gray-800">{statusInfo.label}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={() => {
                  // TODO: 实现进入会话功能
                  toast.info('进入会话功能待实现');
                }}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                进入会话
              </Button>

              {job.status === 'draft' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    // TODO: 实现发布功能
                    toast.info('发布功能待实现');
                  }}
                >
                  发布任务
                </Button>
              )}

              {job.status === 'open' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    // TODO: 实现开始执行功能
                    toast.info('开始执行功能待实现');
                  }}
                >
                  开始执行
                </Button>
              )}

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
