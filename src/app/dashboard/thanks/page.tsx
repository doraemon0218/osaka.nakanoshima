"use client";

import { Heart, MessageSquare, FileText } from "lucide-react";
import {
  getChatById,
  getChatMessages,
  getChatParticipantNames,
  getSentProposal,
} from "@/lib/chat-logs-data";
import { useDirectorLiked } from "@/contexts/director-liked";
import { ClinicalTooltip } from "@/components/ui/clinical-tooltip";

/** デモ用：このアプリを使っている「自分」がチャットで使っている名前（あなたのおかげで判定）。設定で変更可能にすることも可。 */
const CURRENT_USER_PARTICIPANT_NAMES = ["田中（企画管理室）"];

function formatSentAt(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export default function ThanksPage() {
  const { likedChatIds } = useDirectorLiked();
  const entries = likedChatIds
    .map((chatId) => {
      const participants = getChatParticipantNames(chatId);
      const isParticipant = participants.some((name) =>
        CURRENT_USER_PARTICIPANT_NAMES.includes(name)
      );
      if (!isParticipant) return null;
      const chat = getChatById(chatId);
      const proposal = getSentProposal(chatId);
      if (!proposal) return null;
      return { chatId, chat, proposal, participants };
    })
    .filter(Boolean) as {
      chatId: string;
      chat: ReturnType<typeof getChatById>;
      proposal: NonNullable<ReturnType<typeof getSentProposal>>;
      participants: string[];
    }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Heart className="h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            あなたのおかげで
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            あなたが参加したチャットの提案が院長にいいね！されました。院長からのお礼の気持ちが届いています。
          </p>
        </div>
        <ClinicalTooltip content="チャットに参加していた方にも、そのチャットから上がった提案が院長に採用されたことが「あなたのおかげで」として表示されます。院長の感謝の気持ちが伝わる仕様です。">
          <span className="cursor-help text-sm text-muted-foreground">?</span>
        </ClinicalTooltip>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          <p>まだ「あなたのおかげで」のログはありません。</p>
          <p className="mt-2 text-xs">
            参加したチャットの提案が院長にいいね！されると、ここに表示されます。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map(({ chatId, chat, proposal, participants }) => {
            const messages = getChatMessages(chatId);
            return (
              <article
                key={chatId}
                className="rounded-lg border border-primary/30 bg-primary/5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-primary/20 px-6 py-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    院長から感謝：このチャットの提案が採用されました
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatSentAt(proposal.sentAt)}
                  </span>
                </div>

                <div className="space-y-5 p-6">
                  <p className="rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    あなたの参加したチャット「{chat?.title}」の提案が、院長にいいね！されました。お疲れさまでした。
                  </p>

                  <section>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <MessageSquare className="h-4 w-4" />
                      チャットログ
                    </h3>
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      {messages.length === 0 ? (
                        <p className="text-sm text-muted-foreground">メッセージはありません</p>
                      ) : (
                        <ul className="space-y-2">
                          {messages.map((msg) => (
                            <li
                              key={msg.id}
                              className="rounded-md bg-background px-3 py-2 text-sm"
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
                  </section>

                  <section>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <FileText className="h-4 w-4" />
                      採用された提案
                    </h3>
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="font-medium text-foreground">{proposal.title}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {proposal.body}
                      </p>
                    </div>
                  </section>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
