'use client';

import * as React from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { useDashboardSection } from '@/contexts/dashboard-context';

const defaultEarningsData = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 8 },
  { month: 'Mar', value: 14 },
  { month: 'Apr', value: 10 },
  { month: 'May', value: 16 },
  { month: 'Jun', value: 13 },
  { month: 'Jul', value: 15 }
];

export function EarningsGraph() {
  const { data, loading, error, refresh } = useDashboardSection('earnings');

  // Use API data if available, otherwise fallback to default
  const earningsData = data?.chartData || data?.earningsData || defaultEarningsData;
  const totalEarnings = data?.totalEarnings || 15;
  const earningsGrowth = data?.earningsGrowth || 0;

  if (loading) {
    return (
      <Card className='w-full h-[300px] flex flex-col'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-lg font-semibold mb-1'>Earnings</CardTitle>
              <Skeleton className='h-4 w-12' />
            </div>
            <Skeleton className='h-8 w-20' />
          </div>
        </CardHeader>
        <CardContent className='pb-4 flex-1 flex flex-col'>
          <div className='mb-4'>
            <Skeleton className='h-8 w-16' />
          </div>
          <Skeleton className='flex-1 w-full' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='w-full h-[300px] flex flex-col'>
        <CardHeader className='pb-3 flex flex-row items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Earnings</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={refresh}
            className='h-8 w-8 p-0'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='pb-4 flex-1 flex flex-col items-center justify-center'>
          <div className='flex items-center gap-2 text-destructive mb-4'>
            <AlertCircle className='h-5 w-5' />
            <p className='text-sm'>Failed to load earnings data</p>
          </div>
          <Button variant='outline' onClick={refresh} size='sm'>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatEarnings = (value: string | number) => {
    if (typeof value === 'string') {
      return value; // Already formatted (like "1.2M")
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <Card className='w-full h-[300px] flex flex-col'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg font-semibold mb-1'>Earnings</CardTitle>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted-foreground'>
                {new Date().getFullYear()}
              </p>
              {earningsGrowth !== 0 && (
                <span className={`text-xs ${earningsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {earningsGrowth > 0 ? '+' : ''}{earningsGrowth.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <Button variant='ghost' size='sm' className='text-sm text-muted-foreground'>
            Monthly
            <ChevronDown className='ml-1 h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='pb-4 flex-1 flex flex-col'>
        <div className='mb-4'>
          <div className='flex items-center'>
            <div className='w-3 h-3 bg-red-500 rounded-full mr-2'></div>
            <span className='text-2xl font-bold'>{formatEarnings(totalEarnings)}</span>
          </div>
        </div>
        <div className='flex-1 min-h-[120px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={earningsData}>
              <XAxis 
                dataKey='month' 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis hide />
              <Line
                type='monotone'
                dataKey={data?.earningsData?.[0]?.earnings ? 'earnings' : 'value'}
                stroke='#ef4444'
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
