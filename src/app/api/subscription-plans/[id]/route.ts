import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

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

interface UpdateSubscriptionPlanRequest {
  name: string;
  features: string;
  description: string;
  type: string;
  status: 'Active' | 'Draft' | 'Inactive';
}

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

// ✅ Notice params is a Promise
type Context = { params: Promise<{ id: string }> };

// GET - Fetch subscription plan
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params; // ✅ await here
    const planId = parseInt(id);

    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription plan ID' },
        { status: 400 }
      );
    }

    const response = await apiService.get<any>(
      API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(planId)
    );
    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Subscription plan not found' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transformSubscriptionPlanData(response.data)
    });
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update subscription plan
export async function PUT(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params; // ✅ await here
    const planId = parseInt(id);
    const body: UpdateSubscriptionPlanRequest = await request.json();

    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription plan ID' },
        { status: 400 }
      );
    }

    if (!body.name || !body.features || !body.description || !body.type || !body.status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, features, description, type, status'
        },
        { status: 400 }
      );
    }

    if (body.name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plan name must be at least 3 characters long'
        },
        { status: 400 }
      );
    }

    const response = await apiService.put<any>(
      API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(planId),
      {
        name: body.name.trim(),
        features: body.features.trim(),
        description: body.description.trim(),
        type: body.type.trim(),
        status: body.status
      }
    );

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error || 'Failed to update subscription plan'
        },
        {
          status: response.error?.includes('not found')
            ? 404
            : response.error?.includes('already exists')
              ? 409
              : 500
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: transformSubscriptionPlanData(response.data)
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete subscription plan
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params; // ✅ await here
    const planId = parseInt(id);

    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription plan ID' },
        { status: 400 }
      );
    }

    const response = await apiService.delete<any>(
      API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(planId)
    );
    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error || 'Failed to delete subscription plan'
        },
        {
          status: response.error?.includes('not found')
            ? 404
            : response.error?.includes('active subscriptions')
              ? 409
              : 500
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription plan deleted successfully',
      data: response.data ? transformSubscriptionPlanData(response.data) : null
    });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
