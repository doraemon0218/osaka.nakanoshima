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

const STORAGE_KEY = "planning-evaluations";

/** 病院経営課題のテーマ（企画管理室で分類） */
export const PLANNING_THEMES = [
  { id: "revenue_cost", label: "収益・コスト" },
  { id: "quality_safety", label: "品質・安全" },
  { id: "workstyle_hr", label: "働き方・人事" },
  { id: "patient_experience", label: "患者体験" },
  { id: "other", label: "その他" },
] as const;

export type PlanningThemeId = (typeof PLANNING_THEMES)[number]["id"];
export type PlanningReaction = "liked" | "not_bad" | "hmm";

export type PlanningEvaluation = {
  themeId: PlanningThemeId;
  reaction: PlanningReaction;
  askDirector: boolean;
  evaluatedAt: string;
};

type PlanningEvaluationContextValue = {
  evaluations: Record<string, PlanningEvaluation>;
  getEvaluation: (chatId: string) => PlanningEvaluation | null;
  setEvaluation: (
    chatId: string,
    data: { themeId: PlanningThemeId; reaction: PlanningReaction; askDirector: boolean }
  ) => void;
  clearEvaluation: (chatId: string) => void;
};

const PlanningEvaluationContext = createContext<PlanningEvaluationContextValue | null>(null);

function loadEvaluations(): Record<string, PlanningEvaluation> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, PlanningEvaluation> = {};
    const validThemeIds = PLANNING_THEMES.map((t) => t.id);
    if (obj && typeof obj === "object") {
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === "object" && "themeId" in v && "reaction" in v) {
          const ev = v as Record<string, unknown>;
          const themeId = ev.themeId as string;
          const reaction = ev.reaction as string;
          if (
            validThemeIds.includes(themeId as PlanningThemeId) &&
            (reaction === "liked" || reaction === "not_bad" || reaction === "hmm")
          ) {
            out[k] = {
              themeId: themeId as PlanningThemeId,
              reaction: reaction as PlanningReaction,
              askDirector: Boolean(ev.askDirector),
              evaluatedAt:
                typeof ev.evaluatedAt === "string" ? ev.evaluatedAt : new Date().toISOString(),
            };
          }
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

function saveEvaluations(ev: Record<string, PlanningEvaluation>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ev));
  } catch {
    // ignore
  }
}

export function PlanningEvaluationProvider({ children }: { children: ReactNode }) {
  const [evaluations, setEvaluations] = useState<Record<string, PlanningEvaluation>>({});

  useEffect(() => {
    setEvaluations(loadEvaluations());
  }, []);

  useEffect(() => {
    const eventName = getDemoResetEventName();
    const handler = () => setEvaluations(loadEvaluations());
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, []);

  const getEvaluation = useCallback(
    (chatId: string): PlanningEvaluation | null => evaluations[chatId] ?? null,
    [evaluations]
  );

  const setEvaluation = useCallback(
    (
      chatId: string,
      data: { themeId: PlanningThemeId; reaction: PlanningReaction; askDirector: boolean }
    ) => {
      setEvaluations((prev) => {
        const next = {
          ...prev,
          [chatId]: {
            ...data,
            evaluatedAt: new Date().toISOString(),
          },
        };
        saveEvaluations(next);
        return next;
      });
    },
    []
  );

  const clearEvaluation = useCallback((chatId: string) => {
    setEvaluations((prev) => {
      const next = { ...prev };
      delete next[chatId];
      saveEvaluations(next);
      return next;
    });
  }, []);

  return (
    <PlanningEvaluationContext.Provider
      value={{ evaluations, getEvaluation, setEvaluation, clearEvaluation }}
    >
      {children}
    </PlanningEvaluationContext.Provider>
  );
}

export function usePlanningEvaluation() {
  const ctx = useContext(PlanningEvaluationContext);
  if (!ctx)
    throw new Error("usePlanningEvaluation must be used within PlanningEvaluationProvider");
  return ctx;
}
