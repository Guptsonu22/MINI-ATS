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
}

export interface CandidateFilterState {
  search: string;
  stage: string;
  role: string;
  experience: string;
  sortBy: 'applicationDate' | 'name' | 'experience';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface HealthCheckData {
  status: string;
  service: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  nodeVersion: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Array<{ field: string; message: string }>;
  };
}
