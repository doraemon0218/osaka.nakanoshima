"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "director-liked-chat-ids";

type DirectorLikedContextValue = {
  likedChatIds: string[];
  toggleLiked: (chatId: string) => void;
  isLiked: (chatId: string) => boolean;
};

const DirectorLikedContext = createContext<DirectorLikedContextValue | null>(null);

function loadLiked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveLiked(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function DirectorLikedProvider({ children }: { children: ReactNode }) {
  const [likedChatIds, setLikedChatIds] = useState<string[]>([]);

  useEffect(() => {
    setLikedChatIds(loadLiked());
  }, []);

  const toggleLiked = useCallback((chatId: string) => {
    setLikedChatIds((prev) => {
      const next = prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId];
      saveLiked(next);
      return next;
    });
  }, []);

  const isLiked = useCallback(
    (chatId: string) => likedChatIds.includes(chatId),
    [likedChatIds]
  );

  return (
    <DirectorLikedContext.Provider value={{ likedChatIds, toggleLiked, isLiked }}>
      {children}
    </DirectorLikedContext.Provider>
  );
}

export function useDirectorLiked() {
  const ctx = useContext(DirectorLikedContext);
  if (!ctx) throw new Error("useDirectorLiked must be used within DirectorLikedProvider");
  return ctx;
}
