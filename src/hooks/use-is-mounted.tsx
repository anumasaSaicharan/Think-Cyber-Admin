'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if component has mounted on client side
 * Useful for preventing hydration mismatches
 */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}