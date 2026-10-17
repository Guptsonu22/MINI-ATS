import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitPullRequest,
  BarChart3,
  Settings,
  HelpCircle,
  Database,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/candidates', label: 'Candidates', icon: Users, badge: 'Phase 6' },
    { to: '/pipeline', label: 'Hiring Pipeline', icon: GitPullRequest, badge: 'Phase 6' },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, badge: 'Phase 5' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between py-5 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6 px-3">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Recruitment Hub
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            System & Tools
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer">
              <Database className="h-4 w-4 text-slate-400" />
              <span>Database Status</span>
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer">
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Settings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <HelpCircle className="h-4 w-4 text-brand-600" />
            <span>Intern Assignment</span>
          </div>
          <p className="mt-1 text-slate-500 leading-relaxed">
            Full-Stack ATS Implementation. Phase 1 active.
          </p>
        </div>
      </div>
    </aside>
  );
};
