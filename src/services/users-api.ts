'use client';

import { apiService, ApiResponse } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import {
  User,
  UserStats,
  UserListParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  BulkUserOperation,
  UserEnrollment,
  UserProgress
} from '@/types/users';

class UsersApiService {
  // Get users list with filtering, pagination, and sorting
  async getUsers(params?: UserListParams): Promise<ApiResponse<UserListResponse>> {
    try {
      const response = await apiService.get<UserListResponse>(
        API_ENDPOINTS.USERS.LIST,
        { params: params as any }
      );
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: 'Failed to fetch users list'
      };
    }
  }

  // Get user statistics
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response = await apiService.get<UserStats>(
        API_ENDPOINTS.USERS.STATS
      );
      return response;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        success: false,
        error: 'Failed to fetch user statistics'
      };
    }
  }

  // Get specific user by ID
  async getUserById(id: string | number): Promise<ApiResponse<User>> {
    try {
      const response = await apiService.get<User>(
        API_ENDPOINTS.USERS.BY_ID(id)
      );
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: 'Failed to fetch user details'
      };
    }
  }

  // Search users (now uses the same endpoint as getUsers with search param)
  async searchUsers(query: string, filters?: Partial<UserListParams>): Promise<ApiResponse<UserListResponse>> {
    try {
      const params = { search: query, ...filters };
      const response = await apiService.get<UserListResponse>(
        API_ENDPOINTS.USERS.LIST,
        { params: params as any }
      );
      return response;
    } catch (error) {
      console.error('Error searching users:', error);
      return {
        success: false,
        error: 'Failed to search users'
      };
    }
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await apiService.post<User>(
        API_ENDPOINTS.USERS.BASE,
        userData
      );
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }

  // Update user
  async updateUser(id: string | number, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await apiService.put<User>(
        API_ENDPOINTS.USERS.BY_ID(id),
        userData
      );
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }

  // Delete user
  async deleteUser(id: string | number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiService.delete<{ message: string }>(
        API_ENDPOINTS.USERS.BY_ID(id)
      );
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }
  }

  // Activate user (now uses bulk update)
  async activateUser(id: string | number): Promise<ApiResponse<User>> {
    try {
      const bulkOperation: BulkUserOperation = {
        userIds: [id],
        operation: 'activate',
        notifyUsers: false
      };
      
      const response = await this.bulkOperation(bulkOperation);
      
      if (response.success && response.data?.results[0]?.success) {
        // Return user data after activation
        return await this.getUserById(id);
      } else {
        return {
          success: false,
          error: response.data?.results[0]?.error || 'Failed to activate user'
        };
      }
    } catch (error) {
      console.error('Error activating user:', error);
      return {
        success: false,
        error: 'Failed to activate user'
      };
    }
  }

  // Deactivate user (now uses bulk update)
  async deactivateUser(id: string | number): Promise<ApiResponse<User>> {
    try {
      const bulkOperation: BulkUserOperation = {
        userIds: [id],
        operation: 'deactivate',
        notifyUsers: false
      };
      
      const response = await this.bulkOperation(bulkOperation);
      
      if (response.success && response.data?.results[0]?.success) {
        // Return user data after deactivation
        return await this.getUserById(id);
      } else {
        return {
          success: false,
          error: response.data?.results[0]?.error || 'Failed to deactivate user'
        };
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      return {
        success: false,
        error: 'Failed to deactivate user'
      };
    }
  }

  // Suspend user (now uses bulk update)
  async suspendUser(id: string | number, reason?: string): Promise<ApiResponse<User>> {
    try {
      const bulkOperation: BulkUserOperation = {
        userIds: [id],
        operation: 'suspend',
        reason: reason,
        notifyUsers: false
      };
      
      const response = await this.bulkOperation(bulkOperation);
      
      if (response.success && response.data?.results[0]?.success) {
        // Return user data after suspension
        return await this.getUserById(id);
      } else {
        return {
          success: false,
          error: response.data?.results[0]?.error || 'Failed to suspend user'
        };
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      return {
        success: false,
        error: 'Failed to suspend user'
      };
    }
  }

  // Bulk operations on users
  async bulkOperation(operation: BulkUserOperation): Promise<ApiResponse<{ 
    success: number; 
    failed: number; 
    results: { id: string | number; success: boolean; error?: string }[] 
  }>> {
    try {
      const response = await apiService.post(API_ENDPOINTS.USERS.BULK_UPDATE, operation);
      return response;
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      return {
        success: false,
        error: 'Failed to perform bulk operation'
      };
    }
  }

  // Get user enrollments
  async getUserEnrollments(id: string | number): Promise<ApiResponse<UserEnrollment[]>> {
    try {
      const response = await apiService.get<UserEnrollment[]>(
        API_ENDPOINTS.USERS.ENROLLMENTS(id)
      );
      return response;
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      return {
        success: false,
        error: 'Failed to fetch user enrollments'
      };
    }
  }

  // Get user progress
  async getUserProgress(id: string | number): Promise<ApiResponse<UserProgress>> {
    try {
      const response = await apiService.get<UserProgress>(
        API_ENDPOINTS.USERS.PROGRESS(id)
      );
      return response;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return {
        success: false,
        error: 'Failed to fetch user progress'
      };
    }
  }

  // Export users
  async exportUsers(params?: UserListParams): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const response = await apiService.post<{ downloadUrl: string }>(
        API_ENDPOINTS.USERS.EXPORT,
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error exporting users:', error);
      return {
        success: false,
        error: 'Failed to export users'
      };
    }
  }

  // Import users
  async importUsers(file: File): Promise<ApiResponse<{ 
    imported: number; 
    failed: number; 
    errors?: { row: number; error: string }[] 
  }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.post(
        API_ENDPOINTS.USERS.IMPORT,
        formData
      );
      return response;
    } catch (error) {
      console.error('Error importing users:', error);
      return {
        success: false,
        error: 'Failed to import users'
      };
    }
  }
}

// Export singleton instance
export const usersApiService = new UsersApiService();

// Export the class for custom instances
export { UsersApiService };