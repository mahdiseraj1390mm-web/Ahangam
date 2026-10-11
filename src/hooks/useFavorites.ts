"use client";

import { useState, useEffect, useCallback } from "react";

// Global cache in memory so state is shared between all hook instances
let globalFavoriteIds: Set<string> = new Set();
let isFetched = false;
const listeners = new Set<(ids: Set<string>) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(new Set(globalFavoriteIds)));
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(globalFavoriteIds);

  useEffect(() => {
    // Sync with listener
    const handleChange = (ids: Set<string>) => {
      setFavoriteIds(ids);
    };
    listeners.add(handleChange);

    // Initial load from localStorage
    try {
      const cached = localStorage.getItem("ahangam_favorites_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          globalFavoriteIds = new Set(parsed);
          setFavoriteIds(new Set(globalFavoriteIds));
        }
      }
    } catch {}

    // Fetch fresh from API if not yet fetched
    if (!isFetched) {
      isFetched = true;
      fetch("/api/favorites/ids")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.ids)) {
            globalFavoriteIds = new Set(data.ids);
            localStorage.setItem("ahangam_favorites_cache", JSON.stringify(data.ids));
            notifyListeners();
          }
        })
        .catch(() => {});
    }

    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const isFavorite = useCallback(
    (songId: string) => {
      return favoriteIds.has(songId);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(async (songId: string): Promise<boolean> => {
    if (!songId) return false;

    // 1. Optimistic update
    const nextState = !globalFavoriteIds.has(songId);
    if (nextState) {
      globalFavoriteIds.add(songId);
    } else {
      globalFavoriteIds.delete(songId);
    }

    try {
      localStorage.setItem(
        "ahangam_favorites_cache",
        JSON.stringify(Array.from(globalFavoriteIds))
      );
    } catch {}

    notifyListeners();

    // 2. Network sync
    try {
      const res = await fetch(`/api/songs/${songId}/favorite`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && typeof data.isFavorite === "boolean") {
        if (data.isFavorite) {
          globalFavoriteIds.add(songId);
        } else {
          globalFavoriteIds.delete(songId);
        }
        try {
          localStorage.setItem(
            "ahangam_favorites_cache",
            JSON.stringify(Array.from(globalFavoriteIds))
          );
        } catch {}
        notifyListeners();
        return data.isFavorite;
      }
    } catch {
      // Revert if failed
      if (nextState) {
        globalFavoriteIds.delete(songId);
      } else {
        globalFavoriteIds.add(songId);
      }
      notifyListeners();
    }

    return nextState;
  }, []);

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
  };
}
