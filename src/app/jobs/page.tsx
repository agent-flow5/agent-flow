'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Plus, Filter, MessageSquare, Search } from 'lucide-react';
import { mockJobs } from '@/data/mockJobs';
import { useWalletStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { jobStatusConfig } from '@/lib/statusConfig';

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isConnected, address } = useWalletStore();

  const filteredJobs = mockJobs.filter((job) => {
    const tabMatch = activeTab === 'all' || job.owner === address;
    const statusMatch = statusFilter === 'all' || job.status === statusFilter;
    const searchMatch = searchQuery === '' || job.title.toLowerCase().includes(searchQuery.toLowerCase());
    return tabMatch && statusMatch && searchMatch;
  });

  const myJobsCount = mockJobs.filter((j) => j.owner === address).length;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Jobs</h1>
            <p className="text-gray-600">管理和跟踪 AI 任务</p>
          </div>
          {isConnected && (
            <Link href="/jobs/create">
              <Button>
                <Plus className="w-5 h-5" />
                创建任务
              </Button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/70 text-gray-600 hover:bg-white'
            }`}
          >
            全部任务 ({mockJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'my'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/70 text-gray-600 hover:bg-white'
            }`}
          >
            我的任务 ({myJobsCount})
          </button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 mb-6 space-y-4">
          {/* Search Box */}
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索任务名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                清除
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">状态筛选:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-1 rounded-lg text-sm transition-all ${
                  statusFilter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {Object.entries(jobStatusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-4 py-1 rounded-lg text-sm transition-all ${
                    statusFilter === key
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">暂无任务</p>
            </Card>
          ) : (
            filteredJobs.map((job) => {
              const statusInfo = jobStatusConfig[job.status];
              return (
                <Card key={job.id} className="p-6 hover:border-purple-200 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        {job.executable && <Badge variant="success">可执行</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span>创建者: {job.owner}</span>
                        <span>•</span>
                        <span>{job.createdAt}</span>
                        {job.agent && (
                          <>
                            <span>•</span>
                            <span>Agent: {job.agent}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">赏金</p>
                      <p className="text-2xl font-bold text-purple-600">{job.reward} AGF</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="secondary">查看详情</Button>
                    </Link>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4" />
                      进入会话
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
