import AgentDetailClient from './AgentDetailClient';

// 静态导出：预生成一个占位页面，实际数据由客户端根据 URL 动态获取
export async function generateStaticParams() {
  return [{ id: '_' }];
}

export default function AgentDetailPage() {
  return <AgentDetailClient />;
}
