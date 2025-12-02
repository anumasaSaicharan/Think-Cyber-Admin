import { NextRequest, NextResponse } from 'next/server';
import { UserStats } from '@/types/users';

export async function GET(request: NextRequest) {
  try {
    // Mock response for now - in production this would fetch from your database
    const mockStats: UserStats = {
      totalUsers: 2451,
      activeUsers: 1892,
      inactiveUsers: 312,
      pendingUsers: 156,
      suspendedUsers: 91,
      newThisMonth: 156,
      newThisWeek: 42,
      newToday: 8,
      averageEnrollments: 4.2,
      totalEnrollments: 10294,
      totalWatchTime: 125430,
      trends: {
        totalUsers: {
          value: "+15%",
          type: "increase"
        },
        activeUsers: {
          value: "+8%",
          type: "increase"
        },
        newUsers: {
          value: "+22%",
          type: "increase"
        },
        enrollments: {
          value: "+3%",
          type: "increase"
        }
      },
      demographics: {
        byAge: [
          {
            range: "18-25",
            count: 857,
            percentage: 35
          },
          {
            range: "26-35",
            count: 980,
            percentage: 40
          },
          {
            range: "36-45",
            count: 441,
            percentage: 18
          },
          {
            range: "46-55",
            count: 147,
            percentage: 6
          },
          {
            range: "55+",
            count: 26,
            percentage: 1
          }
        ],
        byCountry: [
          {
            country: "USA",
            count: 1225,
            percentage: 50
          },
          {
            country: "Canada",
            count: 490,
            percentage: 20
          },
          {
            country: "UK",
            count: 368,
            percentage: 15
          },
          {
            country: "Australia",
            count: 245,
            percentage: 10
          },
          {
            country: "Other",
            count: 123,
            percentage: 5
          }
        ],
        bySubscription: [
          {
            plan: "free",
            count: 1225,
            percentage: 50
          },
          {
            plan: "premium",
            count: 735,
            percentage: 30
          },
          {
            plan: "basic",
            count: 368,
            percentage: 15
          },
          {
            plan: "enterprise",
            count: 123,
            percentage: 5
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: mockStats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user statistics',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}