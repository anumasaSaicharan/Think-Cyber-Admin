'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useDashboard } from '@/hooks/use-dashboard';
import { 
  DashboardData, 
  DashboardLoadingState, 
  DashboardErrorState 
} from '@/services/dashboard-api';

interface DashboardContextType {
  data: DashboardData;
  loading: DashboardLoadingState;
  errors: DashboardErrorState;
  hasErrors: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  refreshSection: (section: keyof DashboardData) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: React.ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const dashboardData = useDashboard();

  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext(): DashboardContextType {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  
  return context;
}

// Utility hooks for specific dashboard sections
export function useDashboardSection<K extends keyof DashboardData>(
  section: K
): {
  data: DashboardData[K];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const { data, loading, errors, refreshSection } = useDashboardContext();
  
  return {
    data: data[section],
    loading: loading[section],
    error: errors[section],
    refresh: useCallback(() => refreshSection(section), [refreshSection, section])
  };
}