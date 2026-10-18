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
