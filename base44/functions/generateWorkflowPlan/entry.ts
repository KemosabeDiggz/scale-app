import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const jobDescription = body.job_description;
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
      return Response.json({ error: 'A detailed job description is required' }, { status: 400 });
    }

    const prompt = `You are a workflow architect for an agentic SaaS platform. The user wants to automate this business job:

"""
${jobDescription}
"""

Design an autonomous multi-step workflow that completes this job end-to-end. Break it into 2 to 6 steps. Each step is exactly one of:
- "llm": an AI reasoning/generation step. Include a detailed "prompt" that tells the AI exactly what to produce. The prompt may reference outputs of earlier steps using {{steps.STEPNAME.output}} and the original input using {{input}}.
- "wait": pause execution. Include "seconds" (a number, 1-60).
- "email": send an email. Include "to" (email address, may use {{input}} or step refs), "subject", and "body" (may use step refs).

Rules:
- Step "name" must be snake_case and unique.
- Order steps logically: usually gather/analyze with llm steps first, then act with email steps.
- Keep prompts specific and actionable. The AI output of an llm step becomes available to later steps.
- Make the workflow genuinely useful for the stated job.

Return ONLY the workflow plan as JSON.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Short workflow name" },
          description: { type: "string", description: "One sentence describing what the workflow does" },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["llm", "wait", "email"] },
                name: { type: "string", description: "snake_case unique step name" },
                prompt: { type: "string", description: "for llm steps" },
                to: { type: "string", description: "for email steps" },
                subject: { type: "string", description: "for email steps" },
                body: { type: "string", description: "for email steps" },
                seconds: { type: "number", description: "for wait steps" }
              },
              required: ["type", "name"]
            }
          }
        },
        required: ["name", "description", "steps"]
      }
    });

    // Normalize: strip undefined fields per step type
    const cleanSteps = (result.steps || []).map((s) => {
      const step = { type: s.type, name: s.name };
      if (s.type === 'llm') step.prompt = s.prompt || '';
      if (s.type === 'email') {
        step.to = s.to || '';
        step.subject = s.subject || '';
        step.body = s.body || '';
      }
      if (s.type === 'wait') step.seconds = s.seconds || 5;
      return step;
    });

    return Response.json({
      plan: {
        name: result.name || 'Untitled Workflow',
        description: result.description || '',
        steps: cleanSteps
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}