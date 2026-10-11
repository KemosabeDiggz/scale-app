import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const empty = { name: '', email: '', phone: '', company: '', title: '', notes: '' };

export default function ContactForm({ contact, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(contact ? { ...empty, ...contact } : empty);
  }, [contact]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({ ...form, id: contact?.id });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={form.name} onChange={set('name')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={form.title} onChange={set('title')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={set('phone')} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" value={form.company} onChange={set('company')} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={form.notes} onChange={set('notes')} rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{contact ? 'Save' : 'Add Contact'}</Button>
      </div>
    </form>
  );
}