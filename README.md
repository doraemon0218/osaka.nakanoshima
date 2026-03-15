# osaka.nakanoshima

## Field Intelligence OS（デモアプリ）

**1人の従業員が使用する**ことを想定したデモアプリです。従業員が意思決定者に提案するための画面を、Next.js + Tailwind CSS + shadcn/ui で構築しています。

### 開発

```bash
npm install
npm run dev
```

- **表示**: ブラウザで **http://localhost:3000/** を開くと、ルート（/）は自動で `/dashboard` にリダイレクトされ、ダッシュボードが表示されます。

### 対話しながら localhost で更新を確認する

コードを変更しながらリアルタイムで確認したい場合は、あらかじめ開発サーバーを起動しておく。

```bash
npm run dev:3001
```

**http://localhost:3001** を開いたままにしておくと、ファイル保存のたびに Next.js が再コンパイルし、ブラウザを再読み込みすると変更が反映される。対話で修正を加える際は、こちらでサーバーを起動するか、手元で上記コマンドを実行しておくこと。
- **EMFILE エラーが出た場合**: 一度サーバーを停止（ターミナルで `Ctrl+C`）し、再度 `npm run dev` を実行してください。

### 「This page isn't working」/ localhost が表示されない場合

**手順（ターミナルで必ず実行）**

1. **既存の Node サーバーを止める**  
   別ターミナルで動いている `npm run dev` や `npm run start` があれば、そのターミナルで `Ctrl+C` を押して終了する。

2. **プロジェクトフォルダで開発サーバーを起動**
   ```bash
   cd /Users/aiyamayuuki/osaka.nakanoshima
   npm run dev:3002
   ```
   （3001 が使われている場合は上記の 3002 を使用。表示された **Local: http://127.0.0.1:3002** のポート番号をメモする。）

3. **ブラウザで開く**  
   表示された URL をそのまま開く。例:
   - **http://localhost:3002**
   - または **http://127.0.0.1:3002**

**本番ビルドで試す場合**

```bash
cd /Users/aiyamayuuki/osaka.nakanoshima
npm run build
npm run start
```

その後、**http://localhost:3000** を開く。

### 技術スタック

- **Next.js 15** (App Router)
- **Tailwind CSS**
- **shadcn/ui**（Button 等）
- **カラーテーマ**: 医療的な信頼感のある深みのあるブルー、清潔感のある白・グレー