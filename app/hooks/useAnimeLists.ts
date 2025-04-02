import { useEffect } from "react";
import {
  useAnimeListsStore,
  ListType,
  AnimeListItem,
} from "@/store/animeListsStore";

export { ListType, AnimeListItem } from "@/store/animeListsStore";

export function useAnimeLists(userId: string | null) {
  // Get state and actions from the Zustand store
  const {
    lists,
    loading,
    error,
    fetchList,
    addToList,
    removeFromList,
    updateProgress,
    moveToList,
  } = useAnimeListsStore();

  // Initialize lists when userId changes
  useEffect(() => {
    if (userId) {
      // Fetch all list types
      const listTypes: ListType[] = [
        "watching",
        "completed",
        "watchlist",
        "favorites",
        "history",
      ];

      listTypes.forEach((listType) => {
        fetchList(userId, listType);
      });
    }
  }, [userId]);

  // Wrapper functions that handle the userId
  const fetchListWrapper = async (listType: ListType) => {
    if (!userId) return;
    return fetchList(userId, listType);
  };

  const addToListWrapper = async (
    animeId: string,
    listType: ListType,
    progress: number = 0,
  ) => {
    if (!userId) return { error: new Error("User not authenticated") };
    return addToList(userId, animeId, listType, progress);
  };

  const removeFromListWrapper = async (animeId: string, listType: ListType) => {
    if (!userId) return { error: new Error("User not authenticated") };
    return removeFromList(userId, animeId, listType);
  };

  const updateProgressWrapper = async (animeId: string, progress: number) => {
    if (!userId) return { error: new Error("User not authenticated") };
    return updateProgress(userId, animeId, progress);
  };

  const moveToListWrapper = async (
    animeId: string,
    fromList: ListType,
    toList: ListType,
    progress: number = 0,
  ) => {
    if (!userId) return { error: new Error("User not authenticated") };
    return moveToList(userId, animeId, fromList, toList, progress);
  };

  return {
    lists,
    loading,
    error,
    fetchList: fetchListWrapper,
    addToList: addToListWrapper,
    removeFromList: removeFromListWrapper,
    updateProgress: updateProgressWrapper,
    moveToList: moveToListWrapper,
  };
}

export default useAnimeLists;
