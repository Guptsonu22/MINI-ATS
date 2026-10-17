import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardShell } from './pages/DashboardShell';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardShell />} />
          <Route
            path="candidates"
            element={
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-800">Candidates Module</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Candidate list, table, search, filters, and modal will be implemented in Phase 6.
                </p>
              </div>
            }
          />
          <Route
            path="pipeline"
            element={
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-800">Hiring Pipeline</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Kanban/Pipeline visual board will be implemented in Phase 6.
                </p>
              </div>
            }
          />
          <Route
            path="analytics"
            element={
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-800">Recruitment Analytics</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Recharts distribution charts and metrics will be implemented in Phase 5.
                </p>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
