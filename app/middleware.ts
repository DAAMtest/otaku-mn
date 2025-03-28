import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/library',
  '/favorites',
  '/edit-profile',
  '/profile/edit',
  '/watchlist',
  '/history',
  '/settings'
];

// Custom hook for route protection
export function useProtectedRoute(segments: string[]) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    async function checkAuth() {
      try {
        // Get the current path
        const path = '/' + segments.join('/');
        
        // Check if the current path is a protected route
        const isProtectedRoute = PROTECTED_ROUTES.some(route => 
          path.startsWith(route)
        );
        
        if (isProtectedRoute) {
          // Try to get the session from secure storage first for faster checks
          const storedSession = await SecureStore.getItemAsync('supabase-session');
          
          if (storedSession) {
            try {
              // Verify the session is still valid
              const parsedSession = JSON.parse(storedSession);
              const expiresAt = parsedSession.expires_at;
              
              // If session hasn't expired, allow access
              if (expiresAt && new Date(expiresAt * 1000) > new Date()) {
                setIsChecking(false);
                return;
              }
            } catch (error) {
              console.error('Error parsing stored session:', error);
            }
          }
          
          // If no valid stored session, check with Supabase
          const { data: { session } } = await supabase.auth.getSession();
          
          // If no session, redirect to profile page with the sign-in UI
          if (!session) {
            // Redirect to the profile page which now has the sign-in UI
            router.replace('/profile');
          }
        }
        
        // If not a protected route or user is authenticated, continue
        setIsChecking(false);
      } catch (error) {
        console.error('Middleware error:', error);
        // On error, redirect to profile as a fallback
        router.replace('/profile');
        setIsChecking(false);
      }
    }
    
    checkAuth();
  }, [segments, router]);
  
  return isChecking;
}
