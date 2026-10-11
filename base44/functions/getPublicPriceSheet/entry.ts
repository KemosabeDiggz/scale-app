import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Public: returns what a customer needs to see on the estimate page.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { sheet_id } = await req.json();
    if (!sheet_id || typeof sheet_id !== 'string') {
      return Response.json({ error: 'Missing estimate link' }, { status: 400 });
    }

    const sheet = await base44.asServiceRole.entities.PriceSheet.get(sheet_id).catch(() => null);
    if (!sheet || sheet.active === false) {
      return Response.json({ error: 'This estimate link is not active' }, { status: 404 });
    }

    return Response.json({
      business_name: sheet.business_name,
      phone: sheet.phone || '',
      service_area: sheet.service_area || '',
      intro: sheet.intro || '',
      services: (sheet.items || []).map((i) => i.service).filter(Boolean),
    });
  } catch (error) {
    return Response.json({ error: 'Could not load this estimate page' }, { status: 500 });
  }
}
