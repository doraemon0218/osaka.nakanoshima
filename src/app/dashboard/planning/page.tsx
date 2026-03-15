"use client";

import { useMemo, useState } from "react";
import { ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import {
  Briefcase,
  FileText,
  MessageSquare,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Inbox,
  ClipboardList,
  Filter,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDirectorLiked,
  type DirectorReaction,
  PLANNING_MEMBERS,
  type PlanningMemberId,
} from "@/contexts/director-liked";
import { usePendingProposals } from "@/contexts/pending-proposals";
import {
  usePlanningEvaluation,
  PLANNING_THEMES,
  type PlanningThemeId,
  type PlanningReaction,
} from "@/contexts/planning-evaluation";
import {
  getChatById,
  getChatMessages,
  getSentProposal,
} from "@/lib/chat-logs-data";

const STATIC_PROPOSALS = [
  { chatId: "4", from: "田中（企画管理室）", date: "2025/3/14" },
  { chatId: "5", from: "田中（企画管理室）", date: "2025/3/13" },
  { chatId: "6", from: "佐藤（企画管理室）", date: "2025/3/12" },
];

type ProposalItem = {
  key: string;
  chatId: string;
  from: string;
  date: string;
  title: string;
  body: string;
  improvements: { title: string; roi: string; risk: string }[];
};

function formatSentAt(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const REACTION_LABELS: Record<PlanningReaction, string> = {
  liked: "いいね！",
  not_bad: "悪くない",
  hmm: "う〜ん",
};

export default function PlanningPage() {
  const { entries: directorEntries, isTriageComplete } = useDirectorLiked();
  const { getEvaluation, setEvaluation } = usePlanningEvaluation();
  const { proposals: pendingProposals, getSentProposalFromContext } = usePendingProposals();
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [expandedDirectorId, setExpandedDirectorId] = useState<string | null>(null);
  const [themeFilter, setThemeFilter] = useState<PlanningThemeId | "">("");
  const [reactionFilter, setReactionFilter] = useState<PlanningReaction | "">("");
  const [askDirectorOnly, setAskDirectorOnly] = useState(false);
  const [assignedToFilter, setAssignedToFilter] = useState<PlanningMemberId | "">("");

  const fieldProposals = useMemo((): ProposalItem[] => {
    const staticItems: ProposalItem[] = STATIC_PROPOSALS.map((p) => {
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
    const approved = pendingProposals
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
    return [...approved, ...staticItems];
  }, [pendingProposals, getSentProposalFromContext]);

  const filteredFieldProposals = useMemo(() => {
    let list = fieldProposals;
    if (themeFilter) {
      list = list.filter((p) => getEvaluation(p.chatId)?.themeId === themeFilter);
    }
    if (reactionFilter) {
      list = list.filter((p) => getEvaluation(p.chatId)?.reaction === reactionFilter);
    }
    if (askDirectorOnly) {
      list = list.filter((p) => getEvaluation(p.chatId)?.askDirector === true);
    }
    return list;
  }, [fieldProposals, themeFilter, reactionFilter, askDirectorOnly, getEvaluation]);

  // 院長が棚卸先・評価の両方を入れたものだけ「院長から棚卸された仕事」に表示
  const directorTriageListAll = useMemo(() => {
    return Object.entries(directorEntries)
      .filter(([chatId]) => isTriageComplete(chatId))
      .map(([chatId, entry]) => {
        const sp = getSentProposal(chatId) ?? getSentProposalFromContext(chatId);
        return {
          chatId,
          reaction: entry.reaction as DirectorReaction,
          assignedTo: entry.assignedTo,
          memo: entry.memo ?? "",
          title: sp?.title ?? "（提案）",
          body: sp?.body ?? "",
          sentAt: sp?.sentAt ?? "",
        };
      });
  }, [directorEntries, isTriageComplete, getSentProposalFromContext]);

  const directorTriageList = useMemo(() => {
    if (!assignedToFilter) return directorTriageListAll;
    return directorTriageListAll.filter((item) => item.assignedTo === assignedToFilter);
  }, [directorTriageListAll, assignedToFilter]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Briefcase className="h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            経営企画室（企画管理室）
          </h2>
          <p className="text-sm text-muted-foreground">
            現場からの提案をいったん受け、病院経営課題のテーマで分類し、いいね／悪くない／う〜んで評価します。評価結果が院長に伝わり、優先度・良い課題として院長に届きます。わからないことは院長に聞くフラグを付けられます。
          </p>
        </div>
        <ClinicalTooltip content="提案はまず企画管理室に上がり、テーマ分類と3段階評価を付けてから院長へ。後から検証用にテーマ・評価で絞り込みできます。">
          <span className="cursor-help text-sm text-muted-foreground">?</span>
        </ClinicalTooltip>
      </div>

      {/* 現場からの提案 */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">現場からの提案</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          病院経営課題のテーマで分類し、いいね／悪くない／う〜んの3段階で評価してください。評価した内容が院長に優先度・良い課題として伝わります。わからない場合は「院長に聞く」を付けておけます。
        </p>

        {/* 検証用：テーマ・評価で絞り込み */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">検証用：</span>
          <select
            value={themeFilter}
            onChange={(e) => setThemeFilter((e.target.value || "") as PlanningThemeId | "")}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            <option value="">テーマ：すべて</option>
            {PLANNING_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={reactionFilter}
            onChange={(e) => setReactionFilter((e.target.value || "") as PlanningReaction | "")}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            <option value="">評価：すべて</option>
            <option value="liked">いいね！</option>
            <option value="not_bad">悪くない</option>
            <option value="hmm">う〜ん</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={askDirectorOnly}
              onChange={(e) => setAskDirectorOnly(e.target.checked)}
              className="rounded border-input"
            />
            院長に聞く のみ
          </label>
          {(themeFilter || reactionFilter || askDirectorOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setThemeFilter("");
                setReactionFilter("");
                setAskDirectorOnly(false);
              }}
            >
              クリア
            </Button>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-card shadow-sm">
          {filteredFieldProposals.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              {themeFilter || reactionFilter || askDirectorOnly
                ? "該当する提案はありません。"
                : "現在、現場からの提案はありません。"}
            </div>
          ) : (
            filteredFieldProposals.map((item) => {
              const chat = getChatById(item.chatId);
              const messages = getChatMessages(item.chatId);
              const open = expandedFieldId === item.key;
              const ev = getEvaluation(item.chatId);
              return (
                <div
                  key={item.key}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{item.title}</p>
                        {ev && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {PLANNING_THEMES.find((t) => t.id === ev.themeId)?.label ?? ev.themeId}
                          </span>
                        )}
                        {ev?.askDirector && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                            <HelpCircle className="h-3 w-3" />
                            院長に聞く
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.from} ／ {item.date}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedFieldId(open ? null : item.key)}
                      className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                    >
                      {open ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          閉じる
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          閲覧
                        </>
                      )}
                    </button>
                  </div>

                  {/* テーマ・評価・院長に聞く（カード内に常時表示） */}
                  <div className="border-t border-border bg-muted/20 px-6 py-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          病院経営課題テーマ：
                        </span>
                        <select
                          value={ev?.themeId ?? ""}
                          onChange={(e) => {
                            const themeId = (e.target.value || "other") as PlanningThemeId;
                            setEvaluation(item.chatId, {
                              themeId,
                              reaction: ev?.reaction ?? "hmm",
                              askDirector: ev?.askDirector ?? false,
                            });
                          }}
                          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                        >
                          <option value="">未設定</option>
                          {PLANNING_THEMES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">評価：</span>
                        {(["liked", "not_bad", "hmm"] as const).map((r) => (
                          <Button
                            key={r}
                            size="sm"
                            variant={ev?.reaction === r ? "default" : "outline"}
                            className="gap-1"
                            onClick={() =>
                              setEvaluation(item.chatId, {
                                themeId: ev?.themeId ?? "other",
                                reaction: ev?.reaction === r ? "hmm" : r,
                                askDirector: ev?.askDirector ?? false,
                              })
                            }
                          >
                            {r === "liked" && <ThumbsUp className="h-3.5 w-3.5" />}
                            {r === "not_bad" && <Minus className="h-3.5 w-3.5" />}
                            {r === "hmm" && <ThumbsDown className="h-3.5 w-3.5" />}
                            {REACTION_LABELS[r]}
                          </Button>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={ev?.askDirector ?? false}
                          onChange={(e) =>
                            setEvaluation(item.chatId, {
                              themeId: ev?.themeId ?? "other",
                              reaction: ev?.reaction ?? "hmm",
                              askDirector: e.target.checked,
                            })
                          }
                          className="rounded border-input"
                        />
                        <span className="text-muted-foreground">院長に聞く</span>
                      </label>
                    </div>
                  </div>

                  {open && (
                    <div className="border-t border-border bg-muted/20 px-6 py-5 space-y-5">
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                          <MessageSquare className="h-4 w-4" />
                          チャットログ
                          {chat && (
                            <span className="font-normal text-muted-foreground">
                              （{chat.title}）
                            </span>
                          )}
                        </h4>
                        <div className="rounded-lg border border-border bg-background p-3">
                          {messages.length === 0 ? (
                            <p className="text-sm text-muted-foreground">メッセージはありません</p>
                          ) : (
                            <ul className="space-y-2">
                              {messages.map((msg) => (
                                <li
                                  key={msg.id}
                                  className="rounded-md bg-muted/50 px-3 py-2 text-sm"
                                >
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
                          {item.improvements.length > 0 && (
                            <ul className="space-y-1">
                              {item.improvements.map((imp, i) => (
                                <li key={i} className="text-sm">
                                  {imp.title}（ROI: {imp.roi}、リスク: {imp.risk}）
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 院長から棚卸された仕事 */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">院長から棚卸された仕事</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          院長が「いいね！」「悪くない」「う〜ん」で評価し、棚卸先（A〜Eさん）を指定した提案です。棚卸先で絞り込んで確認できます。
        </p>
        {/* 棚卸先でフィルタ（A〜E） */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <span className="text-sm font-medium text-foreground">棚卸先：</span>
          <Button
            variant={assignedToFilter === "" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setAssignedToFilter("")}
          >
            すべて
          </Button>
          {PLANNING_MEMBERS.map((m) => (
            <Button
              key={m.id}
              variant={assignedToFilter === m.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setAssignedToFilter(assignedToFilter === m.id ? "" : m.id)}
            >
              {m.name}
            </Button>
          ))}
        </div>
        <div className="space-y-2 rounded-lg border border-border bg-card shadow-sm">
          {directorTriageList.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              {assignedToFilter
                ? `棚卸先「${PLANNING_MEMBERS.find((m) => m.id === assignedToFilter)?.name ?? assignedToFilter}」に割り当てられた仕事はありません。`
                : "院長から棚卸された仕事はまだありません。"}
            </div>
          ) : (
            directorTriageList.map(({ chatId, reaction, assignedTo, memo, title, body, sentAt }) => {
              const chat = getChatById(chatId);
              const messages = getChatMessages(chatId);
              const open = expandedDirectorId === chatId;
              const ReactionIcon =
                reaction === "liked" ? ThumbsUp : reaction === "not_bad" ? Minus : ThumbsDown;
              const badgeClass =
                reaction === "liked"
                  ? "bg-green-500/15 text-green-700 dark:text-green-400"
                  : reaction === "not_bad"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : "bg-muted text-muted-foreground";
              const assignedName = PLANNING_MEMBERS.find((m) => m.id === assignedTo)?.name ?? assignedTo;
              return (
                <div
                  key={chatId}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0 flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
                      >
                        <ReactionIcon className="h-3.5 w-3.5" />
                        {REACTION_LABELS[reaction]}
                      </span>
                      <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        棚卸先：{assignedName}
                      </span>
                      <p className="font-medium text-foreground">{title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedDirectorId(open ? null : chatId)}
                      className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                    >
                      {open ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          閉じる
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          閲覧
                        </>
                      )}
                    </button>
                  </div>
                  {open && (
                    <div className="border-t border-border bg-muted/20 px-6 py-5 space-y-5">
                      {memo ? (
                        <div className="rounded-lg border border-border bg-background p-3">
                          <h4 className="mb-1.5 text-xs font-medium text-muted-foreground">院長のメモ（意図・詳細）</h4>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{memo}</p>
                        </div>
                      ) : null}
                      {chat && (
                        <p className="text-xs text-muted-foreground">
                          チャット: {chat.title}
                          {sentAt && ` ／ ${formatSentAt(sentAt)}`}
                        </p>
                      )}
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-foreground">チャットログ</h4>
                        <div className="rounded-lg border border-border bg-background p-3">
                          {messages.length === 0 ? (
                            <p className="text-sm text-muted-foreground">メッセージはありません</p>
                          ) : (
                            <ul className="space-y-2">
                              {messages.map((msg) => (
                                <li
                                  key={msg.id}
                                  className="rounded-md bg-muted/50 px-3 py-2 text-sm"
                                >
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
                        <h4 className="mb-2 text-sm font-medium text-foreground">提案内容</h4>
                        <div className="rounded-lg border border-border bg-background p-4">
                          <p className="font-medium text-foreground">{title}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                            {body}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
