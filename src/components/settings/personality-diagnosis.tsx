"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import { Heart, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type Axis = "IE" | "SN" | "TF" | "JP";

export type PersonalityState = {
  scores: Record<Axis, number>;
  step: "intro" | "questions" | "result";
  currentQ: number;
};

const QUESTIONS: {
  axis: Axis;
  left: string;
  right: string;
  leftLabel: string;
  rightLabel: string;
}[] = [
  {
    axis: "IE",
    left: "I",
    right: "E",
    leftLabel: "一人で考えをまとめる方が好き",
    rightLabel: "人と話しながら考える方が好き",
  },
  {
    axis: "SN",
    left: "S",
    right: "N",
    leftLabel: "事実やデータを重視する",
    rightLabel: "パターンや可能性を重視する",
  },
  {
    axis: "TF",
    left: "T",
    right: "F",
    leftLabel: "論理で判断することが多い",
    rightLabel: "気持ちや価値観で判断することが多い",
  },
  {
    axis: "JP",
    left: "J",
    right: "P",
    leftLabel: "計画を立てて進めたい",
    rightLabel: "柔軟にその場で決めたい",
  },
];

const TYPE_DESCRIPTIONS: Record<
  string,
  { title: string; desc: string }
> = {
  ISTJ: {
    title: "堅実な実行者",
    desc: "責任感が強く、ルールと事実を重視します。提案はデータや手順を添えると伝わりやすいです。",
  },
  ISFJ: {
    title: "献身的なサポーター",
    desc: "周囲のニーズに敏感で、細やかな配慮ができます。提案では「誰が得をするか」を明示するとよいです。",
  },
  INFJ: {
    title: "洞察力のある導き手",
    desc: "人の本質や背景を理解し、長期的な視点で支えます。提案の背景やビジョンを短く書くと伝わります。",
  },
  INTJ: {
    title: "戦略的な計画者",
    desc: "目標に向けた効率的な道筋を描きます。改善案はロジックとステップで整理すると伝わりやすいです。",
  },
  ISTP: {
    title: "冷静な問題解決者",
    desc: "手を動かし、その場で最適解を探します。提案は「今何が起きているか」から入るとよいです。",
  },
  ISFP: {
    title: "穏やかな実践者",
    desc: "周囲の空気を大切にし、自分のペースで貢献します。提案は押しつけでなく選択肢として書くと受け入れられやすいです。",
  },
  INFP: {
    title: "理想を大切にする人",
    desc: "価値観に沿った働き方を重視します。提案に「なぜ大切か」を一文添えると共感を得やすくなります。",
  },
  INTP: {
    title: "論理的な探求者",
    desc: "仕組みや理論への関心が強く、改善のための仮説を立てるのが得意です。",
  },
  ESTP: {
    title: "機転の利く行動派",
    desc: "その場の状況を読んで素早く動きます。提案は「すぐできること」から書くと動き出しやすいです。",
  },
  ESFP: {
    title: "明るい調整役",
    desc: "雰囲気を明るくし、一体感を高めます。提案を口頭で補足する機会があると、関係者の理解が進みます。",
  },
  ENFP: {
    title: "可能性を広げる人",
    desc: "新しいアイデアや選択肢を提案し、視野を広げます。",
  },
  ENTP: {
    title: "挑戦する議論家",
    desc: "現状への疑問を投げかけ、より良い方法を議論します。提案は「現状の課題」→「案」の流れにすると伝わります。",
  },
  ESTJ: {
    title: "筋の通したリーダー",
    desc: "ルールと効率を重視し、役割分担を明確にします。提案は期限と担当を書くと採用されやすいです。",
  },
  ESFJ: {
    title: "協調的な調整役",
    desc: "和を大切にし、全員が参加できるように気を配ります。提案では関係者全員のメリットを一文ずつ書くとよいです。",
  },
  ENFJ: {
    title: "共感するリーダー",
    desc: "メンバーの意欲を引き出し、方向性を示します。提案の目的を「みんなで〇〇するため」と書くと響きやすいです。",
  },
  ENTJ: {
    title: "果断な指揮官",
    desc: "目標達成のためにはっきりと判断し、進めます。提案は結論と根拠を最初に書くと読まれやすくなります。",
  },
};

