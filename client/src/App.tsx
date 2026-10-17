import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { PipelinePage } from './pages/PipelinePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { BarChart3, ArrowRight } from 'lucide-react';
import { Button } from './components/ui/Button';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="candidates/:id" element={<CandidateDetailPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route
            path="analytics"
            element={
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-xl mx-auto my-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mx-auto mb-4">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recruitment Analytics & Insights
                </h2>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Advanced Recharts stage conversion funnels, time-to-hire metrics, and sourcing
                  breakdown will be connected in Phase 5.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link to="/">
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
