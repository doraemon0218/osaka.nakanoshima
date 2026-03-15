"use client";

import { useState } from "react";
import { ClinicalLabel, ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DUMMY_MEMBERS = [
  { id: "1", name: "山田 太郎", role: "主治医", status: "approved" as const },
  { id: "2", name: "佐藤 花子", role: "看護師長", status: "approved" as const },
  { id: "3", name: "鈴木 一郎", role: "薬剤師", status: "pending" as const },
  { id: "4", name: "高橋 美咲", role: "ケアマネ", status: "pending" as const },
  { id: "5", name: "伊藤 健太", role: "MSW", status: "rejected" as const },
];

export default function ConsensusPage() {
  const [members, setMembers] = useState(DUMMY_MEMBERS);

  const approvedCount = members.filter((m) => m.status === "approved").length;
  const total = members.length;
  const progress = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

  const handleApprove = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "approved" as const } : m))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          コンセンサス・ビュー
          <ClinicalTooltip content="治療方針やプロトコル変更について、関係メンバーが「了承」したかどうかを一覧で確認できます。臨床では多職種の合意が安全につながるため、進捗を可視化します。">
            <span className="text-muted-foreground cursor-help">?</span>
          </ClinicalTooltip>
        </h2>
        <p className="text-muted-foreground mt-1">
          メンバーの了承ボタン状況をリアルタイムで確認する進捗画面です。
        </p>
      </div>

      {/* 進捗バー */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <ClinicalLabel
            label="了承進捗"
            tip="臨床医の視点では、誰がまだ確認していないかが重要です。残り1人でも未了承なら、説明不足や懸念の可能性があるためフォローしやすくします。"
          />
          <span className="text-sm font-medium text-foreground">
            {approvedCount} / {total} 了承
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* メンバー一覧 */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-medium text-foreground">対象メンバー</h3>
          <p className="text-sm text-muted-foreground">
            プロトコル変更案「〇〇基準の見直し」への了承状況
          </p>
        </div>
        <ul className="divide-y divide-border">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    member.status === "approved"
                      ? "bg-primary/10 text-primary"
                      : member.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {member.status === "approved" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : member.status === "rejected" ? (
                    <Circle className="h-5 w-5" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    member.status === "approved" &&
                      "bg-green-500/10 text-green-700 dark:text-green-400",
                    member.status === "pending" &&
                      "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                    member.status === "rejected" &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {member.status === "approved"
                    ? "了承済み"
                    : member.status === "rejected"
                      ? "未確認"
                      : "確認中"}
                </span>
                {member.status === "pending" && (
                  <Button size="sm" onClick={() => handleApprove(member.id)}>
                    了承する（デモ）
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
