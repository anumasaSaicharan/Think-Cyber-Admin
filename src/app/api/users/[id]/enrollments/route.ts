import { NextRequest, NextResponse } from 'next/server';
import { UserEnrollment } from '@/types/users';

// GET /users/{id}/enrollments - Get user enrollments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Mock enrollments data
    const mockEnrollments: UserEnrollment[] = [
      {
        id: "enrollment_123",
        topicId: "topic_456",
        topicTitle: "Introduction to Cybersecurity",
        topicCategory: "Security Fundamentals",
        enrollmentDate: "2024-01-15T00:00:00Z",
        status: "in-progress",
        progress: 65,
        completionDate: undefined,
        certificateEarned: false,
        rating: undefined,
        timeSpent: 890
      },
      {
        id: "enrollment_124",
        topicTitle: "Network Security Basics",
        topicCategory: "Network Security",
        topicId: "topic_457",
        enrollmentDate: "2024-02-01T00:00:00Z",
        status: "completed",
        progress: 100,
        completionDate: "2024-03-15T00:00:00Z",
        certificateEarned: true,
        rating: 5,
        timeSpent: 1200
      },
      {
        id: "enrollment_125",
        topicId: "topic_458",
        topicTitle: "Web Application Security",
        topicCategory: "Web Security",
        enrollmentDate: "2024-03-20T00:00:00Z",
        status: "in-progress",
        progress: 35,
        completionDate: undefined,
        certificateEarned: false,
        rating: undefined,
        timeSpent: 450
      },
      {
        id: "enrollment_126",
        topicId: "topic_459",
        topicTitle: "Incident Response",
        topicCategory: "Security Management",
        enrollmentDate: "2024-04-10T00:00:00Z",
        status: "enrolled",
        progress: 0,
        completionDate: undefined,
        certificateEarned: false,
        rating: undefined,
        timeSpent: 0
      },
      {
        id: "enrollment_127",
        topicId: "topic_460",
        topicTitle: "Cryptography Fundamentals",
        topicCategory: "Cryptography",
        enrollmentDate: "2024-02-20T00:00:00Z",
        status: "completed",
        progress: 100,
        completionDate: "2024-04-05T00:00:00Z",
        certificateEarned: true,
        rating: 4,
        timeSpent: 980
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockEnrollments
    });

  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user enrollments',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}