'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useDashboardSection } from '@/contexts/dashboard-context';

export function DashboardStatsCards() {
  const { data, loading, error, refresh } = useDashboardSection('overview');

  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className='bg-gradient-to-br from-gray-100 to-gray-200 border-0'>
            <CardHeader className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-4 w-24' />
                </div>
                <Skeleton className='h-12 w-12 rounded-full' />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='md:col-span-2 lg:col-span-4 bg-destructive/10 border-destructive/20'>
          <CardHeader className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='h-5 w-5 text-destructive' />
                <CardTitle className='text-destructive'>Failed to load dashboard stats</CardTitle>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={refresh}
                className='border-destructive/20 hover:bg-destructive/10'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Retry
              </Button>
            </div>
            <CardDescription className='text-destructive/80'>
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Use API data if available, otherwise fallback to default values  
  const stats = {
    completedTopics: data?.metrics?.completedTopics?.count || data?.completedTopics || 2800,
    enrolledTopics: data?.metrics?.enrolledTopics?.count || data?.enrolledTopics || 1500,
    topicsInProgress: data?.metrics?.topicsInProgress?.count || data?.topicsInProgress || 800,
    totalWatchTime: data?.metrics?.totalWatchTime?.count || data?.totalWatchTime || 500
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Completed Topics Card */}
      <Card className='bg-gradient-to-br from-red-400 to-red-500 text-white border-0'>
        <CardHeader className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-3xl font-bold text-white mb-1'>
                {stats.completedTopics.toLocaleString()}
              </CardTitle>
              <CardDescription className='text-white/90 text-sm'>
                Completed Topics
              </CardDescription>
            </div>
            <div className='flex-shrink-0'>
              <img src='/assets/online-course.svg' alt='Completed' className='w-18 h-18' />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enrolled Topics Card */}
      <Card className='bg-gradient-to-br from-blue-400 to-blue-500 text-white border-0'>
        <CardHeader className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-3xl font-bold text-white mb-1'>
                {stats.enrolledTopics.toLocaleString()}
              </CardTitle>
              <CardDescription className='text-white/90 text-sm'>
                Enrolled Topics
              </CardDescription>
            </div>
            <div className='flex-shrink-0'>
              <img src='/assets/enroll.svg' alt='Enrolled' className='w-18 h-18' />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Topics In Progress Card */}
      <Card className='bg-gradient-to-br from-purple-400 to-purple-500 text-white border-0'>
        <CardHeader className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-3xl font-bold text-white mb-1'>
                {stats.topicsInProgress.toLocaleString()}
              </CardTitle>
              <CardDescription className='text-white/90 text-sm'>
                Topics In Progress
              </CardDescription>
            </div>
            <div className='flex-shrink-0'>
              <img src='/assets/multimedia.svg' alt='In Progress' className='w-18 h-18' />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Total Watch Time Card */}
      <Card className='bg-gradient-to-br from-green-400 to-green-500 text-white border-0'>
        <CardHeader className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-3xl font-bold text-white mb-1'>
                {stats.totalWatchTime.toLocaleString()}
              </CardTitle>
              <CardDescription className='text-white/90 text-sm'>
                Total Watch Time
              </CardDescription>
            </div>
            <div className='flex-shrink-0'>
              <img src='/assets/book.svg' alt='Watch Time' className='w-18 h-18' />
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}