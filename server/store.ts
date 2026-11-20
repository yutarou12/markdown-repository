import fs from 'node:fs';
import path from 'node:path';
export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  favorite: boolean;
}
export interface StoreData {
  documents: DocumentRecord[];
  counters: Record<string, number>;
}
// カウンターを文書と一緒に保存し、削除後も同じIDを再利用しない。
export function nextId(data: StoreData, date: string): string {
  const month = date.slice(0, 7).replace('-', '');
  const sequence = (data.counters[month] ?? 0) + 1;
  if (sequence > 999) throw new Error('この月の登録上限（999件）に達しました。');
  data.counters[month] = sequence;
  return `${month}${String(sequence).padStart(3, '0')}`;
}
export function createStore(
  directory: string,
  initialDocuments: Omit<DocumentRecord, 'id'>[] = [],
) {
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, 'documents.json');
  const data: StoreData = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : { documents: [], counters: {} };
  if (!fs.existsSync(file)) {
    data.documents = initialDocuments.map((document) => ({
      ...document,
      id: nextId(data, document.createdAt),
    }));
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }
  return {
    data,
    save() {
      // 一時ファイルからの置換で、書き込み途中のファイルが読み込まれるのを防ぐ。
      fs.writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2));
      fs.renameSync(`${file}.tmp`, file);
    },
  };
}
