import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

// フェンスで指定された言語だけを色分けし、言語未指定のメモはそのまま表示する。
export default function MarkdownPreview({ text }: { text: string }) {
  return (
    <article className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {text}
      </ReactMarkdown>
    </article>
  );
}
