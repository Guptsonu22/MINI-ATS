import React from 'react';
import { Candidate } from '../../types';
import { StageBadge } from '../candidates/StageBadge';
import { User, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentActivityProps {
  candidates: Candidate[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ candidates }) => {
  // Extract recent activities from candidate records and stage histories
  const activities = candidates
    .flatMap(c =>
      c.stageHistory.map(sh => ({
        candidateId: c.id,
        candidateName: c.name,
        appliedRole: c.appliedRole,
        toStage: sh.toStage,
        fromStage: sh.fromStage,
        changedAt: sh.changedAt,
        note: sh.note,
      }))
    )
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent Candidate Activity</h3>
          <p className="text-xs text-slate-500">Latest pipeline milestones and stage updates.</p>
        </div>
        <Link
          to="/candidates"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <span>All Candidates</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.map((act, index) => {
          const dateStr = new Date(act.changedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={index}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/75 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <Link
                    to={`/candidates/${act.candidateId}`}
                    className="font-semibold text-xs sm:text-sm text-slate-900 hover:text-brand-600 transition-colors"
                  >
                    {act.candidateName}
                  </Link>
                  <p className="text-[11px] text-slate-500">{act.appliedRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-11 sm:ml-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  {act.fromStage ? (
                    <>
                      <StageBadge stage={act.fromStage} size="sm" />
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400">New:</span>
                  )}
                  <StageBadge stage={act.toStage} size="sm" />
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  {dateStr}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
