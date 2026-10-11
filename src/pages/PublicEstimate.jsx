import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Camera, X, Phone, ImagePlus, Video } from 'lucide-react';

const MAX_IMAGES = 6;
const FRAMES_PER_VIDEO = 4;
const MAX_SIDE = 1280;

// Shrink a picture (or a video frame) to a JPEG data URL the server can read.
function toJpeg(source, width, height) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}

async function photoToJpeg(file) {
  const bitmap = await createImageBitmap(file);
  const out = toJpeg(bitmap, bitmap.width, bitmap.height);
  bitmap.close?.();
  return out;
}

// The AI reads pictures, so pull a few still frames out of a video.
async function videoToJpegs(file, count) {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;
  try {
    await new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = reject; });
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
    const frames = [];
    for (let i = 1; i <= count; i++) {
      await new Promise((resolve) => { video.onseeked = resolve; video.currentTime = (duration * i) / (count + 1); });
      frames.push(toJpeg(video, video.videoWidth, video.videoHeight));
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

export default function PublicEstimate() {
  const { sheetId } = useParams();
  const [biz, setBiz] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', description: '' });
  const [media, setMedia] = useState([]); // { id, kind: 'photo' | 'video', name, preview, file }
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const photoInput = useRef(null);
  const cameraInput = useRef(null);

  useEffect(() => {
    base44.functions.invoke('getPublicPriceSheet', { sheet_id: sheetId })
      .then((res) => {
        const data = res?.data ?? res;
        if (data?.error) setLoadError(data.error); else setBiz(data);
      })
      .catch(() => setLoadError('This estimate link is not active.'));
  }, [sheetId]);

  useEffect(() => () => media.forEach((m) => URL.revokeObjectURL(m.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addFiles = (fileList) => {
    const added = [...fileList]
      .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map((file) => ({
        id: `${file.name}-${file.size}-${Math.random()}`,
        kind: file.type.startsWith('video/') ? 'video' : 'photo',
        name: file.name,
        preview: URL.createObjectURL(file),
        file,
      }));
    setMedia((m) => [...m, ...added].slice(0, 8));
  };

  const remove = (id) => setMedia((m) => {
    const gone = m.find((x) => x.id === id);
    if (gone) URL.revokeObjectURL(gone.preview);
    return m.filter((x) => x.id !== id);
  });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim()) { setError('Please add your name and phone number.'); return; }
    if (!media.length && form.description.trim().length < 10) { setError('Please add a photo, a video or a short description of the job.'); return; }

    try {
      setBusy('Getting your photos ready…');
      const images = [];
      for (const m of media) {
        if (images.length >= MAX_IMAGES) break;
        try {
          if (m.kind === 'photo') images.push(await photoToJpeg(m.file));
          else images.push(...(await videoToJpegs(m.file, FRAMES_PER_VIDEO)));
        } catch {
          // Skip files this browser can't read (for example some iPhone formats)
        }
      }
      setBusy('Working out your estimate… this takes about 30 seconds.');
      const res = await base44.functions.invoke('createEstimate', {
        sheet_id: sheetId,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email.trim(),
        description: form.description.trim(),
        images: images.slice(0, MAX_IMAGES),
      });
      const data = res?.data ?? res;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.message && err.message.length < 120 ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy('');
    }
  };

  if (loadError) {
    return <Shell><Card className="p-8 text-center">{loadError}</Card></Shell>;
  }
  if (!biz) {
    return <Shell><div className="flex justify-center p-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></Shell>;
  }

  if (result) {
    return (
      <Shell biz={biz}>
        <Card className="p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Your free estimate</p>
          {result.line_items.length ? (
            <div className="font-heading text-4xl sm:text-5xl font-bold mb-3">
              {money(result.estimate_low)}{result.estimate_high > result.estimate_low ? `–${money(result.estimate_high)}` : ''}
            </div>
          ) : (
            <div className="font-heading text-2xl font-bold mb-3">{biz.business_name} will follow up with a price</div>
          )}
          <p className="text-muted-foreground mb-6">{result.summary}</p>
          {result.line_items.length > 0 && (
            <div className="border rounded-lg divide-y mb-6">
              {result.line_items.map((l, i) => (
                <div key={i} className="flex justify-between gap-4 p-3 text-sm">
                  <div><div className="font-medium">{l.service}</div>{l.detail && <div className="text-muted-foreground">{l.detail}</div>}</div>
                  <div className="font-medium whitespace-nowrap">{money(l.low)}{l.high > l.low ? `–${money(l.high)}` : ''}</div>
                </div>
              ))}
            </div>
          )}
          {result.questions?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">{biz.business_name} may ask about:</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">{result.questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </div>
          )}
          <p className="text-xs text-muted-foreground mb-6">This is a free estimate based on your photos and {biz.business_name}'s price sheet. The final price is confirmed by {biz.business_name} before any work starts. They have your request and will reach out.</p>
          {biz.phone && (
            <p className="text-sm">Questions? Call or text <b className="select-all">{biz.phone}</b></p>
          )}
        </Card>
      </Shell>
    );
  }

  return (
    <Shell biz={biz}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <Card className="p-5 sm:p-6 flex flex-col gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Photos &amp; videos</h2>
            <p className="text-sm text-muted-foreground">Show us the job. Clear photos from a few angles give the best estimate.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => cameraInput.current?.click()} className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/60 bg-primary/5 p-5 text-sm font-medium hover:bg-primary/10 transition-colors">
              <Camera className="w-7 h-7 text-primary" /> Take a photo or video
            </button>
            <button type="button" onClick={() => photoInput.current?.click()} className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-5 text-sm font-medium hover:bg-muted transition-colors">
              <ImagePlus className="w-7 h-7 text-primary" /> Choose from my phone
            </button>
          </div>
          <input ref={cameraInput} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          <input ref={photoInput} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />

          {media.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {media.map((m) => (
                <div key={m.id} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                  {m.kind === 'photo'
                    ? <img src={m.preview} alt={m.name} className="w-full h-full object-cover" />
                    : <video src={m.preview} muted playsInline className="w-full h-full object-cover" />}
                  {m.kind === 'video' && <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] rounded px-1.5 py-0.5 flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>}
                  <button type="button" onClick={() => remove(m.id)} aria-label={`Remove ${m.name}`} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="est-desc">Tell us about the job</Label>
            <Textarea id="est-desc" value={form.description} onChange={set('description')} rows={3} placeholder="What do you need done? Sizes, how many, anything we should know." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="est-name">Your name</Label>
              <Input id="est-name" value={form.name} onChange={set('name')} autoComplete="name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="est-phone">Phone</Label>
              <Input id="est-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="est-email">Email (optional)</Label>
            <Input id="est-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={!!busy}>
          {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {busy}</> : 'Get my free estimate'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">By sending, you agree {biz.business_name} may contact you about this estimate.</p>
      </form>
    </Shell>
  );
}

function Shell({ biz, children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {biz && (
          <header className="mb-6">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">{biz.business_name}</h1>
            <p className="text-muted-foreground mt-1">{biz.intro || 'Get a free estimate in about a minute. Just send photos or a video of the job.'}</p>
            {biz.phone && <p className="text-sm mt-2 flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> <span className="select-all">{biz.phone}</span>{biz.service_area && <span className="text-muted-foreground">· {biz.service_area}</span>}</p>}
          </header>
        )}
        {children}
        <p className="text-center text-xs text-muted-foreground mt-10">Free estimates powered by S.C.A.L.E.</p>
      </div>
    </div>
  );
}
