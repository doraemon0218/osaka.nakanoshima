"use client";

import { useState } from "react";
import Link from "next/link";
import { ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import {
  Building2,
  FileText,
  Grid3X3,
  MessageSquare,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDirectorLiked } from "@/contexts/director-liked";
import {
  getChatById,
  getChatMessages,
  getSentProposal,
} from "@/lib/chat-logs-data";

/** 院長に挙がってきた提案（チャットID・提案主。内容は getSentProposal で取得） */
const PROPOSALS_TO_DIRECTOR = [
  { chatId: "4", from: "田中（企画管理室）", date: "2025/3/14" },
  { chatId: "5", from: "田中（企画管理室）", date: "2025/3/13" },
  { chatId: "6", from: "佐藤（企画管理室）", date: "2025/3/12" },
];

const cards = [
  { title: "本日の提案件数", value: "3", desc: "院長確認分" },
  { title: "対応中", value: "2", desc: "検討・了承待ち" },
  { title: "アラート", value: "1", desc: "要確認" },
];

function formatSentAt(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DirectorPage() {
  const { isLiked, toggleLiked } = useDirectorLiked();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Building2 className="h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            院長用ダッシュボード
          </h2>
          <p className="text-sm text-muted-foreground">
            挙がってきた提案を閲覧し、チャットログを確認してからいいね！で採用できます。提案主・チャット参加者に感謝が伝わります。
          </p>
        </div>
      </div>

      {/* サマリー・ヒートマップリンク */}
      <section>
        <h3 className="mb-4 text-lg font-medium text-foreground">サマリー</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/heatmap"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Grid3X3 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">人的資本ヒートマップ</p>
              <p className="text-sm text-muted-foreground">組織の性格特性（MBTI等）を可視化</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 挙がってきた提案一覧：閲覧・いいね */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">挙がってきた提案一覧</h3>
          <ClinicalTooltip content="従業員から院長に報告された提案です。閲覧でチャットログ・提案内容を確認し、いいね！を押すと提案主のレポートに「採用」、チャット参加者に「あなたのおかげで」が表示され、お礼の気持ちが伝わります。">
            <span className="cursor-help text-sm text-muted-foreground">?</span>
          </ClinicalTooltip>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          たくさんの提案が上がってくるため、取捨選択の参考に閲覧してからいいね！で採用してください。
        </p>
        <div className="space-y-2 rounded-lg border border-border bg-card shadow-sm">
          {PROPOSALS_TO_DIRECTOR.map((p) => {
            const chat = getChatById(p.chatId);
            const proposal = getSentProposal(p.chatId);
            const messages = getChatMessages(p.chatId);
            const open = expandedId === p.chatId;

            return (
              <div
                key={p.chatId}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {proposal?.title ?? "（提案）"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {p.from} ／ {p.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(open ? null : p.chatId)}
                      className="gap-1"
                    >
                      {open ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          閉じる
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          閲覧（チャット・提案内容）
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant={isLiked(p.chatId) ? "secondary" : "default"}
                      onClick={() => toggleLiked(p.chatId)}
                      className="gap-1"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {isLiked(p.chatId) ? "いいね！済み" : "いいね！"}
                    </Button>
                  </div>
                </div>

                {open && (
                  <div className="border-t border-border bg-muted/20 px-6 py-5 space-y-5">
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                        <MessageSquare className="h-4 w-4" />
                        チャットログ
                        {chat && (
                          <span className="font-normal text-muted-foreground">
                            （{chat.title}）
                          </span>
                        )}
                      </h4>
                      <div className="rounded-lg border border-border bg-background p-3">
                        {messages.length === 0 ? (
                          <p className="text-sm text-muted-foreground">メッセージはありません</p>
                        ) : (
                          <ul className="space-y-2">
                            {messages.map((msg) => (
                              <li key={msg.id} className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                                <span className="text-xs text-muted-foreground">
                                  {msg.user} {msg.time}
                                </span>
                                <p className="mt-1 text-foreground">{msg.text}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    {proposal && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                          <FileText className="h-4 w-4" />
                          提案内容
                        </h4>
                        <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">タイトル</p>
                            <p className="font-medium text-foreground">{proposal.title}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">本文</p>
                            <p className="whitespace-pre-wrap text-sm text-foreground">
                              {proposal.body}
                            </p>
                          </div>
                          {proposal.improvements.length > 0 && (
                            <div>
                              <p className="mb-1 text-xs text-muted-foreground">改善案</p>
                              <ul className="space-y-1">
                                {proposal.improvements.map((imp, i) => (
                                  <li key={i} className="text-sm">
                                    {imp.title}（ROI: {imp.roi}、リスク: {imp.risk}）
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
