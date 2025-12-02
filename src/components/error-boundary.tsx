'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    // Handle error internally instead of through props
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className='w-full border-destructive/20 bg-destructive/5'>
          <CardHeader>
            <div className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='h-5 w-5' />
              <CardTitle className='text-destructive'>Something went wrong</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-sm text-muted-foreground'>
              <p>An error occurred while rendering this component.</p>
              {this.state.error && (
                <details className='mt-2'>
                  <summary className='cursor-pointer font-medium'>Error details</summary>
                  <pre className='mt-2 text-xs bg-muted p-2 rounded overflow-auto'>
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
            </div>
            <Button onClick={this.handleReset} variant='outline' size='sm'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional Error Boundary Hook (for development)
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
  }, []);
}