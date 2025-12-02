'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useDashboardContext } from '@/contexts/dashboard-context';

export function DashboardApiStatus() {
  const { data, loading, errors, hasErrors, isLoading, refresh, refreshSection } = useDashboardContext();

  const sections = [
    { key: 'overview', name: 'Overview Stats', description: 'Dashboard statistics' },
    { key: 'earnings', name: 'Earnings', description: 'Revenue and earnings data' },
    { key: 'monthlyProgress', name: 'Monthly Progress', description: 'Progress tracking' },
    { key: 'monthlyReport', name: 'Monthly Report', description: 'Detailed reports' },
    { key: 'updates', name: 'User Updates', description: 'Recent user activities' },
    { key: 'analytics', name: 'Analytics', description: 'User analytics data' }
  ] as const;

  const getSectionStatus = (key: keyof typeof data) => {
    if (loading[key]) return 'loading';
    if (errors[key]) return 'error';
    if (data[key]) return 'success';
    return 'idle';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Clock className='h-4 w-4 text-blue-500 animate-spin' />;
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'error':
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-400' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'success':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg font-semibold'>Dashboard API Status</CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Monitor and manage all dashboard API endpoints
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className={hasErrors ? 'border-red-200 text-red-600' : 'border-green-200 text-green-600'}
            >
              {hasErrors ? 'Has Errors' : 'All Good'}
            </Badge>
            <Button
              onClick={refresh}
              disabled={isLoading}
              size='sm'
              variant='outline'
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Overall Status */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {sections.filter(s => getSectionStatus(s.key) === 'success').length}
            </div>
            <div className='text-xs text-muted-foreground'>Successful</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-600'>
              {sections.filter(s => getSectionStatus(s.key) === 'error').length}
            </div>
            <div className='text-xs text-muted-foreground'>Failed</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {sections.filter(s => getSectionStatus(s.key) === 'loading').length}
            </div>
            <div className='text-xs text-muted-foreground'>Loading</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-600'>
              {sections.filter(s => getSectionStatus(s.key) === 'idle').length}
            </div>
            <div className='text-xs text-muted-foreground'>Idle</div>
          </div>
        </div>

        <Separator />

        {/* Individual Section Status */}
        <div className='space-y-3'>
          <h4 className='text-sm font-medium'>API Endpoints</h4>
          <div className='space-y-2'>
            {sections.map((section) => {
              const status = getSectionStatus(section.key);
              const hasData = data[section.key] !== null;
              const error = errors[section.key];

              return (
                <div
                  key={section.key}
                  className={`border rounded-lg p-3 ${getStatusColor(status)}`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {getStatusIcon(status)}
                      <div>
                        <div className='font-medium text-sm'>{section.name}</div>
                        <div className='text-xs opacity-75'>{section.description}</div>
                        {error && (
                          <div className='text-xs text-red-600 mt-1'>
                            Error: {error}
                          </div>
                        )}
                        {hasData && !error && (
                          <div className='text-xs text-green-600 mt-1'>
                            Data loaded successfully
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className={`text-xs ${getStatusColor(status)}`}
                      >
                        {status}
                      </Badge>
                      <Button
                        onClick={() => refreshSection(section.key)}
                        disabled={loading[section.key]}
                        size='sm'
                        variant='ghost'
                        className='h-8 w-8 p-0'
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${loading[section.key] ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Preview */}
        {Object.values(data).some(d => d !== null) && (
          <>
            <Separator />
            <div className='space-y-3'>
              <h4 className='text-sm font-medium'>Data Preview</h4>
              <div className='text-xs text-muted-foreground bg-muted p-3 rounded-lg overflow-auto max-h-40'>
                <pre>{JSON.stringify({ data }, null, 2)}</pre>
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        <Separator />
        <div className='text-sm text-muted-foreground space-y-2'>
          <h4 className='font-medium text-foreground'>Instructions:</h4>
          <ul className='space-y-1 list-disc list-inside'>
            <li>All dashboard APIs are called automatically when the page loads</li>
            <li>Use individual refresh buttons to reload specific sections</li>
            <li>Use "Refresh All" to reload all data simultaneously</li>
            <li>Error states show fallback data while indicating the failure</li>
            <li>Loading states prevent multiple simultaneous requests</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}