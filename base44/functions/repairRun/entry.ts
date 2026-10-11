import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { executeStep } from '../../shared/executeStep.ts';

const MAX_ATTEMPTS = 2;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const runId = body.run_id;
    if (!runId) return Response.json({ error: 'run_id is required' }, { status: 400 });

    const run = await base44.asServiceRole.entities.Run.get(runId);
    if (!run) return Response.json({ error: 'Run not found' }, { status: 404 });
    if (run.status !== 'failed') {
      return Response.json({ skipped: 'run is not failed', status: run.status });
    }

    const attempts = (run.repair_attempts || 0) + 1;
    if (attempts > MAX_ATTEMPTS) {
      await base44.asServiceRole.entities.Run.update(runId, {
        result: (run.result || '') + '\n[Self-repair aborted: maximum retry attempts reached]',
      });
      return Response.json({ aborted: 'max attempts reached', attempts: attempts - 1 });
    }

    const workflow = await base44.asServiceRole.entities.Workflow.get(run.workflow_id);
    if (!workflow || !workflow.steps) {
      return Response.json({ error: 'Workflow not found or has no steps' }, { status: 404 });
    }

    // Find the first failed step; rebuild context from completed steps before it.
    const stepsLog = run.steps_log || [];
    const failedIndex = stepsLog.findIndex((s) => s.status === 'failed');
    const startIndex = failedIndex >= 0 ? failedIndex : 0;

    const context = { steps: {}, input: run.input || '' };
    for (let i = 0; i < startIndex; i++) {
      const log = stepsLog[i];
      if (log && log.status === 'completed' && log.output != null) {
        context.steps[log.name] = { output: log.output };
      }
    }

    await base44.asServiceRole.entities.Run.update(runId, {
      status: 'running',
      repair_attempts: attempts,
      started_at: new Date().toISOString(),
    });

    const newLog = stepsLog.slice(0, startIndex).map((s) => ({ ...s }));
    let failed = false;
    let errorMsg = null;

    for (let i = startIndex; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const entry = { name: step.name, type: step.type, status: 'running', started_at: new Date().toISOString(), repair: true };
      newLog.push(entry);
      await base44.asServiceRole.entities.Run.update(runId, { steps_log: [...newLog] });

      try {
        const result = await executeStep(base44, step, context);
        if (result.error) throw new Error(result.error);
        entry.output = result.output;
        entry.status = 'completed';
        entry.completed_at = new Date().toISOString();
        context.steps[step.name] = { output: result.output };

        if (step.type === 'wait' && result.wait_seconds) {
          await new Promise((r) => setTimeout(r, result.wait_seconds * 1000));
        }
      } catch (e) {
        entry.status = 'failed';
        entry.error = e.message;
        entry.completed_at = new Date().toISOString();
        failed = true;
        errorMsg = e.message;
        newLog[newLog.length - 1] = entry;
        await base44.asServiceRole.entities.Run.update(runId, { steps_log: [...newLog] });
        break;
      }

      newLog[newLog.length - 1] = entry;
      await base44.asServiceRole.entities.Run.update(runId, { steps_log: [...newLog] });
    }

    const lastOutput = newLog.filter((s) => s.output).pop()?.output || '';
    await base44.asServiceRole.entities.Run.update(runId, {
      status: failed ? 'failed' : 'completed',
      result: failed ? (errorMsg || 'Repair failed') : lastOutput,
      completed_at: new Date().toISOString(),
    });

    return Response.json({
      run_id: runId,
      repaired: !failed,
      attempts,
      status: failed ? 'failed' : 'completed',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}