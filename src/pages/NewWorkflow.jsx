import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Save, Trash2 } from 'lucide-react';
import StepList from '@/components/StepList';
import { useToast } from '@/components/ui/use-toast';

const examples = [
  'Research a company and write a personalized sales outreach email to their VP of Marketing',
  'Summarize customer feedback from a survey into a report and email it to the product team',
  'Analyze a job description, write a tailored cover letter, and email it to the recruiter',
  'Generate a weekly market report for a SaaS niche and email it to me',
];

export default function NewWorkflow() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState('');
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    if (job.trim().length < 10) {
      toast({ title: 'Add more detail', description: 'Describe the job in at least a sentence.', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateWorkflowPlan', { job_description: job });
      setPlan(res.data.plan);
    } catch (e) {
      toast({ title: 'Generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const removeStep = (i) => {
    setPlan((p) => ({ ...p, steps: p.steps.filter((_, idx) => idx !== i) }));
  };

  const save = async () => {
    if (!plan || !plan.steps || plan.steps.length === 0) return;
    setSaving(true);
    try {
      const created = await base44.entities.Workflow.create({
        name: plan.name,
        description: plan.description,
        trigger_prompt: job,
        steps: plan.steps,
        status: 'active',
      });
      toast({ title: 'Workflow saved' });
      navigate(`/workflows/${created.id}`);
    } catch (e) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-heading font-bold mb-1">New Workflow</h1>
      <p className="text-muted-foreground text-sm mb-6">Describe a job in plain English. AI will design the autonomous workflow.</p>

      <Card className="p-5 mb-4">
        <Label className="mb-2 block">What job should this workflow complete?</Label>
        <Textarea
          value={job}
          onChange={(e) => setJob(e.target.value)}
          rows={4}
          placeholder="e.g. Research a company and write a personalized sales email to their VP of Marketing"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setJob(ex)}
              className="text-xs px-3 py-1.5 rounded-full border bg-muted/50 hover:bg-muted text-left"
            >
              {ex.length > 50 ? ex.slice(0, 50) + '…' : ex}
            </button>
          ))}
        </div>
        <Button className="mt-4" onClick={generate} disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {generating ? 'Designing workflow…' : 'Generate Workflow'}
        </Button>
      </Card>

      {plan && (
        <Card className="p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold">Review & Edit</h2>
            <Button onClick={save} disabled={saving || plan.steps.length === 0}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Workflow
            </Button>
          </div>
          <div className="space-y-3 mb-4">
            <div>
              <Label className="mb-1 block">Name</Label>
              <Input value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block">Description</Label>
              <Input value={plan.description} onChange={(e) => setPlan({ ...plan, description: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Steps ({plan.steps.length})</span>
          </div>
          <div className="flex flex-col gap-3">
            {plan.steps.map((step, i) => (
              <div key={i} className="relative">
                <button
                  onClick={() => removeStep(i)}
                  className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <StepList steps={[step]} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}