'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useDashboardSection } from '@/contexts/dashboard-context';

const defaultReportData = [
  { label: 'Total', value: '2.8K', color: 'bg-red-500' },
  { label: 'Topics', value: '5K', color: 'bg-blue-500' },
  { label: 'Subscribed', value: '2K', color: 'bg-purple-500' },
  { label: 'Enrolled', value: '1.2K', color: 'bg-green-500' }
];

const segments = ['Earnings', 'Topics', 'Subscribed', 'Enrolled'];

export function MonthlyReport() {
  const [activeSegment, setActiveSegment] = React.useState('Earnings');
  const { data, loading, error, refresh } = useDashboardSection('monthlyReport');

  // Format numbers for display
  const formatNumber = (num: number | undefined | null) => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Generate report data from API or use defaults with error handling
  let reportData;
  try {
    reportData = data?.segments ? [
      { label: data.segments.total?.label || 'Total', value: data.segments.total?.value || '0', color: data.segments.total?.color || 'bg-red-500' },
      { label: data.segments.topics?.label || 'Topics', value: data.segments.topics?.value || '0', color: data.segments.topics?.color || 'bg-blue-500' },
      { label: data.segments.subscribed?.label || 'Subscribed', value: data.segments.subscribed?.value || '0', color: data.segments.subscribed?.color || 'bg-purple-500' },
      { label: data.segments.enrolled?.label || 'Enrolled', value: data.segments.enrolled?.value || '0', color: data.segments.enrolled?.color || 'bg-green-500' }
    ] : data && (data.revenue || data.totalSubscriptions) ? [
      { label: 'Revenue', value: formatNumber(data.revenue), color: 'bg-red-500' },
      { label: 'Subscriptions', value: formatNumber(data.totalSubscriptions), color: 'bg-blue-500' },
      { label: 'New Subs', value: formatNumber(data.newSubscriptions), color: 'bg-purple-500' },
      { label: 'Cancelled', value: formatNumber(data.cancelledSubscriptions), color: 'bg-green-500' }
    ] : defaultReportData;
  } catch (err) {
    console.error('Error processing report data:', err);
    reportData = defaultReportData;
  }

  if (loading) {
    return (
      <Card className='w-full'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold'>
              Calculate monthly report based on each segment
            </CardTitle>
            <Skeleton className='h-8 w-20' />
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-12 w-full' />
          <div className='grid grid-cols-2 gap-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='text-center'>
                <Skeleton className='h-8 w-16 mx-auto mb-2' />
                <Skeleton className='h-4 w-12 mx-auto' />
              </div>
            ))}
          </div>
          <Skeleton className='h-10 w-full' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='w-full'>
        <CardHeader className='pb-3 flex flex-row items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Monthly Report</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={refresh}
            className='h-8 w-8 p-0'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center py-8'>
          <div className='flex items-center gap-2 text-destructive mb-4'>
            <AlertCircle className='h-5 w-5' />
            <p className='text-sm'>Failed to load sales data: {error}</p>
          </div>
          <Button variant='outline' onClick={refresh} size='sm'>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>
            Calculate monthly report based on each segment
          </CardTitle>
          <div className='flex items-center gap-2'>
            {data?.userGrowth && typeof data.userGrowth === 'number' && !isNaN(data.userGrowth) && (
              <Badge variant='outline' className={data.userGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                {data.userGrowth > 0 ? '+' : ''}{data.userGrowth.toFixed(1)}%
              </Badge>
            )}
            <Button variant='ghost' size='sm' className='text-sm text-muted-foreground'>
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              <ChevronDown className='ml-1 h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Segment Tabs */}
        <div className='flex space-x-1 p-1 bg-muted rounded-lg'>
          {segments.map((segment) => (
            <button
              key={segment}
              onClick={() => setActiveSegment(segment)}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                activeSegment === segment
                  ? 'bg-background text-red-600 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {segment}
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-2 gap-4'>
          {reportData.map((item, index) => (
            <div key={index} className='text-center'>
              <div className='flex items-center justify-center mb-2'>
                <div className={`w-3 h-3 ${item.color} rounded-full mr-2`}></div>
                <span className='text-2xl font-bold'>{item.value}</span>
              </div>
              <div className='text-sm text-muted-foreground'>{item.label}</div>
              {index === 0 && (
                <div className='text-xs text-muted-foreground mt-1'>
                  Payment Transactions
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Popular Topics */}
        {data?.popularTopics && Array.isArray(data.popularTopics) && data.popularTopics.length > 0 && (
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-muted-foreground'>Popular Topics</h4>
            <div className='space-y-1'>
              {data.popularTopics.slice(0, 3).map((topic) => (
                <div key={topic?.id || Math.random()} className='flex justify-between text-xs'>
                  <span className='truncate'>{topic?.title || 'Unknown Topic'}</span>
                  <span className='text-muted-foreground'>{topic?.enrollments || 0} enrollments</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Report Button */}
        <Button 
          className='w-full bg-purple-600 hover:bg-purple-700 text-white' 
          onClick={() => {
            try {
              refresh();
            } catch (error) {
              console.error('Error generating report:', error);
            }
          }}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
          <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </CardContent>
    </Card>
  );
}
