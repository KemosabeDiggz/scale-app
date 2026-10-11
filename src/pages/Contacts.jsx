import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, Loader2, Pencil, Trash2, Mail, Phone, Building2, User as UserIcon, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ContactForm from '@/components/ContactForm';

export default function Contacts() {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async (q) => {
    setLoading(true);
    try {
      const filter = q.trim() ? { name: { $regex: q.trim(), $options: 'i' } } : {};
      const res = await base44.entities.Contact.filter(filter, { sort: 'name', limit: 100 });
      setContacts(res.items || []);
    } catch (e) {
      toast({ title: 'Failed to load contacts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(''); }, []);

  const onSearch = (e) => {
    setQuery(e.target.value);
    load(e.target.value);
  };

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setOpen(true); };

  const save = async (data) => {
    try {
      if (editing) {
        await base44.entities.Contact.update(editing.id, data);
        toast({ title: 'Contact updated' });
      } else {
        await base44.entities.Contact.create(data);
        toast({ title: 'Contact added' });
      }
      setOpen(false);
      load(query);
    } catch (e) {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    try {
      await base44.entities.Contact.delete(c.id);
      setContacts((prev) => prev.filter((x) => x.id !== c.id));
      toast({ title: 'Contact deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-1">Your personal contact book.</p>
        </div>
        <Button onClick={openNew}><PlusCircle className="w-4 h-4 mr-2" /> Add Contact</Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={onSearch} placeholder="Search contacts..." className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : contacts.length === 0 ? (
        <Card className="p-10 text-center">
          <UserIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No contacts yet.</p>
          <Button onClick={openNew}><PlusCircle className="w-4 h-4 mr-2" /> Add your first contact</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <Card key={c.id} className="p-5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-semibold truncate">{c.name}</div>
                    {c.title && <div className="text-xs text-muted-foreground truncate">{c.title}</div>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                {c.email && <div className="flex items-center gap-2 text-muted-foreground truncate"><Mail className="w-3.5 h-3.5 shrink-0" /> {c.email}</div>}
                {c.phone && <div className="flex items-center gap-2 text-muted-foreground truncate"><Phone className="w-3.5 h-3.5 shrink-0" /> {c.phone}</div>}
                {c.company && <div className="flex items-center gap-2 text-muted-foreground truncate"><Building2 className="w-3.5 h-3.5 shrink-0" /> {c.company}</div>}
              </div>
              {c.notes && <div className="mt-3 text-xs text-muted-foreground line-clamp-2 border-t pt-3">{c.notes}</div>}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Contact' : 'New Contact'}</DialogTitle>
          </DialogHeader>
          <ContactForm contact={editing} onSubmit={save} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}