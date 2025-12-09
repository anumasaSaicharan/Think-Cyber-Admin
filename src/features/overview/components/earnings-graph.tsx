'use client';

import * as React from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { dashboardApiService } from '@/services/dashboard-api';
import { de } from '@faker-js/faker/.';

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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any>(null);
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());

  const fetchEarnings = React.useCallback(async () => {
    debugger;
    setLoading(true);
    setError(null);
    
    try {
      const response = await dashboardApiService.getEarningsData(selectedYear);
      debugger;
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to load earnings data');
      }
    } catch (err) {
      setError('Failed to load earnings data');
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  React.useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleRefresh = () => {
    fetchEarnings();
  };

  // Process API data - response structure: { success, data: [...], summary: {...} }
  const processEarningsData = () => {
    if (!data) return { chartData: defaultEarningsData, totalEarnings: 0, transactionCount: 0 };
    
    // Response structure: response.data is the whole object with 'data' array and 'summary'
    const apiData = Array.isArray(data) ? data : (data.data || data);
    const summary = Array.isArray(data) ? {} : (data.summary || {});
    
    // Use value directly, or count if value is 0
    const processedData = (Array.isArray(apiData) ? apiData : []).map((item: any) => ({
      ...item,
      displayValue: item.value || item.earnings || 0
    }));
    
    // Don't filter - show all months even if they have zero values
    // This ensures all 12 months are always visible
    
    // Calculate total earnings from data if not in summary
    const totalFromData = processedData.reduce((sum: number, item: any) => sum + (item.value || item.earnings || 0), 0);
    
    return {
      chartData: processedData.length > 0 ? processedData : defaultEarningsData,
      totalEarnings: summary.totalEarnings !== undefined ? summary.totalEarnings : totalFromData,
      transactionCount: summary.totalTransactions || processedData.reduce((sum: number, item: any) => sum + (item.count || 0), 0),
      year: summary.year || selectedYear,
      monthsIncluded: summary.monthsIncluded || 12
    };
  };
  
  const processedData = processEarningsData();
  const earningsData = processedData.chartData;
  const totalEarnings = processedData.totalEarnings;
  const transactionCount = processedData.transactionCount;

  if (loading) {
    return (
      <Card className='w-full h-100 flex flex-col'>
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
            onClick={handleRefresh}
            className='h-8 w-8 p-0'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='pb-4 flex-1 flex flex-col items-center justify-center'>
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

  // Calculate monthly increase
  const calculateMonthlyIncrease = () => {
    if (earningsData.length < 2) return null;
    
    // Get only months with data for comparison
    const dataMonths = earningsData.filter((item: any) => item.displayValue > 0);
    if (dataMonths.length < 2) return null;
    
    const lastMonth = dataMonths[dataMonths.length - 1];
    const previousMonth = dataMonths[dataMonths.length - 2];
    const lastValue = lastMonth.displayValue || 0;
    const prevValue = previousMonth.displayValue || 0;
    
    const increase = lastValue - prevValue;
    const percentChange = prevValue !== 0 ? ((increase / prevValue) * 100) : 0;
    
    return { increase, percentChange, lastMonth: lastMonth.month, prevMonth: previousMonth.month };
  };

  const monthlyIncrease = calculateMonthlyIncrease();

  return (
    <Card className='w-full h-[300px] flex flex-col'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg font-semibold mb-1'>Earnings</CardTitle>
            <div className='flex items-center gap-2'>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className='text-sm text-muted-foreground bg-transparent border border-gray-300 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500'
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
              {transactionCount > 0 && (
                <span className='text-xs text-muted-foreground'>
                  {transactionCount} transactions
                </span>
              )}
            </div>
          </div>
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
      <CardContent className='pb-4 flex-1 flex flex-col'>
        <div className='mb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='w-3 h-3 bg-red-500 rounded-full mr-2'></div>
              <div>
                <span className='text-2xl font-bold'>{formatEarnings(totalEarnings)}</span>
                {totalEarnings === 0 && transactionCount > 0 && (
                  <span className='text-sm text-muted-foreground ml-2'>({transactionCount} transactions)</span>
                )}
              </div>
            </div>
            {monthlyIncrease && (
              <div className='text-right'>
                <div className={`text-sm font-semibold ${monthlyIncrease.increase >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyIncrease.increase >= 0 ? '+' : ''}{formatEarnings(monthlyIncrease.increase)}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {monthlyIncrease.percentChange >= 0 ? '+' : ''}{monthlyIncrease.percentChange.toFixed(1)}% vs {monthlyIncrease.prevMonth}
                </div>
              </div>
            )}
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
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg'>
                        <p className='font-semibold text-sm mb-1'>{data.month}</p>
                        <p className='text-red-500 font-bold'>{formatEarnings(data.displayValue)}</p>
                        {data.count > 0 && (
                          <p className='text-xs text-muted-foreground mt-1'>
                            {data.count} transaction{data.count !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Line
                type='monotone'
                dataKey='displayValue'
                stroke='#ef4444'
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#ef4444' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
