import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, RotateCw } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import StepList from '@/components/StepList';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function RunDetail() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const started = useRef(false);

  const refresh = async () => {
    const r = await base44.entities.Run.get(id);
    setRun(r);
    return r;
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await refresh();
        if (r.workflow_id) {
          const wf = await base44.entities.Workflow.get(r.workflow_id);
          setWorkflow(wf);
        }
        if (r.status === 'pending' && !started.current) {
          started.current = true;
          execute(r);
        }
      } catch (e) {
        // handled
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const execute = async (currentRun) => {
    const wf = workflow || (run ? await base44.entities.Workflow.get(currentRun.workflow_id) : null);
    if (!wf || !wf.steps) {
      await base44.entities.Run.update(id, { status: 'failed', result: 'Workflow has no steps', completed_at: new Date().toISOString() });
      await refresh();
      return;
    }

    const context = { steps: {}, input: currentRun.input || '' };
    const stepsLog = [];
    let failed = false;

    await base44.entities.Run.update(id, { status: 'running', started_at: new Date().toISOString() });
    setRun((r) => ({ ...r, status: 'running' }));

    for (let i = 0; i < wf.steps.length; i++) {
      const step = wf.steps[i];
      const entry = { name: step.name, type: step.type, status: 'running', started_at: new Date().toISOString() };
      stepsLog.push(entry);
      await base44.entities.Run.update(id, { steps_log: [...stepsLog] });
      setRun((r) => ({ ...r, steps_log: [...stepsLog] }));

      try {
        const res = await base44.functions.invoke('runWorkflowStep', { step, context });
        const data = res.data || {};
        if (data.error) throw new Error(data.error);

        entry.output = data.output;
        entry.status = 'completed';
        entry.completed_at = new Date().toISOString();
        context.steps[step.name] = { output: data.output };

        if (step.type === 'wait' && data.wait_seconds) {
          await wait(data.wait_seconds * 1000);
        }
      } catch (e) {
        entry.status = 'failed';
        entry.error = e.message;
        entry.completed_at = new Date().toISOString();
        failed = true;
        stepsLog[stepsLog.length - 1] = entry;
        await base44.entities.Run.update(id, { steps_log: [...stepsLog] });
        setRun((r) => ({ ...r, steps_log: [...stepsLog] }));
        break;
      }

      stepsLog[stepsLog.length - 1] = entry;
      await base44.entities.Run.update(id, { steps_log: [...stepsLog] });
      setRun((r) => ({ ...r, steps_log: [...stepsLog] }));
    }

    const lastOutput = stepsLog.filter((s) => s.output).pop()?.output || '';
    await base44.entities.Run.update(id, {
      status: failed ? 'failed' : 'completed',
      result: lastOutput,
      completed_at: new Date().toISOString(),
    });
    await refresh();
  };

  if (loading || !run) {
    return <div className="flex items-center justify-center h-full p-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const steps = workflow?.steps || [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to={run.workflow_id ? `/workflows/${run.workflow_id}` : '/'} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to workflow
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-bold">{run.workflow_name || 'Run'}</h1>
            <StatusBadge status={run.status} />
          </div>
          {run.input && <p className="text-sm text-muted-foreground">Input: {run.input}</p>}
        </div>
        {run.status !== 'running' && (
          <Link to={run.workflow_id ? `/workflows/${run.workflow_id}` : '/'}>
            <Button variant="outline"><RotateCw className="w-4 h-4 mr-2" /> Run again</Button>
          </Link>
        )}
      </div>

      {run.status === 'completed' && run.result && (
        <Card className="p-5 mb-6 bg-green-500/10 border-green-500/30">
          <div className="text-sm font-medium text-green-300 mb-1">Final Result</div>
          <pre className="text-sm text-green-200 whitespace-pre-wrap break-words">{run.result}</pre>
        </Card>
      )}

      <h2 className="font-heading font-semibold text-lg mb-3">Execution</h2>
      <StepList steps={steps} log={run.steps_log} />
    </div>
  );
}