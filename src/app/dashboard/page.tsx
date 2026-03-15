"use client";

import { ClinicalTooltip } from "@/components/ui/clinical-tooltip";

const cards = [
  {
    title: "本日の件数",
    value: "—",
    desc: "レポート・症例",
    tip: "臨床医の視点では、当日の症例数・報告数が一目で分かると、優先順位づけがしやすくなります。",
  },
  {
    title: "対応中",
    value: "—",
    desc: "進行中のタスク",
    tip: "いま手がけているタスクを一覧にし、引き継ぎや棚卸しに活用できます。",
  },
  {
    title: "アラート",
    value: "0",
    desc: "要対応",
    tip: "見逃しがちなフォローや期限を、アラートで補完します。",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          ダッシュボード
        </h2>
        <p className="text-muted-foreground">
          メイン画面です。医療現場の情報を一覧で確認できます。
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <ClinicalTooltip key={card.title} content={card.tip}>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm cursor-help">
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
            </div>
          </ClinicalTooltip>
        ))}
      </div>
    </div>
  );
}
