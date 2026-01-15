'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Bot, CheckCircle2, Tag, FileText, Target, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { jobStatusConfig } from '@/lib/statusConfig';
import { useToast } from '@/contexts/ToastContext';
import { jobService, JobDto } from '@/lib/api/services/jobs';
import { useWalletStore } from '@/store/walletStore';

export default function JobDetailClient() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const jobId = params.id as string;
  const { isConnected, address } = useWalletStore();

  const [job, setJob] = useState<JobDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [resultText, setResultText] = useState('');

  const fetchJobDetail = async () => {
    if (!isConnected) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await jobService.getJobDetail(jobId);
      setJob(data);
    } catch (error) {
      console.error('获取任务详情失败:', error);
      toast.error('获取任务详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetail();
  }, [jobId, isConnected]);

  // 提交任务完成
  const handleCompleteJob = async () => {
    if (!job) return;

    setIsSubmitting(true);
    try {
      const updatedJob = await jobService.submitJobResult(jobId, {
        resultText: resultText.trim() || undefined,
      });
      setJob(updatedJob);
      setShowCompleteDialog(false);
      setResultText('');
      toast.success('任务已标记为完成！');
    } catch (error) {
      console.error('提交任务结果失败:', error);
      toast.error(error instanceof Error ? error.message : '提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
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
          <p className="text-gray-600 mb-4">请先连接钱包以查看任务详情</p>
          <Link href="/jobs">
            <Button>返回任务列表</Button>
          </Link>
        </Card>
      </div>
    );
  }

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

  const statusInfo = jobStatusConfig[job.status] || { label: job.status, variant: 'default' as const };
  const canComplete = job.status === 'running' || job.status === 'open';

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
                </div>
                <p className="text-gray-600 text-sm">任务 ID: {job.id}</p>
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
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  任务描述
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Expected Result */}
          {job.expectedResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  预期结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.expectedResult}</p>
              </CardContent>
            </Card>
          )}

          {/* Result (if completed) */}
          {job.resultText && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  执行结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.resultText}</p>
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
                    <p className="text-sm text-gray-600 mb-1">创建者 ID</p>
                    <p className="font-medium text-gray-800 font-mono text-sm">{job.userId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Agent ID</p>
                    <p className="font-medium text-gray-800 font-mono text-sm">{job.agentId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">任务分类</p>
                    <p className="font-medium text-gray-800">{job.category}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">状态</p>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">创建时间</p>
                    <p className="font-medium text-gray-800">{formatDate(job.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">更新时间</p>
                    <p className="font-medium text-gray-800">{formatDate(job.updatedAt)}</p>
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
              {/* 完成任务按钮 - 只有在任务进行中时显示 */}
              {canComplete && (
                <Button
                  onClick={() => setShowCompleteDialog(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  完成任务
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => fetchJobDetail()}
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

        {/* Complete Job Dialog */}
        {showCompleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  完成任务
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  确认将此任务标记为完成？完成后将进行结算。
                </p>

                <div>
                  <label htmlFor="resultText" className="block text-sm font-medium text-gray-700 mb-2">
                    执行结果（可选）
                  </label>
                  <textarea
                    id="resultText"
                    rows={4}
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 resize-none"
                    placeholder="描述任务执行结果..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleCompleteJob}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      '确认完成'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCompleteDialog(false);
                      setResultText('');
                    }}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
