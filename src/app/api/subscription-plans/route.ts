import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

// Interface for subscription plan data structure
interface SubscriptionPlan {
  id?: number;
  name: string;
  features: string;
  description: string;
  type: string;
  status: 'Active' | 'Draft' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

interface CreateSubscriptionPlanRequest {
  name: string;
  features: string;
  description: string;
  type: string;
  status: 'Active' | 'Draft' | 'Inactive';
}

// Utility function to transform snake_case API response to camelCase
const transformSubscriptionPlanData = (apiData: any): SubscriptionPlan => ({
  id: apiData.id,
  name: apiData.name,
  features: apiData.features,
  description: apiData.description,
  type: apiData.type,
  status: apiData.status,
  createdAt: apiData.created_at,
  updatedAt: apiData.updated_at
});

// Minimal fallback data - only used when backend is completely unavailable
const minimalFallback: SubscriptionPlan[] = [
  {
    id: 1,
    name: 'Basic Plan',
    features: 'Access to basic courses, Community support, Certificate of completion',
    description: 'Perfect for beginners starting their learning journey',
    type: 'Basic',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Professional Plan',
    features: 'All Basic features, Priority support, Advanced courses, Project guidance',
    description: 'Ideal for professionals looking to advance their skills',
    type: 'Premium',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Enterprise Plan',
    features: 'All Professional features, Dedicated account manager, Custom courses, API access',
    description: 'For organizations needing comprehensive learning solutions',
    type: 'Enterprise',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET - Fetch all subscription plans with optional filters
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Special parameter to fetch all plans without pagination
    const fetchAll = searchParams.get('fetchAll') === 'true';

    // Build query parameters
    const queryParams: Record<string, any> = {
      page: fetchAll ? 1 : page,
      limit: fetchAll ? 1000 : limit,
      sortBy,
      sortOrder
    };

    if (search) queryParams.search = search;
    if (status && status !== 'all') queryParams.status = status;

    // Call backend API with fallback to mock data
    try {
      const response = await apiService.get(
        buildApiUrlWithQuery(API_ENDPOINTS.SUBSCRIPTION_PLANS.BASE, queryParams)
      );

      if (!response.success) {
        // Return minimal fallback data
        return NextResponse.json({
          success: true,
          data: minimalFallback,
          meta: {
            total: minimalFallback.length,
            page,
            limit,
            totalPages: Math.ceil(minimalFallback.length / limit)
          },
          stats: {
            total: minimalFallback.length,
            active: minimalFallback.filter(
              (plan: SubscriptionPlan) => plan.status === 'Active'
            ).length,
            draft: minimalFallback.filter(
              (plan: SubscriptionPlan) => plan.status === 'Draft'
            ).length,
            inactive: minimalFallback.filter(
              (plan: SubscriptionPlan) => plan.status === 'Inactive'
            ).length
          },
          message: 'Using minimal fallback - backend not available'
        });
      }

      // Extract plans data and transform snake_case to camelCase
      const rawPlans = response.data?.plans || response.data || [];
      const plans = rawPlans.map(transformSubscriptionPlanData);

      const meta = response.data?.meta ||
        response.meta || {
          total: plans.length,
          page: fetchAll ? 1 : page,
          limit: fetchAll ? plans.length : limit,
          totalPages: fetchAll ? 1 : Math.ceil(plans.length / limit)
        };

      // Additional stats calculation
      const stats = response.data?.stats || {
        total: plans.length,
        active: plans.filter((plan: SubscriptionPlan) => plan.status === 'Active').length,
        draft: plans.filter((plan: SubscriptionPlan) => plan.status === 'Draft').length,
        inactive: plans.filter((plan: SubscriptionPlan) => plan.status === 'Inactive').length
      };

      return NextResponse.json({
        success: true,
        data: plans,
        meta,
        stats,
        message: fetchAll
          ? `Fetched all ${plans.length} subscription plans from backend`
          : `Fetched ${plans.length} subscription plans from backend (page ${page})`
      });
    } catch (error) {
      // Return minimal fallback data
      return NextResponse.json({
        success: true,
        data: minimalFallback,
        meta: {
          total: minimalFallback.length,
          page,
          limit,
          totalPages: Math.ceil(minimalFallback.length / limit)
        },
        stats: {
          total: minimalFallback.length,
          active: minimalFallback.filter(
            (plan: SubscriptionPlan) => plan.status === 'Active'
          ).length,
          draft: minimalFallback.filter(
            (plan: SubscriptionPlan) => plan.status === 'Draft'
          ).length,
          inactive: minimalFallback.filter(
            (plan: SubscriptionPlan) => plan.status === 'Inactive'
          ).length
        },
        message: 'Using minimal fallback - backend connection failed'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new subscription plan
export async function POST(request: Request) {
  try {
    const body: CreateSubscriptionPlanRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.features || !body.description || !body.type || !body.status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, features, description, type, status'
        },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plan name must be at least 3 characters long'
        },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.post<any>(API_ENDPOINTS.SUBSCRIPTION_PLANS.BASE, {
      name: body.name.trim(),
      features: body.features.trim(),
      description: body.description.trim(),
      type: body.type.trim(),
      status: body.status
    });

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error || 'Failed to create subscription plan'
        },
        { status: response.error?.includes('already exists') ? 409 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const plan = response.data
      ? transformSubscriptionPlanData(response.data)
      : null;

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription plan created successfully',
        data: plan
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
