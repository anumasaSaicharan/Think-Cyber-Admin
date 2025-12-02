import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import React from 'react';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { DashboardStatsCards } from '@/components/dashboard/dashboard-stats-cards';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-2'>
          <div className='flex items-center justify-between space-y-2'>
            <h2 className='text-2xl font-bold tracking-tight'>
              Hi, Welcome back 👋
            </h2>
          </div>

          {/* Dynamic Stats Cards */}
          <DashboardStatsCards />
          
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3' style={{ gridAutoRows: 'min-content' }}>
            {/* Updates section - spans 1 column with full height to match right side */}
            <div className='md:col-span-1 md:row-span-2'>
              <div className='h-full min-h-[600px]'>{bar_stats}</div>
            </div>
            
            {/* Earnings and Monthly Progress - side by side with equal heights */}
            <div className='md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch'>
              <div className='h-full'>{area_stats}</div>
              <div className='h-full'>{pie_stats}</div>
            </div>
            
            {/* Monthly Report - full width below the two cards */}
            <div className='md:col-span-2 w-full'>
              {/* sales parallel routes */}
              {sales}
            </div>
          </div>
        </div>
      </PageContainer>
    </DashboardProvider>
  );
}
