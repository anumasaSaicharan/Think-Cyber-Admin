import { NextRequest, NextResponse } from 'next/server';
import { CreateUserRequest, User } from '@/types/users';

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and email are required',
          code: 'VALIDATION_ERROR',
          errors: {
            name: !body.name ? ['Name is required'] : [],
            email: !body.email ? ['Email is required'] : []
          }
        },
        { status: 400 }
      );
    }

    // Check if email already exists (mock check)
    if (body.email === 'existing@example.com') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email address is already in use',
          code: 'EMAIL_ALREADY_EXISTS'
        },
        { status: 409 }
      );
    }

    // Mock created user response
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: body.name,
      email: body.email,
      avatar: undefined,
      status: 'pending',
      role: body.role || 'student',
      phone: body.profile?.phone,
      address: body.address,
      profile: {
        firstName: body.profile.firstName,
        lastName: body.profile.lastName,
        dateOfBirth: body.profile.dateOfBirth,
        gender: body.profile.gender
      },
      enrollments: {
        total: 0,
        active: 0,
        completed: 0,
        inProgress: 0
      },
      subscription: body.subscription ? {
        plan: body.subscription.plan,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: body.subscription.autoRenew || false
      } : undefined,
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
          timezone: "UTC",
          theme: "system"
        }
      },
      timestamps: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: undefined,
        emailVerifiedAt: undefined
      },
      stats: {
        totalWatchTime: 0,
        coursesCompleted: 0,
        certificatesEarned: 0,
        averageRating: undefined,
        streakDays: 0
      }
    };

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "User created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}