const DEFAULT_DESC = {
  title: "あなたのタイプ",
  desc: "4つの軸の傾向の組み合わせで、意思決定者に提案するときの伝え方の参考にできます。",
};

function getType(scores: Record<Axis, number>): string {
  const ie = scores.IE <= 0 ? "I" : "E";
  const sn = scores.SN <= 0 ? "S" : "N";
  const tf = scores.TF <= 0 ? "T" : "F";
  const jp = scores.JP <= 0 ? "J" : "P";
  return `${ie}${sn}${tf}${jp}`;
}

const DEFAULT_SCORES: Record<Axis, number> = {
  IE: 0,
  SN: 0,
  TF: 0,
  JP: 0,
};

type PersonalityDiagnosisProps = {
  initialState?: Partial<PersonalityState>;
  onStateChange?: (state: PersonalityState) => void;
};

export function PersonalityDiagnosis({ initialState, onStateChange }: PersonalityDiagnosisProps) {
  const [step, setStep] = useState<"intro" | "questions" | "result">(
    initialState?.step ?? "intro"
  );
  const [scores, setScores] = useState<Record<Axis, number>>(
    initialState?.scores ?? DEFAULT_SCORES
  );
  const [currentQ, setCurrentQ] = useState(initialState?.currentQ ?? 0);

  useEffect(() => {
    onStateChange?.({ scores, step, currentQ });
  }, [scores, step, currentQ, onStateChange]);

  const handleChoice = (axis: Axis, value: -1 | 1) => {
    setScores((prev) => ({ ...prev, [axis]: prev[axis] + value }));
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((i) => i + 1);
    } else {
      setStep("result");
    }
  };

  const handleRestart = () => {
    setStep("intro");
    setScores({ IE: 0, SN: 0, TF: 0, JP: 0 });
    setCurrentQ(0);
  };

  const resultType = step === "result" ? getType(scores) : "";
  const resultInfo = TYPE_DESCRIPTIONS[resultType] ?? DEFAULT_DESC;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          あなたの性格診断
        </h3>
        <ClinicalTooltip content="MBTI風の4軸で、あなたの傾向を簡易診断できます。意思決定者への提案の伝え方の参考にしてください。">
          <span className="text-muted-foreground cursor-help text-sm">?</span>
        </ClinicalTooltip>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        4問に答えると、あなたのタイプ傾向が表示されます。
      </p>

      {step === "intro" && (
        <>
          <p className="text-sm text-foreground">
            次の4問で、どちらに近いか選んでください。日頃の自分に近い方を選ぶと、提案スタイルの傾向がわかりやすくなります。
          </p>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setStep("questions")} className="gap-2">
              診断を始める
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {step === "questions" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            質問 {currentQ + 1} / {QUESTIONS.length}
          </p>
          {(() => {
            const q = QUESTIONS[currentQ];
            return (
              <>
                <p className="font-medium text-foreground">
                  どちらに近いですか？
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <button
                    type="button"
                    onClick={() => handleChoice(q.axis, -1)}
                    className="flex-1 rounded-lg border-2 border-border bg-background px-4 py-4 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <span className="font-medium text-primary">{q.left}</span>
                    <span className="mt-1 block text-muted-foreground">
                      {q.leftLabel}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChoice(q.axis, 1)}
                    className="flex-1 rounded-lg border-2 border-border bg-background px-4 py-4 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <span className="font-medium text-primary">{q.right}</span>
                    <span className="mt-1 block text-muted-foreground">
                      {q.rightLabel}
                    </span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {step === "result" && (
        <div className="space-y-4">
          <p className="text-3xl font-bold tracking-tight text-primary">
            {resultType}
          </p>
          <p className="font-medium text-foreground">{resultInfo.title}</p>
          <p className="text-sm text-muted-foreground">{resultInfo.desc}</p>
          <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            この結果は自動で保存され、いつでも設定画面から確認できます。
          </p>
          <Button
            variant="outline"
            onClick={handleRestart}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            もう一度診断する
          </Button>
        </div>
      )}
    </div>
  );
}
