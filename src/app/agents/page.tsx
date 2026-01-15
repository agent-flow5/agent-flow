'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Bot, Plus, CheckCircle, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { AgentCard } from '@/components/features/agents/AgentCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useWalletStore } from '@/store/walletStore';
import { agentService, AgentDto } from '@/lib/api/services/agents';
import { agentDtoToAgent } from '@/types';
import { useToast } from '@/contexts/ToastContext';

type TabType = 'all' | 'mine';

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<AgentDto[]>([]);
  const [myAgents, setMyAgents] = useState<AgentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isConnected } = useWalletStore();
  const toast = useToast();

  // 获取所有 Agents
  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await agentService.getAgentList({ page: 1, pageSize: 100 });
      setAgents(response.items);
    } catch (error) {
      console.error('获取 Agents 失败:', error);
      toast.error('获取 Agents 列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取我的 Agents
  const fetchMyAgents = async () => {
    if (!isConnected) return;

    try {
      const response = await agentService.getMyAgents({ page: 1, pageSize: 100 });
      setMyAgents(response.items);
    } catch (error) {
      console.error('获取我的 Agents 失败:', error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchMyAgents();
    } else {
      setMyAgents([]);
    }
  }, [isConnected]);

  // 当前显示的 agents
  const currentAgents = activeTab === 'mine' ? myAgents : agents;

  // 过滤逻辑
  const filteredAgents = useMemo(() => {
    let result = currentAgents;

    // 根据搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          (agent.description && agent.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [currentAgents, searchQuery]);

  // 动态统计
  const stats = useMemo(() => {
    const agentList = currentAgents;
    return {
      total: agentList.length,
      available: agentList.filter((a) => a.status === 'enabled').length,
      totalJobs: 0, // API 暂未返回完成任务数
    };
  }, [currentAgents]);

  const handleRefresh = async () => {
    await fetchAgents();
    if (isConnected) {
      await fetchMyAgents();
    }
    toast.success('已刷新');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Agents</h1>
            <p className="text-gray-600">浏览和管理平台上的 AI Agents</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            {isConnected && (
              <Link href="/agents/create">
                <Button>
                  <Plus className="w-5 h-5" />
                  注册 Agent
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">
                {activeTab === 'mine' ? '我的 Agents' : '总 Agents'}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">可用</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.available}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">总完成任务</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalJobs}</p>
          </Card>
        </div>

        {/* Search and Tabs */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索 Agent 名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'all'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              全部 Agents
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'mine'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              我的 Agents
            </button>
          </div>
        </div>

        {/* Agents Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agentDtoToAgent(agent)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? '未找到匹配的 Agents' : '暂无 Agents'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
