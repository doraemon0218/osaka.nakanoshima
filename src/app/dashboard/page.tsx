"use client";

import Link from "next/link";
import { Sparkles, MessageSquare } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          従業員用トップ
        </h2>
        <p className="text-muted-foreground">
          このデモでは user は 1 従業員です。左のメニューから機能を選んでください。
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="mb-4 text-sm font-medium text-foreground">
          主な機能
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <Link href="/dashboard/summarize" className="text-primary hover:underline">
              AIサマライズ
            </Link>
            — チャットログから改善案を生成し、院長に報告
          </li>
          <li className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
            <Link href="/dashboard/chat-logs" className="text-primary hover:underline">
              チャットログ一覧
            </Link>
            — 企画管理室のチャットスレッド一覧
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          院長用のダッシュボード・提案一覧は、メニュー下部の「院長」からご利用ください。
        </p>
      </div>
    </div>
  );
}
