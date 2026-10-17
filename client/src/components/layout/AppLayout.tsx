import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { HealthCheckData, ApiResponse } from '../../types';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isBackendHealthy={isBackendHealthy}
      />
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet context={{ healthData, isBackendHealthy }} />
        </main>
      </div>
    </div>
  );
};
