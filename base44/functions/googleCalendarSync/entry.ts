import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const CONNECTOR_ID = '6ac59a0007a6ec4b7d502762';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

// Map app color labels to Google Calendar colorId values
const COLOR_MAP = {
  blue: '9',    // blueberry
  green: '10',  // basil
  red: '11',    // tomato
  amber: '6',   // tangerine
  purple: '3',  // grape
  slate: '8',   // graphite
};

function toGoogleEvent(data) {
  const start = data.start_time;
  const end = data.end_time || new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
  const body = {
    summary: data.title,
    description: data.description || '',
    location: data.location || '',
    start: { dateTime: start },
    end: { dateTime: end },
  };
  if (COLOR_MAP[data.color]) body.colorId = COLOR_MAP[data.color];
  return body;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action;

    let connection;
    try {
      connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    } catch (e) {
      if (action === 'status') return Response.json({ connected: false });
      return Response.json({ error: 'Google Calendar not connected', notConnected: true }, { status: 400 });
    }

    if (action === 'status') return Response.json({ connected: true });

    const accessToken = connection.accessToken;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    if (action === 'create') {
      const res = await fetch(CALENDAR_API, {
        method: 'POST',
        headers,
        body: JSON.stringify(toGoogleEvent(body.event)),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.error?.message || 'Create failed' }, { status: 502 });
      return Response.json({ google_event_id: data.id });
    }

    if (action === 'update') {
      const res = await fetch(`${CALENDAR_API}/${body.google_event_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(toGoogleEvent(body.event)),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.error?.message || 'Update failed' }, { status: 502 });
      return Response.json({ google_event_id: data.id });
    }

    if (action === 'delete') {
      const res = await fetch(`${CALENDAR_API}/${body.google_event_id}`, {
        method: 'DELETE',
        headers,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        return Response.json({ error: data.error?.message || 'Delete failed' }, { status: 502 });
      }
      return Response.json({ deleted: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}