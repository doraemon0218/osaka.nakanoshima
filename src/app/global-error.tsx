"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <h1>エラーが発生しました</h1>
          <p style={{ color: "#666", margin: "1rem 0" }}>{error.message}</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1rem",
              marginRight: "0.5rem",
              cursor: "pointer",
            }}
          >
            再試行
          </button>
          <a href="/" style={{ padding: "0.5rem 1rem" }}>
            トップへ
          </a>
        </div>
      </body>
    </html>
  );
}
