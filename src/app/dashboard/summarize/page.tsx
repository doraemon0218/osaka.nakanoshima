"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClinicalLabel, ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import { Sparkles, MessageSquare, FileText, TrendingUp, AlertTriangle } from "lucide-react";

const DUMMY_CHAT_LOG = [
  { id: "1", user: "田中（看護師）", time: "09:12", text: "3床のバイタル変動あり。医師に報告済み。" },
  { id: "2", user: "山田（医師）", time: "09:15", text: "了解。検査オーダー出した。結果次第で処方変更を検討。" },
  { id: "3", user: "佐藤（薬剤師）", time: "09:45", text: "相互作用チェック完了。問題なし。在庫確認して明日納品可能。" },
  { id: "4", user: "田中（看護師）", time: "10:00", text: "家族から面会時間の問い合わせ。午後からでお願いします。" },
  { id: "5", user: "山田（医師）", time: "10:05", text: "承知。回診は午前中に終わらせる。" },
];

const DUMMY_IMPROVEMENTS = [
  {
    id: "1",
    title: "バイタル変動時のエスカレーション基準の明文化",
    roi: "約 12% の見逃しリスク低減",
    risk: "低",
    riskNote: "既存フローに組み込むだけのため導入リスクは小さい。",
  },
  {
    id: "2",
    title: "検査結果〜処方変更までのリードタイム短縮",
    roi: "平均 2.5h 短縮見込み",
    risk: "中",
    riskNote: "他科・薬剤科との調整が必要。段階的導入を推奨。",
  },
  {
    id: "3",
    title: "家族対応の窓口一元化",
    roi: "問い合わせ対応時間 約 20% 削減",
    risk: "低",
    riskNote: "受付・看護の役割整理のみで実現可能。",
  },
];

export default function SummarizePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setHasResult(false);
    setTimeout(() => {
      setIsGenerating(false);
      setHasResult(true);
    }, 2200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          AIサマライズ
          <ClinicalTooltip content="チャットログから、ROI（投資対効果）とリスクを考慮した改善案を自動で抽出します。臨床現場の会話の「文脈」を踏まえ、無理のない改善提案を行います。">
            <span className="text-muted-foreground cursor-help">?</span>
          </ClinicalTooltip>
        </h2>
        <p className="text-muted-foreground mt-1">
          LINE WORKS風チャットログから、ROI・リスク付きの改善案をシミュレーション表示します。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* チャットログエリア */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ClinicalLabel
              label="チャットログ（サンプル）"
              tip="実際の業務チャットを想定したダミーログです。部署間の連携や報告・依頼の流れが、そのまま改善ポイントの候補になります。"
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
              label="ROI・リスク付き改善案"
              tip="臨床医の視点では、効果の大きさ（ROI）と現場への負荷・リスクのバランスが重要です。ここでは両方を併記し、導入優先度の判断材料にします。"
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
                {DUMMY_IMPROVEMENTS.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-border bg-background p-3 shadow-sm"
                  >
                    <p className="font-medium text-foreground">{item.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        <TrendingUp className="h-3 w-3" />
                        {item.roi}
                      </span>
                      <span
                        className={`
                          inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs
                          ${item.risk === "低" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}
                        `}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        リスク: {item.risk}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.riskNote}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
