import React from 'react';
import { 
  Code2, 
  Terminal, 
  LayoutDashboard, 
  Trophy, 
  Swords, 
  Layers, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  isAdmin
}) => {
  const navItems = [
    { id: 'problems', label: 'Problems', icon: Code2 },
    { id: 'compiler', label: 'Playground', icon: Terminal },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'contests', label: 'Contests', icon: Swords },
    { id: 'projects', label: 'Mini-Projects', icon: Layers },
    { id: 'roadmaps', label: 'Roadmaps', icon: BookOpen },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldAlert }] : [])
  ];

  return (
    <aside
      className={`relative flex flex-col border-r transition-all duration-200 z-20 select-none ${
        collapsed ? 'w-16' : 'w-56'
      } bg-[var(--bg-card)] border-[var(--border-color)]`}
    >
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[var(--border-color)]">
        {!collapsed && (
          <div 
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-2 cursor-pointer font-bold text-base tracking-tight text-indigo-600 dark:text-emerald-400 font-mono"
          >
            <span>&lt;/&gt;</span>
            <span className="text-[var(--text-main)]">Code<span className="text-indigo-600 dark:text-emerald-400">Forge</span></span>
          </div>
        )}
        {collapsed && (
          <div 
            onClick={() => onSelectTab('landing')}
            className="mx-auto cursor-pointer font-bold text-lg text-indigo-600 dark:text-emerald-400 font-mono"
            title="CodeForge"
          >
            &lt;/&gt;
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors hidden md:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-emerald-950/40 text-indigo-600 dark:text-emerald-400 font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] font-mono text-center">
          v1.0 Production
        </div>
      )}
    </aside>
  );
};
