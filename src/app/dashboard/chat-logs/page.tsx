"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import { MessageSquare, ChevronRight, Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DUMMY_CHAT_LOGS } from "@/lib/chat-logs-data";
import { usePendingProposals } from "@/contexts/pending-proposals";

function formatLastAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

export default function ChatLogsPage() {
  const { sentChatIds } = usePendingProposals();
  const sortedLogs = useMemo(() => {
    const isSent = (l: (typeof DUMMY_CHAT_LOGS)[0]) =>
      l.sentStatus === "sent" || sentChatIds.includes(l.id);
    const unsent = DUMMY_CHAT_LOGS.filter((l) => !isSent(l))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const sent = DUMMY_CHAT_LOGS.filter(isSent)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return { unsent, sent };
  }, [sentChatIds]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          <MessageSquare className="h-7 w-7 text-primary" />
          チャットログ一覧
          <ClinicalTooltip content="自分が主のチャットのみ一覧表示されます。提案未送信が上、送信済みが下で、それぞれ新しい順に並びます。送信済みを開くと、過去に送信した提案内容を振り返れます。">
            <span className="text-muted-foreground cursor-help">?</span>
          </ClinicalTooltip>
        </h2>
        <p className="mt-1 text-muted-foreground">
          自分が主のチャットログを一覧で確認できます。送信済みを開くと、過去の提案内容を振り返れます。
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        {/* 提案未送信 */}
        <div className="border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="h-4 w-4 text-amber-600" />
            提案未送信
          </h3>
        </div>
        <ul className="divide-y divide-border">
          {sortedLogs.unsent.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-muted-foreground">
              未送信のチャットはありません
            </li>
          ) : (
            sortedLogs.unsent.map((log) => (
              <li key={log.id}>
                <Link
                  href={`/dashboard/chat-logs/${log.id}`}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50",
                    log.unread > 0 && "bg-primary/5"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-foreground">
                        {log.title}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatLastAt(log.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {log.lastMessage}
                    </p>
                  </div>
                  {log.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
                      {log.unread}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))
          )}
        </ul>

        {/* 送信済み */}
        <div className="border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Send className="h-4 w-4 text-green-600" />
            送信済み
          </h3>
        </div>
        <ul className="divide-y divide-border">
          {sortedLogs.sent.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-muted-foreground">
              送信済みのチャットはありません
            </li>
          ) : (
            sortedLogs.sent.map((log) => (
              <li key={log.id}>
                <Link
                  href={`/dashboard/chat-logs/${log.id}`}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50",
                    log.unread > 0 && "bg-primary/5"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-foreground">
                        {log.title}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatLastAt(log.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {log.lastMessage}
                    </p>
                  </div>
                  {log.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
                      {log.unread}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
