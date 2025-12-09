'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { dashboardApiService } from '@/services/dashboard-api';

// Local item type for the monthly progress component
interface MonthlyReportItem {
  month: string;
  users: number;
  enrollments: number;
  revenue: number;
  growth: string;
}

export function MonthlyProgress() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<MonthlyReportItem[]>([]);

  const fetchMonthlyReport = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dashboardApiService.getMonthlyProgress();
      
      if (response.success && response.data) {
        // The API signature may return an object or an array; ensure we only set an array
        const reportData = Array.isArray(response.data) ? (response.data as MonthlyReportItem[]) : [];
        setData(reportData);
      } else {
        setError(response.error || 'Failed to load monthly report');
      }
    } catch (err) {
      setError('Failed to load monthly report');
      console.error('Error fetching monthly report:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMonthlyReport();
  }, [fetchMonthlyReport]);

  const handleRefresh = () => {
    fetchMonthlyReport();
  };

  // Get latest month data
  const latestMonth = data.length > 0 ? data[data.length - 1] : null;
  const previousMonth = data.length > 1 ? data[data.length - 2] : null;
  
  // Calculate percentage increase based on revenue
  const calculatePercentage = () => {
    if (!latestMonth || !previousMonth || previousMonth.revenue === 0) return 0;
    return Math.round(((latestMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100);
  };
  
  const percentage = calculatePercentage();
  const isPositive = percentage >= 0;

  if (loading) {
    return (
      <Card className='w-full h-[300px] flex flex-col'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg font-semibold'>Monthly increased amount</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center pb-6 flex-1'>
          <Skeleton className='w-32 h-32 rounded-full mb-4' />
          <Skeleton className='h-4 w-48' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='w-full h-[300px] flex flex-col'>
        <CardHeader className='pb-3 flex flex-row items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Monthly increased amount</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleRefresh}
            className='h-8 w-8 p-0'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center pb-6 flex-1'>
          <div className='flex items-center gap-2 text-destructive mb-4'>
            <AlertCircle className='h-5 w-5' />
            <p className='text-sm'>{error}</p>
          </div>
          <Button variant='outline' onClick={handleRefresh} size='sm'>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full h-[300px] flex flex-col overflow-hidden'>
      <CardHeader className='pb-2 shrink-0'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Monthly increased amount</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleRefresh} 
            disabled={loading}
            className='h-8 w-8 p-0'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col pb-4 flex-1 overflow-hidden'>
        {!latestMonth ? (
          <div className='text-center text-muted-foreground py-12'>
            No monthly data available
          </div>
        ) : (
          <>
            {/* Current Month Stats */}
            <div className='grid grid-cols-3 gap-3 mb-4'>
              <div className='text-center'>
                <div className='text-xs text-muted-foreground mb-1'>Users</div>
                <div className='text-xl font-bold'>{latestMonth.users}</div>
              </div>
              <div className='text-center'>
                <div className='text-xs text-muted-foreground mb-1'>Enrollments</div>
                <div className='text-xl font-bold'>{latestMonth.enrollments}</div>
              </div>
              <div className='text-center'>
                <div className='text-xs text-muted-foreground mb-1'>Revenue</div>
                <div className='text-xl font-bold'>${latestMonth.revenue.toFixed(2)}</div>
              </div>
            </div>

            {/* Growth Indicator */}
            <div className='flex items-center justify-center gap-2 mb-4'>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                {isPositive ? (
                  <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <TrendingDown className='h-4 w-4 text-red-600' />
                )}
                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {latestMonth.growth}
                </span>
              </div>
            </div>

            {/* Monthly Breakdown - Latest 3 months */}
            {/* <div className='space-y-2'>
              <div className='text-xs font-semibold text-muted-foreground mb-2'>Recent Months</div>
              {data.slice().reverse().slice(0, 3).map((monthData, index) => (
                <div 
                  key={monthData.month} 
                  className={`flex items-center justify-between p-2 rounded-lg border ${index === 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className='min-w-0 flex-1'>
                    <div className='font-semibold text-sm'>{monthData.month}</div>
                    <div className='text-xs text-muted-foreground truncate'>
                      {monthData.users} users • {monthData.enrollments} enrollments
                    </div>
                  </div>
                  <div className='text-right ml-2 shrink-0'>
                    <div className='font-bold text-sm'>${monthData.revenue.toFixed(2)}</div>
                    <div className={`text-xs ${monthData.growth.includes('+') ? 'text-green-600' : monthData.growth.includes('-') ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {monthData.growth}
                    </div>
                  </div>
                </div>
              ))}
            </div> */}
          </>
        )}
      </CardContent>
    </Card>
  );
}
