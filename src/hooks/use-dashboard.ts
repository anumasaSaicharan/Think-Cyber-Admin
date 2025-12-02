'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  dashboardApiService, 
  DashboardData, 
  DashboardLoadingState, 
  DashboardErrorState 
} from '@/services/dashboard-api';

interface UseDashboardReturn {
  data: DashboardData;
  loading: DashboardLoadingState;
  errors: DashboardErrorState;
  hasErrors: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  refreshSection: (section: keyof DashboardData) => Promise<void>;
}

const initialData: DashboardData = {
  overview: null,
  earnings: null,
  monthlyProgress: null,
  monthlyReport: null,
  updates: null,
  analytics: null
};

const initialLoadingState: DashboardLoadingState = {
  overview: false,
  earnings: false,
  monthlyProgress: false,
  monthlyReport: false,
  updates: false,
  analytics: false
};

const initialErrorState: DashboardErrorState = {
  overview: null,
  earnings: null,
  monthlyProgress: null,
  monthlyReport: null,
  updates: null,
  analytics: null
};

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState<DashboardLoadingState>(initialLoadingState);
  const [errors, setErrors] = useState<DashboardErrorState>(initialErrorState);

  // Calculate derived states
  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(error => error !== null);

  // Fetch all dashboard data
  const fetchAllData = useCallback(async () => {
    // Set all loading states to true
    setLoading({
      overview: true,
      earnings: true,
      monthlyProgress: true,
      monthlyReport: true,
      updates: true,
      analytics: true
    });

    try {
      const result = await dashboardApiService.getAllDashboardData();
      
      setData(result.data);
      setErrors(result.errors);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Set all errors
      const allErrorsState: DashboardErrorState = {
        overview: 'Failed to fetch data',
        earnings: 'Failed to fetch data',
        monthlyProgress: 'Failed to fetch data',
        monthlyReport: 'Failed to fetch data',
        updates: 'Failed to fetch data',
        analytics: 'Failed to fetch data'
      };
      
      setErrors(allErrorsState);
    } finally {
      // Set all loading states to false
      setLoading(initialLoadingState);
    }
  }, []);

  // Refresh specific section
  const refreshSection = useCallback(async (section: keyof DashboardData) => {
    // Set specific loading state to true
    setLoading(prev => ({ ...prev, [section]: true }));
    
    // Clear specific error
    setErrors(prev => ({ ...prev, [section]: null }));

    try {
      const result = await dashboardApiService.refreshSection(section);
      
      if (result.success) {
        setData(prev => ({ ...prev, [section]: result.data }));
      } else {
        setErrors(prev => ({ ...prev, [section]: result.error || 'Failed to fetch data' }));
      }
    } catch (error) {
      console.error(`Error refreshing ${section}:`, error);
      setErrors(prev => ({ 
        ...prev, 
        [section]: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
    } finally {
      // Set specific loading state to false
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  }, []);

  // Refresh all data
  const refresh = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    data,
    loading,
    errors,
    hasErrors,
    isLoading,
    refresh,
    refreshSection
  };
}

// Export individual section hooks for more granular usage
export function useDashboardOverview() {
  const { data, loading, errors, refreshSection } = useDashboard();
  
  return {
    data: data.overview,
    loading: loading.overview,
    error: errors.overview,
    refresh: () => refreshSection('overview')
  };
}

export function useDashboardEarnings() {
  const { data, loading, errors, refreshSection } = useDashboard();
  
  return {
    data: data.earnings,
    loading: loading.earnings,
    error: errors.earnings,
    refresh: () => refreshSection('earnings')
  };
}

export function useDashboardMonthlyProgress() {
  const { data, loading, errors, refreshSection } = useDashboard();
  
  return {
    data: data.monthlyProgress,
    loading: loading.monthlyProgress,
    error: errors.monthlyProgress,
    refresh: () => refreshSection('monthlyProgress')
  };
}

export function useDashboardMonthlyReport() {
  const { data, loading, errors, refreshSection } = useDashboard();
  
  return {
    data: data.monthlyReport,
    loading: loading.monthlyReport,
    error: errors.monthlyReport,
    refresh: () => refreshSection('monthlyReport')
  };
}

export function useDashboardUpdates() {
  const { data, loading, errors, refreshSection } = useDashboard();
  
  return {
    data: data.updates,
    loading: loading.updates,
    error: errors.updates,
    refresh: () => refreshSection('updates')
  };
}

export function useDashboardAnalytics() {
  const { data, loading, errors, refreshSection } = useDashboard();
  
  return {
    data: data.analytics,
    loading: loading.analytics,
    error: errors.analytics,
    refresh: () => refreshSection('analytics')
  };
}