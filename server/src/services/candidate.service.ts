import { Candidate, ICandidate } from '../models/candidate.model.js';
import {
  CreateCandidateInput,
  UpdateCandidateInput,
  CandidateQueryInput,
} from '../schemas/candidate.schema.js';
import { CanonicalStage } from '../constants/stages.js';
import { AppError } from '../utils/AppError.js';
import { FilterQuery } from 'mongoose';

export interface PaginatedResult<T> {
  candidates: T[];
  pagination: {
    page: number;
    limit: number;
    totalCandidates: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class CandidateService {
  /**
   * Create a new candidate with duplicate email protection and initial stage history
   */
  async createCandidate(input: CreateCandidateInput): Promise<ICandidate> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check for existing candidate with the same email
    const existingCandidate = await Candidate.findOne({ email: normalizedEmail });
    if (existingCandidate) {
      throw AppError.conflict(
        `A candidate with email '${normalizedEmail}' already exists.`,
        'DUPLICATE_EMAIL'
      );
    }

    const initialStage = input.currentStage || 'Applied';

    const candidate = new Candidate({
      ...input,
      email: normalizedEmail,
      currentStage: initialStage,
      applicationDate: input.applicationDate ? new Date(input.applicationDate) : new Date(),
      stageHistory: [
        {
          fromStage: null,
          toStage: initialStage,
          changedAt: new Date(),
          note: input.notes || 'Candidate profile registered in ATS.',
          changedBy: 'Recruiter',
        },
      ],
    });

    return await candidate.save();
  }

  /**
   * List candidates with multi-criteria filtering, search, sorting, and pagination
   */
  async getCandidates(query: CandidateQueryInput): Promise<PaginatedResult<ICandidate>> {
    const filter: FilterQuery<ICandidate> = {};

    // 1. Text Search (Name or Email)
    const searchQuery = query.search || query.q;
    if (searchQuery && searchQuery.trim()) {
      const escaped = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    // 2. Stage Filter
    if (query.stage && query.stage.trim()) {
      filter.currentStage = query.stage as CanonicalStage;
    }

    // 3. Role Filter
    if (query.role && query.role.trim()) {
      const escapedRole = query.role.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.appliedRole = { $regex: escapedRole, $options: 'i' };
    }

    // 4. Experience Range Filter
    if (query.minExp !== undefined || query.maxExp !== undefined) {
      filter.experience = {};
      if (query.minExp !== undefined) {
        filter.experience.$gte = query.minExp;
      }
      if (query.maxExp !== undefined) {
        filter.experience.$lte = query.maxExp;
      }
    }

    // Pagination calculations
    const page = Math.max(1, query.page);
    const limit = Math.max(1, Math.min(query.limit, 100));
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = query.sortBy || 'applicationDate';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortDirection };

    // Execute query and count concurrently
    const [candidates, totalCandidates] = await Promise.all([
      Candidate.find(filter).sort(sortObj).skip(skip).limit(limit),
      Candidate.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCandidates / limit) || 1;

    return {
      candidates,
      pagination: {
        page,
        limit,
        totalCandidates,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get single candidate by ID with complete stage history
   */
  async getCandidateById(id: string): Promise<ICandidate> {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      throw AppError.notFound(`Candidate with ID '${id}' not found.`, 'CANDIDATE_NOT_FOUND');
    }
    return candidate;
  }

  /**
   * Update candidate details with email uniqueness check
   */
  async updateCandidate(id: string, input: UpdateCandidateInput): Promise<ICandidate> {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      throw AppError.notFound(`Candidate with ID '${id}' not found.`, 'CANDIDATE_NOT_FOUND');
    }

    // If email is changing, check uniqueness
    if (input.email && input.email.toLowerCase() !== candidate.email.toLowerCase()) {
      const existing = await Candidate.findOne({
        email: input.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw AppError.conflict(
          `A candidate with email '${input.email}' already exists.`,
          'DUPLICATE_EMAIL'
        );
      }
      candidate.email = input.email.toLowerCase();
    }

    // Check if stage is changing through general update
    if (input.currentStage && input.currentStage !== candidate.currentStage) {
      candidate.stageHistory.push({
        fromStage: candidate.currentStage,
        toStage: input.currentStage,
        changedAt: new Date(),
        note: input.notes || `Stage updated to ${input.currentStage}.`,
        changedBy: 'Recruiter',
      });
      candidate.currentStage = input.currentStage;
    }

    // Update remaining provided fields
    if (input.name !== undefined) candidate.name = input.name;
    if (input.phone !== undefined) candidate.phone = input.phone;
    if (input.appliedRole !== undefined) candidate.appliedRole = input.appliedRole;
    if (input.experience !== undefined) candidate.experience = input.experience;
    if (input.skills !== undefined) candidate.skills = input.skills;
    if (input.source !== undefined) candidate.source = input.source;
    if (input.resumeUrl !== undefined) candidate.resumeUrl = input.resumeUrl || undefined;
    if (input.notes !== undefined) candidate.notes = input.notes || undefined;

    return await candidate.save();
  }

  /**
   * Transition candidate hiring stage and append audit history
   */
  async updateCandidateStage(
    id: string,
    targetStage: CanonicalStage,
    note?: string,
    changedBy = 'Recruiter'
  ): Promise<ICandidate> {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      throw AppError.notFound(`Candidate with ID '${id}' not found.`, 'CANDIDATE_NOT_FOUND');
    }

    const previousStage = candidate.currentStage;

    // Append to stage history
    candidate.stageHistory.push({
      fromStage: previousStage,
      toStage: targetStage,
      changedAt: new Date(),
      note: note || `Candidate transitioned from ${previousStage} to ${targetStage}.`,
      changedBy: changedBy.trim() || 'Recruiter',
    });

    candidate.currentStage = targetStage;
    return await candidate.save();
  }

  /**
   * Delete a candidate record
   */
  async deleteCandidate(id: string): Promise<ICandidate> {
    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) {
      throw AppError.notFound(`Candidate with ID '${id}' not found.`, 'CANDIDATE_NOT_FOUND');
    }
    return candidate;
  }
}

export const candidateService = new CandidateService();
