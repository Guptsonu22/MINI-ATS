import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Candidate } from '../types';
import { INITIAL_MOCK_CANDIDATES } from '../data/mockCandidates';
import { CandidateFilters } from '../features/candidates/CandidateFilters';
import { CandidateTable } from '../features/candidates/CandidateTable';
import { CandidateFormModal } from '../features/candidates/CandidateFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';

export const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_MOCK_CANDIDATES);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedExp, setSelectedExp] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);

  // Filter candidates logic
  const filteredCandidates = useMemo(() => {
    return candidates.filter(cand => {
      // Search by name or email
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesName = cand.name.toLowerCase().includes(query);
        const matchesEmail = cand.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }

      // Filter by stage
      if (selectedStage && cand.currentStage !== selectedStage) {
        return false;
      }

      // Filter by role
      if (selectedRole && cand.appliedRole !== selectedRole) {
        return false;
      }

      // Filter by experience
      if (selectedExp) {
        if (selectedExp === '0-2' && (cand.experience < 0 || cand.experience > 2)) return false;
        if (selectedExp === '3-5' && (cand.experience < 3 || cand.experience > 5)) return false;
        if (selectedExp === '5+' && cand.experience < 5) return false;
      }

      return true;
    });
  }, [candidates, search, selectedStage, selectedRole, selectedExp]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCandidates, currentPage]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStage('');
    setSelectedRole('');
    setSelectedExp('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(search || selectedStage || selectedRole || selectedExp);

  // Create or Update Candidate
  const handleSaveCandidate = (candData: Partial<Candidate>) => {
    if (editingCandidate) {
      // Update
      setCandidates(prev =>
        prev.map(c =>
          c.id === editingCandidate.id
            ? {
                ...c,
                ...candData,
                stageHistory:
                  candData.currentStage && candData.currentStage !== c.currentStage
                    ? [
                        ...c.stageHistory,
                        {
                          fromStage: c.currentStage,
                          toStage: candData.currentStage,
                          changedAt: new Date().toISOString(),
                          note: 'Stage updated in edit form.',
                          changedBy: 'Recruiter',
                        },
                      ]
                    : c.stageHistory,
              }
            : c
        )
      );
    } else {
      // Create
      const newCand: Candidate = {
        id: `cand-${Date.now()}`,
        name: candData.name || 'Anonymous',
        email: candData.email || '',
        phone: candData.phone || '',
        appliedRole: candData.appliedRole || 'Full Stack Developer',
        experience: candData.experience || 0,
        source: candData.source || 'Direct',
        skills: candData.skills || [],
        currentStage: candData.currentStage || 'Applied',
        applicationDate: new Date().toISOString(),
        resumeUrl: candData.resumeUrl,
        notes: candData.notes,
        stageHistory: [
          {
            fromStage: null,
            toStage: candData.currentStage || 'Applied',
            changedAt: new Date().toISOString(),
            note: 'Candidate record created.',
            changedBy: 'Recruiter',
          },
        ],
      };
      setCandidates(prev => [newCand, ...prev]);
    }

    setIsFormModalOpen(false);
    setEditingCandidate(null);
  };

  // Delete candidate confirmation
  const handleConfirmDelete = () => {
    if (deletingCandidate) {
      setCandidates(prev => prev.filter(c => c.id !== deletingCandidate.id));
      setDeletingCandidate(null);
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
              {filteredCandidates.length} Total
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

      {/* Candidates Data Table */}
      <CandidateTable
        candidates={paginatedCandidates}
        onEdit={cand => {
          setEditingCandidate(cand);
          setIsFormModalOpen(true);
        }}
        onDelete={cand => setDeletingCandidate(cand)}
        page={currentPage}
        totalPages={totalPages}
        totalCandidates={filteredCandidates.length}
        onPageChange={page => setCurrentPage(page)}
        onResetFilters={handleClearFilters}
      />

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
        confirmText="Delete Candidate"
        variant="danger"
      />
    </div>
  );
};
