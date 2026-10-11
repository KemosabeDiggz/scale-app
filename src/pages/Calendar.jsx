import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ChevronLeft, ChevronRight, PlusCircle, Pencil, Trash2, MapPin, Clock, CalendarCheck, RefreshCw, Link2, Unlink } from 'lucide-react';

const CONNECTOR_ID = '6ac59a0007a6ec4b7d502762';
import { useToast } from '@/components/ui/use-toast';
import EventForm from '@/components/EventForm';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, addMonths, subMonths, parseISO
} from 'date-fns';

const COLOR_DOT = {
  blue: 'bg-blue-500', green: 'bg-green-500', red: 'bg-red-500',
  amber: 'bg-amber-500', purple: 'bg-purple-500', slate: 'bg-slate-500',
};

const COLOR_BORDER = {
  blue: 'border-blue-500', green: 'border-green-500', red: 'border-red-500',
  amber: 'border-amber-500', purple: 'border-purple-500', slate: 'border-slate-500',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [cursor, setCursor] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [defaultStart, setDefaultStart] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

  const load = async () => {
    setLoading(true);
    try {
      const startISO = gridStart.toISOString();
      const endISO = gridEnd.toISOString();
      const res = await base44.entities.Event.filter(
        { start_time: { $gte: startISO, $lte: endISO } },
        { sort: 'start_time', limit: 200 }
      );
      setEvents(res.items || []);
    } catch (e) {
      toast({ title: 'Failed to load events', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [cursor]);

  const checkConnection = async () => {
    try {
      const res = await base44.functions.invoke('googleCalendarSync', { action: 'status' });
      setConnected(!!res.data?.connected);
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => { checkConnection(); }, []);

  const handleConnect = async () => {
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          checkConnection();
        }
      }, 500);
    } catch {
      toast({ title: 'Could not start Google connection', variant: 'destructive' });
    }
  };

  const handleDisconnect = async () => {
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
      setConnected(false);
      toast({ title: 'Google Calendar disconnected' });
    } catch {
      toast({ title: 'Disconnect failed', variant: 'destructive' });
    }
  };

  const syncEvent = async (event, mode) => {
    let action = mode;
    const googleEventId = event.google_event_id;
    if (mode === 'update' && !googleEventId) action = 'create';
    setSyncing(true);
    try {
      const res = await base44.functions.invoke('googleCalendarSync', {
        action,
        event: {
          title: event.title, description: event.description, location: event.location,
          start_time: event.start_time, end_time: event.end_time, color: event.color,
        },
        google_event_id: googleEventId,
      });
      if ((action === 'create' || action === 'update') && res.data?.google_event_id && res.data.google_event_id !== googleEventId) {
        await base44.entities.Event.update(event.id, { google_event_id: res.data.google_event_id });
        load();
      }
    } catch {
      toast({ title: 'Google Calendar sync failed', description: 'Event saved locally but not synced.', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const d = format(parseISO(ev.start_time), 'yyyy-MM-dd');
      (map[d] ||= []).push(ev);
    });
    return map;
  }, [events]);

  const dayEvents = useMemo(() => {
    const key = format(selectedDay, 'yyyy-MM-dd');
    return eventsByDay[key] || [];
  }, [eventsByDay, selectedDay]);

  const openNew = (day) => {
    const dt = new Date(day);
    dt.setHours(9, 0, 0, 0);
    setDefaultStart(dt.toISOString().slice(0, 16));
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (ev) => {
    setEditing(ev);
    setDefaultStart('');
    setOpen(true);
  };

  const save = async (data) => {
    try {
      let saved;
      const mode = editing ? 'update' : 'create';
      if (editing) {
        saved = await base44.entities.Event.update(editing.id, data);
        toast({ title: 'Event updated' });
      } else {
        saved = await base44.entities.Event.create(data);
        toast({ title: 'Event added' });
      }
      setOpen(false);
      load();
      if (connected) syncEvent(saved, mode);
    } catch (e) {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
  };

  const remove = async (ev) => {
    if (!confirm(`Delete "${ev.title}"?`)) return;
    try {
      if (connected && ev.google_event_id) {
        try {
          await base44.functions.invoke('googleCalendarSync', { action: 'delete', google_event_id: ev.google_event_id });
        } catch {
          toast({ title: 'Could not delete from Google Calendar', variant: 'destructive' });
        }
      }
      await base44.entities.Event.delete(ev.id);
      load();
      toast({ title: 'Event deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Your events and schedule.</p>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-muted-foreground">
              <CalendarCheck className="w-4 h-4 mr-2 text-green-600" /> Synced <Unlink className="w-3.5 h-3.5 ml-2" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleConnect}>
              <Link2 className="w-4 h-4 mr-2" /> Connect Google Calendar
            </Button>
          )}
          {syncing && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
          <Button onClick={() => openNew(new Date())}><PlusCircle className="w-4 h-4 mr-2" /> Add Event</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-lg">{format(cursor, 'MMMM yyyy')}</h2>
              <div className="flex gap-1">
                <Button size="icon" variant="outline" onClick={() => setCursor(subMonths(cursor, 1))}><ChevronLeft className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => { setCursor(new Date()); setSelectedDay(new Date()); }}>Today</Button>
                <Button size="icon" variant="outline" onClick={() => setCursor(addMonths(cursor, 1))}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
            </div>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const inMonth = isSameMonth(day, cursor);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDay);
                  const dayEvs = eventsByDay[key] || [];
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[80px] rounded-lg border p-1.5 text-left transition-colors ${
                        isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
                      } ${inMonth ? 'bg-card' : 'bg-muted/30'} hover:bg-muted/50`}
                    >
                      <div className={`text-xs font-medium mb-1 ${isToday ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center' : inMonth ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvs.slice(0, 3).map((ev) => (
                          <div key={ev.id} className="flex items-center gap-1 text-[10px] truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${COLOR_DOT[ev.color] || COLOR_DOT.blue}`} />
                            <span className="truncate">{ev.title}</span>
                          </div>
                        ))}
                        {dayEvs.length > 3 && <div className="text-[10px] text-muted-foreground">+{dayEvs.length - 3} more</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold">{format(selectedDay, 'EEEE, MMM d')}</h3>
              <Button size="sm" variant="outline" onClick={() => openNew(selectedDay)}><PlusCircle className="w-3.5 h-3.5 mr-1" /> Add</Button>
            </div>
            {dayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No events this day.</p>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="group">
                    <div className={`border-l-2 pl-3 py-1 ${COLOR_BORDER[ev.color] || COLOR_BORDER.blue}`}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{ev.title}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3" /> {format(parseISO(ev.start_time), 'h:mm a')}
                            {ev.end_time && ` – ${format(parseISO(ev.end_time), 'h:mm a')}`}
                          </div>
                          {ev.location && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><MapPin className="w-3 h-3" /> {ev.location}</div>}
                          {ev.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{ev.description}</div>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(ev)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(ev)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <EventForm event={editing} defaultStart={defaultStart} onSubmit={save} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}