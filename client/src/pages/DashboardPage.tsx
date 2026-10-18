import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Award,
  Plus,
  ArrowRight,
  Database,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { MetricCard } from '../features/dashboard/MetricCard';
import { PipelineSummary } from '../features/dashboard/PipelineSummary';
import { RecentActivity } from '../features/dashboard/RecentActivity';
import { Button } from '../components/ui/Button';
import { CandidateFormModal } from '../features/candidates/CandidateFormModal';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Candidate, CanonicalStage } from '../types';
import { candidatesApi } from '../api/candidates.api';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await candidatesApi.getCandidates({ limit: 100 });
      setCandidates(response.candidates);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the ATS API server. Please check your network connection.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute live metrics from real candidate records
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

  const handleAddCandidate = async (newCand: Partial<Candidate>) => {
    try {
      await candidatesApi.createCandidate({
        name: newCand.name!,
        email: newCand.email!,
        phone: newCand.phone!,
        appliedRole: newCand.appliedRole!,
        experience: newCand.experience!,
        source: newCand.source!,
        skills: newCand.skills || [],
        currentStage: newCand.currentStage || 'Applied',
        resumeUrl: newCand.resumeUrl,
        notes: newCand.notes,
      });

      addToast(`Candidate ${newCand.name} registered successfully`, 'success');
      setIsAddModalOpen(false);
      await fetchDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register candidate';
      addToast(msg, 'error');
      throw err;
    }
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

      {/* Backend Status Banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3 text-xs text-emerald-900">
        <Database className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <p className="font-semibold">Connected to Mini ATS Database</p>
          <p className="text-emerald-700 leading-relaxed">
            Live applicant pipeline data synchronized with MongoDB. All metric counts, stage distributions,
            and recent activity reflect real candidate database records.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center space-y-3">
          <div className="flex justify-center text-rose-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-rose-900">Unable to Fetch Dashboard Data</h3>
          <p className="text-xs sm:text-sm text-rose-700 max-w-md mx-auto">{error}</p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={fetchDashboardData}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Candidates"
            value={totalCandidates}
            icon={Users}
            subtext="Total applicants in database"
            badgeText="Live"
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
            badgeText="Milestones"
            badgeColor="emerald"
          />
        </div>
      )}

      {/* Pipeline Funnel Distribution */}
      {!isLoading && !error && (
        <PipelineSummary stageCounts={stageCounts} totalCandidates={totalCandidates} />
      )}

      {/* Recent Activity Feed */}
      {!isLoading && !error && <RecentActivity candidates={candidates} />}

      {/* Add Candidate Modal */}
      <CandidateFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCandidate}
      />
    </div>
  );
};
