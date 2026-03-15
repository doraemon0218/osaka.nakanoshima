"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ApproverStatus = "approved" | "pending";

export type PendingProposal = {
  id: string;
  title: string;
  body: string;
  fromChat: string;
  fromChatId: string;
  sentBy: string;
  approvers: { name: string; status: ApproverStatus }[];
  allApproved: boolean;
  sentToDirector: boolean;
};

export type SentProposalSnapshot = {
  title: string;
  body: string;
  sentAt: string;
};

type PendingProposalsContextValue = {
  proposals: PendingProposal[];
  addProposal: (p: Omit<PendingProposal, "id" | "allApproved" | "sentToDirector">) => void;
  approveProposal: (proposalId: string, approverIndex: number) => void;
  sentChatIds: string[];
  sentProposalsByChatId: Record<string, SentProposalSnapshot>;
  getSentProposalFromContext: (chatId: string) => SentProposalSnapshot | null;
};

const PendingProposalsContext = createContext<PendingProposalsContextValue | null>(null);

export function PendingProposalsProvider({ children }: { children: ReactNode }) {
  const [proposals, setProposals] = useState<PendingProposal[]>([]);
  const [sentChatIds, setSentChatIds] = useState<string[]>([]);
  const [sentProposalsByChatId, setSentProposalsByChatId] = useState<Record<string, SentProposalSnapshot>>({});

  const getSentProposalFromContext = useCallback((chatId: string): SentProposalSnapshot | null => {
    return sentProposalsByChatId[chatId] ?? null;
  }, [sentProposalsByChatId]);

  const addProposal = useCallback(
    (p: Omit<PendingProposal, "id" | "allApproved" | "sentToDirector">) => {
      const id = `new-${Date.now()}`;
      const sentAt = new Date().toISOString();
      setProposals((prev) => [
        {
          ...p,
          id,
          allApproved: false,
          sentToDirector: false,
        },
        ...prev,
      ]);
      if (p.fromChatId) {
        setSentChatIds((prev) => (prev.includes(p.fromChatId) ? prev : [...prev, p.fromChatId]));
        setSentProposalsByChatId((prev) => ({
          ...prev,
          [p.fromChatId]: { title: p.title, body: p.body, sentAt },
        }));
      }
    },
    []
  );

  const approveProposal = useCallback((proposalId: string, approverIndex: number) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const nextApprovers = [...p.approvers];
        nextApprovers[approverIndex] = { ...nextApprovers[approverIndex], status: "approved" as const };
        const allApproved = nextApprovers.every((a) => a.status === "approved");
        return {
          ...p,
          approvers: nextApprovers,
          allApproved,
          sentToDirector: allApproved,
        };
      })
    );
  }, []);

  return (
    <PendingProposalsContext.Provider
      value={{
        proposals,
        addProposal,
        approveProposal,
        sentChatIds,
        sentProposalsByChatId,
        getSentProposalFromContext,
      }}
    >
      {children}
    </PendingProposalsContext.Provider>
  );
}

export function usePendingProposals() {
  const ctx = useContext(PendingProposalsContext);
  if (!ctx) throw new Error("usePendingProposals must be used within PendingProposalsProvider");
  return ctx;
}
