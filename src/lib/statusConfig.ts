export const jobStatusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'purple' | 'success' | 'error' | 'warning' }> = {
  draft: { label: '草稿', variant: 'default' },
  open: { label: '可执行', variant: 'info' },
  running: { label: '执行中', variant: 'purple' },
  pending_review: { label: '待审核', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'error' },
};

export const billStatusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'purple' | 'success' | 'error' | 'warning' }> = {
  locked: { label: '已锁定', variant: 'warning' },
  released: { label: '已释放', variant: 'success' },
};
