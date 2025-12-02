// Users API Types and Interfaces

export interface User {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  role?: 'student' | 'instructor' | 'admin' | 'moderator';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
    website?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    inProgress: number;
  };
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'expired' | 'cancelled';
    startDate: string;
    endDate?: string;
    autoRenew: boolean;
  };
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisible: boolean;
      showEmail: boolean;
      showProgress: boolean;
    };
    preferences: {
      language: string;
      timezone: string;
      theme: 'light' | 'dark' | 'system';
    };
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    emailVerifiedAt?: string;
  };
  stats: {
    totalWatchTime: number; // in minutes
    coursesCompleted: number;
    certificatesEarned: number;
    averageRating?: number;
    streakDays: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  newThisMonth: number;
  newThisWeek: number;
  newToday: number;
  averageEnrollments: number;
  totalEnrollments: number;
  totalWatchTime: number;
  trends: {
    totalUsers: {
      value: string;
      type: 'increase' | 'decrease' | 'stable';
    };
    activeUsers: {
      value: string;
      type: 'increase' | 'decrease' | 'stable';
    };
    newUsers: {
      value: string;
      type: 'increase' | 'decrease' | 'stable';
    };
    enrollments: {
      value: string;
      type: 'increase' | 'decrease' | 'stable';
    };
  };
  demographics: {
    byAge: {
      range: string;
      count: number;
      percentage: number;
    }[];
    byCountry: {
      country: string;
      count: number;
      percentage: number;
    }[];
    bySubscription: {
      plan: string;
      count: number;
      percentage: number;
    }[];
  };
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  role?: string[];
  subscription?: string[];
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt' | 'enrollments';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  country?: string;
  enrollmentMin?: number;
  enrollmentMax?: number;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    appliedFilters: UserListParams;
    availableFilters: {
      statuses: string[];
      roles: string[];
      subscriptions: string[];
      countries: string[];
    };
  };
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalEnrollments: number;
    averageEnrollments: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role?: 'student' | 'instructor' | 'admin' | 'moderator';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    autoRenew?: boolean;
  };
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  role?: 'student' | 'instructor' | 'admin' | 'moderator';
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
    website?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  settings?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    privacy?: {
      profileVisible?: boolean;
      showEmail?: boolean;
      showProgress?: boolean;
    };
    preferences?: {
      language?: string;
      timezone?: string;
      theme?: 'light' | 'dark' | 'system';
    };
  };
}

export interface BulkUserOperation {
  userIds: (string | number)[];
  operation: 'activate' | 'deactivate' | 'suspend' | 'delete';
  reason?: string;
  notifyUsers?: boolean;
}

export interface UserEnrollment {
  id: string;
  topicId: string;
  topicTitle: string;
  topicCategory: string;
  enrollmentDate: string;
  status: 'enrolled' | 'in-progress' | 'completed' | 'dropped';
  progress: number; // 0-100
  completionDate?: string;
  certificateEarned?: boolean;
  rating?: number; // 1-5
  timeSpent: number; // in minutes
}

export interface UserProgress {
  userId: string | number;
  overview: {
    totalEnrollments: number;
    completedCourses: number;
    inProgressCourses: number;
    totalWatchTime: number;
    certificatesEarned: number;
    averageRating: number;
    streakDays: number;
  };
  enrollments: UserEnrollment[];
  achievements: {
    id: string;
    title: string;
    description: string;
    iconUrl?: string;
    earnedDate: string;
    category: 'completion' | 'engagement' | 'social' | 'skill';
  }[];
  analytics: {
    learningStreak: {
      current: number;
      longest: number;
      lastActivity: string;
    };
    weeklyActivity: {
      date: string;
      minutesSpent: number;
      coursesAccessed: number;
    }[];
    skillProgress: {
      skill: string;
      level: number;
      progress: number;
      coursesCompleted: number;
    }[];
  };
}