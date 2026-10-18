import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Candidate } from '../models/candidate.model.js';
import { CanonicalStage } from '../constants/stages.js';

interface SeedCandidate {
  name: string;
  email: string;
  phone: string;
  appliedRole: string;
  experience: number;
  source: string;
  skills: string[];
  currentStage: CanonicalStage;
  applicationDate: Date;
  resumeUrl?: string;
  notes?: string;
  stageHistory: Array<{
    fromStage: CanonicalStage | null;
    toStage: CanonicalStage;
    changedAt: Date;
    note?: string;
    changedBy?: string;
  }>;
}

const seedCandidates: SeedCandidate[] = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    appliedRole: 'Full Stack Developer',
    experience: 3,
    source: 'LinkedIn',
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    currentStage: 'Interview',
    applicationDate: new Date('2026-10-10T09:30:00Z'),
    resumeUrl: 'https://example.com/resumes/aarav_sharma.pdf',
    notes: 'Strong portfolio in full-stack web applications. Cleared technical screening with top marks.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-10T09:30:00Z'),
        note: 'Application submitted via LinkedIn post.',
        changedBy: 'System',
      },
      {
        fromStage: 'Applied',
        toStage: 'Screening',
        changedAt: new Date('2026-10-12T11:00:00Z'),
        note: 'Resume screening cleared.',
        changedBy: 'Recruiter',
      },
      {
        fromStage: 'Screening',
        toStage: 'Interview',
        changedAt: new Date('2026-10-14T14:15:00Z'),
        note: 'Technical system design round scheduled.',
        changedBy: 'Hiring Manager',
      },
    ],
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98111 22334',
    appliedRole: 'Frontend Engineer',
    experience: 4,
    source: 'Referral',
    skills: ['React', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Jest', 'Figma'],
    currentStage: 'Offer',
    applicationDate: new Date('2026-10-05T14:20:00Z'),
    resumeUrl: 'https://example.com/resumes/priya_patel.pdf',
    notes: 'Exceptional UI sensibilities. Formal offer extended.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-05T14:20:00Z'),
        note: 'Referred by lead engineer.',
        changedBy: 'System',
      },
      {
        fromStage: 'Applied',
        toStage: 'Screening',
        changedAt: new Date('2026-10-06T10:00:00Z'),
        note: 'Recruiter screen passed.',
        changedBy: 'Recruiter',
      },
      {
        fromStage: 'Screening',
        toStage: 'Interview',
        changedAt: new Date('2026-10-09T16:00:00Z'),
        note: 'Aced UI coding interview.',
        changedBy: 'Interviewer',
      },
      {
        fromStage: 'Interview',
        toStage: 'Offer',
        changedAt: new Date('2026-10-15T12:00:00Z'),
        note: 'Formal offer extended at senior grade.',
        changedBy: 'HR Director',
      },
    ],
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    phone: '+91 97234 56789',
    appliedRole: 'Backend Engineer',
    experience: 5,
    source: 'Company Careers Page',
    skills: ['Node.js', 'Go', 'PostgreSQL', 'Docker', 'Redis', 'Microservices'],
    currentStage: 'Hired',
    applicationDate: new Date('2026-09-28T10:00:00Z'),
    resumeUrl: 'https://example.com/resumes/rohan_verma.pdf',
    notes: 'Candidate accepted offer letter; joining next month.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-09-28T10:00:00Z'),
        note: 'Direct application from careers portal.',
        changedBy: 'System',
      },
      {
        fromStage: 'Applied',
        toStage: 'Screening',
        changedAt: new Date('2026-09-30T10:30:00Z'),
        note: 'Screening passed.',
        changedBy: 'Recruiter',
      },
      {
        fromStage: 'Screening',
        toStage: 'Interview',
        changedAt: new Date('2026-10-04T15:00:00Z'),
        note: 'Passed architecture round.',
        changedBy: 'Hiring Manager',
      },
      {
        fromStage: 'Interview',
        toStage: 'Offer',
        changedAt: new Date('2026-10-08T11:00:00Z'),
        note: 'Offer sent.',
        changedBy: 'HR',
      },
      {
        fromStage: 'Offer',
        toStage: 'Hired',
        changedAt: new Date('2026-10-12T09:00:00Z'),
        note: 'Signed offer agreement.',
        changedBy: 'HR Director',
      },
    ],
  },
  {
    name: 'Sneha Kulkarni',
    email: 'sneha.k@example.com',
    phone: '+91 99887 76655',
    appliedRole: 'Product Designer',
    experience: 2,
    source: 'AngelList / Wellfound',
    skills: ['Figma', 'User Research', 'Design Systems', 'Wireframing', 'Prototyping'],
    currentStage: 'Screening',
    applicationDate: new Date('2026-10-15T11:45:00Z'),
    resumeUrl: 'https://example.com/resumes/sneha_k.pdf',
    notes: 'Great Dribbble case studies. Phone screening booked.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-15T11:45:00Z'),
        note: 'Application received.',
        changedBy: 'System',
      },
      {
        fromStage: 'Applied',
        toStage: 'Screening',
        changedAt: new Date('2026-10-16T10:00:00Z'),
        note: 'Portfolio passed recruiter review.',
        changedBy: 'Recruiter',
      },
    ],
  },
  {
    name: 'Vikram Joshi',
    email: 'vikram.joshi@example.com',
    phone: '+91 98450 12345',
    appliedRole: 'DevOps Engineer',
    experience: 6,
    source: 'GitHub',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Docker', 'Linux', 'Python'],
    currentStage: 'Interview',
    applicationDate: new Date('2026-10-08T15:00:00Z'),
    resumeUrl: 'https://example.com/resumes/vikram_joshi.pdf',
    notes: 'Deep Kubernetes expertise. Behavioral interview scheduled.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-08T15:00:00Z'),
        note: 'Direct application.',
        changedBy: 'System',
      },
      {
        fromStage: 'Applied',
        toStage: 'Screening',
        changedAt: new Date('2026-10-10T12:00:00Z'),
        note: 'Initial screening passed.',
        changedBy: 'Recruiter',
      },
      {
        fromStage: 'Screening',
        toStage: 'Interview',
        changedAt: new Date('2026-10-13T16:00:00Z'),
        note: 'Passed cloud architecture round.',
        changedBy: 'DevOps Lead',
      },
    ],
  },
  {
    name: 'Ananya Nair',
    email: 'ananya.nair@example.com',
    phone: '+91 96321 09876',
    appliedRole: 'Full Stack Developer',
    experience: 1,
    source: 'Campus Recruitment',
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'MongoDB'],
    currentStage: 'Applied',
    applicationDate: new Date('2026-10-16T18:00:00Z'),
    notes: 'Recent university graduate with hackathon honors.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-16T18:00:00Z'),
        note: 'Campus recruitment registration.',
        changedBy: 'System',
      },
    ],
  },
  {
    name: 'Karan Mehra',
    email: 'karan.m@example.com',
    phone: '+91 91234 56780',
    appliedRole: 'QA Automation Engineer',
    experience: 3,
    source: 'LinkedIn',
    skills: ['Playwright', 'Cypress', 'JavaScript', 'Selenium', 'Postman', 'CI/CD'],
    currentStage: 'Rejected',
    applicationDate: new Date('2026-10-02T13:30:00Z'),
    resumeUrl: 'https://example.com/resumes/karan_mehra.pdf',
    notes: 'Candidate accepted conflicting offer.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-02T13:30:00Z'),
        note: 'Applied via LinkedIn.',
        changedBy: 'System',
      },
      {
        fromStage: 'Applied',
        toStage: 'Screening',
        changedAt: new Date('2026-10-04T10:00:00Z'),
        note: 'Screening passed.',
        changedBy: 'Recruiter',
      },
      {
        fromStage: 'Screening',
        toStage: 'Rejected',
        changedAt: new Date('2026-10-07T14:00:00Z'),
        note: 'Candidate accepted another offer.',
        changedBy: 'Recruiter',
      },
    ],
  },
  {
    name: 'Meera Deshmukh',
    email: 'meera.d@example.com',
    phone: '+91 97654 32109',
    appliedRole: 'Frontend Engineer',
    experience: 5,
    source: 'Referral',
    skills: ['Vue.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vite', 'GraphQL'],
    currentStage: 'Interview',
    applicationDate: new Date('2026-10-11T12:00:00Z'),
    resumeUrl: 'https://example.com/resumes/meera_d.pdf',
    notes: 'Accessibility and design systems specialist.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-11T12:00:00Z'),
        note: 'Referred by product team.',
        changedBy: 'System',
      },
      {
        fromStage: 'Applied',
        toStage: 'Screening',
        changedAt: new Date('2026-10-13T09:30:00Z'),
        note: 'Passed initial review.',
        changedBy: 'Recruiter',
      },
      {
        fromStage: 'Screening',
        toStage: 'Interview',
        changedAt: new Date('2026-10-15T15:00:00Z'),
        note: 'Final round scheduled.',
        changedBy: 'Hiring Manager',
      },
    ],
  },
  {
    name: 'Tanvi Agarwal',
    email: 'tanvi.agarwal@example.com',
    phone: '+91 98980 11223',
    appliedRole: 'Product Designer',
    experience: 4,
    source: 'LinkedIn',
    skills: ['Figma', 'UI/UX Design', 'Design Tokens', 'Interaction Design'],
    currentStage: 'Applied',
    applicationDate: new Date('2026-10-17T08:15:00Z'),
    resumeUrl: 'https://example.com/resumes/tanvi_a.pdf',
    notes: 'Applied for Lead Product Designer opening.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-17T08:15:00Z'),
        note: 'Inbound application.',
        changedBy: 'System',
      },
    ],
  },
  {
    name: 'Aditya Rao',
    email: 'aditya.rao@example.com',
    phone: '+91 97410 88990',
    appliedRole: 'Backend Engineer',
    experience: 7,
    source: 'Company Careers Page',
    skills: ['Java', 'Spring Boot', 'Kafka', 'Microservices', 'PostgreSQL', 'AWS'],
    currentStage: 'Screening',
    applicationDate: new Date('2026-10-14T10:00:00Z'),
    resumeUrl: 'https://example.com/resumes/aditya_rao.pdf',
    notes: 'Senior engineer with distributed event streaming experience.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-14T10:00:00Z'),
        note: 'Applied through careers website.',
        changedBy: 'System',
      },
      {
        fromStage: 'Applied',
        toStage: 'Screening',
        changedAt: new Date('2026-10-16T14:00:00Z'),
        note: 'Recruiter phone screening scheduled.',
        changedBy: 'Recruiter',
      },
    ],
  },
  {
    name: 'Ishaan Gupta',
    email: 'ishaan.gupta@example.com',
    phone: '+91 98220 33445',
    appliedRole: 'Full Stack Developer',
    experience: 2,
    source: 'GitHub',
    skills: ['React', 'Next.js', 'Node.js', 'Prisma', 'Tailwind CSS'],
    currentStage: 'Applied',
    applicationDate: new Date('2026-10-17T14:30:00Z'),
    resumeUrl: 'https://example.com/resumes/ishaan_g.pdf',
    notes: 'Strong open-source contributions.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-17T14:30:00Z'),
        note: 'Direct applicant from GitHub Jobs.',
        changedBy: 'System',
      },
    ],
  },
  {
    name: 'Divya Iyer',
    email: 'divya.iyer@example.com',
    phone: '+91 99112 44556',
    appliedRole: 'QA Automation Engineer',
    experience: 4,
    source: 'Referral',
    skills: ['Selenium', 'Playwright', 'Jest', 'API Testing', 'Java', 'Python'],
    currentStage: 'Offer',
    applicationDate: new Date('2026-10-03T11:00:00Z'),
    resumeUrl: 'https://example.com/resumes/divya_i.pdf',
    notes: 'Offer package sent for Lead QA position.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: new Date('2026-10-03T11:00:00Z'),
        note: 'Employee referral.',
        changedBy: 'System',
      },
      {
        fromStage: 'Applied',
        toStage: 'Screening',
        changedAt: new Date('2026-10-05T09:00:00Z'),
        note: 'Screening cleared.',
        changedBy: 'Recruiter',
      },
      {
        fromStage: 'Screening',
        toStage: 'Interview',
        changedAt: new Date('2026-10-08T16:00:00Z'),
        note: 'Passed technical automation round.',
        changedBy: 'QA Lead',
      },
      {
        fromStage: 'Interview',
        toStage: 'Offer',
        changedAt: new Date('2026-10-14T11:30:00Z'),
        note: 'Offer extended.',
        changedBy: 'HR Director',
      },
    ],
  },
];

export const seedDatabase = async (): Promise<void> => {
  try {
    await connectDatabase();

    console.log('🌱 Seeding database with realistic candidate records...');

    // Clear existing candidates in development database
    const deleteResult = await Candidate.deleteMany({});
    console.log(`🧹 Cleared ${deleteResult.deletedCount} existing records.`);

    // Insert seeds
    const created = await Candidate.create(seedCandidates);
    console.log(`✅ Successfully seeded ${created.length} candidates across all 6 canonical stages.`);

    await disconnectDatabase();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// If run directly via CLI
if (process.argv[1]?.includes('seed')) {
  seedDatabase();
}
