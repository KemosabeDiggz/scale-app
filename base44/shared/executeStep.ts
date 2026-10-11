// Shared single-step execution logic used by runWorkflowStep (user-invoked)
// and repairRun (automated self-repair). Both run steps through the service
// role integrations, so this module takes a base44 client and is user-agnostic.

export function resolveTemplates(text, context) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\{\{\s*steps\.([a-zA-Z0-9_]+)\.output\s*\}\}/g, (_, name) => {
      const out = context.steps?.[name]?.output;
      return out != null ? String(out) : '';
    })
    .replace(/\{\{\s*input\s*\}\}/g, () => (context.input != null ? String(context.input) : ''));
}

// Returns { output } on success, or { error } for a validation/known failure.
// Throws on unexpected errors (caller decides how to surface).
export async function executeStep(base44, step, context) {
  if (!step || !step.type || !step.name) {
    return { error: 'step (with type and name) is required' };
  }

  if (step.type === 'llm') {
    const prompt = resolveTemplates(step.prompt, context);
    if (!prompt || prompt.trim().length < 3) {
      return { error: 'llm step prompt is empty after resolving templates' };
    }
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const output = typeof result === 'string' ? result : JSON.stringify(result);
    return { output };
  }

  if (step.type === 'email') {
    const to = resolveTemplates(step.to, context);
    const subject = resolveTemplates(step.subject, context) || 'Workflow notification';
    const emailBody = resolveTemplates(step.body, context) || '';
    if (!to || !to.includes('@')) {
      return { error: 'email step requires a valid "to" address' };
    }
    await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body: emailBody });
    return { output: `Email sent to ${to}` };
  }

  if (step.type === 'wait') {
    const seconds = Math.min(Math.max(Number(step.seconds) || 5, 1), 60);
    return { output: `Waited ${seconds}s`, wait_seconds: seconds };
  }

  return { error: 'unknown step type: ' + step.type };
}