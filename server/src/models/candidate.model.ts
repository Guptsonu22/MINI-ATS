import mongoose, { Schema, Document, Model } from 'mongoose';
import { CANONICAL_STAGES, CanonicalStage } from '../constants/stages.js';

export interface IStageHistory {
  fromStage: CanonicalStage | null;
  toStage: CanonicalStage;
  changedAt: Date;
  note?: string;
  changedBy?: string;
}

export interface ICandidate extends Document {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedRole: string;
  experience: number;
  skills: string[];
  source: string;
  currentStage: CanonicalStage;
  applicationDate: Date;
  resumeUrl?: string;
  notes?: string;
  stageHistory: IStageHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const stageHistorySchema = new Schema<IStageHistory>(
  {
    fromStage: {
      type: String,
      enum: [...CANONICAL_STAGES, null],
      default: null,
    },
    toStage: {
      type: String,
      enum: CANONICAL_STAGES,
      required: [true, 'Target stage is required'],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [1000, 'Stage note cannot exceed 1000 characters'],
    },
    changedBy: {
      type: String,
      trim: true,
      default: 'Recruiter',
    },
  },
  { _id: false }
);

const candidateSchema = new Schema<ICandidate>(
  {
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
    },
    appliedRole: {
      type: String,
      required: [true, 'Applied role is required'],
      trim: true,
      maxlength: [100, 'Applied role cannot exceed 100 characters'],
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      default: [],
      validate: {
        validator: (val: string[]) => Array.isArray(val) && val.length > 0,
        message: 'At least one skill is required',
      },
    },
    source: {
      type: String,
      required: [true, 'Candidate source is required'],
      trim: true,
      maxlength: [100, 'Source cannot exceed 100 characters'],
    },
    currentStage: {
      type: String,
      enum: {
        values: CANONICAL_STAGES,
        message: '{VALUE} is not a valid canonical stage',
      },
      default: 'Applied',
      required: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: undefined,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: undefined,
    },
    stageHistory: {
      type: [stageHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for fast lookup, filtering, and sorting
candidateSchema.index({ currentStage: 1 });
candidateSchema.index({ appliedRole: 1 });
candidateSchema.index({ applicationDate: -1 });
candidateSchema.index({ experience: 1 });
candidateSchema.index({ name: 'text', email: 'text' });

export const Candidate: Model<ICandidate> = mongoose.model<ICandidate>('Candidate', candidateSchema);
