/** デモ用に localStorage に保存しているキー。初期値に戻すときに削除する */
export const DEMO_STORAGE_KEYS = [
  "director-reactions",
  "director-liked-chat-ids",
  "planning-evaluations",
  "deleted-unsent-chat-ids",
] as const;

const DEMO_RESET_EVENT = "demo-reset";

/** デモを初期値に戻す：上記キーを削除し、各 Provider にリセットを通知する */
export function resetDemoStorage(): void {
  if (typeof window === "undefined") return;
  DEMO_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent(DEMO_RESET_EVENT));
}

/** リセット通知を購読するためのイベント名（Provider 内で使用） */
export function getDemoResetEventName(): string {
  return DEMO_RESET_EVENT;
}
