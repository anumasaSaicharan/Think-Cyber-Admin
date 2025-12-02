# Users List API Documentation

## Overview
This document outlines the complete API structure for the Users List functionality in the ThinkCyber Admin Dashboard.

## API Endpoints

### Base URL: `http://localhost:8081/ThinkCyber/server/api`

---

## 1. Get Users List

### Request
```
GET /users/list
```

### Query Parameters
```typescript
{
  page?: number;              // Default: 1
  limit?: number;             // Default: 20, Max: 100
  search?: string;            // Search in name, email
  status?: string[];          // ['active', 'inactive', 'pending', 'suspended']
  role?: string[];            // ['student', 'instructor', 'admin', 'moderator']
  subscription?: string[];    // ['free', 'basic', 'premium', 'enterprise']
  sortBy?: string;           // 'name' | 'email' | 'createdAt' | 'lastLoginAt' | 'enrollments'
  sortOrder?: string;        // 'asc' | 'desc'
  dateFrom?: string;         // ISO date string
  dateTo?: string;           // ISO date string
  country?: string;          // Country filter
  enrollmentMin?: number;    // Minimum enrollments
  enrollmentMax?: number;    // Maximum enrollments
}
```

### Example Request
```
GET /users/list?page=1&limit=20&search=john&status=active&status=pending&sortBy=createdAt&sortOrder=desc
```

### Response
```typescript
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "avatar": "https://example.com/avatars/john.jpg",
        "status": "active",
        "role": "student",
        "phone": "+1234567890",
        "address": {
          "city": "New York",
          "state": "NY",
          "country": "USA"
        },
        "profile": {
          "firstName": "John",
          "lastName": "Doe",
          "dateOfBirth": "1990-01-15",
          "gender": "male"
        },
        "enrollments": {
          "total": 5,
          "active": 3,
          "completed": 2,
          "inProgress": 3
        },
        "subscription": {
          "plan": "premium",
          "status": "active",
          "startDate": "2024-01-01T00:00:00Z",
          "endDate": "2024-12-31T23:59:59Z",
          "autoRenew": true
        },
        "timestamps": {
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-09-26T12:00:00Z",
          "lastLoginAt": "2024-09-25T18:30:00Z",
          "emailVerifiedAt": "2024-01-01T01:00:00Z"
        },
        "stats": {
          "totalWatchTime": 1250,
          "coursesCompleted": 2,
          "certificatesEarned": 2,
          "averageRating": 4.5,
          "streakDays": 15
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 45,
      "totalItems": 892,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "filters": {
      "appliedFilters": {
        "search": "john",
        "status": ["active", "pending"],
        "sortBy": "createdAt",
        "sortOrder": "desc"
      },
      "availableFilters": {
        "statuses": ["active", "inactive", "pending", "suspended"],
        "roles": ["student", "instructor", "admin", "moderator"],
        "subscriptions": ["free", "basic", "premium", "enterprise"],
        "countries": ["USA", "Canada", "UK", "Australia", "India"]
      }
    },
    "summary": {
      "totalUsers": 892,
      "activeUsers": 745,
      "totalEnrollments": 3456,
      "averageEnrollments": 3.9
    }
  },
  "message": "Users retrieved successfully"
}
```

---

## 2. Get User Statistics

### Request
```
GET /users/stats
```

### Response
```typescript
{
  "success": true,
  "data": {
    "totalUsers": 2451,
    "activeUsers": 1892,
    "inactiveUsers": 312,
    "pendingUsers": 156,
    "suspendedUsers": 91,
    "newThisMonth": 156,
    "newThisWeek": 42,
    "newToday": 8,
    "averageEnrollments": 4.2,
    "totalEnrollments": 10294,
    "totalWatchTime": 125430,
    "trends": {
      "totalUsers": {
        "value": "+15%",
        "type": "increase"
      },
      "activeUsers": {
        "value": "+8%",
        "type": "increase"
      },
      "newUsers": {
        "value": "+22%",
        "type": "increase"
      },
      "enrollments": {
        "value": "+3%",
        "type": "increase"
      }
    },
    "demographics": {
      "byAge": [
        {
          "range": "18-25",
          "count": 857,
          "percentage": 35
        },
        {
          "range": "26-35",
          "count": 980,
          "percentage": 40
        }
      ],
      "byCountry": [
        {
          "country": "USA",
          "count": 1225,
          "percentage": 50
        },
        {
          "country": "Canada",
          "count": 490,
          "percentage": 20
        }
      ],
      "bySubscription": [
        {
          "plan": "free",
          "count": 1225,
          "percentage": 50
        },
        {
          "plan": "premium",
          "count": 735,
          "percentage": 30
        }
      ]
    }
  }
}
```

