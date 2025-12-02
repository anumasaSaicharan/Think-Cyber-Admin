// Test script to verify users API endpoints
import { usersApiService } from '../services/users-api';

async function testUsersAPI() {
  console.log('🧪 Testing Users API endpoints...\n');

  try {
    // Test 1: Get users list
    console.log('1. Testing GET /users/list...');
    const usersResponse = await usersApiService.getUsers({
      page: 1,
      limit: 10,
      search: 'john',
      status: ['active'],
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    console.log('✅ Users list:', usersResponse.success ? 'Success' : 'Failed');
    if (usersResponse.success) {
      console.log(`   Found ${usersResponse.data?.users.length} users`);
      console.log(`   Total pages: ${usersResponse.data?.pagination.totalPages}`);
    }
    console.log();

    // Test 2: Get user stats
    console.log('2. Testing GET /users/stats...');
    const statsResponse = await usersApiService.getUserStats();
    console.log('✅ User stats:', statsResponse.success ? 'Success' : 'Failed');
    if (statsResponse.success) {
      console.log(`   Total users: ${statsResponse.data?.totalUsers}`);
      console.log(`   Active users: ${statsResponse.data?.activeUsers}`);
    }
    console.log();

    // Test 3: Get user by ID
    console.log('3. Testing GET /users/{id}...');
    const userResponse = await usersApiService.getUserById('user_123');
    console.log('✅ Get user by ID:', userResponse.success ? 'Success' : 'Failed');
    if (userResponse.success) {
      console.log(`   User: ${userResponse.data?.name} (${userResponse.data?.email})`);
      console.log(`   Status: ${userResponse.data?.status}`);
    }
    console.log();

    // Test 4: Create user
    console.log('4. Testing POST /users...');
    const createResponse = await usersApiService.createUser({
      name: 'Test User',
      email: 'test@example.com',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      },
      role: 'student',
      sendWelcomeEmail: true
    });
    console.log('✅ Create user:', createResponse.success ? 'Success' : 'Failed');
    if (createResponse.success) {
      console.log(`   Created user: ${createResponse.data?.name} (${createResponse.data?.id})`);
    }
    console.log();

    // Test 5: Update user
    console.log('5. Testing PUT /users/{id}...');
    const updateResponse = await usersApiService.updateUser('user_123', {
      name: 'John Doe Updated',
      status: 'active',
      profile: {
        bio: 'Updated bio for testing'
      }
    });
    console.log('✅ Update user:', updateResponse.success ? 'Success' : 'Failed');
    if (updateResponse.success) {
      console.log(`   Updated user: ${updateResponse.data?.name}`);
    }
    console.log();

    // Test 6: Get user enrollments
    console.log('6. Testing GET /users/{id}/enrollments...');
    const enrollmentsResponse = await usersApiService.getUserEnrollments('user_123');
    console.log('✅ User enrollments:', enrollmentsResponse.success ? 'Success' : 'Failed');
    if (enrollmentsResponse.success) {
      console.log(`   Found ${enrollmentsResponse.data?.length} enrollments`);
    }
    console.log();

    // Test 7: Get user progress
    console.log('7. Testing GET /users/{id}/progress...');
    const progressResponse = await usersApiService.getUserProgress('user_123');
    console.log('✅ User progress:', progressResponse.success ? 'Success' : 'Failed');
    if (progressResponse.success) {
      console.log(`   Total enrollments: ${progressResponse.data?.overview.totalEnrollments}`);
      console.log(`   Completed courses: ${progressResponse.data?.overview.completedCourses}`);
    }
    console.log();

    // Test 8: Bulk operations
    console.log('8. Testing POST /users/bulk-update...');
    const bulkResponse = await usersApiService.bulkOperation({
      userIds: ['user_123', 'user_456'],
      operation: 'activate',
      reason: 'Testing bulk activation',
      notifyUsers: false
    });
    console.log('✅ Bulk operation:', bulkResponse.success ? 'Success' : 'Failed');
    if (bulkResponse.success) {
      console.log(`   Success: ${bulkResponse.data?.success}, Failed: ${bulkResponse.data?.failed}`);
    }
    console.log();

    console.log('🎉 All API endpoint tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Export for potential use in other test files
export { testUsersAPI };

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testUsersAPI();
}