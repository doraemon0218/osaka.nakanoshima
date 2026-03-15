"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChatById, getChatMessages, getSentProposal } from "@/lib/chat-logs-data";
import { MessageSquare, ArrowLeft, Send, FileText, PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingProposals } from "@/contexts/pending-proposals";

function formatSentAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const chat = getChatById(id);
  if (!chat) notFound();

  const messages = getChatMessages(id);
  const sentProposalStatic = getSentProposal(id);
  const { addProposal, getSentProposalFromContext } = usePendingProposals();
  const sentProposalFromContext = getSentProposalFromContext(id);
  const sentProposal =
    sentProposalStatic ??
    (sentProposalFromContext
      ? { ...sentProposalFromContext, improvements: [] as { title: string; roi: string; risk: string }[] }
      : null);
  const [additionalProposal, setAdditionalProposal] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 提案未送信用: まず「AIアシスト」か「フリー入力」を選択 → 入力画面へ
  type ProposalMode = "choice" | "ai" | "free";
  const [proposalMode, setProposalMode] = useState<ProposalMode>("choice");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTemplate, setAiTemplate] = useState<{ title: string; body: string } | null>(null);
  const [freeInput, setFreeInput] = useState("");

  const handleAiGenerate = () => {
    setAiGenerating(true);
    setAiTemplate(null);
    setTimeout(() => {
      setAiGenerating(false);
      setAiTemplate({
        title: "チャットに基づく改善提案",
        body:
          "本チャットの議論を踏まえ、以下の改善を提案します。\n\n・取りまとめフローの明文化\n・ヒアリングから報告までのリードタイム短縮\n・進捗・了承状況の窓口一元化\n\nご検討のほどよろしくお願いいたします。",
      });
    }, 1800);
  };

  const handleSendProposal = () => {
    const title = aiTemplate ? aiTemplate.title.trim() || "提案" : (freeInput.trim().slice(0, 50) || "提案");
    const body = aiTemplate ? aiTemplate.body.trim() : freeInput.trim();
    if (!title && !body) return;
    addProposal({
      title: title || "提案",
      body: body || "（内容なし）",
      fromChat: chat.title,
      fromChatId: id,
      sentBy: "自分",
      approvers: [
        { name: "山田（リーダー）", status: "pending" },
        { name: "佐藤（企画管理室）", status: "pending" },
      ],
    });
    setAiTemplate(null);
    setFreeInput("");
  };

  const canSend =
    proposalMode === "ai"
      ? aiTemplate && (aiTemplate.title.trim() || aiTemplate.body.trim())
      : proposalMode === "free" && freeInput.trim().length > 0;

  const handleSubmitAdditional = () => {
    if (!additionalProposal.trim()) return;
    setSubmitted(true);
    setAdditionalProposal("");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/chat-logs"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          一覧へ
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <MessageSquare className="h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {chat.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {sentProposal ? "送信済み" : "提案未送信"}
          </p>
        </div>
      </div>

      {/* チャットメッセージ */}
      <section>
        <h3 className="mb-3 text-lg font-medium text-foreground">チャットログ</h3>
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">メッセージはありません</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-lg bg-muted/50 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{msg.user}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="mt-1">{msg.text}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 提案未送信の場合：提案する画面（選択 → 入力画面 → 送信） */}
      {!sentProposal && (
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-foreground">
            <Send className="h-5 w-5 text-primary" />
            提案する
          </h3>

          {/* Step 1: 提案方法を選択 */}
          {proposalMode === "choice" && (
            <>
              <p className="mb-5 text-sm text-muted-foreground">
                どちらの方法で提案しますか？ 選択すると入力画面に進みます。
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setProposalMode("ai")}
                  className="flex flex-col items-start gap-2 rounded-xl border-2 border-border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span className="flex items-center gap-2 text-base font-medium text-foreground">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AIアシスト提案をする
                  </span>
                  <span className="text-sm text-muted-foreground">
                    AIがテンプレを作成します。タイトル・本文はそのまま編集できます。
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setProposalMode("free")}
                  className="flex flex-col items-start gap-2 rounded-xl border-2 border-border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span className="flex items-center gap-2 text-base font-medium text-foreground">
                    <Send className="h-5 w-5 text-primary" />
                    フリー入力提案をする
                  </span>
                  <span className="text-sm text-muted-foreground">
                    AIを使わず、補足や独自の提案をそのまま入力します。
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Step 2a: AIアシスト → 入力画面（テンプレ編集・本文は編集可能を明示） */}
          {proposalMode === "ai" && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProposalMode("choice");
                    setAiTemplate(null);
                  }}
                >
                  ← 選択に戻る
                </Button>
                <span className="text-sm text-muted-foreground">AIアシスト提案</span>
              </div>
              <div className="mb-6">
                {!aiTemplate ? (
                  <>
                    <p className="mb-3 text-sm text-muted-foreground">
                      AIが提案テンプレを作成します。作成後、タイトル・本文を自由に編集してから送信できます。
                    </p>
                    <Button
                      onClick={handleAiGenerate}
                      disabled={aiGenerating}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {aiGenerating ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          AIでテンプレを作成
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4 rounded-lg border-2 border-primary/40 bg-primary/5 p-5">
                    <p className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                      ✏️ タイトル・本文は編集可能です。必要に応じて修正してから送信してください。
                    </p>
                    <div>
                      <label className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                        タイトル
                        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">編集可</span>
                      </label>
                      <input
                        type="text"
                        value={aiTemplate.title}
                        onChange={(e) => setAiTemplate((t) => (t ? { ...t, title: e.target.value } : null))}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                        本文
                        <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                          編集可・そのまま書き換えOK
                        </span>
                      </label>
                      <textarea
                        value={aiTemplate.body}
                        onChange={(e) => setAiTemplate((t) => (t ? { ...t, body: e.target.value } : null))}
                        className="min-h-[160px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={6}
                        placeholder="AIが生成した本文を自由に編集できます"
                      />
                    </div>
                  </div>
                )}
              </div>
              {aiTemplate && (
                <Button onClick={handleSendProposal} disabled={!canSend} className="gap-2">
                  <Send className="h-4 w-4" />
                  送信（チャット参加者に承認要求）
                </Button>
              )}
            </>
          )}

          {/* Step 2b: フリー入力 → 入力画面（補足しやすい動線） */}
          {proposalMode === "free" && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProposalMode("choice");
                    setFreeInput("");
                  }}
                >
                  ← 選択に戻る
                </Button>
                <span className="text-sm text-muted-foreground">フリー入力提案</span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                AIを使わず、補足や独自の提案をそのまま入力します。必要事項を書いたら下の送信ボタンで送信してください。
              </p>
              <div className="mb-5 rounded-lg border border-border bg-muted/20 p-4">
                <label className="mb-2 block text-sm font-medium text-foreground">提案内容（フリー入力）</label>
                <textarea
                  value={freeInput}
                  onChange={(e) => setFreeInput(e.target.value)}
                  placeholder="例：〇〇についての補足です。／ 独自の改善案として△△を提案します。"
                  className="min-h-[140px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={5}
                />
              </div>
              <Button onClick={handleSendProposal} disabled={!canSend} className="gap-2">
                <Send className="h-4 w-4" />
                送信（チャット参加者に承認要求）
              </Button>
            </>
          )}
        </section>
      )}

      {/* 送信済みの場合：過去に送信した提案内容を振り返り用に表示 */}
      {sentProposal && (
        <section className="rounded-lg border border-green-500/30 bg-green-500/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-foreground">
            <Send className="h-5 w-5 text-green-600" />
            過去に送信した提案内容（振り返り）
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">送信日時</p>
              <p className="text-sm text-foreground">
                {formatSentAt(sentProposal.sentAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">提案タイトル</p>
              <p className="font-medium text-foreground">{sentProposal.title}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">提案内容</p>
              <p className="text-sm text-foreground">{sentProposal.body}</p>
            </div>
            {sentProposal.improvements.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  改善案（送信時）
                </p>
                <ul className="space-y-2">
                  {sentProposal.improvements.map((imp, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{imp.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          ROI: {imp.roi} ／ リスク: {imp.risk}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 追加で新たに提案できるフリー入力欄 */}
          <div className="mt-8 border-t border-green-500/20 pt-6">
            <h4 className="mb-2 flex items-center gap-2 text-base font-medium text-foreground">
              <PlusCircle className="h-4 w-4 text-primary" />
              新たに気づいたこと・追加提案
            </h4>
            <p className="mb-3 text-xs text-muted-foreground">
              振り返りで気づいたことを自由に記入し、追加で提案できます。
            </p>
            <textarea
              value={additionalProposal}
              onChange={(e) => setAdditionalProposal(e.target.value)}
              placeholder="例：前回の提案を踏まえ、〇〇についても検討いただきたいです。／ チャットのやりとりから、△△の見直しを追加で提案します。"
              className="min-h-[120px] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
            <div className="mt-3 flex items-center gap-3">
              <Button
                onClick={handleSubmitAdditional}
                disabled={!additionalProposal.trim()}
                size="sm"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                追加提案を送信
              </Button>
              {submitted && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  追加提案を送信しました。
                </span>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
