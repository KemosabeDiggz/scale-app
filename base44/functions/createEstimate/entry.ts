import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 2_500_000;

// Public: a customer sends photos (or frames pulled from a video) and a job
// description; we price it from the business's own price sheet and save the
// request for the owner.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { sheet_id, customer_name, customer_phone, customer_email } = body;
    const description = String(body.description || '').slice(0, 1500);
    const images = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];

    if (!sheet_id) return Response.json({ error: 'Missing estimate link' }, { status: 400 });
    if (!customer_name || !customer_phone) {
      return Response.json({ error: 'Please add your name and phone number' }, { status: 400 });
    }
    if (!images.length && description.trim().length < 10) {
      return Response.json({ error: 'Please add a photo or describe the job' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    const sheet = await svc.entities.PriceSheet.get(sheet_id).catch(() => null);
    if (!sheet || sheet.active === false) {
      return Response.json({ error: 'This estimate link is not active' }, { status: 404 });
    }

    // Upload each photo (sent as a data URL) to storage
    const media_urls: string[] = [];
    for (const dataUrl of images) {
      const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(dataUrl));
      if (!match) continue;
      const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
      if (bytes.length > MAX_IMAGE_BYTES) continue;
      const file = new File([bytes], `estimate-photo-${media_urls.length + 1}.jpg`, { type: match[1] });
      const { file_url } = await svc.integrations.Core.UploadFile({ file });
      media_urls.push(file_url);
    }

    const priceList = (sheet.items || [])
      .filter((i) => i.service)
      .map((i) => `- ${i.service}: $${i.price_low ?? '?'}–$${i.price_high ?? i.price_low ?? '?'}${i.unit ? ` per ${i.unit}` : ''}${i.notes ? ` (${i.notes})` : ''}`)
      .join('\n');

    const prompt = `You are the estimator for ${sheet.business_name}, a local service business${sheet.service_area ? ` serving ${sheet.service_area}` : ''}.
A customer sent ${media_urls.length} photo(s) and this description:
"""
${description || '(no description)'}
"""

The business's price sheet (use ONLY these services and price ranges):
${priceList || '(no prices set)'}

Instructions:
- Look at the photos and the description and pick the matching services from the price sheet.
- Estimate a low and high total in US dollars using the price sheet ranges. If size, amount or condition is unclear, use a wider range.
- Never add services or prices that are not on the price sheet. If nothing matches, return zero line items and explain in the summary that the business will follow up.
- Write the summary in 2-3 plain, friendly sentences to the customer.
- List up to 3 short things the business should confirm (for example size, access or condition).`;

    const result = await svc.integrations.Core.InvokeLLM({
      prompt,
      file_urls: media_urls.length ? media_urls : undefined,
      response_json_schema: {
        type: 'object',
        properties: {
          line_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                service: { type: 'string' },
                detail: { type: 'string' },
                low: { type: 'number' },
                high: { type: 'number' },
              },
              required: ['service', 'low', 'high'],
            },
          },
          summary: { type: 'string' },
          questions: { type: 'array', items: { type: 'string' } },
        },
        required: ['line_items', 'summary'],
      },
    });

    // Keep the numbers sane, then total them ourselves
    const money = (n) => Math.max(0, Math.round(Number(n) || 0));
    const line_items = (result.line_items || []).map((l) => {
      const low = money(l.low);
      const high = Math.max(low, money(l.high));
      return { service: String(l.service || ''), detail: String(l.detail || ''), low, high };
    });
    const estimate_low = line_items.reduce((a, l) => a + l.low, 0);
    const estimate_high = line_items.reduce((a, l) => a + l.high, 0);
    const questions = (result.questions || []).slice(0, 3).map(String);

    await svc.entities.EstimateRequest.create({
      price_sheet_id: sheet.id,
      owner_id: sheet.created_by_id,
      customer_name: String(customer_name).slice(0, 120),
      customer_phone: String(customer_phone).slice(0, 40),
      customer_email: String(customer_email || '').slice(0, 120),
      description,
      media_urls,
      line_items,
      estimate_low,
      estimate_high,
      summary: String(result.summary || ''),
      questions,
      status: 'new',
    });

    return Response.json({
      business_name: sheet.business_name,
      phone: sheet.phone || '',
      line_items,
      estimate_low,
      estimate_high,
      summary: String(result.summary || ''),
      questions,
    });
  } catch (error) {
    return Response.json({ error: 'Could not create the estimate. Please try again.' }, { status: 500 });
  }
}
