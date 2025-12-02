import { NextRequest, NextResponse } from 'next/server';
import { UserProgress } from '@/types/users';

// GET /users/{id}/progress - Get user progress
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

    // Mock user progress data
    const mockProgress: UserProgress = {
      userId: id,
      overview: {
        totalEnrollments: 5,
        completedCourses: 2,
        inProgressCourses: 3,
        totalWatchTime: 1250,
        certificatesEarned: 2,
        averageRating: 4.5,
        streakDays: 15
      },
      enrollments: [
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
          topicId: "topic_457",
          topicTitle: "Network Security Basics",
          topicCategory: "Network Security",
          enrollmentDate: "2024-02-01T00:00:00Z",
          status: "completed",
          progress: 100,
          completionDate: "2024-03-15T00:00:00Z",
          certificateEarned: true,
          rating: 5,
          timeSpent: 1200
        }
      ],
      achievements: [
        {
          id: "achievement_123",
          title: "First Course Completed",
          description: "Completed your first course",
          iconUrl: "https://example.com/icons/first-course.svg",
          earnedDate: "2024-02-01T00:00:00Z",
          category: "completion"
        },
        {
          id: "achievement_124",
          title: "Security Expert",
          description: "Completed 5 security courses",
          iconUrl: "https://example.com/icons/security-expert.svg",
          earnedDate: "2024-04-05T00:00:00Z",
          category: "skill"
        },
        {
          id: "achievement_125",
          title: "Learning Streak",
          description: "Maintained a 15-day learning streak",
          iconUrl: "https://example.com/icons/streak.svg",
          earnedDate: "2024-09-26T00:00:00Z",
          category: "engagement"
        }
      ],
      analytics: {
        learningStreak: {
          current: 15,
          longest: 28,
          lastActivity: "2024-09-26T10:00:00Z"
        },
        weeklyActivity: [
          {
            date: "2024-09-20",
            minutesSpent: 120,
            coursesAccessed: 2
          },
          {
            date: "2024-09-21",
            minutesSpent: 90,
            coursesAccessed: 1
          },
          {
            date: "2024-09-22",
            minutesSpent: 0,
            coursesAccessed: 0
          },
          {
            date: "2024-09-23",
            minutesSpent: 75,
            coursesAccessed: 1
          },
          {
            date: "2024-09-24",
            minutesSpent: 105,
            coursesAccessed: 2
          },
          {
            date: "2024-09-25",
            minutesSpent: 135,
            coursesAccessed: 3
          },
          {
            date: "2024-09-26",
            minutesSpent: 60,
            coursesAccessed: 1
          }
        ],
        skillProgress: [
          {
            skill: "Cybersecurity",
            level: 3,
            progress: 75,
            coursesCompleted: 2
          },
          {
            skill: "Network Security",
            level: 2,
            progress: 50,
            coursesCompleted: 1
          },
          {
            skill: "Web Security",
            level: 1,
            progress: 35,
            coursesCompleted: 0
          },
          {
            skill: "Incident Response",
            level: 1,
            progress: 0,
            coursesCompleted: 0
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: mockProgress
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user progress',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}