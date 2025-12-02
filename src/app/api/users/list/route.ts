import { NextRequest, NextResponse } from 'next/server';
import { UserListParams, UserListResponse } from '@/types/users';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const params: UserListParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      search: searchParams.get('search') || undefined,
      status: searchParams.getAll('status').length ? searchParams.getAll('status') : undefined,
      role: searchParams.getAll('role').length ? searchParams.getAll('role') : undefined,
      subscription: searchParams.getAll('subscription').length ? searchParams.getAll('subscription') : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      country: searchParams.get('country') || undefined,
      enrollmentMin: searchParams.get('enrollmentMin') ? parseInt(searchParams.get('enrollmentMin')!) : undefined,
      enrollmentMax: searchParams.get('enrollmentMax') ? parseInt(searchParams.get('enrollmentMax')!) : undefined,
    };

    // Mock response for now - in production this would fetch from your database
    const mockResponse: UserListResponse = {
      users: [
        {
          id: "user_123",
          name: "John Doe",
          email: "john.doe@example.com",
          avatar: "https://example.com/avatars/john.jpg",
          status: "active",
          role: "student",
          phone: "+1234567890",
          address: {
            city: "New York",
            state: "NY",
            country: "USA"
          },
          profile: {
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1990-01-15",
            gender: "male"
          },
          enrollments: {
            total: 5,
            active: 3,
            completed: 2,
            inProgress: 3
          },
          subscription: {
            plan: "premium",
            status: "active",
            startDate: "2024-01-01T00:00:00Z",
            endDate: "2024-12-31T23:59:59Z",
            autoRenew: true
          },
          settings: {
            notifications: {
              email: true,
              push: true,
              sms: false
            },
            privacy: {
              profileVisible: true,
              showEmail: false,
              showProgress: true
            },
            preferences: {
              language: "en",
              timezone: "America/New_York",
              theme: "system"
            }
          },
          timestamps: {
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-09-26T12:00:00Z",
            lastLoginAt: "2024-09-25T18:30:00Z",
            emailVerifiedAt: "2024-01-01T01:00:00Z"
          },
          stats: {
            totalWatchTime: 1250,
            coursesCompleted: 2,
            certificatesEarned: 2,
            averageRating: 4.5,
            streakDays: 15
          }
        }
      ],
      pagination: {
        currentPage: params.page || 1,
        totalPages: 45,
        totalItems: 892,
        itemsPerPage: params.limit || 20,
        hasNextPage: true,
        hasPreviousPage: false
      },
      filters: {
        appliedFilters: params,
        availableFilters: {
          statuses: ["active", "inactive", "pending", "suspended"],
          roles: ["student", "instructor", "admin", "moderator"],
          subscriptions: ["free", "basic", "premium", "enterprise"],
          countries: ["USA", "Canada", "UK", "Australia", "India"]
        }
      },
      summary: {
        totalUsers: 892,
        activeUsers: 745,
        totalEnrollments: 3456,
        averageEnrollments: 3.9
      }
    };

    return NextResponse.json({
      success: true,
      data: mockResponse,
      message: "Users retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching users list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users list',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}