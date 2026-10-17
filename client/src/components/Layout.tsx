import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { HealthCheckData, ApiResponse } from '../types';

export const Layout: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const json: ApiResponse<HealthCheckData> = await response.json();
          if (json.success && json.data) {
            setHealthData(json.data);
            setIsBackendHealthy(true);
            return;
          }
        }
        setIsBackendHealthy(false);
      } catch {
        setIsBackendHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar isBackendHealthy={isBackendHealthy} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet context={{ healthData, isBackendHealthy }} />
        </main>
      </div>
    </div>
  );
};
