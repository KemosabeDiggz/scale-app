import { Outlet, Link, useLocation } from 'react-router-dom';
import { Workflow, Home as HomeIcon, PlusCircle, LayoutTemplate, Users, Calendar as CalendarIcon, Activity } from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/my-status', label: 'My Status', icon: Activity },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/workflows/new', label: 'New Workflow', icon: PlusCircle },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-64 shrink-0 bg-card border-r flex flex-col p-5">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Workflow className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-heading font-bold text-base">FlowForge</div>
            <div className="text-xs text-muted-foreground">Agentic Workflows</div>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto text-xs text-muted-foreground px-3">
          The #1 SaaS category of 2026
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}