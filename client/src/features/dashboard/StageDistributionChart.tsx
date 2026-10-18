import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { StageCountItem } from '../../types';
import { CanonicalStage } from '../../types';

interface StageDistributionChartProps {
  stageBreakdown: StageCountItem[];
  totalCandidates: number;
}

const STAGE_COLORS: Record<CanonicalStage, string> = {
  Applied: '#64748b', // Slate 500
  Screening: '#a855f7', // Purple 500
  Interview: '#3b82f6', // Blue 500
  Offer: '#f59e0b', // Amber 500
  Hired: '#10b981', // Emerald 500
  Rejected: '#f43f5e', // Rose 500
};

interface TooltipPayloadItem {
  value: number;
  payload: StageCountItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = STAGE_COLORS[data.stage] || '#3b82f6';

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-semibold text-slate-900">{data.stage}</span>
        </div>
        <div className="space-y-0.5 text-slate-600">
          <p className="flex justify-between gap-4">
            <span>Candidates:</span>
            <span className="font-bold text-slate-900">{data.count}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span>Share of Pipeline:</span>
            <span className="font-bold text-slate-900">{data.percentage}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const StageDistributionChart: React.FC<StageDistributionChartProps> = ({
  stageBreakdown,
  totalCandidates,
}) => {
  const chartData = stageBreakdown.map(item => ({
    ...item,
    formattedLabel: item.stage,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Hiring Pipeline Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Real-time candidate count across all 6 canonical hiring stages derived from MongoDB
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{totalCandidates} Total Applicants</span>
        </div>
      </div>

      {totalCandidates === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
          <p className="text-sm font-medium">No candidate records available to chart.</p>
          <p className="text-xs mt-1">Add applicants to visualize pipeline stage distribution.</p>
        </div>
      ) : (
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="formattedLabel"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map(entry => (
                  <Cell
                    key={`cell-${entry.stage}`}
                    fill={STAGE_COLORS[entry.stage] || '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stage Distribution Badge Chips */}
      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stageBreakdown.map(item => {
          const color = STAGE_COLORS[item.stage];
          return (
            <div
              key={item.stage}
              className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold text-slate-700">{item.stage}</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-slate-900">{item.count}</span>
                <span className="text-xs font-medium text-slate-500">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
