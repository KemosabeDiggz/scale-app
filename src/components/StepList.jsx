import { Brain, Mail, Clock, CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react';

const typeIcon = {
  llm: Brain,
  email: Mail,
  wait: Clock,
};

const typeColor = {
  llm: 'text-violet-300 bg-violet-500/20',
  email: 'text-blue-300 bg-blue-500/20',
  wait: 'text-amber-300 bg-amber-500/20',
};

function StepStatus({ status }) {
  if (status === 'running') return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
  return <Circle className="w-4 h-4 text-muted-foreground" />;
}

export default function StepList({ steps, log }) {
  const logByName = {};
  if (log) log.forEach((s) => { logByName[s.name] = s; });

  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => {
        const Icon = typeIcon[step.type] || Circle;
        const entry = logByName[step.name] || {};
        return (
          <div key={i} className="border rounded-lg p-4 bg-card">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColor[step.type] || ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Step {i + 1}</span>
                  {log && <StepStatus status={entry.status} />}
                </div>
                <div className="font-medium text-sm">{step.name}</div>
                <div className="text-xs text-muted-foreground capitalize mb-2">{step.type} step</div>
                {step.type === 'llm' && step.prompt && (
                  <pre className="text-xs text-muted-foreground bg-muted/50 rounded p-2 whitespace-pre-wrap break-words border">{step.prompt}</pre>
                )}
                {step.type === 'email' && (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div><span className="font-medium text-foreground">To:</span> {step.to}</div>
                    <div><span className="font-medium text-foreground">Subject:</span> {step.subject}</div>
                    {step.body && <div className="mt-1 bg-muted/50 rounded p-2 border whitespace-pre-wrap break-words">{step.body}</div>}
                  </div>
                )}
                {step.type === 'wait' && (
                  <div className="text-xs text-muted-foreground">Wait {step.seconds}s</div>
                )}
                {entry.output && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-foreground mb-1">Output</div>
                    <pre className="text-xs bg-green-500/10 text-green-200 rounded p-2 whitespace-pre-wrap break-words border border-green-500/20 max-h-48 overflow-auto">{entry.output}</pre>
                  </div>
                )}
                {entry.error && (
                  <div className="mt-2 text-xs text-red-300 bg-red-500/10 rounded p-2 border border-red-500/20">{entry.error}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}