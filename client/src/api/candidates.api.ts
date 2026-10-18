import { apiClient } from './client';
import {
  Candidate,
  CandidateQueryParams,
  CreateCandidatePayload,
  UpdateCandidatePayload,
  UpdateStagePayload,
  PaginationData,
  HealthCheckData,
} from '../types';

export interface GetCandidatesResponse {
  candidates: Candidate[];
  pagination: PaginationData;
}

export const candidatesApi = {
  /**
   * Fetch paginated candidates with optional search and filters
   */
  async getCandidates(params?: CandidateQueryParams): Promise<GetCandidatesResponse> {
    const response = await apiClient.get<Candidate[]>('/candidates', params as Record<string, string | number>);

    const candidateList = Array.isArray(response.data) ? response.data : [];

    return {
      candidates: candidateList,
      pagination: response.pagination || {
        page: 1,
        limit: 10,
        totalCandidates: candidateList.length,
        totalPages: Math.max(1, Math.ceil(candidateList.length / 10)),
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  /**
   * Fetch a single candidate by ID with complete stage history
   */
  async getCandidateById(id: string): Promise<Candidate> {
    const response = await apiClient.get<Candidate>(`/candidates/${id}`);
    if (!response.data) {
      throw new Error('Candidate data not returned by API');
    }
    return response.data;
  },

  /**
   * Create a new candidate record
   */
  async createCandidate(payload: CreateCandidatePayload): Promise<Candidate> {
    return apiClient.post<Candidate>('/candidates', payload);
  },

  /**
   * Update candidate information
   */
  async updateCandidate(id: string, payload: UpdateCandidatePayload): Promise<Candidate> {
    return apiClient.patch<Candidate>(`/candidates/${id}`, payload);
  },

  /**
   * Promote or update a candidate's hiring stage
   */
  async updateCandidateStage(id: string, payload: UpdateStagePayload): Promise<Candidate> {
    return apiClient.patch<Candidate>(`/candidates/${id}/stage`, payload);
  },

  /**
   * Delete a candidate record
   */
  async deleteCandidate(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/candidates/${id}`);
  },

  /**
   * Check backend server and database health
   */
  async getHealth(): Promise<HealthCheckData> {
    const response = await apiClient.get<HealthCheckData>('/health');
    if (!response.data) {
      throw new Error('Health data not returned by API');
    }
    return response.data;
  },
};
