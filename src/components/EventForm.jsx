import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const COLORS = [
  { value: 'blue', label: 'Blue', cls: 'bg-blue-500' },
  { value: 'green', label: 'Green', cls: 'bg-green-500' },
  { value: 'red', label: 'Red', cls: 'bg-red-500' },
  { value: 'amber', label: 'Amber', cls: 'bg-amber-500' },
  { value: 'purple', label: 'Purple', cls: 'bg-purple-500' },
  { value: 'slate', label: 'Slate', cls: 'bg-slate-500' },
];

const toLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

const empty = { title: '', description: '', start_time: '', end_time: '', location: '', color: 'blue' };

export default function EventForm({ event, defaultStart, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (event) {
      setForm({ ...empty, ...event, start_time: toLocal(event.start_time), end_time: toLocal(event.end_time) });
    } else {
      setForm({ ...empty, start_time: defaultStart || '' });
    }
  }, [event, defaultStart]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.start_time) return;
    const payload = {
      ...form,
      start_time: new Date(form.start_time).toISOString(),
      end_time: form.end_time ? new Date(form.end_time).toISOString() : undefined,
      id: event?.id,
    };
    if (!payload.end_time) delete payload.end_time;
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={form.title} onChange={set('title')} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="start_time">Start *</Label>
          <Input id="start_time" type="datetime-local" value={form.start_time} onChange={set('start_time')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_time">End</Label>
          <Input id="end_time" type="datetime-local" value={form.end_time} onChange={set('end_time')} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={form.location} onChange={set('location')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description} onChange={set('description')} rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label>Color</Label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color: c.value }))}
              className={`w-8 h-8 rounded-full ${c.cls} ${form.color === c.value ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}
              aria-label={c.label}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{event ? 'Save' : 'Add Event'}</Button>
      </div>
    </form>
  );
}