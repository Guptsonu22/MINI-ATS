import { Request, Response, NextFunction } from 'express';
import { candidateService } from '../services/candidate.service.js';
import {
  CreateCandidateInput,
  UpdateCandidateInput,
  UpdateCandidateStageInput,
  CandidateQueryInput,
} from '../schemas/candidate.schema.js';

export const createCandidateHandler = async (
  req: Request<unknown, unknown, CreateCandidateInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidate = await candidateService.createCandidate(req.body);

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidatesHandler = async (
  req: Request<unknown, unknown, unknown, CandidateQueryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { candidates, pagination } = await candidateService.getCandidates(req.query);

    res.status(200).json({
      success: true,
      data: candidates,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateByIdHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id);

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateHandler = async (
  req: Request<{ id: string }, unknown, UpdateCandidateInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidate = await candidateService.updateCandidate(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateStageHandler = async (
  req: Request<{ id: string }, unknown, UpdateCandidateStageInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { stage, note, changedBy } = req.body;
    const candidate = await candidateService.updateCandidateStage(
      req.params.id,
      stage,
      note,
      changedBy
    );

    res.status(200).json({
      success: true,
      message: `Candidate stage successfully updated to '${stage}'`,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCandidateHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidate = await candidateService.deleteCandidate(req.params.id);

    res.status(200).json({
      success: true,
      message: `Candidate '${candidate.name}' deleted successfully`,
      data: {
        id: candidate.id,
      },
    });
  } catch (error) {
    next(error);
  }
};
