'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ArrowRight, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api-endpoints';
import { dashboardApiService } from '@/services/dashboard-api';
import { de } from '@faker-js/faker/.';

const segments = ['Earnings', 'Topics', 'Enrolled'];

export function MonthlyReport() {
  const [activeSegment, setActiveSegment] = React.useState('Earnings');
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [reportData, setReportData] = React.useState<any>(null);

  const months = React.useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);

  // Initialize with current month
  React.useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  const fetchReport = React.useCallback(async () => {
    if (!selectedMonth) {
      console.log('No month selected');
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const segmentMap: Record<string, string> = {
        'Earnings': 'earnings',
        'Topics': 'topics',
        'Enrolled': 'enrolled'
      };

      const segment = segmentMap[activeSegment] || 'earnings';
      console.log('Fetching report with:', { segment, month: selectedMonth });

      const response = await dashboardApiService.getMonthlyReport({
        segment: segment,
        month: selectedMonth
      });

      console.log('Monthly Report Response:', response);

      if (response && response.success && response.data) {
        setReportData(response.data);
      } else {
        setError(response?.error || 'Failed to fetch report');
      }
    } catch (err) {
      setError('Failed to fetch report');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  }, [activeSegment, selectedMonth]);

  React.useEffect(() => {
    if (selectedMonth) {
      fetchReport();
    }
  }, [fetchReport, selectedMonth]);

  const handleDownloadCSV = async () => {
    if (!selectedMonth) {
      console.log('No month selected for download');
      return;
    }
    try {
      const segmentMap: Record<string, string> = {
        'Earnings': 'earnings',
        'Topics': 'topics',
        'Enrolled': 'enrolled'
      };

      const segment = segmentMap[activeSegment] || 'earnings';

      const response = await dashboardApiService.getMonthlyReportDownload({
        segment,
        month: selectedMonth
      });

      if (response.success && response.data) {
        const blob = response.data as any;
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;

        // Generate filename based on segment and month
        const monthName = new Date(selectedMonth + '-01').toLocaleString('en-US', { month: 'short', year: 'numeric' });
        a.download = `${segment}_report_${monthName.replace(' ', '_')}.csv`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        throw new Error(response.error || 'Failed to download report');
      }
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError('Failed to download CSV report');
    }
  };

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

  const getDisplayData = () => {
    if (!reportData) {
      return [
        { label: 'Total', value: '0', color: 'bg-red-500', sublabel: 'Payment Transactions' },
        { label: 'Topics', value: '0', color: 'bg-blue-500', sublabel: '' },
        { label: 'Subscribed', value: '0', color: 'bg-purple-500', sublabel: '' },
        { label: 'Enrolled', value: '0', color: 'bg-green-500', sublabel: '' }
      ];
    }

    return [
      {
        label: 'Total',
        value: formatNumber(reportData.totalPaymentTransactions || 0),
        color: 'bg-red-500',
        sublabel: 'Payment Transactions'
      },
      {
        label: 'Topics',
        value: formatNumber(reportData.totalTopics || 0),
        color: 'bg-blue-500',
        sublabel: ''
      },
      {
        label: 'Subscribed',
        value: formatNumber(reportData.totalSubscribed || 0),
        color: 'bg-purple-500',
        sublabel: ''
      },
      {
        label: 'Enrolled',
        value: formatNumber(reportData.totalEnrolled || 0),
        color: 'bg-green-500',
        sublabel: ''
      }
    ];
  };

  const displayData = getDisplayData();

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
            onClick={fetchReport}
            className='h-8 w-8 p-0'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center py-8'>
          <div className='flex items-center gap-2 text-destructive mb-4'>
            <AlertCircle className='h-5 w-5' />
            <p className='text-sm'>{error}</p>
          </div>
          <Button variant='outline' onClick={fetchReport} size='sm'>
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
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className='h-9 px-3 pr-8 rounded-md border border-input bg-background text-sm cursor-pointer'
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <Button
              variant='ghost'
              size='sm'
              onClick={fetchReport}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${activeSegment === segment
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
          {displayData.map((item, index) => (
            <div key={index} className='text-center'>
              <div className='flex items-center justify-center mb-2'>
                <div className={`w-3 h-3 ${item.color} rounded-full mr-2`}></div>
                <span className='text-2xl font-bold'>{item.value}</span>
              </div>
              <div className='text-sm text-muted-foreground'>{item.label}</div>
              {item.sublabel && (
                <div className='text-xs text-muted-foreground mt-1'>
                  {item.sublabel}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Generate Report Buttons */}
        <div className='flex gap-2'>
          <Button
            className='flex-1 bg-purple-600 hover:bg-purple-700 text-white'
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            onClick={handleDownloadCSV}
            disabled={loading}
            className='px-4'
          >
            <Download className='h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
