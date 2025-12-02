'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useDashboardSection } from '@/contexts/dashboard-context';

export function MonthlyProgress() {
  const { data, loading, error, refresh } = useDashboardSection('monthlyProgress');

  // Use API data if available, otherwise fallback to default
  const percentage = data?.percentage || (typeof data?.currentMonth === 'object' ? data?.currentMonth?.percentage : 60);
  const currentProgress = (typeof data?.currentMonth === 'object' ? data?.currentMonth?.progress : data?.achieved) || 0;
  const target = (typeof data?.currentMonth === 'object' ? data?.currentMonth?.target : data?.target) || 0;
  const growth = data?.growth || 0;

  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
            onClick={refresh}
            className='h-8 w-8 p-0'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center pb-6 flex-1'>
          <div className='flex items-center gap-2 text-destructive mb-4'>
            <AlertCircle className='h-5 w-5' />
            <p className='text-sm'>Failed to load data</p>
          </div>
          <Button variant='outline' onClick={refresh} size='sm'>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full h-[300px] flex flex-col'>
      <CardHeader className='pb-3 flex flex-row items-center justify-between'>
        <CardTitle className='text-lg font-semibold'>Monthly increased amount</CardTitle>
        <Button
          variant='ghost'
          size='sm'
          onClick={refresh}
          className='h-8 w-8 p-0'
        >
          <RefreshCw className='h-4 w-4' />
        </Button>
      </CardHeader>
      <CardContent className='flex flex-col items-center justify-center pb-6 flex-1'>
        <div className='relative w-32 h-32 mb-4'>
          <svg className='w-32 h-32 transform -rotate-90' viewBox='0 0 100 100'>
            {/* Background circle */}
            <circle
              cx='50'
              cy='50'
              r='40'
              stroke='currentColor'
              strokeWidth='8'
              fill='transparent'
              className='text-muted-foreground/20'
            />
            {/* Progress circle */}
            <circle
              cx='50'
              cy='50'
              r='40'
              stroke='#ef4444'
              strokeWidth='8'
              fill='transparent'
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap='round'
              className='transition-all duration-1000 ease-in-out'
            />
          </svg>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-foreground'>{percentage}%</div>
              {growth !== 0 && (
                <div className={`text-xs ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='text-center space-y-1'>
          <p className='text-sm text-muted-foreground'>
            Calculated with respect to per 100 subscription
          </p>
          {data && (
            <div className='text-xs text-muted-foreground'>
              {currentProgress} / {target} completed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
