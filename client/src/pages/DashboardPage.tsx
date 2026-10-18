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
  XCircle,
  Briefcase,
  RefreshCw,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';
import { MetricCard } from '../features/dashboard/MetricCard';
import { StageDistributionChart } from '../features/dashboard/StageDistributionChart';
import { RecentCandidates } from '../features/dashboard/RecentCandidates';
import { Button } from '../components/ui/Button';
import { CandidateFormModal } from '../features/candidates/CandidateFormModal';
import { CardSkeleton } from '../components/ui/Skeleton';
import { AnalyticsData, Candidate } from '../types';
import { candidatesApi } from '../api/candidates.api';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDashboardAnalytics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await candidatesApi.getAnalytics();
      setAnalytics(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the ATS API server. Please check your database connection.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, [fetchDashboardAnalytics]);

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
      // Immediately refresh live dashboard metrics derived from MongoDB
      await fetchDashboardAnalytics(true);
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
            Real-time recruitment analytics and funnel velocity derived directly from MongoDB
            candidate records.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardAnalytics(true)}
            disabled={isLoading || isRefreshing}
            leftIcon={
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
            }
          >
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </Button>

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

      {/* Backend & Data Consistency Banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-start gap-3">
          <Database className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold flex items-center gap-2">
              <span>Connected to Mini ATS Database</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Phase 5 Analytics Active
              </span>
            </p>
            <p className="text-emerald-700 leading-relaxed">
              All metrics and pipeline charts are dynamically computed via MongoDB aggregation
              pipelines. Consistent definition applied: Active candidates strictly exclude Hired and
              Rejected.
            </p>
          </div>
        </div>
        <div className="text-slate-500 text-[11px] shrink-0 md:text-right pl-7 md:pl-0">
          Formula: <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-emerald-800">Active = Total - (Hired + Rejected)</code>
        </div>
      </div>

      {/* Error State Banner */}
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
              onClick={() => fetchDashboardAnalytics()}
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
      ) : analytics ? (
        <>
          {/* Main Key Performance Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              title="Total Candidates"
              value={analytics.totalCandidates}
              icon={Users}
              subtext="Total applicants in database"
              badgeText="Database"
              badgeColor="blue"
            />
            <MetricCard
              title="Active Pipeline"
              value={analytics.activeCandidates}
              icon={UserCheck}
              subtext="Excludes Hired and Rejected"
              badgeText="In Evaluation"
              badgeColor="emerald"
            />
            <MetricCard
              title="In Interview"
              value={analytics.inInterview}
              icon={Calendar}
              subtext="Technical & behavioral rounds"
              badgeText="Active Round"
              badgeColor="amber"
            />
            <MetricCard
              title="Hired"
              value={analytics.hiredCandidates}
              icon={Award}
              subtext={`${analytics.hireRate}% conversion hire rate`}
              badgeText="Converted"
              badgeColor="emerald"
            />
          </div>

          {/* Secondary Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <MetricCard
              title="Offers Extended"
              value={analytics.offersExtended}
              icon={Send}
              subtext="Pending decision from candidates"
              badgeText="Decision"
              badgeColor="amber"
            />
            <MetricCard
              title="Rejected"
              value={analytics.rejectedCandidates}
              icon={XCircle}
              subtext="Not moving forward in process"
              badgeText="Concluded"
              badgeColor="rose"
            />
            <MetricCard
              title="Average Experience"
              value={`${analytics.averageExperience} yrs`}
              icon={Clock}
              subtext="Mean industry background"
              badgeText="Aggregate"
              badgeColor="purple"
            />
          </div>

          {/* Canonical Stage Distribution Chart */}
          <StageDistributionChart
            stageBreakdown={analytics.stageBreakdown}
            totalCandidates={analytics.totalCandidates}
          />

          {/* Bottom Grid: Recent Candidates & Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Candidates Section (2 Columns) */}
            <div className="lg:col-span-2">
              <RecentCandidates candidates={analytics.recentCandidates} />
            </div>

            {/* Sourcing & Role Breakdown (1 Column) */}
            <div className="space-y-6">
              {/* Sourcing Breakdown Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Candidate Sourcing</h3>
                  <span className="text-[11px] text-slate-400 font-medium">Top Channels</span>
                </div>
                {analytics.sourceBreakdown.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No source data</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.sourceBreakdown.slice(0, 5).map(item => (
                      <div key={item.source} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-slate-700 truncate max-w-[150px]">
                            {item.source}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${Math.max(item.percentage, 4)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roles Breakdown Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Applied Roles</h3>
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </div>
                {analytics.roleBreakdown.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No role data</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.roleBreakdown.slice(0, 5).map(item => (
                      <div key={item.role} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-slate-700 truncate max-w-[150px]">
                            {item.role}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.max(item.percentage, 4)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Empty State when 0 records exist */}
      {!isLoading && !error && analytics && analytics.totalCandidates === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Users className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Candidates in Pipeline Yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your recruitment database is currently empty. Add your first applicant to see real-time
              conversion metrics and stage distributions.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add First Candidate
            </Button>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      <CandidateFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCandidate}
      />
    </div>
  );
};
