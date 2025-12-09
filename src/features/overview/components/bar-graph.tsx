'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronDown, MoreHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { dashboardApiService } from '@/services/dashboard-api';

export const description = 'Updates panel with user list';

export function BarGraph() {
  const [activeTab] = React.useState<'enrolled'>('enrolled');
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');
  const [month, setMonth] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [enrolledData, setEnrolledData] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);

  // Initialize with current month - only on client side
  React.useEffect(() => {
    setMounted(true);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(currentMonth);
    
    // Set date range for current month
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(formatDate(firstDay));
    setToDate(formatDate(lastDay));
  }, []);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const fetchUpdates = React.useCallback(async (page = 1, limit = 10) => {
    debugger;
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        tab: activeTab,
        page,
        limit
      };

      // Use month parameter if set, otherwise use date range
      if (month) {
        params.month = month;
      } else if (fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
      }
      const response = await dashboardApiService.getUserUpdates(params);
      
      console.log('🔍 Full Response:', response);
      console.log('🔍 Response.success:', response.success);
      console.log('🔍 Response.data:', response.data);
      console.log('🔍 Response.data type:', typeof response.data);
      console.log('🔍 Is response.data an array?', Array.isArray(response.data));
 
      if (response.success && response.data) { 
        // response.data is already the array of items
        const apiData = response.data as any;
        console.log('🔍 apiData:', apiData);
        
        // Check if apiData is the array itself or contains data property
        const dataArray = Array.isArray(apiData) ? apiData : (apiData.data || []);
        const paginationData = Array.isArray(apiData) ? null : (apiData.pagination || null);
        
        console.log('🔍 Final dataArray:', dataArray);
        console.log('🔍 Final dataArray length:', dataArray.length);
        console.log('🔍 Final paginationData:', paginationData);
        
        setEnrolledData(dataArray);
        setPagination(paginationData);
      } else {
        console.log('❌ Response failed or no data');
        setError(response.error || 'Failed to fetch updates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching updates:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, month, fromDate, toDate]);

  // Fetch data when tab or dates change
  React.useEffect(() => {
    if (month || (fromDate && toDate)) {
      fetchUpdates();
    }
  }, [fetchUpdates, month, fromDate, toDate]);

  const handleRefresh = () => {
    fetchUpdates();
  };

  console.log('Enrolled Data:', enrolledData);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-600';
      case 'pending':
        return 'bg-yellow-50 text-yellow-600';
      case 'inactive':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-blue-50 text-blue-600';
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString || !mounted) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Card className='w-full h-full flex flex-col'>
        <CardHeader className='pb-3'>
          <div className='flex'>
            <CardTitle className='text-lg font-semibold'>Updates</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='pt-0 flex-1'>
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='flex items-center gap-3 p-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-3 w-16' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className='w-full h-full flex flex-col'>
        <CardHeader className='pb-3'>
          <div className='flex'>
            <CardTitle className='text-lg font-semibold'>Updates</CardTitle>
            <Skeleton className='h-6 w-6' />
          </div>
          <div className='flex gap-6 mt-4 pl-2.5'>
            <Skeleton className='h-8 w-16' />
            <Skeleton className='h-8 w-20' />
          </div>
        </CardHeader>
        <CardContent className='pt-0 flex-1'>
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='flex items-center gap-3 p-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-3 w-16' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='w-full h-full flex flex-col'>
        <CardHeader className='pb-3 flex flex-row items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Updatewwws</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleRefresh}
            className='h-8 w-8 px-10'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='pt-0 flex-1 flex flex-col items-center justify-center'>
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
    <Card className='w-full h-full flex flex-col'>
      <CardHeader className='pb-3 shrink-0'>
        <div className='flex items-center'>
          <CardTitle className='text-lg font-semibold'>Updates</CardTitle>
          <Button variant='ghost' size='sm' onClick={handleRefresh} disabled={loading} className='px-10'>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Header */}
        <div className='mt-4 border-b pb-2'>
          <div className='text-red-500 font-medium'>
            Enrolled
          </div>
          <div className='h-0.5 bg-red-500 w-20' />
        </div>

        {/* Month Selector */}
        {/* <div className='mt-4 flex items-center justify-start'>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className='h-9 px-3 pr-8 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer'
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value='2025-12'>December, 2025</option>
            <option value='2025-11'>November, 2025</option>
            <option value='2025-10'>October, 2025</option>
            <option value='2025-09'>September, 2025</option>
            <option value='2025-08'>August, 2025</option>
            <option value='2025-07'>July, 2025</option>
            <option value='2025-06'>June, 2025</option>
            <option value='2025-05'>May, 2025</option>
            <option value='2025-04'>April, 2025</option>
            <option value='2025-03'>March, 2025</option>
            <option value='2025-02'>February, 2025</option>
            <option value='2025-01'>January, 2025</option>
          </select>
        </div> */}

        {/* Date Range Selector */}
        {/* <div className='mt-3 flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600'>From</span>
            <input
              type='date'
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className='h-9 px-3 rounded-md border border-input bg-background text-sm'
            />
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600'>To</span>
            <input
              type='date'
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className='h-9 px-3 rounded-md border border-input bg-background text-sm'
            />
          </div>
        </div> */}
      </CardHeader>

      <CardContent className='pt-4 flex-1 overflow-hidden flex flex-col'>
        <div className='flex-1 overflow-y-auto pr-2 space-y-3'>
          <div className='space-y-3'>
            {enrolledData.length === 0 ? (
                <div className='text-center text-muted-foreground py-12'>
                  No enrollment updates found
                </div>
              ) : (
                enrolledData.slice(0, 5).map((item) => (
                  <div key={item.id} className='flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200'>
                    <Avatar className='h-10 w-10 shrink-0'>
                      <AvatarImage src={item.avatar} alt={item.userName} />
                      <AvatarFallback className='bg-orange-100 text-orange-600 text-xs font-semibold'>
                        {(item.userName || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2 mb-1'>
                        <div className='font-medium text-sm truncate'>{item.userName}</div>
                        <Badge 
                          variant='secondary' 
                          className={`text-xs shrink-0 ${
                            item.paymentStatus === 'completed' 
                              ? 'bg-green-50 text-green-700' 
                              : item.paymentStatus === 'pending'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {item.paymentStatus || item.status}
                        </Badge>
                      </div>
                      {item.userEmail && (
                        <div className='text-xs text-muted-foreground mb-1 truncate'>{item.userEmail}</div>
                      )}
                      {item.topicTitle && (
                        <div className='text-xs text-primary font-medium mb-1 truncate'>
                          📚 {item.topicTitle}
                        </div>
                      )}
                      <div className='flex items-center gap-3 text-xs text-muted-foreground flex-wrap'>
                        <span>📅 {formatDisplayDate(item.enrolledAt)}</span>
                        {item.progress > 0 && <span>📊 {item.progress}%</span>}
                        {item.watchTime && item.watchTime !== '0h 0m' && (
                          <span>⏱️ {item.watchTime}</span>
                        )}
                        {item.isSubscriptionActive && item.subscriptionEndDate && (
                          <span className='text-green-600 font-medium'>✓ Valid until {formatDisplayDate(item.subscriptionEndDate)}</span>
                        )}
                        {item.subscriptionValidDays && (
                          <span>🔄 {item.subscriptionValidDays} days</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-center pt-4 border-t'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fetchUpdates(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loading}
            >
              Previous
            </Button>
            <span className='text-sm text-muted-foreground'>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fetchUpdates(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
