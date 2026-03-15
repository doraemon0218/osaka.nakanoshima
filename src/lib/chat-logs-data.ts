export type SentStatus = "unsent" | "sent";

export type ChatLogItem = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  sentStatus: SentStatus;
  unread: number;
};

export type SentProposal = {
  title: string;
  body: string;
  sentAt: string;
  improvements: { title: string; roi: string; risk: string }[];
};

export type ChatMessage = {
  id: string;
  user: string;
  time: string;
  text: string;
};

const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  "1": [
    { id: "m1", user: "佐藤（企画管理室）", time: "09:45", text: "進捗管理の棚卸し完了。遅れているタスクは2件。優先度の見直しが必要そうです。" },
    { id: "m2", user: "山田（リーダー）", time: "09:50", text: "了解。優先度の基準を一度整理しよう。" },
  ],
  "2": [
    { id: "m1", user: "田中（企画管理室）", time: "10:00", text: "意思決定者への報告資料、明日午前中に共有します。" },
    { id: "m2", user: "山田（リーダー）", time: "10:05", text: "承知。了承取りまとめは佐藤さんにお願い。" },
  ],
  "3": [
    { id: "m1", user: "山田（企画管理室 リーダー）", time: "14:00", text: "了承取りまとめは佐藤さんにお願い。" },
    { id: "m2", user: "佐藤（企画管理室）", time: "14:15", text: "承知しました。" },
  ],
  "4": [
    { id: "m1", user: "田中（企画管理室）", time: "09:12", text: "今期の予算案、各部門からヒアリング済みです。調整会議の日程出しましょうか。" },
    { id: "m2", user: "山田（企画管理室 リーダー）", time: "09:15", text: "了解。来週火曜で取りまとめ。ROIの試算も添付しておいて。" },
  ],
  "5": [
    { id: "m1", user: "田中（企画管理室）", time: "12:00", text: "ROIの試算を添付しました。ご確認ください。" },
    { id: "m2", user: "山田（リーダー）", time: "12:10", text: "確認しました。問題なし。" },
  ],
  "6": [
    { id: "m1", user: "佐藤（企画管理室）", time: "11:00", text: "今月の進捗まとめを送信しました。" },
    { id: "m2", user: "山田（リーダー）", time: "11:30", text: "ありがとう。院長報告に使う。" },
  ],
};

const SENT_PROPOSALS: Record<string, SentProposal> = {
  "4": {
    title: "予算・報告の取りまとめフローの明文化",
    body: "各部門ヒアリング結果を踏まえ、調整会議のアウトプットを標準化する提案です。",
    sentAt: "2025-03-15T14:32:00",
    improvements: [
      { title: "予算・報告の取りまとめフローの明文化", roi: "約 12% の工数削減見込み", risk: "低" },
    ],
  },
  "5": {
    title: "改善案共有（ROI試算）",
    body: "ROI試算に基づく改善案を共有し、院長のご判断を仰ぎます。",
    sentAt: "2025-03-14T12:00:00",
    improvements: [
      { title: "ヒアリング〜意思決定者報告までのリードタイム短縮", roi: "平均 2.5日 短縮見込み", risk: "中" },
    ],
  },
  "6": {
    title: "月次振り返りに基づく進捗報告",
    body: "今月の進捗まとめを院長に報告するための提案です。",
    sentAt: "2025-03-10T11:00:00",
    improvements: [
      { title: "進捗・了承状況の窓口一元化", roi: "確認工数 約 20% 削減", risk: "低" },
    ],
  },
};

export const DUMMY_CHAT_LOGS: ChatLogItem[] = [
  { id: "1", title: "企画管理室 進捗棚卸し", lastMessage: "佐藤（企画管理室）: 遅れているタスクは2件。", updatedAt: "2025-03-15T10:30:00", sentStatus: "unsent", unread: 2 },
  { id: "2", title: "企画管理室 週次報告", lastMessage: "田中（企画管理室）: 意思決定者への報告資料、明日午前中に共有します。", updatedAt: "2025-03-15T09:15:00", sentStatus: "unsent", unread: 0 },
  { id: "3", title: "企画管理室 了承取りまとめ", lastMessage: "山田（企画管理室 リーダー）: 了承取りまとめは佐藤さんにお願い。", updatedAt: "2025-03-14T16:00:00", sentStatus: "unsent", unread: 1 },
  { id: "4", title: "企画管理室 予算取りまとめ", lastMessage: "山田（企画管理室 リーダー）: 来週火曜で取りまとめ。", updatedAt: "2025-03-15T14:32:00", sentStatus: "sent", unread: 0 },
  { id: "5", title: "企画管理室 改善案共有", lastMessage: "ROIの試算を添付しました。ご確認ください。", updatedAt: "2025-03-14T12:00:00", sentStatus: "sent", unread: 0 },
  { id: "6", title: "企画管理室 月次振り返り", lastMessage: "今月の進捗まとめを送信しました。", updatedAt: "2025-03-10T11:00:00", sentStatus: "sent", unread: 0 },
];

export function getChatById(id: string): ChatLogItem | undefined {
  return DUMMY_CHAT_LOGS.find((c) => c.id === id);
}

export function getChatMessages(id: string): ChatMessage[] {
  return CHAT_MESSAGES[id] ?? [];
}

/** チャットに参加しているメンバー名の一覧（あなたのおかげで判定用） */
export function getChatParticipantNames(chatId: string): string[] {
  const messages = CHAT_MESSAGES[chatId] ?? [];
  return Array.from(new Set(messages.map((m) => m.user)));
}

export function getSentProposal(id: string): SentProposal | undefined {
  return SENT_PROPOSALS[id];
}

/** このユーザーが提案した内容のうち、院長がいいね！を押したもの（レポート用） */
export type DirectorLikedReport = {
  chatId: string;
  title: string;
  body: string;
  sentAt: string;
  improvements: SentProposal["improvements"];
};

export const DIRECTOR_LIKED_REPORTS: DirectorLikedReport[] = [
  {
    chatId: "4",
    title: "予算・報告の取りまとめフローの明文化",
    body: "各部門ヒアリング結果を踏まえ、調整会議のアウトプットを標準化する提案です。",
    sentAt: "2025-03-15T14:32:00",
    improvements: [
      { title: "予算・報告の取りまとめフローの明文化", roi: "約 12% の工数削減見込み", risk: "低" },
    ],
  },
  {
    chatId: "5",
    title: "改善案共有（ROI試算）",
    body: "ROI試算に基づく改善案を共有し、院長のご判断を仰ぎます。",
    sentAt: "2025-03-14T12:00:00",
    improvements: [
      { title: "ヒアリング〜意思決定者報告までのリードタイム短縮", roi: "平均 2.5日 短縮見込み", risk: "中" },
    ],
  },
];
