"use client";

import { FileText, MessageSquare, ThumbsUp } from "lucide-react";
import {
  getChatById,
  getChatMessages,
  getSentProposal,
} from "@/lib/chat-logs-data";
import { ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import { useDirectorLiked } from "@/contexts/director-liked";
import { usePendingProposals } from "@/contexts/pending-proposals";

function formatSentAt(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportsPage() {
  const { likedChatIds } = useDirectorLiked();
  const { getSentProposalFromContext } = usePendingProposals();
  const reports = likedChatIds
    .map((chatId) => {
      const proposal = getSentProposal(chatId) ?? getSentProposalFromContext(chatId);
      if (!proposal) return null;
      return {
        chatId,
        title: proposal.title,
        body: proposal.body,
        sentAt: proposal.sentAt,
        improvements: "improvements" in proposal ? proposal.improvements : [],
      };
    })
    .filter(Boolean) as { chatId: string; title: string; body: string; sentAt: string; improvements: { title: string; roi: string; risk: string }[] }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            院長いいねリスト
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            院長がいいね！を押した提案の一覧です。採用としてチャットログと提案内容を確認できます。
          </p>
        </div>
        <ClinicalTooltip content="院長が「いいね！」した提案がここに「採用」として表示されます。院長からのお礼の気持ちが伝わります。">
          <span className="cursor-help text-muted-foreground text-sm">?</span>
        </ClinicalTooltip>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          <p>院長がいいね！を押した提案はまだありません。</p>
          <p className="mt-2 text-xs">院長にいいね！されると、ここに「採用」として表示されます。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => {
            const chat = getChatById(report.chatId);
            const messages = getChatMessages(report.chatId);
            return (
              <article
                key={report.chatId}
                className="rounded-lg border border-green-500/30 bg-green-500/5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-green-500/20 px-6 py-3">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <span className="rounded-full bg-green-600/20 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:text-green-300">
                    採用
                  </span>
                  <span className="text-sm text-green-700 dark:text-green-400">
                    院長がいいね！
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatSentAt(report.sentAt)} 提案
                  </span>
                </div>

                <div className="space-y-6 p-6">
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      チャットログ
                      {chat && (
                        <span className="font-normal text-muted-foreground">
                          （{chat.title}）
                        </span>
                      )}
                    </h3>
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                      {messages.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          メッセージはありません
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {messages.map((msg) => (
                            <li
                              key={msg.id}
                              className="rounded-md bg-background px-3 py-2 text-sm"
                            >
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {msg.user}
                                </span>
                                <span>{msg.time}</span>
                              </div>
                              <p className="mt-1 text-foreground">{msg.text}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      提案内容
                    </h3>
                    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          タイトル
                        </p>
                        <p className="font-medium text-foreground">
                          {report.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          本文
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-foreground">
                          {report.body}
                        </p>
                      </div>
                      {report.improvements.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            改善案
                          </p>
                          <ul className="space-y-2">
                            {report.improvements.map((imp, i) => (
                              <li
                                key={i}
                                className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"
                              >
                                <p className="font-medium text-foreground">
                                  {imp.title}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  ROI: {imp.roi} ／ リスク: {imp.risk}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
