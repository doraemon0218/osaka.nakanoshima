"use client";

import { ClinicalLabel, ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import { cn } from "@/lib/utils";

const MBTI_LABELS = ["I", "E", "S", "N", "T", "F", "J", "P"] as const;
const AXES = [
  { left: "I（内向）", right: "E（外向）", key: "IE" },
  { left: "S（感覚）", right: "N（直感）", key: "SN" },
  { left: "T（思考）", right: "F（感情）", key: "TF" },
  { left: "J（判断）", right: "P（知覚）", key: "JP" },
] as const;

const DUMMY_PEOPLE = [
  { id: "1", name: "山田", type: "ISTJ", score: 85, role: "医師" },
  { id: "2", name: "佐藤", type: "ENFJ", score: 78, role: "看護師" },
  { id: "3", name: "鈴木", type: "INTP", score: 92, role: "薬剤師" },
  { id: "4", name: "高橋", type: "ESFJ", score: 70, role: "ケアマネ" },
  { id: "5", name: "伊藤", type: "INTJ", score: 88, role: "MSW" },
  { id: "6", name: "渡辺", type: "ESTP", score: 65, role: "PT" },
  { id: "7", name: "中村", type: "INFJ", score: 80, role: "OT" },
  { id: "8", name: "小林", type: "ENTJ", score: 75, role: "管理職" },
];

const TYPE_COLORS: Record<string, string> = {
  ISTJ: "bg-slate-500/80",
  ENFJ: "bg-emerald-500/80",
  INTP: "bg-blue-500/80",
  ESFJ: "bg-amber-500/80",
  INTJ: "bg-indigo-500/80",
  ESTP: "bg-orange-500/80",
  INFJ: "bg-teal-500/80",
  ENTJ: "bg-rose-500/80",
};

function getBubbleSize(score: number) {
  const base = 32;
  const scale = score / 100;
  return Math.max(28, Math.min(56, base + scale * 24));
}

export default function HeatmapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          人的資本ヒートマップ
          <ClinicalTooltip content="組織メンバーの性格特性（MBTI等）を可視化し、チームの多様性や強みのバランスを把握します。臨床では、コミュニケーションスタイルの違いを理解することで、多職種連携のすれ違いを防ぎます。">
            <span className="text-muted-foreground cursor-help">?</span>
          </ClinicalTooltip>
        </h2>
        <p className="text-muted-foreground mt-1">
          組織の性格特性をバブルチャート・グリッドで可視化します（ダミーデータ）。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* バブルチャート風 */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <ClinicalLabel
            label="タイプ別バブル（相対サイズ＝貢献度スコア）"
            tip="各メンバーをMBTIタイプでプロットし、バブルサイズで貢献度や適合度のような指標を表現しています。臨床現場では「誰がどのような思考傾向か」を共有し、役割分担に活かします。"
          />
          <div className="mt-6 flex flex-wrap items-end justify-center gap-6">
            {DUMMY_PEOPLE.map((person) => (
              <div
                key={person.id}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 border-white shadow-md text-white text-xs font-bold",
                    TYPE_COLORS[person.type] ?? "bg-primary"
                  )}
                  style={{
                    width: getBubbleSize(person.score),
                    height: getBubbleSize(person.score),
                  }}
                >
                  {person.type}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* グリッド（軸別分布） */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <ClinicalLabel
            label="軸別分布（I-E / S-N / T-F / J-P）"
            tip="4軸それぞれで、組織がどちらに寄っているかを確認できます。偏りが大きい場合は、意思決定やコミュニケーションで見落としがちな視点を意識して補うとよいでしょう。"
          />
          <div className="mt-6 space-y-4">
            {AXES.map((axis) => {
              const leftCount = DUMMY_PEOPLE.filter((p) =>
                p.type.includes(axis.key[0])
              ).length;
              const rightCount = DUMMY_PEOPLE.filter((p) =>
                p.type.includes(axis.key[1])
              ).length;
              const total = leftCount + rightCount;
              const leftPct = total > 0 ? (leftCount / total) * 100 : 50;
              return (
                <div key={axis.key}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{axis.left}</span>
                    <span>{axis.right}</span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded-full bg-muted flex">
                    <div
                      className="h-full rounded-l-full bg-primary/70 transition-all"
                      style={{ width: `${leftPct}%` }}
                    />
                    <div
                      className="h-full rounded-r-full bg-primary/30 transition-all"
                      style={{ width: `${100 - leftPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 一覧テーブル */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-medium text-foreground">メンバー一覧（MBTI・スコア）</h3>
          <p className="text-sm text-muted-foreground">
            ダミーデータです。スコアは貢献度・適合度のイメージ値です。
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left font-medium text-foreground">
                  名前
                </th>
                <th className="px-6 py-3 text-left font-medium text-foreground">
                  役割
                </th>
                <th className="px-6 py-3 text-left font-medium text-foreground">
                  MBTI
                </th>
                <th className="px-6 py-3 text-left font-medium text-foreground">
                  スコア
                </th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_PEOPLE.map((person) => (
                <tr key={person.id} className="border-b border-border">
                  <td className="px-6 py-3 font-medium text-foreground">
                    {person.name}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {person.role}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "inline-block rounded px-2 py-0.5 text-xs font-medium text-white",
                        TYPE_COLORS[person.type] ?? "bg-primary"
                      )}
                    >
                      {person.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {person.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
