import type { DocumentRecord } from './store.js';
// 初回のみ、使い方のガイドを通常の文書として登録する。不要なら画面から削除できる。
const guides = [
  {
    title: 'MarkShelfへようこそ',
    tags: ['はじめに', 'ガイド'],
    favorite: true,
    content:
      '# MarkShelfへようこそ\n\n思いついたアイデアも、日々の開発メモも。Markdownをひとつの場所にまとめましょう。\n\n## はじめに\n\n1. 「Markdownを登録」をクリックします。\n2. ファイルを選ぶか、本文を直接入力します。\n3. タイトル・登録日時・タグを設定して保存します。\n\n## あなた専用のライブラリ\n\n文書はサーバー上に保存されます。Docker Composeの永続ボリュームにより、コンテナを再起動してもデータは保持されます。\n\n> ここに並ぶ6件は最初から付属するガイドです。不要になったら文書を開いて削除できます。',
  },
  {
    title: 'Markdownの基本的な書き方',
    tags: ['Markdown', 'ガイド'],
    favorite: false,
    content:
      '# Markdownの基本的な書き方\n\n見出し、リスト、リンクなど。よく使うMarkdownの記法をまとめました。\n\n## 見出し\n\n行頭に `#` を付けると見出しになります。数を増やすと、小さい見出しになります。\n\n## テキストの装飾\n\n**太字で強調**、*斜体*、~~取り消し線~~ を利用できます。\n\n## リスト\n\n- メモを記録する\n- タグで分類する\n- お気に入りに追加する\n\n## タスクリスト\n\n- [x] Markdownを読み込む\n- [ ] 自分のドキュメントを登録する\n\n## 引用\n\n> 小さなメモが、大きなアイデアにつながります。',
  },
  {
    title: 'コードブロックとテーブルの活用',
    tags: ['Markdown', '開発'],
    favorite: false,
    content:
      '# コードブロックとテーブルの活用\n\nコードの断片や情報の比較を、読みやすいドキュメントにまとめる方法。\n\n## コードブロック\n\nバッククォートを3つ並べてコードを囲みます。\n\n```typescript\ninterface Note {\n  title: string;\n  tags: string[];\n}\n\nconst note: Note = {\n  title: "今日のアイデア",\n  tags: ["メモ"],\n};\n```\n\n## テーブル\n\n| 機能 | 用途 |\n| --- | --- |\n| ライブラリ | 文書を保存・検索 |\n| お気に入り | よく使う文書へアクセス |\n| ビューアー | 保存せず内容を確認 |\n\nコード表示に切り替えると、元のMarkdownをそのまま確認できます。',
  },
  {
    title: 'タグでナレッジを整理する',
    tags: ['使い方', '整理術'],
    favorite: true,
    content:
      '# タグでナレッジを整理する\n\n文書が増えても、欲しい情報を見つけやすく。自分に合ったタグを使いましょう。\n\n## タグを付ける\n\n登録フォームのタグ欄に、カンマ区切りで入力します。\n\n```text\n開発, React, メモ\n```\n\n## 絞り込みの方法\n\n- 左側のタグ一覧をクリックする\n- 検索欄の隣のタグ選択を使う\n- ドキュメントのタグをクリックする\n\n## おすすめの整理方法\n\n「プロジェクト名」「技術」「用途」など、複数の観点を組み合わせると便利です。\n\n> タイトルだけでなく、本文・ID・タグからも検索できます。',
  },
  {
    title: 'Markdownビューアーの使い方',
    tags: ['使い方', 'ガイド'],
    favorite: false,
    content:
      '# Markdownビューアーの使い方\n\nダウンロードしたMarkdownファイルを、保存せずにすばやく確認できます。\n\n## ファイルを開く\n\n1. 左側の「Markdownビューアー」を選択します。\n2. ファイルをドラッグ＆ドロップするか、「ファイルを選択」を押します。\n3. 見出しやリストに変換された内容を確認します。\n\n## 表示を切り替える\n\n「デザイン」と「コード」を切り替えて、表示と元のテキストを比較できます。「全体をコピー」からMarkdownをコピーできます。\n\n## 対応ファイル\n\n`.md`、`.markdown`、`.txt` に対応しています。ファイルサイズの上限は2MBです。\n\n> ビューアーで開いたファイルはライブラリには自動保存されません。保存には「Markdownを登録」を利用してください。',
  },
  {
    title: 'ローカル環境の運用メモ',
    tags: ['開発', 'メモ'],
    favorite: false,
    content:
      '# ローカル環境の運用メモ\n\nDocker Composeで起動する方法と、大切な文書を保存するためのメモ。\n\n## 起動\n\n```bash\ncp .env.example .env\ndocker compose up -d --build\n```\n\n## ポート設定\n\n`.env` の `APP_PORT` を変更してホスト側のポートを指定します。初期値は8080です。\n\n## データの保存\n\nデータは `markshelf-data` ボリューム内の `documents.json` に保存されます。定期的にバックアップしてください。\n\n## VPN経由のアクセス\n\n初期設定ではループバックアドレスだけにバインドします。VPNから接続する場合は、`.env` の `BIND_ADDRESS` をホストのVPNインターフェースのIPアドレスに変更してください。\n\n> このアプリには認証機能がありません。VPNやホストのファイアウォールでアクセスを制限して利用してください。',
  },
];
export const initialGuides: Omit<DocumentRecord, 'id'>[] = guides.map((guide, index) => {
  const date = new Date();
  date.setDate(date.getDate() - index);
  date.setHours(10, 0, 0, 0);
  return {
    ...guide,
    createdAt: new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16),
  };
});
