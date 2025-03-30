import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  "/library",
  "/favorites",
  "/edit-profile",
  "/profile/edit",
  "/watchlist",
  "/history",
  "/settings"
];

// Routes that should show auth modal instead of redirecting
const AUTH_MODAL_ROUTES = [
  "/profile",
  "/(tabs)/profile",
  "/edit-profile"
];

// Custom hook for route protection
export function useProtectedRoute(segments: string[]) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);
  const { session, refreshSession } = useAuth();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        
        // Get the current path
        const path = "/" + segments.join("/");
        console.log("Middleware - Current path:", path);

        // Check if it's a route that should show auth modal
        const shouldShowAuthModal = AUTH_MODAL_ROUTES.some((route) =>
          path.startsWith(route) || path === route
        );
        console.log("Middleware - Should show auth modal:", shouldShowAuthModal);
        
        // If it's a route that should show auth modal, let the component handle it
        if (shouldShowAuthModal) {
          console.log("Middleware - Auth modal route - letting component handle auth");
          setIsLoading(false);
          return;
        }

        // Check if the current path is a protected route
        const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
          path.startsWith(route) || path === route
        );
        console.log("Middleware - Is protected route:", isProtectedRoute);

        if (!isProtectedRoute) {
          // Not a protected route, allow access
          console.log("Middleware - Not a protected route, proceeding");
          setIsLoading(false);
          return;
        }

        // For protected routes, check session
        console.log("Middleware - Checking auth context session:", !!session);
        
        // If we have a session in context, verify it's still valid
        if (session) {
          const isValid = await refreshSession();
          console.log("Middleware - Session refresh result:", isValid);
          
          if (isValid) {
            console.log("Middleware - Valid session confirmed, allowing access");
            setIsLoading(false);
            return;
          }
        }
        
        // No valid session, try one final refresh
        const finalRefresh = await refreshSession();
        if (finalRefresh) {
          console.log("Middleware - Session restored after final refresh");
          setIsLoading(false);
          return;
        }
        
        // If no valid session found and component is mounted, redirect
        if (isMounted.current) {
          console.log("Middleware - No valid session after all checks, redirecting from:", path, "to: /");
          router.replace('/');
        }
      } catch (error) {
        console.error("Middleware - Error in auth check:", error);
        // On error, try to refresh session one last time
        const emergencyRefresh = await refreshSession();
        if (!emergencyRefresh && isMounted.current) {
          router.replace('/');
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();
  }, [segments, router, session, refreshSession]);

  return isLoading;
}
