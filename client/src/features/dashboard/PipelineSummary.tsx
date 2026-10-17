import React from 'react';
import { CanonicalStage } from '../../types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PipelineSummaryProps {
  stageCounts: Record<CanonicalStage, number>;
  totalCandidates: number;
}

export const PipelineSummary: React.FC<PipelineSummaryProps> = ({
  stageCounts,
  totalCandidates,
}) => {
  const stages: Array<{
    name: CanonicalStage;
    barColor: string;
    border: string;
    bg: string;
    textColor: string;
  }> = [
    {
      name: 'Applied',
      barColor: 'bg-slate-500',
      border: 'border-slate-200',
      bg: 'bg-slate-50',
      textColor: 'text-slate-800',
    },
    {
      name: 'Screening',
      barColor: 'bg-purple-500',
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      textColor: 'text-purple-800',
    },
    {
      name: 'Interview',
      barColor: 'bg-blue-500',
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      textColor: 'text-blue-800',
    },
    {
      name: 'Offer',
      barColor: 'bg-amber-500',
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      textColor: 'text-amber-800',
    },
    {
      name: 'Hired',
      barColor: 'bg-emerald-500',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-800',
    },
    {
      name: 'Rejected',
      barColor: 'bg-rose-500',
      border: 'border-rose-200',
      bg: 'bg-rose-50',
      textColor: 'text-rose-800',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Hiring Pipeline Distribution</h3>
          <p className="text-xs text-slate-500">
            Current applicant funnel across the 6 canonical ATS stages.
          </p>
        </div>
        <Link
          to="/pipeline"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <span>View Pipeline</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage, idx) => {
          const count = stageCounts[stage.name] || 0;
          const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;

          return (
            <div
              key={stage.name}
              className={`rounded-xl border p-3.5 flex flex-col justify-between ${stage.bg} ${stage.border}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${stage.textColor}`}>{stage.name}</span>
                <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
              </div>

              <div className="my-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">{count}</span>
                  <span className="text-xs font-semibold text-slate-500">{percentage}%</span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/70 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.barColor}`}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
              </div>

              <span className="text-[10px] text-slate-500 font-medium">
                {count === 1 ? '1 candidate' : `${count} candidates`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
