"use client";

import { PendingProposalsProvider } from "@/contexts/pending-proposals";
import { DirectorLikedProvider } from "@/contexts/director-liked";
import { PlanningEvaluationProvider } from "@/contexts/planning-evaluation";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <PendingProposalsProvider>
      <PlanningEvaluationProvider>
        <DirectorLikedProvider>{children}</DirectorLikedProvider>
      </PlanningEvaluationProvider>
    </PendingProposalsProvider>
  );
}
