import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  badgeText?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'slate';
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  badgeText,
  badgeColor = 'emerald',
}) => {
  const badgeColorClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-brand-600 border border-slate-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</div>
        {badgeText && (
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeColorClasses[badgeColor]}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtext && <p className="mt-2 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
};
