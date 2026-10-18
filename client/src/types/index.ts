export type CanonicalStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export interface StageHistoryEntry {
  fromStage: CanonicalStage | null;
  toStage: CanonicalStage;
  changedAt: string;
  note?: string;
  changedBy?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedRole: string;
  experience: number; // in years
  source: string;
  skills: string[];
  currentStage: CanonicalStage;
  applicationDate: string;
  resumeUrl?: string;
  notes?: string;
  stageHistory: StageHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  totalCandidates: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CandidateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  stage?: string;
  role?: string;
  minExp?: number;
  maxExp?: number;
  sortBy?: 'applicationDate' | 'name' | 'experience' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCandidatePayload {
  name: string;
  email: string;
  phone: string;
  appliedRole: string;
  experience: number;
  source: string;
  skills: string[];
  currentStage?: CanonicalStage;
  applicationDate?: string;
  resumeUrl?: string;
  notes?: string;
}

export type UpdateCandidatePayload = Partial<CreateCandidatePayload>;

export interface UpdateStagePayload {
  stage: CanonicalStage;
  note?: string;
  changedBy?: string;
}

export interface HealthCheckData {
  status: string;
  service: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  nodeVersion: string;
  database?: {
    state: string;
    host?: string;
    name?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationData;
  error?: {
    message: string;
    code: string;
    details?: Array<{ field: string; message: string }>;
  };
}

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
  recentCandidates: Candidate[];
}

