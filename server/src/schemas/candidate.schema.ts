import { z } from 'zod';
import { CANONICAL_STAGES } from '../constants/stages.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const candidateIdParamSchema = z.object({
  id: z
    .string()
    .regex(
      objectIdRegex,
      'Invalid candidate ID format. Must be a 24-character hexadecimal string.'
    ),
});

export const createCandidateSchema = z.object({
  name: z
    .string({ required_error: 'Candidate name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(3, 'Phone number must be at least 3 characters')
    .max(30, 'Phone number cannot exceed 30 characters'),
  appliedRole: z
    .string({ required_error: 'Applied role is required' })
    .trim()
    .min(2, 'Applied role must be at least 2 characters')
    .max(100, 'Applied role cannot exceed 100 characters'),
  experience: z.coerce
    .number({ required_error: 'Years of experience is required' })
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
  skills: z
    .union([
      z.array(z.string().trim().min(1, 'Skill tag cannot be empty')),
      z.string().transform(str =>
        str
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      ),
    ])
    .refine(arr => arr.length > 0, 'At least one skill is required'),
  source: z
    .string({ required_error: 'Candidate source is required' })
    .trim()
    .min(2, 'Source must be at least 2 characters')
    .max(100, 'Source cannot exceed 100 characters'),
  currentStage: z
    .enum(CANONICAL_STAGES, {
      errorMap: () => ({
        message: `Stage must be one of: ${CANONICAL_STAGES.join(', ')}`,
      }),
    })
    .default('Applied'),
  applicationDate: z
    .string()
    .datetime({ message: 'Application date must be a valid ISO datetime' })
    .optional(),
  resumeUrl: z.string().trim().url('Resume URL must be a valid URL').or(z.literal('')).optional(),
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters').optional(),
});

export const updateCandidateSchema = createCandidateSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const updateCandidateStageSchema = z.object({
  stage: z.enum(CANONICAL_STAGES, {
    errorMap: () => ({
      message: `Stage must be one of: ${CANONICAL_STAGES.join(', ')}`,
    }),
  }),
  note: z
    .string()
    .trim()
    .max(1000, 'Stage transition note cannot exceed 1000 characters')
    .optional(),
  changedBy: z.string().trim().max(100, 'Author name cannot exceed 100 characters').optional(),
});

export const candidateQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  q: z.string().trim().optional(), // alias for search
  stage: z.enum([...CANONICAL_STAGES, '']).optional(),
  role: z.string().trim().optional(),
  minExp: z.coerce.number().min(0).optional(),
  maxExp: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['applicationDate', 'name', 'experience', 'createdAt']).default('applicationDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type UpdateCandidateStageInput = z.infer<typeof updateCandidateStageSchema>;
export type CandidateQueryInput = z.infer<typeof candidateQuerySchema>;
