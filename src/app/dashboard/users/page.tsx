'use client';

import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usersApiService } from '@/services/users-api';
import { UserStats, UserListResponse } from '@/types/users';
import { UserPlus, Search, Filter } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserListResponse | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users list and stats in parallel
      const [usersResponse, statsResponse] = await Promise.all([
        usersApiService.getUsers({ page: 1, limit: 20 }),
        usersApiService.getUserStats()
      ]);

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setUserStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLoading(true);
      try {
        const response = await usersApiService.searchUsers(query);
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    } else {
      fetchData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Users Management
            </h1>
            <p className='text-muted-foreground'>
              Manage all users in your educational platform
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className='text-2xl font-bold'>
                  {userStats?.totalUsers?.toLocaleString() || '0'}
                </div>
              )}
              <p className='text-muted-foreground text-xs'>
                {userStats?.trends?.totalUsers?.value || '+0%'} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className='text-2xl font-bold'>
                  {userStats?.activeUsers?.toLocaleString() || '0'}
                </div>
              )}
              <p className='text-muted-foreground text-xs'>
                {userStats?.trends?.activeUsers?.value || '+0%'} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className='text-2xl font-bold'>
                  {userStats?.newThisMonth?.toLocaleString() || '0'}
                </div>
              )}
              <p className='text-muted-foreground text-xs'>
                {userStats?.trends?.newUsers?.value || '+0%'} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Avg. Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className='text-2xl font-bold'>
                  {userStats?.averageEnrollments?.toFixed(1) || '0.0'}
                </div>
              )}
              <p className='text-muted-foreground text-xs'>
                {userStats?.trends?.enrollments?.value || '+0%'} from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
            <CardDescription>
              A comprehensive list of all users in your platform
            </CardDescription>
            <div className='flex w-full items-center space-x-4'>
              <div className='relative flex-1'>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder='Search users by name, email, or status...'
                  className='pl-8'
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button variant='outline'>
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between rounded-lg border p-4'
                  >
                    <div className='flex items-center space-x-4'>
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className="space-y-2 text-right">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                ))
              ) : users?.users && users.users.length > 0 ? (
                users.users.map((user) => (
                  <div
                    key={user.id}
                    className='flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50'
                  >
                    <div className='flex items-center space-x-4'>
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name || 'User'} />
                        <AvatarFallback>
                          {user.name
                            ? user.name.split(' ')
                                .map((n: string) => n[0])
                                .join('')
                            : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium'>{user.name || 'Unnamed User'}</p>
                        <p className='text-muted-foreground text-sm'>
                          {user.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>
                          {user.enrollments?.total || 0} enrollments
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          Joined {user.timestamps?.createdAt ? formatDate(user.timestamps.createdAt) : 'N/A'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(user.status || 'pending')}>
                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
