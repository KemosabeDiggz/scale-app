import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  MessageSquare, Rocket, Calendar as CalendarIcon, Users,
  Palette, Globe, LayoutTemplate, PlusCircle, Activity,
} from 'lucide-react';

// Left menu, top to bottom. Each group is one section of the sidebar.
const sections = [
  {
    title: null,
    items: [
      { to: '/assistant', label: 'Ask Asst.', icon: MessageSquare },
      { to: '/', label: 'LaunchPad', icon: Rocket },
      { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
      { to: '/contacts', label: 'Contacts', icon: Users },
    ],
  },
  {
    title: 'Design Studio',
    items: [
      { to: '/logo-designer', label: 'Logo Designer', icon: Palette },
      { to: '/website-designer', label: 'Website Designer', icon: Globe },
    ],
  },
  {
    title: 'Workflows',
    items: [
      { to: '/templates', label: 'Templates', icon: LayoutTemplate },
      { to: '/workflows/new', label: 'New Workflow', icon: PlusCircle },
      { to: '/my-status', label: 'My Status', icon: Activity },
    ],
  },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-64 shrink-0 bg-card border-r flex flex-col p-5">
        <Link to="/" className="mb-8 px-1">
          <div className="font-heading font-bold text-xl tracking-wide">
            S<span className="text-primary">.</span>C<span className="text-primary">.</span>A<span className="text-primary">.</span>L<span className="text-primary">.</span>E<span className="text-primary">.</span>
          </div>
          <div className="text-xs text-muted-foreground">No Missed Calls</div>
        </Link>
        <nav className="flex flex-col gap-6">
          {sections.map((section, i) => (
            <div key={section.title || i} className="flex flex-col gap-1">
              {section.title && (
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
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
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
