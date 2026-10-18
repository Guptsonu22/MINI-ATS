import { Candidate, ICandidate } from '../models/candidate.model.js';
import { CANONICAL_STAGES, CanonicalStage } from '../constants/stages.js';

export interface StageCountItem {
  stage: CanonicalStage;
  count: number;
  percentage: number;
}

export interface SourceCountItem {
  source: string;
  count: number;
  percentage: number;
}

export interface RoleCountItem {
  role: string;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  totalCandidates: number;
  activeCandidates: number; // Consistently defined as currentStage NOT IN ('Hired', 'Rejected')
  hiredCandidates: number;
  rejectedCandidates: number;
  inInterview: number;
  offersExtended: number;
  screeningCount: number;
  appliedCount: number;
  averageExperience: number;
  hireRate: number; // Percentage of total candidates that reached 'Hired'
  stageDistribution: Record<CanonicalStage, number>;
  stageBreakdown: StageCountItem[];
  sourceBreakdown: SourceCountItem[];
  roleBreakdown: RoleCountItem[];
  recentCandidates: ICandidate[];
}

export class AnalyticsService {
  /**
   * Derive recruitment dashboard analytics using MongoDB aggregation pipelines
   */
  async getAnalytics(): Promise<AnalyticsData> {
    // Execute aggregation pipelines concurrently
    const [stageCountsRaw, sourceCountsRaw, roleCountsRaw, expStatsRaw, recentCandidates] =
      await Promise.all([
        // 1. Group by current stage
        Candidate.aggregate<{ _id: string; count: number }>([
          {
            $group: {
              _id: '$currentStage',
              count: { $sum: 1 },
            },
          },
        ]),

        // 2. Group by candidate source
        Candidate.aggregate<{ _id: string; count: number }>([
          {
            $group: {
              _id: '$source',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: 1 } },
        ]),

        // 3. Group by applied role
        Candidate.aggregate<{ _id: string; count: number }>([
          {
            $group: {
              _id: '$appliedRole',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: 1 } },
        ]),

        // 4. Experience statistics (average, count)
        Candidate.aggregate<{ avgExp: number; count: number }>([
          {
            $group: {
              _id: null,
              avgExp: { $avg: '$experience' },
              count: { $sum: 1 },
            },
          },
        ]),

        // 5. Recent 5 candidates with stage history
        Candidate.find().sort({ applicationDate: -1, createdAt: -1 }).limit(5),
      ]);

    // Build stage distribution dictionary ensuring all canonical stages exist
    const stageDistribution: Record<CanonicalStage, number> = {
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Hired: 0,
      Rejected: 0,
    };

    stageCountsRaw.forEach(item => {
      if (item._id in stageDistribution) {
        stageDistribution[item._id as CanonicalStage] = item.count;
      }
    });

    // Derive totals
    const totalCandidates = expStatsRaw[0]?.count ?? 0;
    const appliedCount = stageDistribution.Applied;
    const screeningCount = stageDistribution.Screening;
    const inInterview = stageDistribution.Interview;
    const offersExtended = stageDistribution.Offer;
    const hiredCandidates = stageDistribution.Hired;
    const rejectedCandidates = stageDistribution.Rejected;

    // Active candidates consistently excludes 'Hired' and 'Rejected'
    // Active = Applied + Screening + Interview + Offer
    const activeCandidates = appliedCount + screeningCount + inInterview + offersExtended;

    // Derived ratios
    const averageExperience =
      totalCandidates > 0 && expStatsRaw[0]?.avgExp != null
        ? Number(expStatsRaw[0].avgExp.toFixed(1))
        : 0;

    const hireRate =
      totalCandidates > 0 ? Number(((hiredCandidates / totalCandidates) * 100).toFixed(1)) : 0;

    // Stage breakdown array in canonical pipeline order
    const stageBreakdown: StageCountItem[] = CANONICAL_STAGES.map(stage => {
      const count = stageDistribution[stage];
      const percentage =
        totalCandidates > 0 ? Number(((count / totalCandidates) * 100).toFixed(1)) : 0;
      return { stage, count, percentage };
    });

    // Source breakdown array
    const sourceBreakdown: SourceCountItem[] = sourceCountsRaw.map(item => ({
      source: item._id || 'Unknown',
      count: item.count,
      percentage:
        totalCandidates > 0 ? Number(((item.count / totalCandidates) * 100).toFixed(1)) : 0,
    }));

    // Role breakdown array
    const roleBreakdown: RoleCountItem[] = roleCountsRaw.map(item => ({
      role: item._id || 'General',
      count: item.count,
      percentage:
        totalCandidates > 0 ? Number(((item.count / totalCandidates) * 100).toFixed(1)) : 0,
    }));

    return {
      totalCandidates,
      activeCandidates,
      hiredCandidates,
      rejectedCandidates,
      inInterview,
      offersExtended,
      screeningCount,
      appliedCount,
      averageExperience,
      hireRate,
      stageDistribution,
      stageBreakdown,
      sourceBreakdown,
      roleBreakdown,
      recentCandidates,
    };
  }
}

export const analyticsService = new AnalyticsService();
