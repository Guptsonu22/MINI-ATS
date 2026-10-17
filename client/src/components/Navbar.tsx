import React from 'react';
import { Briefcase, Bell, Search, UserCheck } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isBackendHealthy?: boolean | null;
}

export const Navbar: React.FC<NavbarProps> = ({ isBackendHealthy }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-lg">Mini ATS</span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200">
              Recruiter SaaS
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">Applicant Tracking System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend health status badge */}
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${
            isBackendHealthy === true
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isBackendHealthy === false
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title="Backend API Connection Status"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isBackendHealthy === true
                ? 'bg-emerald-500 animate-pulse'
                : isBackendHealthy === false
                  ? 'bg-rose-500'
                  : 'bg-amber-500 animate-bounce'
            }`}
          />
          <span className="hidden sm:inline">
            {isBackendHealthy === true
              ? 'API Online'
              : isBackendHealthy === false
                ? 'API Disconnected'
                : 'Checking API...'}
          </span>
        </div>

        {/* Global search quick button */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400 w-64 cursor-not-allowed">
          <Search className="h-3.5 w-3.5" />
          <span>Quick candidate search...</span>
          <kbd className="ml-auto rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-200">
            Ctrl+K
          </kbd>
        </div>

        {/* Recruiter profile */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-semibold text-xs">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-slate-800">Recruiting Team</p>
              <p className="text-slate-400">admin@recruiter.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
