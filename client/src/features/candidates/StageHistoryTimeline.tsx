import React from 'react';
import { Clock, ArrowRight, User } from 'lucide-react';
import { StageHistoryEntry } from '../../types';
import { StageBadge } from './StageBadge';

interface StageHistoryTimelineProps {
  history: StageHistoryEntry[];
}

export const StageHistoryTimeline: React.FC<StageHistoryTimelineProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
        No stage transitions recorded yet.
      </div>
    );
  }

  // Sort descending by changedAt
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {sortedHistory.map((entry, index) => {
        const formattedDate = new Date(entry.changedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={index} className="relative group">
            {/* Timeline bullet dot */}
            <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-600 ring-2 ring-brand-100" />

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {entry.fromStage ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <StageBadge stage={entry.fromStage} size="sm" />
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <StageBadge stage={entry.toStage} size="sm" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="text-slate-400">Created in</span>
                      <StageBadge stage={entry.toStage} size="sm" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {entry.changedBy && (
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <User className="h-3 w-3 text-slate-400" />
                      {entry.changedBy}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {formattedDate}
                  </span>
                </div>
              </div>

              {entry.note && (
                <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100 leading-relaxed">
                  {entry.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
