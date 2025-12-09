'use client';

import { apiService, ApiResponse } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// Dashboard API Response Types
export interface DashboardOverviewStats {
  completedTopics?: number;
  enrolledTopics?: number;
  topicsInProgress?: number;
  totalWatchTime?: number;
  totalUsers?: number;
  activeUsers?: number;
  newRegistrations?: number;
  totalRevenue?: number;
  metrics?: {
    completedTopics?: {
      count: number;
      trend?: string;
      trendType?: string;
    };
    enrolledTopics?: {
      count: number;
      trend?: string;
      trendType?: string;
    };
    topicsInProgress?: {
      count: number;
      trend?: string;
      trendType?: string;
    };
    totalWatchTime?: {
      count: number;
      unit?: string;
      trend?: string;
      trendType?: string;
    };
  };
  revenue?: {
    totalRevenue?: number;
    newCustomers?: number;
    activeAccounts?: number;
    growthRate?: number;
    trends?: Record<string, any>;
  };
}

export interface DashboardEarnings {
  totalEarnings?: string | number;
  monthlyEarnings?: number;
  yearlyEarnings?: number;
  earningsGrowth?: number;
  period?: string;
  year?: number;
  earningsData?: {
    month: string;
    earnings: number;
  }[];
  chartData?: {
    month: string;
    value: number;
    earnings: number;
  }[];
}

export interface MonthlyProgress {
  percentage?: number;
  currentMonth?: string | {
    progress: number;
    percentage: number;
    target: number;
    achieved: number;
  };
  previousMonth?: {
    progress: number;
    percentage: number;
  };
  growth?: number;
  year?: number;
  metric?: string;
  description?: string;
  target?: number;
  achieved?: number;
}

export interface MonthlyReport { 
  totalPaymentTransactions?: number;
  segment?: string;
  totalTopics: number;
  totalEnrolled: number;
  totalSubscribed: number;
  totalEarnings?: number;
  totalSubscriptions?: number;
  newSubscriptions?: number;
  cancelledSubscriptions?: number;
  revenue?: number;
  userGrowth?: number;
  month?: string;
  year?: number;
  segments?: {
    total?: { value: string; label: string; color: string; };
    topics?: { value: string; label: string; color: string; };
    subscribed?: { value: string; label: string; color: string; };
    enrolled?: { value: string; label: string; color: string; };
  };
  activeSegment?: string;
  popularTopics?: {
    id: string;
    title: string;
    enrollments: number;
    completionRate: number;
  }[];
}

export interface UserUpdates {
  data: Array<any>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters?: {
    tab: string;
    month: string | null;
    fromDate: string | null;
    toDate: string | null;
  };
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userRetention: number;
  userEngagement: number;
  usersByLocation: {
    country: string;
    users: number;
  }[];
  userActivity: {
    date: string;
    activeUsers: number;
  }[];
}

// Combined dashboard data type
export interface DashboardData {
  overview: DashboardOverviewStats | null;
  earnings: DashboardEarnings | null;
  monthlyProgress: MonthlyProgress | null;
  monthlyReport: MonthlyReport | null;
  updates: UserUpdates | null;
  analytics: UserAnalytics | null;
}

// Loading state type
export interface DashboardLoadingState {
  overview: boolean;
  earnings: boolean;
  monthlyProgress: boolean;
  monthlyReport: boolean;
  updates: boolean;
  analytics: boolean;
}

// Error state type
export interface DashboardErrorState {
  overview: string | null;
  earnings: string | null;
  monthlyProgress: string | null;
  monthlyReport: string | null;
  updates: string | null;
  analytics: string | null;
}

class DashboardApiService {
  // Fetch dashboard overview statistics
  async getOverviewStats(): Promise<ApiResponse<DashboardOverviewStats>> {
    try {
      const response = await apiService.get<DashboardOverviewStats>(
        API_ENDPOINTS.DASHBOARD.OVERVIEW
      );
      return response;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      return {
        success: false,
        error: 'Failed to fetch dashboard overview statistics'
      };
    }
  }

