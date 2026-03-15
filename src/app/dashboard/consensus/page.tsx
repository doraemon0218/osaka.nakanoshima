"use client";

import { useState } from "react";
import { ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageSquare, ArrowUp, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePendingProposals } from "@/contexts/pending-proposals";
import { getChatMessages } from "@/lib/chat-logs-data";

// チャット主が送信した提案。チャット内の人が承認すると院長に上がる（body / fromChatId は内容確認用）
const DUMMY_PROPOSALS = [
  {
    id: "1",
    title: "予算・報告の取りまとめフローの明文化",
    body: "各部門ヒアリング結果を踏まえ、調整会議のアウトプットを標準化する提案です。報告フローを明文化し、工数削減を図りたいです。",
    fromChat: "企画管理室 予算取りまとめ",
    fromChatId: "4",
    sentBy: "田中（企画管理室）",
    approvers: [
      { name: "山田（リーダー）", status: "approved" as const },
      { name: "佐藤（企画管理室）", status: "approved" as const },
    ],
    allApproved: true,
    sentToDirector: true,
  },
  {
    id: "2",
    title: "進捗・了承状況の窓口一元化",
    body: "進捗管理の棚卸し結果を基に、了承状況の確認窓口を一元化する提案です。確認工数の削減が見込めます。",
    fromChat: "企画管理室 進捗棚卸し",
    fromChatId: "1",
    sentBy: "佐藤（企画管理室）",
    approvers: [
      { name: "山田（リーダー）", status: "approved" as const },
      { name: "田中（企画管理室）", status: "pending" as const },
    ],
    allApproved: false,
    sentToDirector: false,
  },
  {
    id: "3",
    title: "ヒアリング〜意思決定者報告までのリードタイム短縮",
    body: "ヒアリングから意思決定者への報告までのリードタイムを短縮するため、取りまとめ手順の見直しを提案します。",
    fromChat: "企画管理室 週次報告",
    fromChatId: "2",
    sentBy: "山田（企画管理室 リーダー）",
    approvers: [
      { name: "田中（企画管理室）", status: "pending" as const },
      { name: "佐藤（企画管理室）", status: "pending" as const },
    ],
    allApproved: false,
    sentToDirector: false,
  },
];

export default function ConsensusPage() {
  const { proposals: pendingProposals, approveProposal } = usePendingProposals();
  const [dummyProposals, setDummyProposals] = useState(DUMMY_PROPOSALS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // チャットから送信した新規提案を上に、既存ダミーを下に表示
  const allProposals = [...pendingProposals, ...dummyProposals];

  const handleApprove = (proposalId: string, approverIndex: number) => {
    if (proposalId.startsWith("new-")) {
      approveProposal(proposalId, approverIndex);
      return;
    }
    setDummyProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const nextApprovers = [...p.approvers];
        nextApprovers[approverIndex] = {
          ...nextApprovers[approverIndex],
          status: "approved" as const,
        };
        const allApproved = nextApprovers.every((a) => a.status === "approved");
        return {
          ...p,
          approvers: nextApprovers,
          allApproved,
          sentToDirector: allApproved,
        };
      })
    );
  };

  const unapprovedCount = allProposals.filter((p) => !p.sentToDirector).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          <CheckCircle2 className="h-7 w-7 text-primary" />
          承認待ちの提案一覧
          <ClinicalTooltip content="各チャットを総括し、院長に提案する内容について、チャット内の承認を得たものが院長に上がります。チャット主が要約・提案を送信すると、チャット内の人に承認確認が通知され、承認されると院長に上がります。">
            <span className="text-muted-foreground cursor-help">?</span>
          </ClinicalTooltip>
        </h2>
        <p className="mt-1 text-muted-foreground">
          チャット主が送信した提案のうち、チャット内の承認がまだ完了していないもの一覧です。全員が承認すると院長に送られます。
        </p>
      </div>

      {/* フロー説明 */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">流れ</p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>チャット主が要約・提案を送信</li>
          <li>チャット内の人に承認確認が通知される</li>
          <li>承認されると院長に上がる</li>
        </ol>
      </div>

      {/* 未承認件数 */}
      {unapprovedCount > 0 && (
        <p className="text-sm text-muted-foreground">
          未承認の提案: <span className="font-medium text-foreground">{unapprovedCount}</span> 件
        </p>
      )}

      {/* 提案一覧 */}
      <div className="space-y-4">
        {allProposals.map((p) => {
          const isExpanded = expandedId === p.id;
          const chatId = "fromChatId" in p ? (p as { fromChatId?: string }).fromChatId : undefined;
          const body = "body" in p ? (p as { body?: string }).body : undefined;
          const messages = chatId ? getChatMessages(chatId) : [];

          return (
            <div
              key={p.id}
              className={cn(
                "rounded-lg border bg-card shadow-sm",
                p.sentToDirector ? "border-green-500/30" : "border-border",
                isExpanded && "ring-2 ring-primary/30"
              )}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {p.fromChat} ／ 送信: {p.sentBy}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {p.sentToDirector && (
                      <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                        <ArrowUp className="h-3.5 w-3.5" />
                        院長に送済み
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      className="gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          閉じる
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          内容を確認
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 展開時: チャットログ・提案内容を表示し、承認ボタンを同じ画面で操作 */}
                {isExpanded && (
                  <div className="mt-5 space-y-5 border-t border-border pt-5">
                    {body != null && body !== "" && (
                      <div>
                        <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          提案内容
                        </p>
                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                          <p className="whitespace-pre-wrap text-sm text-foreground">{body}</p>
                        </div>
                      </div>
                    )}
                    {messages.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          チャットログ（{p.fromChat}）
                        </p>
                        <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border bg-muted/10 p-3">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className="rounded-md bg-background px-3 py-2 text-sm"
                            >
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{msg.user}</span>
                                <span>{msg.time}</span>
                              </div>
                              <p className="mt-1 text-foreground">{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        チャット内の承認（内容を確認のうえ承認してください）
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {p.approvers.map((a, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs",
                                a.status === "approved"
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              )}
                            >
                              {a.name}: {a.status === "approved" ? "承認済み" : "未承認"}
                            </span>
                            {a.status !== "approved" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(p.id, i)}
                              >
                                承認する（デモ）
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 折りたたみ時は承認状況のみ表示 */}
                {!isExpanded && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      チャット内の承認
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {p.approvers.map((a, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs",
                              a.status === "approved"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            )}
                          >
                            {a.name}: {a.status === "approved" ? "承認済み" : "未承認"}
                          </span>
                          {a.status !== "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(p.id, i)}
                            >
                              承認する（デモ）
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
