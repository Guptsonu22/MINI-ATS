import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, Award, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { MetricCard } from '../features/dashboard/MetricCard';
import { PipelineSummary } from '../features/dashboard/PipelineSummary';
import { RecentActivity } from '../features/dashboard/RecentActivity';
import { Button } from '../components/ui/Button';
import { CandidateFormModal } from '../features/candidates/CandidateFormModal';
import { INITIAL_MOCK_CANDIDATES } from '../data/mockCandidates';
import { Candidate, CanonicalStage } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_MOCK_CANDIDATES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute metrics
  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter(
    c => c.currentStage !== 'Hired' && c.currentStage !== 'Rejected'
  ).length;
  const inInterview = candidates.filter(c => c.currentStage === 'Interview').length;
  const offersAndHires = candidates.filter(
    c => c.currentStage === 'Offer' || c.currentStage === 'Hired'
  ).length;

  const stageCounts: Record<CanonicalStage, number> = {
    Applied: candidates.filter(c => c.currentStage === 'Applied').length,
    Screening: candidates.filter(c => c.currentStage === 'Screening').length,
    Interview: candidates.filter(c => c.currentStage === 'Interview').length,
    Offer: candidates.filter(c => c.currentStage === 'Offer').length,
    Hired: candidates.filter(c => c.currentStage === 'Hired').length,
    Rejected: candidates.filter(c => c.currentStage === 'Rejected').length,
  };

  const handleAddCandidate = (newCand: Partial<Candidate>) => {
    const created: Candidate = {
      id: `cand-${Date.now()}`,
      name: newCand.name || 'New Candidate',
      email: newCand.email || '',
      phone: newCand.phone || '',
      appliedRole: newCand.appliedRole || 'Full Stack Developer',
      experience: newCand.experience || 0,
      source: newCand.source || 'Direct',
      skills: newCand.skills || [],
      currentStage: newCand.currentStage || 'Applied',
      applicationDate: new Date().toISOString(),
      resumeUrl: newCand.resumeUrl,
      notes: newCand.notes,
      stageHistory: [
        {
          fromStage: null,
          toStage: newCand.currentStage || 'Applied',
          changedAt: new Date().toISOString(),
          note: 'Candidate created via Recruiter Dashboard.',
          changedBy: 'Recruiter',
        },
      ],
    };

    setCandidates([created, ...candidates]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Recruitment Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track hiring pipeline progress, candidate milestones, and recruitment velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/candidates')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Candidate Database
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Presentation Mode Notice Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex items-start gap-3 text-xs text-blue-900">
        <Sparkles className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <p className="font-semibold">Phase 2 Frontend Presentation Mode</p>
          <p className="text-blue-700 leading-relaxed">
            Displaying interactive presentation mock candidates across all 6 canonical stages.
            Navigation, search, modal dialogs, and filters are fully functional in the UI. Real
            backend persistence will be connected in Phase 3.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Candidates"
          value={totalCandidates}
          icon={Users}
          subtext="Total applicants in system"
          badgeText="+12% this month"
          badgeColor="blue"
        />
        <MetricCard
          title="Active Candidates"
          value={activeCandidates}
          icon={UserCheck}
          subtext="In active screening or evaluation"
          badgeText="Active"
          badgeColor="emerald"
        />
        <MetricCard
          title="Interviews Scheduled"
          value={inInterview}
          icon={Calendar}
          subtext="Technical & behavioral rounds"
          badgeText="In Progress"
          badgeColor="amber"
        />
        <MetricCard
          title="Offers & Hires"
          value={offersAndHires}
          icon={Award}
          subtext="Successful conversion milestones"
          badgeText="Success"
          badgeColor="emerald"
        />
      </div>

      {/* Pipeline Funnel Distribution */}
      <PipelineSummary stageCounts={stageCounts} totalCandidates={totalCandidates} />

      {/* Recent Activity Feed */}
      <RecentActivity candidates={candidates} />

      {/* Add Candidate Modal */}
      <CandidateFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCandidate}
      />
    </div>
  );
};