  // Fetch dashboard earnings data
  async getEarningsData(year?: number): Promise<ApiResponse<DashboardEarnings>> {
    try {
      // Use current year if not provided
      const selectedYear = year || new Date().getFullYear();
      const response = await apiService.get<DashboardEarnings>(
        API_ENDPOINTS.DASHBOARD.EARNINGS(String(selectedYear))
      );
      return response;
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      return {
        success: false,
        error: 'Failed to fetch earnings data'
      };
    }
  }

  // Fetch monthly progress data
  async getMonthlyProgress(): Promise<ApiResponse<MonthlyProgress>> {
    try {
      const response = await apiService.get<MonthlyProgress>(
        API_ENDPOINTS.DASHBOARD.REPORT_MONTHLY
      );
      return response;
    } catch (error) {
      console.error('Error fetching monthly progress:', error);
      return {
        success: false,
        error: 'Failed to fetch monthly progress data'
      };
    }
  }

  // Fetch monthly report data
  async getMonthlyReport(params?: { segment: string; month: string }): Promise<ApiResponse<MonthlyReport>> {
    try {
      // Use default values if params not provided
      const segment = params?.segment || 'earnings';
      const now = new Date();
      const month = params?.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const endpoint = API_ENDPOINTS.DASHBOARD.REPORT_MONTHLY_NEW(segment, month);
      console.log('Fetching monthly report from endpoint:', endpoint);
      const response = await apiService.get<MonthlyReport>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      return {
        success: false,
        error: 'Failed to fetch monthly report data'
      };
    }
  }

  // Fetch monthly report data for download
  async getMonthlyReportDownload(params?: { segment: string; month: string }): Promise<ApiResponse<Blob>> {
    try {
      const segment = params?.segment || 'earnings';
      const now = new Date();
      const month = params?.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const endpoint = `${API_ENDPOINTS.DASHBOARD.REPORT_MONTHLY_NEW(segment, month)}&download=true`;
      console.log('Downloading report from endpoint:', endpoint);
      
      const response = await apiService.downloadBlob(endpoint);
      return response;
    } catch (error) {
      console.error('Error downloading monthly report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download monthly report'
      };
    }
  }

