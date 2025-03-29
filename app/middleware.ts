import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  "/library",
  "/favorites",
  "/edit-profile",
  "/profile/edit",
  "/watchlist",
  "/history",
  "/settings",
];

// Custom hook for route protection
export function useProtectedRoute(segments: string[]) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get the current path
        const path = "/" + segments.join("/");

        // Check if the current path is a protected route
        const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
          path.startsWith(route),
        );

        if (isProtectedRoute) {
          // Try to get the session from secure storage first for faster checks
          const storedSession =
            await SecureStore.getItemAsync("supabase-session");

          if (storedSession) {
            try {
              // Verify the session is still valid
              const parsedSession = JSON.parse(storedSession);
              const expiresAt = parsedSession.expires_at;

              // If session hasn't expired, verify user exists in users table
              if (expiresAt && new Date(expiresAt * 1000) > new Date()) {
                // Check if user exists in the users table
                const userId = parsedSession.user.id;
                if (userId) {
                  const { data, error } = await supabase
                    .from("users")
                    .select("id")
                    .eq("id", userId)
                    .single();

                  // If user doesn't exist in the users table, create a default profile
                  if (error && error.code === "PGRST116") {
                    const email = parsedSession.user.email || "";
                    const username =
                      email.split("@")[0] ||
                      "user_" + Math.random().toString(36).substring(2, 7);

                    await supabase.from("users").insert({
                      id: userId,
                      username,
                      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    });
                  }
                }

                setIsChecking(false);
                return;
              }
            } catch (error) {
              console.error("Error parsing stored session:", error);
            }
          }

          // If no valid stored session, check with Supabase
          const {
            data: { session },
          } = await supabase.auth.getSession();

          // If no session, redirect to profile page with the sign-in UI
          if (!session) {
            // Redirect to the profile page which now has the sign-in UI
            router.replace("/profile");
          } else {
            // Verify user exists in users table
            const { data, error } = await supabase
              .from("users")
              .select("id")
              .eq("id", session.user.id)
              .single();

            // If user doesn't exist in the users table, create a default profile
            if (error && error.code === "PGRST116") {
              const email = session.user.email || "";
              const username =
                email.split("@")[0] ||
                "user_" + Math.random().toString(36).substring(2, 7);

              await supabase.from("users").insert({
                id: session.user.id,
                username,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        }

        // If not a protected route or user is authenticated, continue
        setIsChecking(false);
      } catch (error) {
        console.error("Middleware error:", error);
        // On error, redirect to profile as a fallback
        router.replace("/profile");
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [segments, router]);

  return isChecking;
}
