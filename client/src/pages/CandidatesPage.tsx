import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertTriangle, RotateCcw } from 'lucide-react';
import { Candidate, PaginationData } from '../types';
import { CandidateFilters } from '../features/candidates/CandidateFilters';
import { CandidateTable, CandidateSortField } from '../features/candidates/CandidateTable';
import { CandidateFormModal } from '../features/candidates/CandidateFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { candidatesApi } from '../api/candidates.api';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';

export const CandidatesPage: React.FC = () => {
  const { addToast } = useToast();

  // Data State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalCandidates: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Query State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedExp, setSelectedExp] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<CandidateSortField>('applicationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch candidates from real API
  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let minExp: number | undefined;
      let maxExp: number | undefined;
      if (selectedExp === '0-2') {
        minExp = 0;
        maxExp = 2;
      } else if (selectedExp === '3-5') {
        minExp = 3;
        maxExp = 5;
      } else if (selectedExp === '5+') {
        minExp = 5;
      }

      const response = await candidatesApi.getCandidates({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch.trim() || undefined,
        stage: selectedStage || undefined,
        role: selectedRole || undefined,
        minExp,
        maxExp,
        sortBy,
        sortOrder,
      });

      setCandidates(response.candidates);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the ATS API server. Please check your network connection.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearch,
    selectedStage,
    selectedRole,
    selectedExp,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStage('');
    setSelectedRole('');
    setSelectedExp('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(search || selectedStage || selectedRole || selectedExp);

  const handleSortChange = (field: CandidateSortField) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Create or Update Candidate
  const handleSaveCandidate = async (candData: Partial<Candidate>) => {
    try {
      if (editingCandidate) {
        await candidatesApi.updateCandidate(editingCandidate.id, {
          name: candData.name,
          email: candData.email,
          phone: candData.phone,
          appliedRole: candData.appliedRole,
          experience: candData.experience,
          source: candData.source,
          skills: candData.skills,
          currentStage: candData.currentStage,
          resumeUrl: candData.resumeUrl,
          notes: candData.notes,
        });
        addToast(`Updated ${candData.name || 'candidate'} profile successfully`, 'success');
      } else {
        await candidatesApi.createCandidate({
          name: candData.name!,
          email: candData.email!,
          phone: candData.phone!,
          appliedRole: candData.appliedRole!,
          experience: candData.experience!,
          source: candData.source!,
          skills: candData.skills || [],
          currentStage: candData.currentStage || 'Applied',
          resumeUrl: candData.resumeUrl,
          notes: candData.notes,
        });
        addToast(`Candidate ${candData.name} registered successfully`, 'success');
      }

      setIsFormModalOpen(false);
      setEditingCandidate(null);
      await fetchCandidates();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save candidate';
      addToast(msg, 'error');
      throw err; // Let CandidateFormModal display inline server error
    }
  };

  // Delete candidate confirmation
  const handleConfirmDelete = async () => {
    if (!deletingCandidate) return;

    setIsDeleting(true);
    try {
      await candidatesApi.deleteCandidate(deletingCandidate.id);
      addToast(`Candidate ${deletingCandidate.name} deleted successfully`, 'success');
      setDeletingCandidate(null);
      await fetchCandidates();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete candidate';
      addToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Candidate Directory
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
              {pagination.totalCandidates} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, evaluate, and manage candidate hiring progress.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingCandidate(null);
            setIsFormModalOpen(true);
          }}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Candidate
        </Button>
      </div>

      {/* Filter Controls */}
      <CandidateFilters
        search={search}
        onSearchChange={val => {
          setSearch(val);
          setCurrentPage(1);
        }}
        selectedStage={selectedStage}
        onStageChange={val => {
          setSelectedStage(val);
          setCurrentPage(1);
        }}
        selectedRole={selectedRole}
        onRoleChange={val => {
          setSelectedRole(val);
          setCurrentPage(1);
        }}
        selectedExp={selectedExp}
        onExpChange={val => {
          setSelectedExp(val);
          setCurrentPage(1);
        }}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Server Error State */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center space-y-3">
          <div className="flex justify-center text-rose-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-rose-900">Unable to Load Candidates</h3>
          <p className="text-xs sm:text-sm text-rose-700 max-w-md mx-auto">{error}</p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={fetchCandidates}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && <TableSkeleton rows={itemsPerPage} />}

      {/* Candidates Data Table */}
      {!isLoading && !error && (
        <CandidateTable
          candidates={candidates}
          onEdit={cand => {
            setEditingCandidate(cand);
            setIsFormModalOpen(true);
          }}
          onDelete={cand => setDeletingCandidate(cand)}
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalCandidates={pagination.totalCandidates}
          limit={pagination.limit}
          onPageChange={page => setCurrentPage(page)}
          onResetFilters={handleClearFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      )}

      {/* Create / Edit Candidate Modal */}
      <CandidateFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCandidate(null);
        }}
        onSubmit={handleSaveCandidate}
        initialData={editingCandidate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCandidate)}
        onClose={() => setDeletingCandidate(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Candidate Record"
        message={`Are you sure you want to delete ${deletingCandidate?.name}? This action removes their profile and interview history from the active pipeline.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Candidate'}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
