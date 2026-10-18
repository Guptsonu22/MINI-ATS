import React from 'react';
import { Link } from 'react-router-dom';
import { Candidate } from '../../types';
import { StageBadge } from '../candidates/StageBadge';
import { User, Calendar, Briefcase, ArrowRight, ExternalLink } from 'lucide-react';

interface RecentCandidatesProps {
  candidates: Candidate[];
}

export const RecentCandidates: React.FC<RecentCandidatesProps> = ({ candidates }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent Candidates</h3>
          <p className="text-xs text-slate-500">
            Latest applicants entered into the database with current pipeline status.
          </p>
        </div>
        <Link
          to="/candidates"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <span>View All Candidates</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          <User className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium">No candidates registered yet.</p>
          <p className="text-xs mt-0.5">Newly added applicants will appear here immediately.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {candidates.map(candidate => {
            const dateStr = candidate.applicationDate
              ? new Date(candidate.applicationDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={candidate.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/75 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs mt-0.5 sm:mt-0">
                    {candidate.name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/candidates/${candidate.id}`}
                        className="font-semibold text-sm text-slate-900 hover:text-brand-600 transition-colors flex items-center gap-1 group"
                      >
                        <span>{candidate.name}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                      </Link>
                      <StageBadge stage={candidate.currentStage} size="sm" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-slate-400" />
                        {candidate.appliedRole}
                      </span>
                      <span>•</span>
                      <span>{candidate.experience} yr exp</span>
                      <span>•</span>
                      <span className="text-slate-400">{candidate.source}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 pl-12 sm:pl-0">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {dateStr}
                  </span>
                  <Link
                    to={`/candidates/${candidate.id}`}
                    className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    <span>Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
