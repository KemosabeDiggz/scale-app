import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Palette, Download } from 'lucide-react';

const STYLES = [
  { id: 'modern', label: 'Modern', hint: 'clean, minimal, simple shapes' },
  { id: 'bold', label: 'Bold', hint: 'strong, thick lettering, high contrast' },
  { id: 'friendly', label: 'Friendly', hint: 'rounded, warm, approachable' },
  { id: 'classic', label: 'Classic', hint: 'timeless, trustworthy, badge or emblem' },
];
const HOW_MANY = 3;

export default function LogoDesigner() {
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [colors, setColors] = useState('navy blue and orange');
  const [style, setStyle] = useState('modern');
  const [busy, setBusy] = useState(false);
  const [logos, setLogos] = useState([]);
  const [error, setError] = useState('');

  const generate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !business.trim()) return;
    setBusy(true);
    setError('');
    setLogos([]);
    const s = STYLES.find((x) => x.id === style);
    const prompt = `A professional logo for a small business called "${name.trim()}", which is a ${business.trim()}. Style: ${s.label.toLowerCase()} (${s.hint}). Colors: ${colors.trim() || 'brand colors'}. Flat vector logo, centered on a plain white background, with a simple icon and the business name spelled exactly "${name.trim()}". No mockups, no extra text.`;
    try {
      const results = await Promise.allSettled(
        Array.from({ length: HOW_MANY }, () => base44.integrations.Core.GenerateImage({ prompt })),
      );
      const urls = results.filter((r) => r.status === 'fulfilled').map((r) => r.value.url);
      if (!urls.length) throw new Error('none');
      setLogos(urls);
    } catch (err) {
      setError('Could not make logos right now. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Logo Designer</h1>
        <p className="text-muted-foreground text-sm mt-1">Describe your business and get {HOW_MANY} logo ideas in about a minute.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] items-start">
        <Card className="p-5">
          <form onSubmit={generate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="logo-name">Business name</Label>
              <Input id="logo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="SteadyHand Service" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="logo-business">What do you do?</Label>
              <Input id="logo-business" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="kitchen hood cleaning company" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="logo-colors">Colors</Label>
              <Input id="logo-colors" value={colors} onChange={(e) => setColors(e.target.value)} placeholder="navy blue and orange" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Style</span>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    aria-pressed={style === s.id}
                    className={`text-sm px-3 py-2 rounded-md border transition-colors ${
                      style === s.id ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-muted'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={busy || !name.trim() || !business.trim()}>
              {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Designing…</> : <><Palette className="w-4 h-4 mr-2" /> Make my logos</>}
            </Button>
            <p className="text-xs text-muted-foreground">Tip: AI sometimes misspells words in logos. Check the name, and make a new batch if it's off.</p>
          </form>
        </Card>

        <div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          {busy && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: HOW_MANY }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg border bg-card animate-pulse" />
              ))}
            </div>
          )}
          {!busy && logos.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {logos.map((url, i) => (
                <Card key={url} className="p-3 flex flex-col gap-3">
                  <div className="aspect-square rounded-md bg-white overflow-hidden">
                    <img src={url} alt={`Logo idea ${i + 1} for ${name}`} className="w-full h-full object-contain" />
                  </div>
                  <a href={url} target="_blank" rel="noreferrer" className="text-sm inline-flex items-center gap-2 text-primary hover:underline">
                    <Download className="w-4 h-4" /> Open full size to save
                  </a>
                </Card>
              ))}
            </div>
          )}
          {!busy && !logos.length && !error && (
            <Card className="p-10 text-center text-muted-foreground">
              <Palette className="w-8 h-8 mx-auto text-primary mb-3" />
              Fill in your business details and tap <b>Make my logos</b>. Your ideas will show up here.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
