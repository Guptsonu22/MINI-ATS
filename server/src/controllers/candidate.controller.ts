import { RequestHandler } from 'express';
import { candidateService } from '../services/candidate.service.js';
import {
  CreateCandidateInput,
  UpdateCandidateInput,
  UpdateCandidateStageInput,
  CandidateQueryInput,
} from '../schemas/candidate.schema.js';

export const createCandidateHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const candidate = await candidateService.createCandidate(
      req.body as unknown as CreateCandidateInput
    );

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidatesHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const query = req.query as unknown as CandidateQueryInput;
    const { candidates, pagination } = await candidateService.getCandidates(query);

    res.status(200).json({
      success: true,
      data: candidates,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateByIdHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id as string);

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const candidate = await candidateService.updateCandidate(
      req.params.id as string,
      req.body as unknown as UpdateCandidateInput
    );

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateStageHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { stage, note, changedBy } = req.body as unknown as UpdateCandidateStageInput;
    const candidate = await candidateService.updateCandidateStage(
      req.params.id as string,
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

export const deleteCandidateHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const candidate = await candidateService.deleteCandidate(req.params.id as string);

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
