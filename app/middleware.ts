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
  "/settings",
  "/downloads",
  "/lists",
  "/notifications",
  "/privacy-settings",
  "/change-password",
];

// Routes that should show auth modal instead of redirecting
const AUTH_MODAL_ROUTES = [
  "/profile",
  "/(tabs)/profile",
  "/edit-profile",
  "/favorites",
  "/watchlist",
];

// Admin routes that require admin privileges
const ADMIN_ROUTES = [
  "/admin",
  "/admin/analytics",
  "/admin/anime",
  "/admin/bulk-operations",
  "/admin/genres",
  "/admin/index",
  "/admin/moderation",
  "/admin/notifications",
  "/admin/settings",
  "/admin/users",
];

// Debug logger for middleware
const middlewareDebug = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log("[MiddlewareDebug]", ...args);
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error("[MiddlewareError]", ...args);
    }
  },
};

// Custom hook for route protection
export function useProtectedRoute(segments: string[]) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);
  const { session, refreshSession, user } = useAuth();
  const lastPathRef = useRef<string>("");

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        if (!isMounted.current) return;
        setIsLoading(true);

        // Get the current path
        const path = "/" + segments.join("/");
        middlewareDebug.log("Current path:", path);

        // Avoid redundant checks for the same path
        if (path === lastPathRef.current) {
          middlewareDebug.log("Skipping duplicate path check");
          setIsLoading(false);
          return;
        }

        lastPathRef.current = path;

        // Check if it's a route that should show auth modal
        const shouldShowAuthModal = AUTH_MODAL_ROUTES.some(
          (route) => path.startsWith(route) || path === route,
        );
        middlewareDebug.log("Should show auth modal:", shouldShowAuthModal);

        // If it's a route that should show auth modal, let the component handle it
        if (shouldShowAuthModal) {
          middlewareDebug.log(
            "Auth modal route - letting component handle auth",
          );
          // Check if we have a session before proceeding
          if (!session && !user) {
            middlewareDebug.log(
              "No session for auth modal route, component will handle",
            );
          }
          setIsLoading(false);
          return;
        }

        // Check if the current path is a protected route
        const isProtectedRoute = PROTECTED_ROUTES.some(
          (route) => path.startsWith(route) || path === route,
        );
        middlewareDebug.log("Is protected route:", isProtectedRoute);

        // Check if it's an admin route
        const isAdminRoute = ADMIN_ROUTES.some(
          (route) => path.startsWith(route) || path === route,
        );
        middlewareDebug.log("Is admin route:", isAdminRoute);

        if (!isProtectedRoute && !isAdminRoute) {
          // Not a protected route, allow access
          middlewareDebug.log("Not a protected route, proceeding");
          setIsLoading(false);
          return;
        }

        // For protected routes, check session
        middlewareDebug.log("Checking auth context session:", !!session);

        // If we have a session in context, verify it's still valid
        if (session) {
          const isValid = await refreshSession();
          middlewareDebug.log("Session refresh result:", isValid);

          if (isValid) {
            // For admin routes, check if user has admin role
            if (isAdminRoute) {
              // In a real app, check user.role or similar
              const isAdmin = user ? true : false; // For demo purposes

              if (!isAdmin) {
                middlewareDebug.log(
                  "User doesn't have admin privileges, redirecting",
                );
                if (isMounted.current) {
                  router.replace("/");
                }
                return;
              }
            }

            middlewareDebug.log("Valid session confirmed, allowing access");
            setIsLoading(false);
            return;
          }
        }

        // No valid session, try one final refresh
        const finalRefresh = await refreshSession();
        if (finalRefresh) {
          middlewareDebug.log("Session restored after final refresh");

          // For admin routes, check if user has admin role
          if (isAdminRoute) {
            // In a real app, check user.role or similar
            const isAdmin = user ? true : false; // For demo purposes

            if (!isAdmin) {
              middlewareDebug.log(
                "User doesn't have admin privileges, redirecting",
              );
              if (isMounted.current) {
                router.replace("/");
              }
              return;
            }
          }

          setIsLoading(false);
          return;
        }

        // If no valid session found and component is mounted, redirect
        if (isMounted.current) {
          middlewareDebug.log(
            "No valid session after all checks, redirecting from:",
            path,
            "to: /",
          );
          router.replace("/");
        }
      } catch (error) {
        middlewareDebug.error("Error in auth check:", error);
        // On error, try to refresh session one last time
        try {
          const emergencyRefresh = await refreshSession();
          if (!emergencyRefresh && isMounted.current) {
            router.replace("/");
          }
        } catch (refreshError) {
          middlewareDebug.error(
            "Error during emergency refresh:",
            refreshError,
          );
          if (isMounted.current) {
            router.replace("/");
          }
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();
  }, [segments, router, session, refreshSession, user]);

  return isLoading;
}
