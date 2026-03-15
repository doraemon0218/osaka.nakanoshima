# osaka.nakanoshima

## Field Intelligence OS（デモアプリ）

Next.js + Tailwind CSS + shadcn/ui で構築したダッシュボード型デモアプリです。

### 開発

```bash
npm install
npm run dev
```

- **表示**: ブラウザで **http://localhost:3000/** を開くと、ルート（/）は自動で `/dashboard` にリダイレクトされ、ダッシュボードのモックが表示されます。
- **EMFILE エラーが出た場合**: 一度サーバーを停止（ターミナルで `Ctrl+C`）し、再度 `npm run dev` を実行してください。`node_modules` は `.gitignore` および `.cursorignore` に含まれており、エディタ・OS の監視対象から外れるよう調整済みです。

### 技術スタック

- **Next.js 15** (App Router)
- **Tailwind CSS**
- **shadcn/ui**（Button 等）
- **カラーテーマ**: 医療的な信頼感のある深みのあるブルー、清潔感のある白・グレー