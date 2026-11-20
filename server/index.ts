import express from 'express';
import { initialGuides } from './guides.js';
import path from 'node:path';
import { createStore, nextId } from './store.js';
const app = express();
const store = createStore(process.env.DATA_DIR ?? './data', initialGuides);
app.use(express.json({ limit: '3mb' }));
app.get('/api/documents', (_request, response) => response.json(store.data.documents));
app.post('/api/documents', (request, response) => {
  const { title, content, tags, createdAt } = request.body;
  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.length > 200 ||
    typeof content !== 'string' ||
    !content.trim() ||
    content.length > 2_000_000 ||
    !Array.isArray(tags) ||
    tags.length > 20 ||
    tags.some((tag: unknown) => typeof tag !== 'string' || tag.length > 40) ||
    typeof createdAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(createdAt) ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    response.status(400).json({ error: 'タイトル・Markdown・登録日時・タグを確認してください。' });
    return;
  }
  try {
    const document = {
      id: nextId(store.data, createdAt),
      title: title.trim(),
      content,
      tags: [...new Set<string>(tags.map((tag: string) => tag.trim()).filter(Boolean))],
      createdAt,
      favorite: false,
    };
    store.data.documents.unshift(document);
    store.save();
    response.status(201).json(document);
  } catch (error) {
    response.status(400).json({ error: (error as Error).message });
  }
});
app.patch('/api/documents/:id', (request, response) => {
  const document = store.data.documents.find((item) => item.id === request.params.id);
  if (!document) {
    response.status(404).json({ error: '文書が見つかりません。' });
    return;
  }
  if (typeof request.body.favorite !== 'boolean') {
    response.status(400).json({ error: '不正な値です。' });
    return;
  }
  document.favorite = request.body.favorite;
  store.save();
  response.json(document);
});
app.delete('/api/documents/:id', (request, response) => {
  store.data.documents = store.data.documents.filter((item) => item.id !== request.params.id);
  store.save();
  response.sendStatus(204);
});
app.use(express.static(path.resolve('dist')));
app.get('/{*path}', (_request, response) => response.sendFile(path.resolve('dist/index.html')));
app.use(
  (
    error: Error,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    response
      .status(500)
      .json({ error: '処理に失敗しました。入力内容と保存先を確認してください。' });
    console.error(error.message);
  },
);
app.listen(Number(process.env.API_PORT ?? 3001), '0.0.0.0', () =>
  console.log('MarkShelf server is ready.'),
);
