import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, MessageSquare } from 'lucide-react';

const SUGGESTIONS = [
  'Write a text to remind a customer about tomorrow\'s appointment',
  'Give me 3 Facebook post ideas for my business this week',
  'How should I follow up with someone who got a quote but went quiet?',
];

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

  const ask = async (text) => {
    const question = text.trim();
    if (!question || busy) return;
    const history = [...messages, { role: 'user', text: question }];
    setMessages(history);
    setDraft('');
    setError('');
    setBusy(true);
    try {
      const transcript = history
        .slice(-10)
        .map((m) => `${m.role === 'user' ? 'Owner' : 'Assistant'}: ${m.text}`)
        .join('\n\n');
      const prompt = `You are the S.C.A.L.E. assistant, a helpful business helper for owners of small local service businesses (trades, cleaners, groomers, shops). Answer in plain, simple words and short paragraphs or short lists. Be practical and specific. Never invent facts about the owner's business; ask if you need details. Never send messages yourself; when writing a text or email, give it as a draft for the owner to send.

Conversation so far:
${transcript}

Assistant:`;
      const reply = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages([...history, { role: 'assistant', text: typeof reply === 'string' ? reply : JSON.stringify(reply) }]);
    } catch (e) {
      setError('The assistant could not answer right now. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(draft); }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Ask Asst.</h1>
        <p className="text-muted-foreground text-sm mt-1">Ask anything about running your business. Get texts, posts and plans written for you.</p>
      </div>

      <div className="flex-1 flex flex-col gap-3 mb-4">
        {messages.length === 0 && (
          <Card className="p-6 text-center">
            <MessageSquare className="w-8 h-8 mx-auto text-primary mb-3" />
            <p className="font-medium mb-4">What can I help you with today?</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="text-sm text-left px-4 py-2 rounded-md border hover:border-primary hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-card border'
            }`}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="self-start flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(draft); }}
        className="sticky bottom-0 bg-background/95 backdrop-blur py-3 flex gap-2 items-end"
      >
        <Textarea
          id="assistant-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your question… (Enter to send, Shift+Enter for a new line)"
          rows={2}
          className="resize-none"
        />
        <Button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
