import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Globe, Download } from 'lucide-react';

export default function WebsiteDesigner() {
  const [form, setForm] = useState({
    name: '',
    services: '',
    area: '',
    phone: '',
    colors: 'navy blue and orange',
  });
  const [busy, setBusy] = useState(false);
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const generate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.services.trim()) return;
    setBusy(true);
    setError('');
    const prompt = `Build a complete, single-file, mobile-friendly one-page website for a small local service business.

Business name: ${form.name.trim()}
Services: ${form.services.trim()}
Service area: ${form.area.trim() || 'not given'}
Phone: ${form.phone.trim() || 'not given'}
Brand colors: ${form.colors.trim() || 'pick tasteful colors'}

Requirements:
- One HTML document with all CSS inside a <style> tag. No external scripts. Google Fonts allowed.
- Sections: header with name and a "Call" button, hero with a clear headline, services list, why choose us, service area, and a contact section.
- Use only the details above. Do not invent reviews, awards, licenses, years in business, prices or addresses. Use placeholders like [Your email] for anything missing.
- If a phone number is given, use a tel: link for the Call buttons.
- Plain, friendly wording that a local customer understands.`;
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: { html: { type: 'string', description: 'The full HTML document' } },
          required: ['html'],
        },
      });
      if (!res?.html) throw new Error('empty');
      setHtml(res.html);
    } catch (err) {
      setError('Could not build the website right now. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(form.name.trim() || 'my-website').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Website Designer</h1>
        <p className="text-muted-foreground text-sm mt-1">Tell us about your business and get a ready-to-use one-page website.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] items-start">
        <Card className="p-5">
          <form onSubmit={generate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="web-name">Business name</Label>
              <Input id="web-name" value={form.name} onChange={set('name')} placeholder="SteadyHand Service" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="web-services">What services do you offer?</Label>
              <Textarea id="web-services" value={form.services} onChange={set('services')} rows={3} placeholder="Kitchen hood cleaning, filter cleaning, exhaust fan cleaning" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="web-area">Where do you work?</Label>
              <Input id="web-area" value={form.area} onChange={set('area')} placeholder="Sanford, Lillington, Dunn" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="web-phone">Business phone</Label>
              <Input id="web-phone" value={form.phone} onChange={set('phone')} placeholder="(919) 555-0100" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="web-colors">Colors</Label>
              <Input id="web-colors" value={form.colors} onChange={set('colors')} />
            </div>
            <Button type="submit" disabled={busy || !form.name.trim() || !form.services.trim()}>
              {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building… (about a minute)</> : <><Globe className="w-4 h-4 mr-2" /> {html ? 'Make a new version' : 'Build my website'}</>}
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-3 min-w-0">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {html ? (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground">Preview. Check the details before you use it.</p>
                <Button variant="outline" onClick={download}><Download className="w-4 h-4 mr-2" /> Download website</Button>
              </div>
              <div className="rounded-lg border overflow-hidden bg-white">
                <iframe title="Website preview" srcDoc={html} sandbox="" className="w-full h-[70vh] block" />
              </div>
            </>
          ) : (
            <Card className="p-10 text-center text-muted-foreground">
              <Globe className="w-8 h-8 mx-auto text-primary mb-3" />
              {busy ? 'Building your website…' : <>Fill in your business details and tap <b>Build my website</b>. Your preview will show up here.</>}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
