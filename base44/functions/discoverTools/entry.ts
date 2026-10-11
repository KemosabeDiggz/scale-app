import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // If a real user is present (manual/admin invocation), require admin.
    // Scheduled workflow invocations have no user and run as the service role.
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    // 1. Search the web for new SaaS/AI tools via LLM with internet context.
    const llm = await svc.integrations.Core.InvokeLLM({
      prompt:
        'You are a SaaS tool scout for an agentic workflow automation platform. Search the web (Product Hunt, X/Twitter, AI tool directories, GitHub trending) for NEW SaaS and AI agent tools launched or trending in the last 7 days. Focus on: agentic workflow automation, AI agents for service businesses (HVAC, plumbing, roofing, landscaping), SaaS productivity, and AI for SMB operations. For each tool return: name, a one-sentence description, a category, the source where you found it (e.g. "Product Hunt" or "X"), a source_url, and a relevance_score from 1 to 10 where 10 is a perfect fit for an agentic workflow platform. Only include tools with relevance_score >= 7. Return at most 10 tools.',
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          tools: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                source: { type: 'string' },
                source_url: { type: 'string' },
                relevance_score: { type: 'number' }
              },
              required: ['name', 'description', 'category', 'source', 'relevance_score']
            }
          }
        },
        required: ['tools']
      }
    });

    const tools = (llm && llm.tools) || [];
    if (!tools.length) {
      return Response.json({ discovered: 0, message: 'No new relevant tools found.' });
    }

    // 2. De-duplicate against existing Tool Idea records by name.
    const names = tools.map((t) => t.name);
    const existing = await svc.entities.ToolIdea.filter(
      { name: { $in: names } },
      { fields: ['name'] }
    );
    const existingNames = new Set((existing.items || []).map((i) => i.name));
    const fresh = tools.filter((t) => !existingNames.has(t.name));

    if (!fresh.length) {
      return Response.json({ discovered: 0, message: 'All found tools already in the database.' });
    }

    // 3. Create Tool Idea records for the new finds.
    const records = fresh.map((t) => ({
      name: t.name,
      description: t.description,
      category: t.category,
      source: t.source,
      source_url: t.source_url || '',
      relevance_score: t.relevance_score,
      stage: 'discovered'
    }));

    await svc.entities.ToolIdea.bulkCreate(records);

    return Response.json({
      discovered: fresh.length,
      tools: fresh.map((t) => ({ name: t.name, score: t.relevance_score, source: t.source }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}