  // Fetch user updates data with optional filters
  async getUserUpdates(params?: {
    tab?: 'enrolled' | 'subscription';
    month?: string; // YYYY-MM format
    fromDate?: string; // YYYY-MM-DD format
    toDate?: string; // YYYY-MM-DD format
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<UserUpdates>> {
    try {
      // Build query parameters
      const queryParams: Record<string, string> = {};
      
      if (params?.tab) queryParams.tab = params.tab;
      if (params?.month) queryParams.month = params.month;
      if (params?.fromDate) queryParams.fromDate = params.fromDate;
      if (params?.toDate) queryParams.toDate = params.toDate;
      if (params?.page) queryParams.page = params.page.toString();
      if (params?.limit) queryParams.limit = params.limit.toString();

      // Build URL with query parameters
      const queryString = Object.keys(queryParams).length > 0
        ? `?${new URLSearchParams(queryParams).toString()}`
        : '';
      
      const endpoint = `${API_ENDPOINTS.DASHBOARD.UPDATES}${queryString}`;
      
      const response = await apiService.get<UserUpdates>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching user updates:', error);
      return {
        success: false,
        error: 'Failed to fetch user updates data'
      };
    }
  }

  // Fetch user analytics data
  async getUserAnalytics(): Promise<ApiResponse<UserAnalytics>> {
    try {
      const response = await apiService.get<UserAnalytics>(
        API_ENDPOINTS.DASHBOARD.ANALYTICS_USERS
      );
      return response;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return {
        success: false,
        error: 'Failed to fetch user analytics data'
      };
    }
  }

  // Fetch all dashboard data concurrently
  async getAllDashboardData(): Promise<{
    data: DashboardData;
    errors: DashboardErrorState;
    hasErrors: boolean;
  }> {
    const promises = [
      this.getOverviewStats(),
      this.getEarningsData(),
      this.getMonthlyProgress(),
      this.getMonthlyReport(),
      this.getUserUpdates(),
      this.getUserAnalytics()
    ];

    try {
      const [
        overviewResult,
        earningsResult,
        monthlyProgressResult,
        monthlyReportResult,
        updatesResult,
        analyticsResult
      ] = await Promise.allSettled(promises);

      const data: DashboardData = {
        overview: overviewResult.status === 'fulfilled' && overviewResult.value.success 
          ? (overviewResult.value.data as DashboardOverviewStats) || null 
          : null,
        earnings: earningsResult.status === 'fulfilled' && earningsResult.value.success 
          ? (earningsResult.value.data as DashboardEarnings) || null 
          : null,
        monthlyProgress: monthlyProgressResult.status === 'fulfilled' && monthlyProgressResult.value.success 
          ? (monthlyProgressResult.value.data as MonthlyProgress) || null 
          : null,
        monthlyReport: monthlyReportResult.status === 'fulfilled' && monthlyReportResult.value.success 
          ? (monthlyReportResult.value.data as MonthlyReport) || null 
          : null,
        updates: updatesResult.status === 'fulfilled' && updatesResult.value.success 
          ? (updatesResult.value.data as UserUpdates) || null 
          : null,
        analytics: analyticsResult.status === 'fulfilled' && analyticsResult.value.success 
          ? (analyticsResult.value.data as UserAnalytics) || null 
          : null
      };

      const errors: DashboardErrorState = {
        overview: overviewResult.status === 'rejected' || (overviewResult.status === 'fulfilled' && !overviewResult.value.success)
          ? (overviewResult.status === 'fulfilled' ? overviewResult.value.error : 'Request failed') || 'Failed to fetch overview data'
          : null,
        earnings: earningsResult.status === 'rejected' || (earningsResult.status === 'fulfilled' && !earningsResult.value.success)
          ? (earningsResult.status === 'fulfilled' ? earningsResult.value.error : 'Request failed') || 'Failed to fetch earnings data'
          : null,
        monthlyProgress: monthlyProgressResult.status === 'rejected' || (monthlyProgressResult.status === 'fulfilled' && !monthlyProgressResult.value.success)
          ? (monthlyProgressResult.status === 'fulfilled' ? monthlyProgressResult.value.error : 'Request failed') || 'Failed to fetch monthly progress data'
          : null,
        monthlyReport: monthlyReportResult.status === 'rejected' || (monthlyReportResult.status === 'fulfilled' && !monthlyReportResult.value.success)
          ? (monthlyReportResult.status === 'fulfilled' ? monthlyReportResult.value.error : 'Request failed') || 'Failed to fetch monthly report data'
          : null,
        updates: updatesResult.status === 'rejected' || (updatesResult.status === 'fulfilled' && !updatesResult.value.success)
          ? (updatesResult.status === 'fulfilled' ? updatesResult.value.error : 'Request failed') || 'Failed to fetch updates data'
          : null,
        analytics: analyticsResult.status === 'rejected' || (analyticsResult.status === 'fulfilled' && !analyticsResult.value.success)
          ? (analyticsResult.status === 'fulfilled' ? analyticsResult.value.error : 'Request failed') || 'Failed to fetch analytics data'
          : null
      };

      const hasErrors = Object.values(errors).some(error => error !== null);

      return { data, errors, hasErrors };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      const allNullData: DashboardData = {
        overview: null,
        earnings: null,
        monthlyProgress: null,
        monthlyReport: null,
        updates: null,
        analytics: null
      };

      const allErrorsState: DashboardErrorState = {
        overview: 'Failed to fetch data',
        earnings: 'Failed to fetch data',
        monthlyProgress: 'Failed to fetch data',
        monthlyReport: 'Failed to fetch data',
        updates: 'Failed to fetch data',
        analytics: 'Failed to fetch data'
      };

      return { 
        data: allNullData, 
        errors: allErrorsState, 
        hasErrors: true 
      };
    }
  }

  // Refresh specific dashboard section
  async refreshSection(section: keyof DashboardData): Promise<ApiResponse<any>> {
    switch (section) {
      case 'overview':
        return this.getOverviewStats();
      case 'earnings':
        return this.getEarningsData();
      case 'monthlyProgress':
        return this.getMonthlyProgress();
      case 'monthlyReport':
        return this.getMonthlyReport();
      case 'updates':
        return this.getUserUpdates();
      case 'analytics':
        return this.getUserAnalytics();
      default:
        return {
          success: false,
          error: `Unknown section: ${section}`
        };
    }
  }
}

// Export singleton instance
export const dashboardApiService = new DashboardApiService();

// Export the class for custom instances
export { DashboardApiService };