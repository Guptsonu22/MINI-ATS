import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
} from 'lucide-react';
import { Candidate } from '../../types';
import { StageBadge } from './StageBadge';
import { EmptyState } from '../../components/ui/EmptyState';

export type CandidateSortField = 'applicationDate' | 'name' | 'experience';

interface CandidateTableProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidate: Candidate) => void;
  page: number;
  totalPages: number;
  totalCandidates: number;
  limit?: number;
  onPageChange: (newPage: number) => void;
  onResetFilters?: () => void;
  sortBy?: CandidateSortField;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: CandidateSortField) => void;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  onEdit,
  onDelete,
  page,
  totalPages,
  totalCandidates,
  limit = 10,
  onPageChange,
  onResetFilters,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const navigate = useNavigate();

  const renderSortIcon = (field: CandidateSortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400 group-hover/col:text-slate-600" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-brand-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-brand-600" />
    );
  };

  if (candidates.length === 0) {
    return (
      <EmptyState
        title="No candidates found"
        description="No applicant records match your active search or filter criteria. Try adjusting or clearing filters."
        actionLabel="Reset all filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
              <th className="py-3.5 px-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => onSortChange?.('name')}
                  className="inline-flex items-center gap-1 font-semibold uppercase hover:text-slate-900 group/col focus:outline-none"
                >
                  <span>Candidate</span>
                  {renderSortIcon('name')}
                </button>
              </th>
              <th className="py-3.5 px-4">Applied Role</th>
              <th className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => onSortChange?.('experience')}
                  className="inline-flex items-center gap-1 font-semibold uppercase hover:text-slate-900 group/col focus:outline-none"
                >
                  <span>Experience</span>
                  {renderSortIcon('experience')}
                </button>
              </th>
              <th className="py-3.5 px-4">Current Stage</th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => onSortChange?.('applicationDate')}
                  className="inline-flex items-center gap-1 font-semibold uppercase hover:text-slate-900 group/col focus:outline-none"
                >
                  <span>Applied Date</span>
                  {renderSortIcon('applicationDate')}
                </button>
              </th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map(candidate => {
              const initials = candidate.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              const formattedDate = new Date(candidate.applicationDate).toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }
              );

              return (
                <tr
                  key={candidate.id}
                  className="hover:bg-slate-50/75 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                >
                  {/* Candidate Profile */}
                  <td className="py-3 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate hover:text-brand-600 transition-colors">
                          {candidate.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="inline-flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {candidate.email}
                          </span>
                          <span className="hidden md:inline-flex items-center gap-1 truncate">
                            • <Phone className="h-3 w-3 text-slate-400" />
                            {candidate.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800 text-xs sm:text-sm">
                      {candidate.appliedRole}
                    </p>
                  </td>

                  {/* Experience */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {candidate.experience} {candidate.experience === 1 ? 'yr' : 'yrs'}
                    </span>
                  </td>

                  {/* Current Stage */}
                  <td className="py-3 px-4">
                    <StageBadge stage={candidate.currentStage} size="sm" />
                  </td>

                  {/* Source */}
                  <td className="py-3 px-4 text-xs text-slate-500">
                    <span className="truncate max-w-[120px] block">{candidate.source}</span>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-4 sm:px-6 text-right whitespace-nowrap"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                        title="View Candidate Details"
                        aria-label={`View ${candidate.name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(candidate)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition-colors"
                        title="Edit Candidate Information"
                        aria-label={`Edit ${candidate.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(candidate)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                        title="Delete Candidate Record"
                        aria-label={`Delete ${candidate.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {candidate.resumeUrl && (
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          title="View Resume PDF"
                          aria-label="View Resume"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 sm:px-6 py-3 text-xs text-slate-600">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {totalCandidates === 0 ? 0 : (page - 1) * limit + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-900">
            {Math.min(page * limit, totalCandidates)}
          </span>{' '}
          of <span className="font-semibold text-slate-900">{totalCandidates}</span> candidates
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>
          <span className="px-2 font-medium text-slate-700">
            Page {page} of {Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
