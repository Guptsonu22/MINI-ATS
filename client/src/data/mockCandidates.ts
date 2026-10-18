export const STANDARD_ROLES = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'DevOps Engineer',
  'Product Designer',
  'QA Automation Engineer',
] as const;

export const STANDARD_SOURCES = [
  'LinkedIn',
  'Referral',
  'Company Careers Page',
  'GitHub',
  'AngelList / Wellfound',
  'Campus Recruitment',
] as const;

// Backward-compatibility aliases for option dropdowns
export const MOCK_ROLES = STANDARD_ROLES;
export const MOCK_SOURCES = STANDARD_SOURCES;
