"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import {
  Building2,
  FileText,
  Grid3X3,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ChevronUp,
  Filter,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDirectorLiked,
  type DirectorReaction,
  PLANNING_MEMBERS,
} from "@/contexts/director-liked";
import { usePendingProposals } from "@/contexts/pending-proposals";
import { usePlanningEvaluation, PLANNING_THEMES } from "@/contexts/planning-evaluation";
import {
  getChatById,
  getChatMessages,
  getSentProposal,
} from "@/lib/chat-logs-data";

/** 院長に挙がってきた提案（静的：チャットID・提案主。内容は getSentProposal で取得） */
const STATIC_PROPOSALS_TO_DIRECTOR = [
  { chatId: "4", from: "田中（企画管理室）", date: "2025/3/14" },
  { chatId: "5", from: "田中（企画管理室）", date: "2025/3/13" },
  { chatId: "6", from: "佐藤（企画管理室）", date: "2025/3/12" },
];

/** 院長一覧で表示する1件（静的 or 全員承認済みコンテキスト） */
type DirectorProposalItem = {
  key: string;
  chatId: string;
  from: string;
  date: string;
  title: string;
  body: string;
  improvements: { title: string; roi: string; risk: string }[];
};

/** サマリーの絞り込み種別（押したカードに応じて一覧をフィルタ） */
type SummaryFilter = null | "unreviewed" | "in_progress" | "alert";

const SUMMARY_CARDS: { key: SummaryFilter; title: string; desc: string }[] = [
  { key: "unreviewed", title: "本日の提案件数", desc: "院長確認分" },
  { key: "in_progress", title: "対応中", desc: "検討・了承待ち" },
  { key: "alert", title: "アラート", desc: "要確認" },
];

