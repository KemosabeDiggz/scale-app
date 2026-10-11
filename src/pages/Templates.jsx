import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { WORKFLOW_TEMPLATES } from '@/lib/workflowTemplates';
import { useToast } from '@/components/ui/use-toast';

export default function Templates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState(null);
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(WORKFLOW_TEMPLATES.map((t) => t.category)))],
    []
  );

  const visible = useMemo(
    () => (category === 'All' ? WORKFLOW_TEMPLATES : WORKFLOW_TEMPLATES.filter((t) => t.category === category)),
    [category]
  );

  const addTemplate = async (tpl) => {
    setBusyId(tpl.id);
    try {
      const created = await base44.entities.Workflow.create({
        name: tpl.name,
        description: tpl.description,
        trigger_prompt: tpl.trigger_prompt,
        steps: tpl.steps,
        status: 'active',
      });
      toast({ title: 'Template added', description: `${tpl.name} is ready to run.` });
      navigate(`/workflows/${created.id}`);
    } catch (e) {
      toast({ title: 'Failed to add template', description: e.message, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Workflow Templates</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {WORKFLOW_TEMPLATES.length} agentic workflows predicting the SaaS &amp; AI agents businesses need through 2030.
          Click <span className="font-medium">Use Template</span> to add one and run it.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              category === c ? 'bg-primary text-primary-foreground border-transparent' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {visible.map((tpl) => (
          <Card key={tpl.id} className="p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="font-heading font-semibold text-base">{tpl.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{tpl.tagline}</div>
              </div>
              {tpl.rank ? (
                <Badge className="bg-amber-500/20 text-amber-300 border-transparent shrink-0">
                  <Trophy className="w-3 h-3 mr-1" /> {tpl.rank}
                </Badge>
              ) : (
                <Badge variant="outline" className="shrink-0">{tpl.category}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{tpl.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {tpl.steps.length} steps
              </span>
              <Button size="sm" onClick={() => addTemplate(tpl)} disabled={busyId === tpl.id}>
                {busyId === tpl.id ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-1" />
                )}
                Use Template
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}