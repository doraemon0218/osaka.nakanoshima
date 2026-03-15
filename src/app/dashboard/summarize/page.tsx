"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClinicalLabel, ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import { Sparkles, MessageSquare, FileText, TrendingUp, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DUMMY_CHAT_LOG = [
  { id: "1", user: "田中（企画管理室）", time: "09:12", text: "今期の予算案、各部門からヒアリング済みです。調整会議の日程出しましょうか。" },
  { id: "2", user: "山田（企画管理室 リーダー）", time: "09:15", text: "了解。来週火曜で取りまとめ。ROIの試算も添付しておいて。" },
  { id: "3", user: "佐藤（企画管理室）", time: "09:45", text: "進捗管理の棚卸し完了。遅れているタスクは2件。優先度の見直しが必要そうです。" },
  { id: "4", user: "田中（企画管理室）", time: "10:00", text: "意思決定者への報告資料、明日午前中に共有します。" },
  { id: "5", user: "山田（企画管理室 リーダー）", time: "10:05", text: "承知。了承取りまとめは佐藤さんにお願い。" },
];

const DUMMY_IMPROVEMENTS = [
  {
    id: "1",
    title: "予算・報告の取りまとめフローの明文化",
    roi: "約 12% の工数削減見込み",
    risk: "低",
    riskNote: "既存の会議に組み込むだけのため導入リスクは小さい。",
  },
  {
    id: "2",
    title: "ヒアリング〜意思決定者報告までのリードタイム短縮",
    roi: "平均 2.5日 短縮見込み",
    risk: "中",
    riskNote: "他部門・企画管理室内の調整が必要。段階的導入を推奨。",
  },
  {
    id: "3",
    title: "進捗・了承状況の窓口一元化",
    roi: "確認工数 約 20% 削減",
    risk: "低",
    riskNote: "役割整理のみで実現可能。",
  },
];

export default function SummarizePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const handleGenerate = () => {
    setIsGenerating(true);
    setHasResult(false);
    setSelectedIds(new Set());
    setReportedIds(new Set());
    setTimeout(() => {
      setIsGenerating(false);
      setHasResult(true);
    }, 2200);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReportToDirector = (id: string) => {
    setReportedIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          AIサマライズ
          <ClinicalTooltip content="企画管理室のチャットログから、ROI（投資対効果）とリスクを考慮した改善案を自動で抽出します。">
            <span className="text-muted-foreground cursor-help">?</span>
          </ClinicalTooltip>
        </h2>
        <p className="text-muted-foreground mt-1">
          企画管理室のチャットログ（LINE WORKS風）から、ROI・リスク付きの改善案をシミュレーション表示します。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* チャットログエリア */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ClinicalLabel
              label="企画管理室 チャットログ（サンプル）"
              tip="企画管理室の業務チャットを想定したダミーログです。予算・進捗・報告の流れが改善案の候補になります。"
            />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              LINE WORKS風
            </span>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto rounded-md bg-muted/30 p-3">
            {DUMMY_CHAT_LOG.map((msg) => (
              <div
                key={msg.id}
                className="rounded-lg bg-background px-3 py-2 text-sm shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{msg.user}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="mt-1">{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AIで改善案を生成
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 改善案エリア */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ClinicalLabel
              label="予測される提案アイデア"
              tip="効果（ROI）とリスクを併記しています。チェックを入れた項目の下から院長に報告できます。"
            />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              AI出力
            </span>
          </div>
          <div className="min-h-[320px] rounded-md bg-muted/30 p-3">
            {!hasResult ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
                {isGenerating ? (
                  <p>チャットログを分析し、改善案を生成しています...</p>
                ) : (
                  <p>「AIで改善案を生成」を押すと、ここに結果が表示されます。</p>
                )}
              </div>
            ) : (
              <ul className="space-y-4">
                  {DUMMY_IMPROVEMENTS.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    const isReported = reportedIds.has(item.id);
                    return (
                      <li key={item.id} className="rounded-lg border border-border bg-background p-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{item.title}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                <TrendingUp className="h-3 w-3" />
                                {item.roi}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs",
                                  item.risk === "低"
                                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                )}
                              >
                                <AlertTriangle className="h-3 w-3" />
                                リスク: {item.risk}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {item.riskNote}
                            </p>
                          </div>
                          <label className="flex shrink-0 cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.id)}
                              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            <span className="text-xs text-muted-foreground">選択</span>
                          </label>
                        </div>
                        {isSelected && (
                          <div className="mt-3 border-t border-border pt-3">
                            <Button
                              onClick={() => handleReportToDirector(item.id)}
                              size="sm"
                              className="gap-2"
                            >
                              <Check className="h-4 w-4" />
                              院長に報告する
                            </Button>
                            {isReported && (
                              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                院長に共有しました。ご協力ありがとうございます。
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