function formatSentAt(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const REACTION_FILTER_OPTIONS: { value: DirectorReaction | ""; label: string }[] = [
  { value: "", label: "すべて" },
  { value: "liked", label: "いいね！" },
  { value: "not_bad", label: "悪くない" },
  { value: "hmm", label: "う〜ん" },
];

const PLANNING_REACTION_LABELS: Record<string, string> = {
  liked: "いいね！",
  not_bad: "悪くない",
  hmm: "う〜ん",
};

type DirectorProposalCardProps = {
  item: DirectorProposalItem;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  getReaction: (chatId: string) => DirectorReaction | null;
  getAssignedTo: (chatId: string) => string;
  getMemo: (chatId: string) => string;
  setReaction: (chatId: string, reaction: DirectorReaction | null, assignedTo?: string) => void;
  setAssignedTo: (chatId: string, assignedTo: string) => void;
  setMemo: (chatId: string, memo: string) => void;
  getPlanningEvaluation: (chatId: string) => { themeId: string; reaction: string; askDirector: boolean } | null;
};

function DirectorProposalCard({
  item,
  expandedId,
  setExpandedId,
  getReaction,
  getAssignedTo,
  getMemo,
  setReaction,
  setAssignedTo,
  setMemo,
  getPlanningEvaluation,
}: DirectorProposalCardProps) {
  const chat = getChatById(item.chatId);
  const messages = getChatMessages(item.chatId);
  const open = expandedId === item.key;
  const planningEv = getPlanningEvaluation(item.chatId);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{item.title}</p>
            {planningEv ? (
              <>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {PLANNING_THEMES.find((t) => t.id === planningEv.themeId)?.label ?? planningEv.themeId}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  企画管理室：{PLANNING_REACTION_LABELS[planningEv.reaction] ?? planningEv.reaction}
                </span>
                {planningEv.askDirector ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <HelpCircle className="h-3 w-3" />
                    院長に聞く
                  </span>
                ) : null}
              </>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.from} ／ {item.date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedId(open ? null : item.key)}
            className="gap-1"
          >
            {open ? (
              <>
                <ChevronUp className="h-4 w-4" />
                閉じる
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                閲覧（チャット・提案内容）
              </>
            )}
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                棚卸先：
              </span>
              <select
                value={getAssignedTo(item.chatId) ?? ""}
                onChange={(e) =>
                  setAssignedTo(item.chatId, (e.target.value || "") as "" | "A" | "B" | "C" | "D" | "E")
                }
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              >
                <option value="">未選択</option>
                {PLANNING_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={getReaction(item.chatId) === "liked" ? "default" : "outline"}
                onClick={() =>
                  setReaction(item.chatId, getReaction(item.chatId) === "liked" ? null : "liked", getAssignedTo(item.chatId) || "")
                }
                className="gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                {getReaction(item.chatId) === "liked" ? "いいね！済み" : "いいね！"}
              </Button>
              <Button
                size="sm"
                variant={getReaction(item.chatId) === "not_bad" ? "secondary" : "outline"}
                onClick={() =>
                  setReaction(item.chatId, getReaction(item.chatId) === "not_bad" ? null : "not_bad", getAssignedTo(item.chatId) || "")
                }
                className="gap-1"
              >
                <Minus className="h-4 w-4" />
                {getReaction(item.chatId) === "not_bad" ? "悪くない 済" : "悪くない"}
              </Button>
              <Button
                size="sm"
                variant={getReaction(item.chatId) === "hmm" ? "secondary" : "outline"}
                onClick={() =>
                  setReaction(item.chatId, getReaction(item.chatId) === "hmm" ? null : "hmm", getAssignedTo(item.chatId) || "")
                }
                className="gap-1"
              >
                <ThumbsDown className="h-4 w-4" />
                {getReaction(item.chatId) === "hmm" ? "う〜ん 済" : "う〜ん"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 px-6 py-3 bg-muted/20">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          意図・詳細のメモ（任意）
        </label>
        <textarea
          value={getMemo(item.chatId)}
          onChange={(e) => setMemo(item.chatId, e.target.value)}
          placeholder="棚卸の意図や詳細をフリー入力で追記できます"
          className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
          rows={2}
        />
      </div>
      {open ? (
        <div className="border-t border-border bg-muted/20 px-6 py-5 space-y-5">
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageSquare className="h-4 w-4" />
              チャットログ
              {chat ? (
                <span className="font-normal text-muted-foreground">
                  （{chat.title}）
                </span>
              ) : null}
            </h4>
            <div className="rounded-lg border border-border bg-background p-3">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">メッセージはありません</p>
              ) : (
                <ul className="space-y-2">
                  {messages.map((msg) => (
                    <li key={msg.id} className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <span className="text-xs text-muted-foreground">
                        {msg.user} {msg.time}
                      </span>
                      <p className="mt-1 text-foreground">{msg.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4" />
              提案内容
            </h4>
            <div className="rounded-lg border border-border bg-background p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">タイトル</p>
                <p className="font-medium text-foreground">{item.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">本文</p>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {item.body}
                </p>
              </div>
              {item.improvements.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">改善案</p>
                  <ul className="space-y-1">
                    {item.improvements.map((imp, i) => (
                      <li key={i} className="text-sm">
                        {imp.title}（ROI: {imp.roi}、リスク: {imp.risk}）
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DirectorPage() {
  const {
    isLiked,
    getReaction,
    getAssignedTo,
    getMemo,
    isTriageComplete,
    setReaction,
    setAssignedTo,
    setMemo,
  } = useDirectorLiked();
  const { proposals: pendingProposals, getSentProposalFromContext } = usePendingProposals();
  const { getEvaluation: getPlanningEvaluation } = usePlanningEvaluation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>(null);
  const [reactionFilter, setReactionFilter] = useState<DirectorReaction | "">("");

  // 静的リスト ＋ 全員承認済み。院長には「企画管理室で評価済み」のものだけ表示（現場→企画管理室→院長）
  const allProposalsToDirector = useMemo((): DirectorProposalItem[] => {
    const staticItems: DirectorProposalItem[] = STATIC_PROPOSALS_TO_DIRECTOR.map((p) => {
      const sp = getSentProposal(p.chatId);
      return {
        key: `static-${p.chatId}`,
        chatId: p.chatId,
        from: p.from,
        date: p.date,
        title: sp?.title ?? "（提案）",
        body: sp?.body ?? "",
        improvements: sp?.improvements ?? [],
      };
    });
    const approvedFromContext = pendingProposals
      .filter((p) => p.allApproved)
      .map((p) => {
        const sent = getSentProposalFromContext(p.fromChatId);
        const dateStr = sent?.sentAt ? formatSentAt(sent.sentAt) : "—";
        return {
          key: p.id,
          chatId: p.fromChatId,
          from: p.sentBy,
          date: dateStr,
          title: p.title,
          body: p.body,
          improvements: [] as { title: string; roi: string; risk: string }[],
        };
      });
    return [...approvedFromContext, ...staticItems];
  }, [pendingProposals, getSentProposalFromContext]);

  // 企画管理室でテーマ・評価済みのものだけ院長に表示（優先度・良い課題として企画管理室から上がってきたもの）
  const proposalsToDirector = useMemo(
    () => allProposalsToDirector.filter((p) => getPlanningEvaluation(p.chatId) != null),
    [allProposalsToDirector, getPlanningEvaluation]
  );

  // サマリー用：棚卸先・評価の両方が未入力の件数（対応中）。両方入れたときだけ対応中から外れる
  const unreviewedCount = useMemo(
    () => proposalsToDirector.filter((p) => !isTriageComplete(p.chatId)).length,
    [proposalsToDirector, isTriageComplete]
  );
  const alertCount = unreviewedCount > 0 ? 1 : 0;

  // サマリー or 検証用反応で絞り込み
  const displayedProposals = useMemo(() => {
    let list = proposalsToDirector;
    if (summaryFilter) {
      list = list.filter((p) => !isTriageComplete(p.chatId));
    }
    if (reactionFilter) {
      list = list.filter((p) => getReaction(p.chatId) === reactionFilter);
    }
    return list;
  }, [proposalsToDirector, summaryFilter, reactionFilter, getReaction, isTriageComplete]);

  const getSummaryValue = (key: SummaryFilter): string => {
    if (key === "alert") return String(alertCount);
    if (key === "unreviewed" || key === "in_progress") return String(unreviewedCount);
    return "0";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Building2 className="h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            院長用ダッシュボード
          </h2>
          <p className="text-sm text-muted-foreground">
            企画管理室でテーマ分類・評価された提案がここに上がります。優先度・良い課題を確認してから、いいね！／悪くない／う〜んで判断できます。「院長に聞く」付きは要確認です。
          </p>
        </div>
      </div>

      {/* サマリー・ヒートマップリンク */}
      <section>
        <h3 className="mb-4 text-lg font-medium text-foreground">サマリー</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          件数をタップすると、該当するチャットログ（提案）一覧が下に表示されます。
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {SUMMARY_CARDS.map((card) => {
            const value = getSummaryValue(card.key);
            const isActive = summaryFilter === card.key;
            return (
              <button
                key={card.key ?? "all"}
                type="button"
                onClick={() => setSummaryFilter(isActive ? null : card.key)}
                className={`rounded-lg border p-6 text-left shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/5 ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/heatmap"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Grid3X3 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">人的資本ヒートマップ</p>
              <p className="text-sm text-muted-foreground">組織の性格特性（MBTI等）を可視化</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 挙がってきた提案一覧：閲覧・いいね（サマリーでフィルタ時は該当のみ表示） */}
      <section id="proposal-list">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">
            {reactionFilter
              ? REACTION_FILTER_OPTIONS.find((o) => o.value === reactionFilter)?.label + "の提案一覧"
              : summaryFilter
                ? SUMMARY_CARDS.find((c) => c.key === summaryFilter)?.desc + "の提案一覧"
                : "挙がってきた提案一覧"}
          </h3>
          {(summaryFilter || reactionFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSummaryFilter(null);
                setReactionFilter("");
              }}
              className="text-muted-foreground"
            >
              すべての提案を表示
            </Button>
          )}
          <ClinicalTooltip content="従業員から院長に報告された提案です。閲覧でチャットログ・提案内容を確認し、いいね！を押すと提案主のレポートに「採用」、チャット参加者に「あなたのおかげで」が表示され、お礼の気持ちが伝わります。">
            <span className="cursor-help text-sm text-muted-foreground">?</span>
          </ClinicalTooltip>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          企画管理室の評価（テーマ・いいね／悪くない／う〜ん）を踏まえ、院長として「いいね！」「悪くない」「う〜ん」で迅速に篩い分けできます。後から検証用に反応で絞り込み可能です。
        </p>
        {/* 検証用：反応で絞り込み */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">検証用：</span>
          {REACTION_FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.value || "all"}
              variant={reactionFilter === opt.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setReactionFilter(opt.value as DirectorReaction | "")}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="space-y-2 rounded-lg border border-border bg-card shadow-sm">
          {displayedProposals.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              {summaryFilter
                ? "該当する提案はありません。"
                : "企画管理室で評価された提案がここに表示されます。まず経営企画室でテーマ分類・評価してください。"}
            </div>
          ) : (
            <>
              {displayedProposals.map((item) => (
                <DirectorProposalCard
                  key={item.key}
                  item={item}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  getReaction={getReaction}
                  getAssignedTo={getAssignedTo}
                  getMemo={getMemo}
                  setReaction={setReaction}
                  setAssignedTo={setAssignedTo}
                  setMemo={setMemo}
                  getPlanningEvaluation={getPlanningEvaluation}
                />
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
