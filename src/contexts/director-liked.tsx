"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getDemoResetEventName } from "@/lib/demo-reset";

const STORAGE_KEY = "director-reactions";
const LEGACY_KEY = "director-liked-chat-ids";

/** 院長の反応（迅速な篩い分け・後から検証用） */
export type DirectorReaction = "liked" | "not_bad" | "hmm";

/** 経営企画室メンバー（棚卸先）。デモ用 A〜E。空欄＝未選択 */
export type PlanningMemberId = "A" | "B" | "C" | "D" | "E";

export const PLANNING_MEMBERS: { id: PlanningMemberId; name: string }[] = [
  { id: "A", name: "Aさん" },
  { id: "B", name: "Bさん" },
  { id: "C", name: "Cさん" },
  { id: "D", name: "Dさん" },
  { id: "E", name: "Eさん" },
];

/** 棚卸先は空欄（""）を許容。院長が棚卸先・評価の両方を入れたときだけ対応中から外れる */
export type AssignedToValue = PlanningMemberId | "";

type DirectorEntry = {
  reaction: DirectorReaction | null;
  assignedTo: AssignedToValue;
  /** 院長が棚卸時に追記する意図・詳細のメモ（任意） */
  memo?: string;
};

type DirectorLikedContextValue = {
  likedChatIds: string[];
  toggleLiked: (chatId: string) => void;
  isLiked: (chatId: string) => boolean;
  getReaction: (chatId: string) => DirectorReaction | null;
  getAssignedTo: (chatId: string) => AssignedToValue;
  getMemo: (chatId: string) => string;
  /** 棚卸先・評価の両方が入っているか（対応中から除く条件） */
  isTriageComplete: (chatId: string) => boolean;
  setReaction: (chatId: string, reaction: DirectorReaction | null, assignedTo?: AssignedToValue) => void;
  setAssignedTo: (chatId: string, assignedTo: AssignedToValue) => void;
  setMemo: (chatId: string, memo: string) => void;
  reactions: Record<string, DirectorReaction>;
  entries: Record<string, DirectorEntry>;
};

const DirectorLikedContext = createContext<DirectorLikedContextValue | null>(null);

const validIds: PlanningMemberId[] = ["A", "B", "C", "D", "E"];

function loadEntries(): Record<string, DirectorEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const out: Record<string, DirectorEntry> = {};
      if (obj && typeof obj === "object") {
        for (const [k, v] of Object.entries(obj)) {
          if (v && typeof v === "object" && "reaction" in v) {
            const ent = v as Record<string, unknown>;
            const reaction = ent.reaction as string | null;
            const assignedTo = ent.assignedTo as string;
            const validReaction =
              reaction === "liked" || reaction === "not_bad" || reaction === "hmm";
            const validAssigned =
              assignedTo === "" || validIds.includes(assignedTo as PlanningMemberId);
            const memo = typeof ent.memo === "string" ? ent.memo : undefined;
            if (validReaction && validAssigned) {
              out[k] = {
                reaction: reaction as DirectorReaction,
                assignedTo: (assignedTo || "") as AssignedToValue,
                ...(memo !== undefined && memo !== "" ? { memo } : {}),
              };
            } else if (reaction === null && validAssigned) {
              out[k] = {
                reaction: null,
                assignedTo: (assignedTo || "") as AssignedToValue,
                ...(memo !== undefined && memo !== "" ? { memo } : {}),
              };
            }
          } else if (v === "liked" || v === "not_bad" || v === "hmm") {
            out[k] = { reaction: v as DirectorReaction, assignedTo: "A" };
          }
        }
      }
      return out;
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const arr = JSON.parse(legacy) as unknown[];
      const ids = Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
      const out: Record<string, DirectorEntry> = {};
      ids.forEach((id) => (out[id] = { reaction: "liked", assignedTo: "A" }));
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
      } catch {
        // ignore
      }
      return out;
    }
  } catch {
    // ignore
  }
  return {};
}

function saveEntries(entries: Record<string, DirectorEntry>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function DirectorLikedProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, DirectorEntry>>({});

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  useEffect(() => {
    const eventName = getDemoResetEventName();
    const handler = () => setEntries(loadEntries());
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, []);

  const reactions: Record<string, DirectorReaction> = Object.fromEntries(
    Object.entries(entries)
      .filter(([, v]) => v.reaction != null)
      .map(([k, v]) => [k, v.reaction!])
  );

  const likedChatIds = Object.entries(entries)
    .filter(([, v]) => v.reaction === "liked")
    .map(([k]) => k);

  const toggleLiked = useCallback((chatId: string) => {
    setEntries((prev) => {
      const next = { ...prev };
      if (next[chatId]?.reaction === "liked") delete next[chatId];
      else
        next[chatId] = {
          reaction: "liked",
          assignedTo: prev[chatId]?.assignedTo ?? "",
          memo: prev[chatId]?.memo,
        };
      saveEntries(next);
      return next;
    });
  }, []);

  const isLiked = useCallback(
    (chatId: string) => entries[chatId]?.reaction === "liked",
    [entries]
  );

  const getReaction = useCallback(
    (chatId: string): DirectorReaction | null => entries[chatId]?.reaction ?? null,
    [entries]
  );

  const getAssignedTo = useCallback(
    (chatId: string): AssignedToValue => entries[chatId]?.assignedTo ?? "",
    [entries]
  );

  const getMemo = useCallback(
    (chatId: string): string => entries[chatId]?.memo ?? "",
    [entries]
  );

  const isTriageComplete = useCallback(
    (chatId: string): boolean => {
      const e = entries[chatId];
      if (!e) return false;
      return e.reaction != null && e.assignedTo !== "";
    },
    [entries]
  );

  const setReaction = useCallback(
    (chatId: string, reaction: DirectorReaction | null, assignedTo?: AssignedToValue) => {
      setEntries((prev) => {
        const next = { ...prev };
        if (reaction === null) {
          delete next[chatId];
        } else {
          next[chatId] = {
            reaction,
            assignedTo: assignedTo !== undefined ? assignedTo : prev[chatId]?.assignedTo ?? "",
            memo: prev[chatId]?.memo,
          };
        }
        saveEntries(next);
        return next;
      });
    },
    []
  );

  const setAssignedTo = useCallback((chatId: string, assignedTo: AssignedToValue) => {
    setEntries((prev) => {
      const next = { ...prev };
      next[chatId] = {
        reaction: prev[chatId]?.reaction ?? null,
        assignedTo: assignedTo ?? "",
        memo: prev[chatId]?.memo,
      };
      saveEntries(next);
      return next;
    });
  }, []);

  const setMemo = useCallback((chatId: string, memo: string) => {
    setEntries((prev) => {
      const next = { ...prev };
      const existing = prev[chatId];
      if (!existing) {
        next[chatId] = { reaction: null, assignedTo: "", memo: memo || undefined };
      } else {
        next[chatId] = { ...existing, memo: memo || undefined };
      }
      saveEntries(next);
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
        getAssignedTo,
        getMemo,
        isTriageComplete,
        setReaction,
        setAssignedTo,
        setMemo,
        reactions,
        entries,
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
