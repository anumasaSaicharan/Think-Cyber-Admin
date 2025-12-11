'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Authentication TK',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage({ stars }: { stars: number }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting to sign in with:', { email });
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Change to false to handle redirect manually
        callbackUrl: '/dashboard/overview'
      });
      
      console.log('Sign in result:', result);
      
      if (result?.error) {
        console.error('Authentication failed:', result.error);
        alert('Authentication failed: ' + result.error);
      } else if (result?.ok) {
        console.log('Authentication successful, redirecting...');
        window.location.href = '/dashboard/overview';
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-[#E6F0F9]' />
        <div className='relative z-20 mt-auto'>
          <img
            src='/assets/login-banner.svg'
            alt='Authentication'
            className='h-auto w-full'
          />
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        {/* Close button */}
        <button className='absolute top-6 right-6 p-2'>
          <X className='h-6 w-6 text-gray-400' />
        </button>

        {/* Main content */}
        <div className='w-full max-w-md p-8'>
          {/* Logo and Title */}
          <div className='mb-8 text-center'>
            <div className='mb-6 flex items-center justify-center'>
              <div className='flex items-center text-blue-600'>
                <img
                  src='/assets/logo.svg'
                  alt='Logo'
                  className='mr-3 h-auto w-auto'
                />
              </div>
            </div>

            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Admin Login-KT
            </h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-sm font-medium text-gray-700'
              >
                Email Address
              </Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='text-sm font-medium text-gray-700'
              >
                Password
              </Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                required
              />
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
