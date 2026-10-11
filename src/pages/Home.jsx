import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusCircle, Workflow as WorkflowIcon, Play, Loader2, ArrowRight } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState([]);
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState({ workflows: 0, runs: 0, completed: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [wfRes, runRes, wfCount, runCount, doneCount] = await Promise.all([
          base44.entities.Workflow.filter({}, { sort: '-created_date', limit: 50 }),
          base44.entities.Run.filter({}, { sort: '-created_date', limit: 10 }),
          base44.entities.Workflow.count({}),
          base44.entities.Run.count({}),
          base44.entities.Run.count({ status: 'completed' }),
        ]);
        setWorkflows(wfRes.items || []);
        setRuns(runRes.items || []);
        setStats({ workflows: wfCount, runs: runCount, completed: doneCount });
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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your autonomous AI workflows, all in one place.</p>
        </div>
        <Link to="/workflows/new">
          <Button><PlusCircle className="w-4 h-4 mr-2" /> New Workflow</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Workflows</div>
          <div className="text-3xl font-heading font-bold mt-1">{stats.workflows}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Total Runs</div>
          <div className="text-3xl font-heading font-bold mt-1">{stats.runs}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-3xl font-heading font-bold mt-1">{stats.completed}</div>
        </Card>
      </div>

      <h2 className="font-heading font-semibold text-lg mb-3">Your Workflows</h2>
      {workflows.length === 0 ? (
        <Card className="p-10 text-center">
          <WorkflowIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No workflows yet. Describe a job and let AI build it for you.</p>
          <Link to="/workflows/new">
            <Button><PlusCircle className="w-4 h-4 mr-2" /> Create your first workflow</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {workflows.map((wf) => (
            <Link key={wf.id} to={`/workflows/${wf.id}`}>
              <Card className="p-5 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="font-heading font-semibold truncate">{wf.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{wf.description || 'No description'}</div>
                  </div>
                  <StatusBadge status={wf.status} />
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Play className="w-3 h-3" /> {wf.steps?.length || 0} steps
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <h2 className="font-heading font-semibold text-lg mb-3">Recent Runs</h2>
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
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}