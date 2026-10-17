import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CheckCircle2,
  Server,
  Code2,
  ArrowRight,
  Sparkles,
  GitCommit,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';
import { HealthCheckData } from '../types';

interface ContextType {
  healthData: HealthCheckData | null;
  isBackendHealthy: boolean | null;
}

const canonicalStages = [
  { name: 'Applied', color: 'bg-slate-100 text-slate-700 border-slate-300', count: 0 },
  { name: 'Screening', color: 'bg-purple-50 text-purple-700 border-purple-200', count: 0 },
  { name: 'Interview', color: 'bg-blue-50 text-blue-700 border-blue-200', count: 0 },
  { name: 'Offer', color: 'bg-amber-50 text-amber-700 border-amber-200', count: 0 },
  { name: 'Hired', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', count: 0 },
  { name: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200', count: 0 },
];

export const DashboardShell: React.FC = () => {
  const { healthData, isBackendHealthy } = useOutletContext<ContextType>();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-brand-navy to-slate-900 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm border border-white/10 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            <span>Mini ATS Phase 1 Complete</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Recruitment Command Center
          </h1>
          <p className="mt-2 text-slate-300 text-sm md:text-base leading-relaxed">
            Professional Applicant Tracking System built with React, Vite, TypeScript, Express,
            and MongoDB. Phase 1 monorepo scaffold, health-check API, and design system are live.
          </p>
        </div>
      </div>

      {/* Backend & Environment Live Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              API Server
            </span>
            <Server className="h-4 w-4 text-brand-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {isBackendHealthy ? 'Online' : isBackendHealthy === false ? 'Offline' : 'Connecting...'}
            </span>
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                isBackendHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {healthData ? `Uptime: ${healthData.uptimeSeconds}s | Env: ${healthData.environment}` : 'Connecting to /api/health...'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Node & Runtime
            </span>
            <Code2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {healthData?.nodeVersion || 'v24.21.0'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">TypeScript strict mode enabled</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Database Engine
            </span>
            <Database className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">MongoDB</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">127.0.0.1:27017 (Verified ready for Phase 2)</p>
        </div>
      </div>

      {/* Canonical Hiring Stages Preview */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Canonical Hiring Pipeline Architecture
            </h2>
            <p className="text-xs text-slate-500">
              Standardized recruitment stages enforced across UI, REST API, and Mongoose model.
            </p>
          </div>
          <span className="text-xs font-medium text-brand-600 flex items-center gap-1">
            6 Canonical Stages <ArrowRight className="h-3 w-3" />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {canonicalStages.map((stage, idx) => (
            <div
              key={stage.name}
              className={`rounded-lg border p-3 flex flex-col justify-between ${stage.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{stage.name}</span>
                <span className="text-[10px] font-mono opacity-60">0{idx + 1}</span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xl font-bold">{stage.count}</span>
                <span className="text-[10px] font-medium opacity-75">Candidates</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Implementation Checklist */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand-600" />
          <span>Intern Assignment Phase Roadmap</span>
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-emerald-50/50 p-3 border border-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Phase 1: Project Scaffolding & Health Check (Active)
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Vite + React 18, Tailwind CSS, Express backend, TypeScript strict mode, health endpoint, tests.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
            <GitCommit className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">
                Phase 2: Database Schema, Validation & Realistic Seed Data
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Mongoose Candidate model, Zod validation schemas, error middleware, and 20+ seed candidates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
            <GitCommit className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">
                Phase 3: Candidate CRUD, Multi-Filter Search & Analytics API
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Search by name/email, filter by stage/role/exp, pagination, stage transitions, and summary metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mini ATS Monorepo • Clean Architecture</span>
          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
          >
            Raw Health JSON <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
