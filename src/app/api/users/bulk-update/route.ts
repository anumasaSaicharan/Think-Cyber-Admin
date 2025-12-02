import { NextRequest, NextResponse } from 'next/server';
import { BulkUserOperation } from '@/types/users';

// POST /users/bulk-update - Bulk operations on users
export async function POST(request: NextRequest) {
  try {
    const body: BulkUserOperation = await request.json();
    
    // Validate required fields
    if (!body.userIds || !Array.isArray(body.userIds) || body.userIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'userIds array is required and must not be empty',
          code: 'VALIDATION_ERROR',
          errors: {
            userIds: ['userIds array is required and must not be empty']
          }
        },
        { status: 400 }
      );
    }

    if (!body.operation) {
      return NextResponse.json(
        {
          success: false,
          error: 'operation is required',
          code: 'VALIDATION_ERROR',
          errors: {
            operation: ['operation is required']
          }
        },
        { status: 400 }
      );
    }

    // Limit bulk operations to 100 users at once
    if (body.userIds.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bulk operations limited to 100 users at once',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Mock bulk operation results
    const results = body.userIds.map((userId, index) => {
      // Simulate some failures for demonstration
      const shouldFail = index === body.userIds.length - 1 && body.userIds.length > 1;
      
      return {
        id: userId,
        success: !shouldFail,
        error: shouldFail ? 'User not found' : undefined
      };
    });

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    const responseData = {
      success: successCount,
      failed: failedCount,
      results: results
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: body.operation === 'activate' 
        ? `Successfully ${body.operation}d ${successCount} users` 
        : `Successfully performed ${body.operation} on ${successCount} users`
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk operation',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}