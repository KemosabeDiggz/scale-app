import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Copy, ExternalLink, Calculator, Phone, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Starting rows so the sheet isn't blank. The owner changes these to their own prices.
const EXAMPLE_ITEMS = [
  { service: 'Small job', price_low: 150, price_high: 300, unit: 'job', notes: 'Example. Change to your prices.' },
  { service: 'Medium job', price_low: 300, price_high: 600, unit: 'job', notes: '' },
  { service: 'Large job', price_low: 600, price_high: 1200, unit: 'job', notes: '' },
];
const STATUSES = ['new', 'contacted', 'booked', 'closed'];
const money = (n) => '$' + Math.round(n || 0).toLocaleString('en-US');

export default function Estimator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [form, setForm] = useState({ business_name: '', phone: '', service_area: '', intro: '', items: EXAMPLE_ITEMS, active: true });
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState([]);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const sheets = await base44.entities.PriceSheet.filter({ created_by_id: me.id }, { limit: 1 });
        const s = (sheets.items || [])[0];
        if (s) {
          setSheet(s);
          setForm({ business_name: s.business_name || '', phone: s.phone || '', service_area: s.service_area || '', intro: s.intro || '', items: s.items?.length ? s.items : EXAMPLE_ITEMS, active: s.active !== false });
        }
        const reqs = await base44.entities.EstimateRequest.filter({ owner_id: me.id }, { sort: '-created_date', limit: 50 });
        setRequests(reqs.items || []);
      } catch {
        toast({ title: 'Could not load your estimator', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setItem = (i, key) => (e) => setForm((f) => {
    const items = f.items.map((it, j) => (j === i ? { ...it, [key]: key.startsWith('price') ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value } : it));
    return { ...f, items };
  });
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { service: '', price_low: '', price_high: '', unit: 'job', notes: '' }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }));

  const save = async () => {
    if (!form.business_name.trim()) { toast({ title: 'Add your business name first', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const data = { ...form, items: form.items.filter((i) => i.service?.trim()) };
      const saved = sheet ? await base44.entities.PriceSheet.update(sheet.id, data) : await base44.entities.PriceSheet.create(data);
      setSheet(saved);
      toast({ title: 'Price sheet saved' });
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const link = sheet ? `${window.location.origin}/estimate/${sheet.id}` : '';
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); toast({ title: 'Link copied' }); }
    catch { toast({ title: 'Copy failed. Select the link and copy it.', variant: 'destructive' }); }
  };

  const setStatus = async (r, status) => {
    try {
      await base44.entities.EstimateRequest.update(r.id, { status });
      setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
    } catch {
      toast({ title: 'Could not update', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full p-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Estimator</h1>
        <p className="text-muted-foreground text-sm mt-1">Send customers one link. They send photos or a video and get a free estimate from your own price sheet.</p>
      </div>

      {/* Share link */}
      <Card className="p-5">
        <h2 className="font-heading font-bold mb-1">Your estimate link</h2>
        {sheet ? (
          <>
            <p className="text-sm text-muted-foreground mb-3">Text or post this link. Anyone can use it, no account needed.</p>
            <div className="flex flex-wrap gap-2 items-center">
              <code className="flex-1 min-w-0 truncate rounded-md border bg-muted px-3 py-2 text-sm select-all">{link}</code>
              <Button variant="outline" onClick={copy}><Copy className="w-4 h-4 mr-2" /> Copy</Button>
              <Button variant="outline" asChild><a href={link} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" /> Open</a></Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Fill in your price sheet below and tap <b>Save</b>. Your link shows up here.</p>
        )}
      </Card>

      {/* Price sheet */}
      <Card className="p-5 flex flex-col gap-4">
        <h2 className="font-heading font-bold">Your price sheet</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5"><Label htmlFor="ps-name">Business name</Label><Input id="ps-name" value={form.business_name} onChange={setField('business_name')} placeholder="SteadyHand Service" /></div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="ps-phone">Business phone</Label><Input id="ps-phone" value={form.phone} onChange={setField('phone')} placeholder="(919) 555-0100" /></div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="ps-area">Service area</Label><Input id="ps-area" value={form.service_area} onChange={setField('service_area')} placeholder="Sanford, Lillington, Dunn" /></div>
        </div>
        <div className="flex flex-col gap-1.5"><Label htmlFor="ps-intro">Note to customers (optional)</Label><Input id="ps-intro" value={form.intro} onChange={setField('intro')} placeholder="Send a few photos and get a free estimate in about a minute." /></div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-left text-muted-foreground">
              <tr><th className="py-2 pr-2 font-medium">Service</th><th className="py-2 pr-2 font-medium w-28">Low $</th><th className="py-2 pr-2 font-medium w-28">High $</th><th className="py-2 pr-2 font-medium w-32">Priced per</th><th className="py-2 pr-2 font-medium">Notes</th><th className="w-10" /></tr>
            </thead>
            <tbody>
              {form.items.map((it, i) => (
                <tr key={i}>
                  <td className="py-1 pr-2"><Input aria-label="Service" value={it.service} onChange={setItem(i, 'service')} placeholder="e.g. Hood cleaning, 1 hood" /></td>
                  <td className="py-1 pr-2"><Input aria-label="Low price" type="number" min="0" value={it.price_low} onChange={setItem(i, 'price_low')} /></td>
                  <td className="py-1 pr-2"><Input aria-label="High price" type="number" min="0" value={it.price_high} onChange={setItem(i, 'price_high')} /></td>
                  <td className="py-1 pr-2"><Input aria-label="Priced per" value={it.unit} onChange={setItem(i, 'unit')} placeholder="job, hour, sq ft" /></td>
                  <td className="py-1 pr-2"><Input aria-label="Notes" value={it.notes} onChange={setItem(i, 'notes')} /></td>
                  <td className="py-1"><Button variant="ghost" size="icon" onClick={() => removeItem(i)} aria-label="Remove row"><Trash2 className="w-4 h-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <Button variant="outline" onClick={addItem}><Plus className="w-4 h-4 mr-2" /> Add a service</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save price sheet</Button>
        </div>
      </Card>

      {/* Requests with photos */}
      <Card className="p-5">
        <h2 className="font-heading font-bold mb-3">Estimate requests</h2>
        {requests.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Calculator className="w-8 h-8 mx-auto text-primary mb-3" />
            No requests yet. When a customer uses your link, their photos and estimate show up here.
          </div>
        ) : (
          <div className="flex flex-col divide-y">
            {requests.map((r) => (
              <div key={r.id} className="py-4 flex flex-col gap-3">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="font-semibold">{r.customer_name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> <span className="select-all">{r.customer_phone}</span>{r.customer_email && <span>· {r.customer_email}</span>}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-xl font-bold">{r.estimate_high ? `${money(r.estimate_low)}–${money(r.estimate_high)}` : 'Needs a look'}</div>
                    <select aria-label="Status" value={r.status || 'new'} onChange={(e) => setStatus(r, e.target.value)} className="mt-1 text-sm rounded-md border bg-background px-2 py-1 capitalize">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {r.description && <p className="text-sm">{r.description}</p>}
                {r.media_urls?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {r.media_urls.map((u, i) => (
                      <button key={u} type="button" onClick={() => setPhoto(u)} className="w-20 h-20 rounded-md overflow-hidden border hover:ring-2 hover:ring-primary" aria-label={`View photo ${i + 1} from ${r.customer_name}`}>
                        <img src={u} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                {r.summary && <p className="text-sm text-muted-foreground">{r.summary}</p>}
                {r.questions?.length > 0 && <p className="text-xs text-muted-foreground">Confirm: {r.questions.join(' · ')}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {photo && (
        <div role="dialog" aria-label="Photo" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPhoto(null)}>
          <img src={photo} alt="Customer photo" className="max-w-full max-h-full rounded-lg" />
          <span className="sr-only"><ImageIcon /> Tap anywhere to close</span>
        </div>
      )}
    </div>
  );
}
