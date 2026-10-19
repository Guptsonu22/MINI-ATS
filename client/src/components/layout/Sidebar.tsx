import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GitPullRequest, BarChart3, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/candidates', label: 'Candidates', icon: Users },
    { to: '/pipeline', label: 'Hiring Pipeline', icon: GitPullRequest },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-slate-200 bg-white flex-col justify-between py-5 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6 px-3">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="px-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <span>Mini ATS Active</span>
          </div>
          <p className="mt-1 text-slate-500 leading-relaxed">
            Full-stack recruitment system with candidate pipeline, real-time analytics, and status tracking.
          </p>
        </div>
      </div>
    </aside>
  );
};
