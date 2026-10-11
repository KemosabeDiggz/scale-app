import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Trash2, ArrowLeft } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import StepList from '@/components/StepList';
import { useToast } from '@/components/ui/use-toast';

export default function WorkflowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [starting, setStarting] = useState(false);

  const load = async () => {
    try {
      const [wf, runRes] = await Promise.all([
        base44.entities.Workflow.get(id),
        base44.entities.Run.filter({ workflow_id: id }, { sort: '-created_date', limit: 20 }),
      ]);
      setWorkflow(wf);
      setRuns(runRes.items || []);
    } catch (e) {
      toast({ title: 'Not found', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const startRun = async () => {
    setStarting(true);
    try {
      const run = await base44.entities.Run.create({
        workflow_id: id,
        workflow_name: workflow.name,
        status: 'pending',
        input,
        steps_log: [],
        started_at: new Date().toISOString(),
      });
      navigate(`/runs/${run.id}`);
    } catch (e) {
      toast({ title: 'Failed to start', description: e.message, variant: 'destructive' });
      setStarting(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this workflow? Its run history stays.')) return;
    await base44.entities.Workflow.delete(id);
    navigate('/');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full p-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!workflow) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-bold">{workflow.name}</h1>
            <StatusBadge status={workflow.status} />
          </div>
          <p className="text-muted-foreground text-sm">{workflow.description}</p>
        </div>
        <Button variant="outline" size="icon" onClick={remove}><Trash2 className="w-4 h-4" /></Button>
      </div>

      <Card className="p-5 mb-6">
        <Label className="mb-2 block">Run input (optional — referenced as {'{{input}}'} in steps)</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} placeholder="Any context to feed the workflow…" />
        <Button className="mt-3" onClick={startRun} disabled={starting || !workflow.steps || workflow.steps.length === 0}>
          {starting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Run Workflow
        </Button>
      </Card>

      <h2 className="font-heading font-semibold text-lg mb-3">Steps</h2>
      <StepList steps={workflow.steps || []} />

      <h2 className="font-heading font-semibold text-lg mt-8 mb-3">Run History</h2>
      {runs.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">No runs yet. Hit "Run Workflow" above.</Card>
      ) : (
        <Card className="divide-y">
          {runs.map((run) => (
            <Link key={run.id} to={`/runs/${run.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/40">
              <StatusBadge status={run.status} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{run.result || run.input || 'Run'}</div>
                <div className="text-xs text-muted-foreground">{new Date(run.created_date).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}