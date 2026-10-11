import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { executeStep } from '../../shared/executeStep.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const step = body.step;
    const context = body.context || { steps: {}, input: '' };

    const result = await executeStep(base44, step, context);
    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message, failed: true }, { status: 500 });
  }
}