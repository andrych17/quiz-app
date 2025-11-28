"use client";

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Hook to warn users about unsaved changes before navigation
 * @param hasUnsavedChanges - Boolean flag indicating if there are unsaved changes
 * @param message - Optional custom warning message
 */
export function useUnsavedChanges(
  hasUnsavedChanges: boolean,
  message: string = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?'
) {
  const pathname = usePathname();

  // Warn on browser navigation (refresh, close tab, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Warn on internal navigation (clicking links)
  useEffect(() => {
    const handleRouteChange = () => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          // Prevent navigation by throwing error
          throw new Error('Route change cancelled by user');
        }
      }
    };

    // Store original push and replace functions
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    // Override pushState
    window.history.pushState = function(...args) {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          return;
        }
      }
      return originalPush.apply(this, args);
    };

    // Override replaceState
    window.history.replaceState = function(...args) {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          return;
        }
      }
      return originalReplace.apply(this, args);
    };

    // Cleanup
    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
    };
  }, [hasUnsavedChanges, message]);
}

/**
 * Create a navigation handler that checks for unsaved changes
 * @param hasUnsavedChanges - Boolean flag indicating if there are unsaved changes
 * @param router - Next.js router instance
 * @param message - Optional custom warning message
 */
export function useNavigationGuard(
  hasUnsavedChanges: boolean,
  message: string = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?'
) {
  const router = useRouter();

  const navigateWithConfirmation = useCallback((path: string) => {
    if (hasUnsavedChanges) {
      if (window.confirm(message)) {
        router.push(path);
      }
    } else {
      router.push(path);
    }
  }, [hasUnsavedChanges, message, router]);

  return { navigateWithConfirmation };
}
