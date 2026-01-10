export const jobStatusConfig = {
  draft: { label: '草稿', variant: 'default' as const },
  open: { label: '可执行', variant: 'info' as const },
  running: { label: '执行中', variant: 'purple' as const },
  completed: { label: '已完成', variant: 'success' as const },
  failed: { label: '失败', variant: 'error' as const },
};

export const billStatusConfig = {
  pending: { label: '待支付', variant: 'warning' as const },
  paid: { label: '已支付', variant: 'success' as const },
  failed: { label: '失败', variant: 'error' as const },
};
