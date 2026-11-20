# MarkShelf — Markdown Repository

個人用Markdownライブラリ。TypeScript / React / MUI / MUI Icons と Express で構成した、ローカル・VPN利用向けのアプリです。

## Docker Composeで起動

Node.jsのインストールは不要です。DockerとDocker Composeを用意してください。

```bash
cp .env.example .env
docker compose up -d --build
```

ブラウザーで http://localhost:8080 を開きます。`.env` の `APP_PORT` を変更すると、ホスト側のポートを変更できます。変更後は `docker compose up -d` を実行してください。

初期状態では `127.0.0.1` のみにバインドします。構築済みVPNから使う場合は `BIND_ADDRESS` にホストのVPNインターフェースのIPアドレスを設定し、`http://VPNのIP:APP_PORT` で開きます。認証機能は実装していないため、VPNとファイアウォールでアクセスを制限してください。

## 機能

- `.md` / `.markdown` / `.txt` アップロード、ドラッグ＆ドロップ、本文の直接入力（最大2MB）
- タイトル・登録日時・タグ（カンマ区切り）の入力
- `YYYYMM001` 形式の自動採番（月ごとに連番、上限999件、削除後も再利用なし）
- 見出し、リスト、表、タスクリスト、コードブロックなどのGFMプレビュー
- デザイン／コード表示、全体コピー、Markdownダウンロード
- 本文・タイトル・タグ・ID検索、タグ絞り込み、並べ替え、6件ずつのページング
- グリッド／リスト表示、お気に入り、削除確認
- 保存せずに使える独立したMarkdownビューアー
- レスポンシブ表示、端末ごとに設定を保持するダークテーマ

初回起動時には6件の使い方ガイドを登録します。通常の文書と同じように削除できます。すべて削除しても再生成されません。

登録日時は利用者のローカル時刻として扱い、その年月でIDを発行します。表示は各端末のローカル日付になります。生HTMLは実行しません。Markdown内の外部画像・リンクを開くときは、その参照先への接続が発生します。

## データ保存とバックアップ

データは名前付きボリューム `markshelf-data` 内の `/app/data/documents.json` に保存されます。コンテナの再作成や通常の `docker compose down` で文書は消えません。`docker compose down -v` は保存データも削除するため使用に注意してください。

バックアップ前に登録操作を止めてから、次を実行します。

```bash
docker compose cp markshelf:/app/data/documents.json ./documents.backup.json
```

復元する場合は利用者の操作を止めたうえでファイルをコンテナにコピーし、再起動します。

```bash
docker compose cp ./documents.backup.json markshelf:/app/data/documents.json
docker compose exec -u root markshelf chown node:node /app/data/documents.json
docker compose restart markshelf
```

このJSONストアは1プロセスでの個人利用を前提とします。複数レプリカでは実行しないでください。初期ガイド以外にクラウド同期や外部保存はありません。Google Fontsを取得できない場合もシステムフォントで動作します。

## 開発

Node.js 24以降を推奨します。

```bash
npm ci
npm run dev
```

画面: http://localhost:5173 / 開発API: http://localhost:3001 。Viteから `/api` を開発APIにプロキシします。本番ではExpressがビルド結果とAPIを同じポートで配信します。`API_PORT`（初期値3001）と `DATA_DIR`（初期値 `./data`）をサーバー環境変数で指定できます。開発APIのポートを変える場合は `vite.config.ts` のプロキシ先も変更してください。

```bash
npm run build
npm test
npm start
```

採用した書き方と設計方針は [CODING_STANDARDS.md](./CODING_STANDARDS.md) にまとめています。