---

## 3. Get User by ID

### Request
```
GET /users/{id}
```

### Response
```typescript
{
  "success": true,
  "data": {
    // Complete user object with all fields
    "id": "user_123",
    "name": "John Doe",
    // ... all user fields as defined in User interface
  }
}
```

---

## 4. Create User

### Request
```
POST /users
```

### Request Body
```typescript
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!",
  "role": "student",
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "dateOfBirth": "1995-03-20",
    "gender": "female"
  },
  "address": {
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "country": "USA",
    "zipCode": "02101"
  },
  "subscription": {
    "plan": "basic",
    "autoRenew": true
  },
  "sendWelcomeEmail": true
}
```

### Response
```typescript
{
  "success": true,
  "data": {
    // Complete user object
  },
  "message": "User created successfully"
}
```

---

## 5. Update User

### Request
```
PUT /users/{id}
```

### Request Body
```typescript
{
  "name": "John Doe Updated",
  "status": "active",
  "profile": {
    "phone": "+1987654321",
    "bio": "Updated bio"
  }
}
```

---

## 6. Bulk Operations

### Request
```
POST /users/bulk-update
```

### Request Body
```typescript
{
  "userIds": ["user_123", "user_456", "user_789"],
  "operation": "activate",
  "reason": "Bulk activation for promotion",
  "notifyUsers": true
}
```

### Response
```typescript
{
  "success": true,
  "data": {
    "success": 2,
    "failed": 1,
    "results": [
      {
        "id": "user_123",
        "success": true
      },
      {
        "id": "user_456",
        "success": true
      },
      {
        "id": "user_789",
        "success": false,
        "error": "User not found"
      }
    ]
  }
}
```

---

## 7. User Enrollments

### Request
```
GET /users/{id}/enrollments
```

### Response
```typescript
{
  "success": true,
  "data": [
    {
      "id": "enrollment_123",
      "topicId": "topic_456",
      "topicTitle": "Introduction to Cybersecurity",
      "topicCategory": "Security Fundamentals",
      "enrollmentDate": "2024-01-15T00:00:00Z",
      "status": "in-progress",
      "progress": 65,
      "completionDate": null,
      "certificateEarned": false,
      "rating": null,
      "timeSpent": 890
    }
  ]
}
```

---

## 8. User Progress

### Request
```
GET /users/{id}/progress
```

### Response
```typescript
{
  "success": true,
  "data": {
    "userId": "user_123",
    "overview": {
      "totalEnrollments": 5,
      "completedCourses": 2,
      "inProgressCourses": 3,
      "totalWatchTime": 1250,
      "certificatesEarned": 2,
      "averageRating": 4.5,
      "streakDays": 15
    },
    "enrollments": [
      // Array of enrollments
    ],
    "achievements": [
      {
        "id": "achievement_123",
        "title": "First Course Completed",
        "description": "Completed your first course",
        "iconUrl": "https://example.com/icons/first-course.svg",
        "earnedDate": "2024-02-01T00:00:00Z",
        "category": "completion"
      }
    ],
    "analytics": {
      "learningStreak": {
        "current": 15,
        "longest": 28,
        "lastActivity": "2024-09-26T10:00:00Z"
      },
      "weeklyActivity": [
        {
          "date": "2024-09-20",
          "minutesSpent": 120,
          "coursesAccessed": 2
        }
      ],
      "skillProgress": [
        {
          "skill": "Cybersecurity",
          "level": 3,
          "progress": 75,
          "coursesCompleted": 2
        }
      ]
    }
  }
}
```

---

## Error Responses

### Standard Error Format
```typescript
{
  "success": false,
  "error": "Error message",
  "errors": {
    "field": ["Validation error message"]
  },
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `USER_NOT_FOUND` - User with specified ID doesn't exist
- `EMAIL_ALREADY_EXISTS` - Email address is already in use
- `INVALID_CREDENTIALS` - Invalid authentication credentials
- `PERMISSION_DENIED` - Insufficient permissions for operation
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Implementation Notes

### Frontend Integration
1. Use the `usersApiService` for all API calls
2. Implement proper loading states
3. Handle pagination for large user lists
4. Add search debouncing (300ms delay)
5. Cache user stats for 5 minutes
6. Implement optimistic updates for status changes

### Performance Considerations
- Default page size: 20 users
- Maximum page size: 100 users
- Search queries cached for 1 minute
- User details cached for 15 minutes
- Implement virtual scrolling for large lists

### Security
- All endpoints require authentication
- Admin role required for user creation/deletion
- Bulk operations limited to 100 users at once
- Rate limiting: 100 requests per minute per user