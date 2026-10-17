import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { MOCK_ROLES } from '../../data/mockCandidates';

interface CandidateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedStage: string;
  onStageChange: (stage: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedExp: string;
  onExpChange: (exp: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const CandidateFilters: React.FC<CandidateFiltersProps> = ({
  search,
  onSearchChange,
  selectedStage,
  onStageChange,
  selectedRole,
  onRoleChange,
  selectedExp,
  onExpChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const stageOptions = [
    { label: 'All Stages', value: '' },
    { label: 'Applied', value: 'Applied' },
    { label: 'Screening', value: 'Screening' },
    { label: 'Interview', value: 'Interview' },
    { label: 'Offer', value: 'Offer' },
    { label: 'Hired', value: 'Hired' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  const roleOptions = [
    { label: 'All Roles', value: '' },
    ...MOCK_ROLES.map(role => ({ label: role, value: role })),
  ];

  const expOptions = [
    { label: 'All Experience', value: '' },
    { label: 'Entry Level (0-2 yrs)', value: '0-2' },
    { label: 'Mid Level (3-5 yrs)', value: '3-5' },
    { label: 'Senior Level (5+ yrs)', value: '5+' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Search Candidates
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search by candidate name or email..."
              className="block w-full rounded-lg border border-slate-300 pl-9 pr-8 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stage Filter */}
        <div>
          <Select
            label="Hiring Stage"
            options={stageOptions}
            value={selectedStage}
            onChange={e => onStageChange(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <div>
          <Select
            label="Applied Role"
            options={roleOptions}
            value={selectedRole}
            onChange={e => onRoleChange(e.target.value)}
          />
        </div>

        {/* Experience Filter */}
        <div>
          <Select
            label="Experience"
            options={expOptions}
            value={selectedExp}
            onChange={e => onExpChange(e.target.value)}
          />
        </div>
      </div>

      {/* Active Filter Chips & Clear Action */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-medium">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200">
                Query: "{search}"
                <button type="button" onClick={() => onSearchChange('')} className="hover:text-rose-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedStage && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200">
                Stage: {selectedStage}
                <button type="button" onClick={() => onStageChange('')} className="hover:text-rose-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedRole && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200">
                Role: {selectedRole}
                <button type="button" onClick={() => onRoleChange('')} className="hover:text-rose-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedExp && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200">
                Exp: {selectedExp} yrs
                <button type="button" onClick={() => onExpChange('')} className="hover:text-rose-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            leftIcon={<RotateCcw className="h-3 w-3" />}
            className="text-slate-500 hover:text-slate-900 ml-auto"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};
