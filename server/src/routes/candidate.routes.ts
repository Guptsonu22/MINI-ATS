import { Router } from 'express';
import {
  createCandidateHandler,
  getCandidatesHandler,
  getCandidateByIdHandler,
  updateCandidateHandler,
  updateCandidateStageHandler,
  deleteCandidateHandler,
} from '../controllers/candidate.controller.js';
import { getAnalyticsHandler } from '../controllers/analytics.controller.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import {
  createCandidateSchema,
  updateCandidateSchema,
  updateCandidateStageSchema,
  candidateQuerySchema,
  candidateIdParamSchema,
} from '../schemas/candidate.schema.js';

export const candidateRouter = Router();

candidateRouter.post('/', validateBody(createCandidateSchema), createCandidateHandler);

candidateRouter.get('/', validateQuery(candidateQuerySchema), getCandidatesHandler);

candidateRouter.get('/analytics', getAnalyticsHandler);

candidateRouter.get('/:id', validateParams(candidateIdParamSchema), getCandidateByIdHandler);

candidateRouter.patch(
  '/:id',
  validateParams(candidateIdParamSchema),
  validateBody(updateCandidateSchema),
  updateCandidateHandler
);

candidateRouter.patch(
  '/:id/stage',
  validateParams(candidateIdParamSchema),
  validateBody(updateCandidateStageSchema),
  updateCandidateStageHandler
);

candidateRouter.delete('/:id', validateParams(candidateIdParamSchema), deleteCandidateHandler);
