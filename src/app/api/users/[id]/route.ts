import { NextRequest, NextResponse } from 'next/server';
import { User, UpdateUserRequest } from '@/types/users';

// GET /users/{id} - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock user data - in production this would fetch from your database
    const mockUser: User = {
      id: id,
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://example.com/avatars/john.jpg",
      status: "active",
      role: "student",
      phone: "+1234567890",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        country: "USA",
        zipCode: "10001"
      },
      profile: {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-15",
        gender: "male",
        bio: "Cybersecurity enthusiast and learner",
        website: "https://johndoe.dev",
        socialLinks: {
          linkedin: "https://linkedin.com/in/johndoe",
          twitter: "https://twitter.com/johndoe",
          github: "https://github.com/johndoe"
        }
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
          theme: "light"
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
    };

    // Mock check if user exists
    if (id === 'nonexistent') {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mockUser
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user details',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// PUT /users/{id} - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateUserRequest = await request.json();

    // Mock check if user exists
    if (id === 'nonexistent') {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Mock updated user response (merge with existing data)
    const updatedUser: User = {
      id: id,
      name: body.name || "John Doe",
      email: body.email || "john.doe@example.com",
      avatar: "https://example.com/avatars/john.jpg",
      status: body.status || "active",
      role: body.role || "student",
      phone: body.profile?.phone || "+1234567890",
      address: {
        street: body.address?.street || "123 Main St",
        city: body.address?.city || "New York",
        state: body.address?.state || "NY",
        country: body.address?.country || "USA",
        zipCode: body.address?.zipCode || "10001"
      },
      profile: {
        firstName: body.profile?.firstName || "John",
        lastName: body.profile?.lastName || "Doe",
        dateOfBirth: body.profile?.dateOfBirth || "1990-01-15",
        gender: body.profile?.gender || "male",
        bio: body.profile?.bio || "Cybersecurity enthusiast and learner",
        website: body.profile?.website || "https://johndoe.dev"
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
          email: body.settings?.notifications?.email ?? true,
          push: body.settings?.notifications?.push ?? true,
          sms: body.settings?.notifications?.sms ?? false
        },
        privacy: {
          profileVisible: body.settings?.privacy?.profileVisible ?? true,
          showEmail: body.settings?.privacy?.showEmail ?? false,
          showProgress: body.settings?.privacy?.showProgress ?? true
        },
        preferences: {
          language: body.settings?.preferences?.language || "en",
          timezone: body.settings?.preferences?.timezone || "America/New_York",
          theme: body.settings?.preferences?.theme || "light"
        }
      },
      timestamps: {
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString(),
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
    };

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully"
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}