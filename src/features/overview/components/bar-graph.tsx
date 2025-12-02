'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronDown, MoreHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { useDashboardSection } from '@/contexts/dashboard-context';

export const description = 'Updates panel with user list';

// Default data for fallback
const defaultEnrolledData = [
  {
    id: '1',
    userId: '1',
    userName: 'Lori',
    action: 'enrollment' as const,
    topicTitle: 'Introduction to Cybersecurity',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    userId: '2',
    userName: 'Mitchell',
    action: 'enrollment' as const,
    topicTitle: 'Advanced Network Security',
    timestamp: new Date().toISOString()
  },
  {
    id: '3',
    userId: '3',
    userName: 'Pramod',
    action: 'enrollment' as const,
    topicTitle: 'Web Application Security',
    timestamp: new Date().toISOString()
  }
];

const defaultSubscribedData = [
  {
    id: '1',
    userId: '1',
    userName: 'Alice Johnson',
    action: 'subscription' as const,
    timestamp: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Bob Smith',
    action: 'subscription' as const,
    timestamp: '2024-02-20T00:00:00Z'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Carol Davis',
    action: 'subscription' as const,
    timestamp: '2024-03-10T00:00:00Z'
  },
  {
    id: '4',
    userId: '4',
    userName: 'David Wilson',
    action: 'subscription' as const,
    timestamp: '2024-01-05T00:00:00Z'
  }
];

export function BarGraph() {
  const [activeTab, setActiveTab] = React.useState<'enrolled' | 'subscribed'>('enrolled');
  const [dateRange, setDateRange] = React.useState('May, 2025');
  const { data, loading, error, refresh } = useDashboardSection('updates');

  // Use API data or fallback to default
  const recentUpdates = data?.recentUpdates || [];
  const enrolledData = data?.enrolled?.map(item => ({
    id: item.id.toString(),
    userId: item.id.toString(),
    userName: item.name,
    action: 'enrollment' as const,
    topicTitle: item.topicTitle,
    timestamp: item.enrolledAt
  })) || recentUpdates.filter(update => update.action === 'enrollment') || defaultEnrolledData;
  
  const subscribedData = data?.subscribed?.map(item => ({
    id: item.id.toString(),
    userId: item.id.toString(),
    userName: item.name,
    action: 'subscription' as const,
    timestamp: item.joinDate + 'T00:00:00Z'
  })) || recentUpdates.filter(update => update.action === 'subscription') || defaultSubscribedData;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className='w-full h-full flex flex-col'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold'>Updates</CardTitle>
            <Skeleton className='h-6 w-6' />
          </div>
          <div className='flex gap-6 mt-4'>
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
          <CardTitle className='text-lg font-semibold'>Updates</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={refresh}
            className='h-8 w-8 p-0'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='pt-0 flex-1 flex flex-col items-center justify-center'>
          <div className='flex items-center gap-2 text-destructive mb-4'>
            <AlertCircle className='h-5 w-5' />
            <p className='text-sm'>Failed to load updates</p>
          </div>
          <Button variant='outline' onClick={refresh} size='sm'>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full h-full min-h-[600px] flex flex-col'>
     <CardHeader className="pb-3 flex-shrink-0 space-y-4">

  {/* Top row → Tabs + Month dropdown */}
  <div className="flex items-center justify-between w-full">
    
    {/* Tabs */}
    <div className="flex gap-6">
      <button
        onClick={() => setActiveTab('enrolled')}
        className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
          activeTab === 'enrolled'
            ? 'text-red-500 border-red-500'
            : 'text-gray-500 border-transparent hover:text-gray-700'
        }`}
      >
        Enrolled ({enrolledData.length})
      </button>

      <button
        onClick={() => setActiveTab('subscribed')}
        className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
          activeTab === 'subscribed'
            ? 'text-red-500 border-red-500'
            : 'text-gray-500 border-transparent hover:text-gray-700'
        }`}
      >
        Subscribed ({subscribedData.length})
      </button>
    </div>

    {/* Month Selector */}
    <Button variant="outline" size="sm" className="h-8 px-3">
      {dateRange}
      <ChevronDown className="h-3 w-3 ml-2" />
    </Button>
  </div>

  {/* Date Range Row */}
  <div className="flex items-center gap-8 text-sm">
    <div className="flex items-center gap-3">
      <span className="text-gray-600">From</span>
      <Button variant="outline" size="sm" className="h-8 px-3">
        <Calendar className="h-3 w-3 mr-1" />
        28.05.2025
      </Button>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-gray-600">To</span>
      <Button variant="outline" size="sm" className="h-8 px-3">
        <Calendar className="h-3 w-3 mr-1" />
        08.06.2025
      </Button>
    </div>
  </div>
</CardHeader>


      <CardContent className='pt-4 flex-1 overflow-hidden flex flex-col'>
        <div className='flex-1 overflow-y-auto pr-2 max-h-[400px]'>
          {activeTab === 'enrolled' ? (
            // Enrolled Tab - User Cards
            <div className='space-y-6'>
              {enrolledData.length === 0 ? (
                <div className='text-center text-muted-foreground py-12'>
                  No enrollment updates found
                </div>
              ) : (
                enrolledData.map((update) => (
                  <div key={update.id} className='flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100'>
                    <div className='flex items-center gap-4'>
                      <Avatar className='h-12 w-12'>
                        <AvatarFallback className='bg-orange-100 text-orange-600 text-sm font-medium'>
                          {update.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='space-y-2'>
                        <div className='font-medium text-sm'>{update.userName}</div>
                        <Badge variant='secondary' className='text-xs bg-blue-50 text-blue-600 hover:bg-blue-50'>
                          Enrolled
                        </Badge>
                        <div className='text-xs text-red-500 flex items-center gap-1'>
                          <div className='w-1 h-1 bg-red-500 rounded-full'></div>
                          {update.topicTitle || 'Course enrollment'}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {formatDate(update.timestamp)}
                        </div>
                      </div>
                    </div>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Subscribed Tab - Table
            <div className='space-y-4'>
              <div className='text-sm font-medium text-gray-700 mb-4'>Subscription Details</div>
              <div className='space-y-4'>
                {subscribedData.length === 0 ? (
                  <div className='text-center text-muted-foreground py-12'>
                    No subscription updates found
                  </div>
                ) : (
                  subscribedData.map((update) => (
                    <div key={update.id} className='border rounded-lg p-4 hover:bg-gray-50 transition-colors space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='font-medium text-sm'>{update.userName}</div>
                        <Badge className='text-xs bg-green-50 text-green-600'>
                          Subscribed
                        </Badge>
                      </div>
                      <div className='text-xs text-gray-600 space-y-2'>
                        <div>User ID: {update.userId}</div>
                        <div>Action: {update.action}</div>
                        <div>Date: {formatDate(update.timestamp)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
