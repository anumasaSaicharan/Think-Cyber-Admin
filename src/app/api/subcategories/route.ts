import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

// Interface for sub-category data structure
interface SubCategory {
  id?: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  status: 'Active' | 'Draft' | 'Inactive';
  emoji?: string;
  topicsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateSubCategoryRequest {
  name: string;
  description: string;
  categoryId: number;
  status: 'Active' | 'Draft' | 'Inactive';
}

// Minimal fallback data for subcategories - only used when backend is completely unavailable
const minimalSubcategoriesFallback: SubCategory[] = [
  {
    id: 1,
    name: 'Basic Security',
    description: 'Introduction to basic security concepts',
    categoryId: 1,
    categoryName: 'Cybersecurity Fundamentals',
    status: 'Active',
    emoji: '🔒',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Password Security',
    description: 'Password best practices and management',
    categoryId: 1,
    categoryName: 'Cybersecurity Fundamentals',
    status: 'Active',
    emoji: '🔑',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Firewall Management',
    description: 'Network firewall configuration and management',
    categoryId: 2,
    categoryName: 'Network Security',
    status: 'Active',
    emoji: '🔥',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Utility function to transform snake_case API response to camelCase
const transformSubCategoryData = (apiData: any): SubCategory => {
  if (!apiData) {
    throw new Error('Invalid subcategory data: data is null or undefined');
  }

  return {
    id: apiData.id,
    name: apiData.name || '',
    description: apiData.description || '',
    categoryId: apiData.category_id || apiData.categoryId || 0,
    categoryName: apiData.category_name || apiData.categoryName || '',
    status: apiData.status || 'Draft',
    emoji: apiData.emoji,
    topicsCount: apiData.topics_count || apiData.topicsCount || 0,
    createdAt: apiData.created_at || apiData.createdAt || '',
    updatedAt: apiData.updated_at || apiData.updatedAt || ''
  };
};

// GET - Fetch all sub-categories with optional filters
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const fetchAll = searchParams.get('fetchAll') === 'true';

    const queryParams: Record<string, any> = {
      page: fetchAll ? 1 : page,
      limit: fetchAll ? 1000 : limit,
      sortBy,
      sortOrder
    };

    if (search) queryParams.search = search;
    if (status && status !== 'all') queryParams.status = status;
    if (categoryId) queryParams.categoryId = categoryId;

    try {
      const response = await apiService.get(
        buildApiUrlWithQuery(API_ENDPOINTS.SUBCATEGORIES.BASE, queryParams)
      );

      if (!response.success) {
        return NextResponse.json({
          success: true,
          data: minimalSubcategoriesFallback,
          meta: {
            total: minimalSubcategoriesFallback.length,
            page,
            limit,
            totalPages: Math.ceil(minimalSubcategoriesFallback.length / limit)
          },
          message: 'Using minimal fallback - backend not available'
        });
      }

      const rawSubcategories =
        response.data?.subcategories || response.data || [];
      const subcategories = rawSubcategories.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        categoryId: item.category_id || item.categoryId,
        categoryName: item.category_name || item.categoryName,
        status: item.status,
        emoji: item.emoji,
        topicsCount: item.topics_count || item.topicsCount || 0,
        createdAt: item.created_at || item.createdAt,
        updatedAt: item.updated_at || item.updatedAt
      }));

      const meta = response.data?.meta ||
        response.meta || {
          total: subcategories.length,
          page: fetchAll ? 1 : page,
          limit: fetchAll ? subcategories.length : limit,
          totalPages: fetchAll ? 1 : Math.ceil(subcategories.length / limit)
        };

      return NextResponse.json({
        success: true,
        data: subcategories,
        meta
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        data: minimalSubcategoriesFallback,
        meta: {
          total: minimalSubcategoriesFallback.length,
          page,
          limit,
          totalPages: Math.ceil(minimalSubcategoriesFallback.length / limit)
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

// POST - Create a new sub-category
export async function POST(request: Request) {
  try {
    const body: CreateSubCategoryRequest = await request.json();

    if (!body.name || !body.description || !body.categoryId || !body.status) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: name, description, categoryId, status'
        },
        { status: 400 }
      );
    }

    if (body.name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sub-category name must be at least 3 characters long'
        },
        { status: 400 }
      );
    }

    if (body.description.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Description must be at least 10 characters long'
        },
        { status: 400 }
      );
    }

    const response = await apiService.post<any>(
      API_ENDPOINTS.SUBCATEGORIES.CREATE,
      {
        name: body.name.trim(),
        description: body.description.trim(),
        category_id: body.categoryId,
        status: body.status
      }
    );

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error || 'Failed to create sub-category'
        },
        { status: response.error?.includes('already exists') ? 409 : 500 }
      );
    }

    const created = response.data
      ? transformSubCategoryData(response.data)
      : null;

    return NextResponse.json(
      {
        success: true,
        message: 'Sub-category created successfully',
        data: created
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
