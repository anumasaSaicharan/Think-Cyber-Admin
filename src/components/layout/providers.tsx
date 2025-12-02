'use client';
import { SessionProvider } from 'next-auth/react';
import { useTheme } from 'next-themes';
import React from 'react';
import { ActiveThemeProvider } from '../active-theme';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
  <SessionProvider basePath="/api/auth">
          {children}
        </SessionProvider>
      </ActiveThemeProvider>
    </>
  );
}
