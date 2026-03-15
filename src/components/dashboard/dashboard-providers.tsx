"use client";

import { PendingProposalsProvider } from "@/contexts/pending-proposals";
import { DirectorLikedProvider } from "@/contexts/director-liked";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <PendingProposalsProvider>
      <DirectorLikedProvider>{children}</DirectorLikedProvider>
    </PendingProposalsProvider>
  );
}
