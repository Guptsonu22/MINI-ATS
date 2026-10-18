export const CANONICAL_STAGES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
] as const;

export type CanonicalStage = (typeof CANONICAL_STAGES)[number];

export const isCanonicalStage = (stage: string): stage is CanonicalStage => {
  return CANONICAL_STAGES.includes(stage as CanonicalStage);
};
