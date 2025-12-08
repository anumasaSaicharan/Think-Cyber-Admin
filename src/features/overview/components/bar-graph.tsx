'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronDown, MoreHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { useDashboardSection } from '@/contexts/dashboard-context';

export const description = 'Updates panel with user list';

// Default fallback data
const defaultEnrolledData = [
  { id: '1', userId: '1', userName: 'Lori', action: 'enrollment', topicTitle: 'Introduction to Cybersecurity', timestamp: new Date().toISOString() },
  { id: '2', userId: '2', userName: 'Mitchell', action: 'enrollment', topicTitle: 'Advanced Network Security', timestamp: new Date().toISOString() },
  { id: '3', userId: '3', userName: 'Pramod', action: 'enrollment', topicTitle: 'Web Application Security', timestamp: new Date().toISOString() }
];

const defaultSubscribedData = [
  { id: '1', userId: '1', userName: 'Alice Johnson', action: 'subscription', timestamp: '2024-01-15T00:00:00Z' },
  { id: '2', userId: '2', userName: 'Bob Smith', action: 'subscription', timestamp: '2024-02-20T00:00:00Z' },
  { id: '3', userId: '3', userName: 'Carol Davis', action: 'subscription', timestamp: '2024-03-10T00:00:00Z' },
  { id: '4', userId: '4', userName: 'David Wilson', action: 'subscription', timestamp: '2024-01-05T00:00:00Z' }
];

export function BarGraph() {
  const [activeTab, setActiveTab] = React.useState<'enrolled' | 'subscribed'>('enrolled');
  const [dateRange, setDateRange] = React.useState('May, 2025');

  // NEW dynamic date state
  const [fromDate, setFromDate] = React.useState('2025-05-28');
  const [toDate, setToDate] = React.useState('2025-06-08');

  const { data, loading, error, refresh } = useDashboardSection('updates');

  const recentUpdates = data?.recentUpdates || [];

  const enrolledData =
    data?.enrolled?.length
      ? data.enrolled.map(item => ({
          id: item.id.toString(),
          userId: item.id.toString(),
          userName: item.name,
          action: 'enrollment',
          topicTitle: item.topicTitle,
          timestamp: item.enrolledAt
        }))
      : recentUpdates.filter(u => u.action === 'enrollment').length
      ? recentUpdates.filter(u => u.action === 'enrollment')
      : defaultEnrolledData;

  const subscribedData =
    data?.subscribed?.length
      ? data.subscribed.map(item => ({
          id: item.id.toString(),
          userId: item.id.toString(),
          userName: item.name,
          action: 'subscription',
          timestamp: item.joinDate + 'T00:00:00Z'
        }))
      : recentUpdates.filter(u => u.action === 'subscription').length
      ? recentUpdates.filter(u => u.action === 'subscription')
      : defaultSubscribedData;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  // Loading UI
  if (loading) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Updates</CardTitle>
            <Skeleton className="h-6 w-6" />
          </div>
          <div className="flex gap-6 mt-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error UI
  if (error) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Updates</CardTitle>
          <Button variant="ghost" size="sm" onClick={refresh} className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Failed to load updates</p>
          </div>
          <Button variant="outline" onClick={refresh} size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // MAIN COMPONENT
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0 space-y-4 overflow-hidden">

        {/* TOP ROW */}
        <div className="flex flex-wrap items-center justify-between w-full gap-4">

          {/* Tabs */}
          <div className="flex gap-6 flex-wrap">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                activeTab === 'enrolled'
                  ? 'text-red-500 border-red-500'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              Enrolled ({enrolledData.length})
            </button>

            <button
              onClick={() => setActiveTab('subscribed')}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                activeTab === 'subscribed'
                  ? 'text-red-500 border-red-500'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              Subscribed ({subscribedData.length})
            </button>
          </div>

          {/* Month Selector */}
          <Button variant="outline" size="sm" className="h-8 px-3 whitespace-nowrap">
            {dateRange}
            <ChevronDown className="h-3 w-3 ml-2" />
          </Button>
        </div>

        {/* DATE RANGE ROW — NOW DYNAMIC */}
        <div className="flex flex-wrap items-center gap-4 text-sm">

          {/* FROM DATE */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-muted-foreground">From</span>

            <div className="relative">
              <Calendar className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="
                  h-8 pl-8 pr-3 rounded-md border bg-background text-foreground 
                  border-input text-sm 
                  focus:outline-none focus:ring-2 focus:ring-ring
                  min-w-[130px]
                "
              />
            </div>
          </div>

          {/* TO DATE */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-muted-foreground">To</span>

            <div className="relative">
              <Calendar className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="
                  h-8 pl-8 pr-3 rounded-md border bg-background text-foreground 
                  border-input text-sm 
                  focus:outline-none focus:ring-2 focus:ring-ring
                  min-w-[130px]
                "
              />
            </div>
          </div>

        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-1 space-y-6">

          {activeTab === 'enrolled' ? (
            <div className="space-y-6">
              {enrolledData.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">No enrollment updates found</div>
              ) : (
                enrolledData.map(update => (
                  <div
                    key={update.id}
                    className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-accent dark:hover:bg-accent"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">
                          {update.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1.5">
                        <div className="font-medium text-sm">{update.userName}</div>

                        <Badge variant="secondary" className="text-xs">Enrolled</Badge>

                        <div className="text-xs text-red-500 flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {update.topicTitle}
                        </div>

                        <div className="text-xs text-muted-foreground">{formatDate(update.timestamp)}</div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-sm font-medium">Subscription Details</div>

              {subscribedData.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">No subscription updates found</div>
              ) : (
                subscribedData.map(update => (
                  <div
                    key={update.id}
                    className="border rounded-lg p-4 space-y-3 transition-colors hover:bg-accent dark:hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{update.userName}</div>

                      <Badge className="text-xs bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        Subscribed
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1.5">
                      <div>User ID: {update.userId}</div>
                      <div>Action: {update.action}</div>
                      <div>Date: {formatDate(update.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
