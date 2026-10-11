import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Loader2, Workflow as WorkflowIcon, ArrowRight, Activity } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function MyStatus() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState([]);
  const [runs, setRuns] = useState([]);
  const [latestByWf, setLatestByWf] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [wfRes, runRes] = await Promise.all([
          base44.entities.Workflow.filter({ status: 'active' }, { sort: '-created_date', limit: 50 }),
          base44.entities.Run.filter({}, { sort: '-created_date', limit: 20 }),
        ]);
        const wfItems = wfRes.items || [];
        const runItems = runRes.items || [];
        setWorkflows(wfItems);
        setRuns(runItems);
        const map = {};
        runItems.forEach((r) => {
          if (r.workflow_id && !map[r.workflow_id]) map[r.workflow_id] = r;
        });
        setLatestByWf(map);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold">My Workflow Status</h1>
        <p className="text-muted-foreground text-sm mt-1">A live, read-only view of your active workflows and latest results.</p>
      </div>

      <h2 className="font-heading font-semibold text-lg mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" /> Active Workflows
      </h2>
      {workflows.length === 0 ? (
        <Card className="p-10 text-center mb-8">
          <WorkflowIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No active workflows right now.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {workflows.map((wf) => {
            const latest = latestByWf[wf.id];
            return (
              <Link key={wf.id} to={`/workflows/${wf.id}`}>
                <Card className="p-5 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-heading font-semibold truncate">{wf.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{wf.description || 'No description'}</div>
                    </div>
                    <StatusBadge status={latest ? latest.status : wf.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <span>{wf.steps?.length || 0} steps</span>
                    {latest && (
                      <span className="ml-2 truncate">Last run: {latest.result || latest.input || '—'}</span>
                    )}
                    <ArrowRight className="w-3 h-3 ml-auto" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <h2 className="font-heading font-semibold text-lg mb-3">Recent Results</h2>
      {runs.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">No runs yet.</Card>
      ) : (
        <Card className="divide-y">
          {runs.map((run) => (
            <Link key={run.id} to={`/runs/${run.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/40">
              <StatusBadge status={run.status} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{run.workflow_name || 'Workflow'}</div>
                <div className="text-xs text-muted-foreground truncate">{run.result || run.input || '—'}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}