import { useEffect } from "react";
import {
  useUserPreferencesStore,
  UserPreferences,
} from "@/store/userPreferencesStore";

export { UserPreferences } from "@/store/userPreferencesStore";

export function useUserPreferences(userId: string | null) {
  // Get state and actions from the Zustand store
  const { preferences, loading, error, fetchPreferences, updatePreferences } =
    useUserPreferencesStore();

  // Initialize preferences when userId changes
  useEffect(() => {
    if (userId) {
      fetchPreferences(userId);
    }
  }, [userId]);

  // Wrapper for updatePreferences that handles the userId
  const updateUserPreferences = async (
    updates: Partial<Omit<UserPreferences, "id" | "userId" | "updatedAt">>,
  ) => {
    if (!userId) return { error: new Error("User not authenticated") };
    return updatePreferences(userId, updates);
  };

  return {
    preferences,
    loading,
    error,
    fetchPreferences: () => userId && fetchPreferences(userId),
    updatePreferences: updateUserPreferences,
  };
}

export default useUserPreferences;
