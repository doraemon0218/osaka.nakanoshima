"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "director-reactions";
const LEGACY_KEY = "director-liked-chat-ids";

/** 院長の反応（迅速な篩い分け・後から検証用） */
export type DirectorReaction = "liked" | "not_bad" | "hmm";

type DirectorLikedContextValue = {
  /** いいね！＝採用（レポート・あなたのおかげでに表示） */
  likedChatIds: string[];
  toggleLiked: (chatId: string) => void;
  isLiked: (chatId: string) => boolean;
  /** 院長の反応（いいね / 悪くない / う〜ん）。後から検証用 */
  getReaction: (chatId: string) => DirectorReaction | null;
  setReaction: (chatId: string, reaction: DirectorReaction | null) => void;
  /** 反応ごとの chatId 一覧（検証用フィルタ） */
  reactions: Record<string, DirectorReaction>;
};

const DirectorLikedContext = createContext<DirectorLikedContextValue | null>(null);

function loadReactions(): Record<string, DirectorReaction> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const out: Record<string, DirectorReaction> = {};
      if (obj && typeof obj === "object") {
        for (const [k, v] of Object.entries(obj)) {
          if (v === "liked" || v === "not_bad" || v === "hmm") out[k] = v;
        }
      }
      return out;
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const arr = JSON.parse(legacy) as unknown[];
      const ids = Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
      const out: Record<string, DirectorReaction> = {};
      ids.forEach((id) => (out[id] = "liked"));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
      return out;
    }
  } catch {
    // ignore
  }
  return {};
}

function saveReactions(reactions: Record<string, DirectorReaction>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reactions));
  } catch {
    // ignore
  }
}

export function DirectorLikedProvider({ children }: { children: ReactNode }) {
  const [reactions, setReactions] = useState<Record<string, DirectorReaction>>({});

  useEffect(() => {
    setReactions(loadReactions());
  }, []);

  const likedChatIds = Object.entries(reactions)
    .filter(([, v]) => v === "liked")
    .map(([k]) => k);

  const toggleLiked = useCallback((chatId: string) => {
    setReactions((prev) => {
      const next = { ...prev };
      if (next[chatId] === "liked") delete next[chatId];
      else next[chatId] = "liked";
      saveReactions(next);
      return next;
    });
  }, []);

  const isLiked = useCallback(
    (chatId: string) => reactions[chatId] === "liked",
    [reactions]
  );

  const getReaction = useCallback(
    (chatId: string): DirectorReaction | null => reactions[chatId] ?? null,
    [reactions]
  );

  const setReaction = useCallback((chatId: string, reaction: DirectorReaction | null) => {
    setReactions((prev) => {
      const next = { ...prev };
      if (reaction === null) delete next[chatId];
      else next[chatId] = reaction;
      saveReactions(next);
      return next;
    });
  }, []);

  return (
    <DirectorLikedContext.Provider
      value={{
        likedChatIds,
        toggleLiked,
        isLiked,
        getReaction,
        setReaction,
        reactions,
      }}
    >
      {children}
    </DirectorLikedContext.Provider>
  );
}

export function useDirectorLiked() {
  const ctx = useContext(DirectorLikedContext);
  if (!ctx) throw new Error("useDirectorLiked must be used within DirectorLikedProvider");
  return ctx;
}
