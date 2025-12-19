'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { SubscriptionPlanModal } from '@/components/modal/subscription-plan-modal';
import { DeleteSubscriptionPlanModal } from '@/components/modal/delete-subscription-plan-modal';
import { toast } from '@/lib/toast';
import { formatDate } from '@/lib/format';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

interface SubscriptionPlan {
  id: number;
  name: string; 
  features: string;
  description: string;  type: string;  status: 'Active' | 'Draft' | 'Inactive';
  createdAt: string;
  updatedAt?: string;
}

interface Stats {
  total: number;
  active: number;
  draft: number;
  inactive: number;  
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    draft: 0,
    inactive: 0  
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  // Fetch subscription plans from API
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const result = await apiService.get(API_ENDPOINTS.SUBSCRIPTION_PLANS.BASE, { params });
      
      if (result.success && result.data) {
        const plansData = result.data;
        setPlans(plansData);
        
        // Calculate stats from the plans data
        const total = result.meta?.total || plansData.length;
        const active = plansData.filter((plan: SubscriptionPlan) => plan.status === 'Active').length;
        const draft = plansData.filter((plan: SubscriptionPlan) => plan.status === 'Draft').length;
        const inactive = plansData.filter((plan: SubscriptionPlan) => plan.status === 'Inactive').length;
        
        setStats({
          total,
          active,
          draft,
          inactive
        });
      } else {
        toast.error('Failed to fetch features plans. Please try again.');
        console.error('Failed to fetch plans:', result.error);
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.');
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Create or update subscription plan
  const handleSavePlan = async (planData: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedPlan) {
        // Update existing plan
        const result = await apiService.put(API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(selectedPlan.id), planData);
        
        if (result.success) {
          await fetchPlans(); // Refresh the list
          setIsEditModalOpen(false);
          setSelectedPlan(null);
          toast.success('Subscription plan updated successfully');
        } else {
          toast.error(result.error || 'Failed to update subscription plan');
          throw new Error(result.error);
        }
      } else {
        // Create new plan
        const result = await apiService.post(API_ENDPOINTS.SUBSCRIPTION_PLANS.BASE, planData);
        
        if (result.success) {
          await fetchPlans(); // Refresh the list
          setIsAddModalOpen(false);
          toast.success('Subscription plan created successfully');
        } else {
          toast.error(result.error || 'Failed to create subscription plan');
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Error saving subscription plan:', error);
      throw error; // Re-throw to handle in modal
    }
  };

  // Delete subscription plan
  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    
    try {
      const result = await apiService.delete(API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(planToDelete.id));
      
      if (result.success) {
        await fetchPlans(); // Refresh the list
        setIsDeleteModalOpen(false);
        setPlanToDelete(null);
        toast.success('Subscription plan deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete subscription plan');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      throw error; // Re-throw to handle in modal
    }
  };

  // Handle edit button click
  const handleEditClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  // Load plans on component mount and debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans();
    }, searchTerm ? 300 : 0); // No delay on initial load, 300ms delay for search

    return () => clearTimeout(timer);
  }, [fetchPlans]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Our Plans Management</h1>
            <p className='text-muted-foreground'>
              Create and manage our plans for your users
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchPlans}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Add Plan
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Plans</CardTitle>
              <CreditCard className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.total}</div>
              <p className='text-xs text-muted-foreground'>
                All subscription plans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active Plans</CardTitle>
              <CreditCard className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.active}</div>
              <p className='text-xs text-muted-foreground'>
                {loading || stats.total === 0 ? '-' : Math.round((stats.active / stats.total) * 100)}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Draft Plans</CardTitle>
              <CreditCard className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.draft}</div>
              <p className='text-xs text-muted-foreground'>
                Not published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Inactive Plans</CardTitle>
              <CreditCard className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.inactive}</div>
              <p className='text-xs text-muted-foreground'>
                Inactive or archived
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plans List */}
        <Card>
          <CardHeader>
            <CardTitle>All Plans</CardTitle>
            <CardDescription>
              Manage and configure your our plans
            </CardDescription>
            <div className='flex space-x-2'>
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input 
                  placeholder='Search plans...' 
                  className='pl-8'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading subscription plans...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  {searchTerm ? 'No subscription plans found matching your search.' : 'No subscription plans found. Create your first plan!'}
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {plans.map((plan) => (
                  <div key={plan.id} className='flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent'>
                    <div className='flex items-center space-x-4'>
                      <div className='p-2 bg-purple-100 rounded-lg'>
                        <CreditCard className='h-6 w-6 text-purple-600' />
                      </div>
                      <div>
                        <p className='font-medium'>{plan.name}</p>
                        <p className='text-sm text-muted-foreground'>{plan.features}</p>
                        <p className='text-xs text-muted-foreground'>
                          Created: {plan.createdAt ? formatDate(plan.createdAt, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          }) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                      </div>
                      <div className='flex space-x-2'>
                        <Button 
                          variant='outline' 
                          size='sm'
                          onClick={() => handleEditClick(plan)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button 
                          variant='outline' 
                          size='sm'
                          onClick={() => handleDeleteClick(plan)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <SubscriptionPlanModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSavePlan}
          plan={null}
        />

        <SubscriptionPlanModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPlan(null);
          }}
          onSave={handleSavePlan}
          plan={selectedPlan}
        />

        <DeleteSubscriptionPlanModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setPlanToDelete(null);
          }}
          onConfirm={handleDeletePlan}
          planName={planToDelete?.name || ''}
        />
      </div>
    </PageContainer>
  );
}
