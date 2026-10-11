import { Badge } from '@/components/ui/badge';

const map = {
  pending: { label: 'Pending', cls: 'bg-muted text-muted-foreground' },
  running: { label: 'Running', cls: 'bg-blue-500/20 text-blue-300' },
  completed: { label: 'Completed', cls: 'bg-green-500/20 text-green-300' },
  failed: { label: 'Failed', cls: 'bg-red-500/20 text-red-300' },
  draft: { label: 'Draft', cls: 'bg-muted text-muted-foreground' },
  active: { label: 'Active', cls: 'bg-green-500/20 text-green-300' },
  archived: { label: 'Archived', cls: 'bg-muted text-muted-foreground' },
};

export default function StatusBadge({ status }) {
  const cfg = map[status] || map.pending;
  return <Badge className={cfg.cls + ' border-transparent'}>{cfg.label}</Badge>;
}