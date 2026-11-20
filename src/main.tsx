import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  Pagination,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
} from '@mui/material';
import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import GridViewRounded from '@mui/icons-material/GridViewRounded';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import StarBorderRounded from '@mui/icons-material/StarBorderRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import CodeRounded from '@mui/icons-material/CodeRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import ViewListRounded from '@mui/icons-material/ViewListRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import EastRounded from '@mui/icons-material/EastRounded';
import FolderOpenRounded from '@mui/icons-material/FolderOpenRounded';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { DocumentRecord } from '../server/store';
import './styles.css';

type Page = 'library' | 'favorites' | 'viewer';
const tagColors = ['blue', 'green', 'purple', 'orange'];
const localDate = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(value),
  );
function excerpt(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*>`\[\]_|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 96);
}
// APIの失敗を画面に伝え、保存できていない文書を成功扱いしない。
async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? 'サーバーに接続できませんでした。');
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('markshelf-theme') === 'dark');
  const [page, setPage] = useState<Page>('library');
  const [mobile, setMobile] = useState(false);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('new');
  const [layout, setLayout] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [date, setDate] = useState(localDate());
  const [filename, setFilename] = useState('');
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<DocumentRecord | null>(null);
  const [code, setCode] = useState(false);
  const [viewer, setViewer] = useState('');
  const [viewerName, setViewerName] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const viewerInput = useRef<HTMLInputElement>(null);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: dark ? 'dark' : 'light',
          // MUIは色の濃淡を計算するため、公式トークンに対応するHEX値を渡す。
          primary: {
            main: dark ? '#c5d7fb' : '#0017c1',
            contrastText: dark ? '#1a1a1a' : '#ffffff',
          },
          text: { primary: dark ? '#ffffff' : '#1a1a1a', secondary: dark ? '#e6e6e6' : '#4d4d4d' },
          error: { main: dark ? '#ffbbbb' : '#ce0000' },
          success: { main: dark ? '#9bd4b5' : '#115a36' },
          background: {
            default: dark ? '#1a1a1a' : '#f2f2f2',
            paper: dark ? '#333333' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"DM Sans", "Noto Sans JP", sans-serif',
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: { borderRadius: 8 },
        components: {
          MuiButton: { defaultProps: { disableElevation: true } },
          MuiInputBase: {
            styleOverrides: { input: { '&::placeholder': { color: 'var(--muted)', opacity: 1 } } },
          },
          MuiOutlinedInput: {
            styleOverrides: { notchedOutline: { borderColor: 'var(--control-border)' } },
          },
          MuiTextField: { defaultProps: { size: 'small' } },
        },
      }),
    [dark],
  );
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('markshelf-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    api<DocumentRecord[]>('/api/documents')
      .then(setDocuments)
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);
  const allTags = useMemo(
    () => [...new Set(documents.flatMap((item) => item.tags))].sort(),
    [documents],
  );
  const filtered = useMemo(
    () =>
      documents
        .filter(
          (item) =>
            (page !== 'favorites' || item.favorite) &&
            (!tag || item.tags.includes(tag)) &&
            `${item.title} ${item.content} ${item.id} ${item.tags.join(' ')}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'title'
            ? a.title.localeCompare(b.title, 'ja')
            : sort === 'old'
              ? a.createdAt.localeCompare(b.createdAt)
              : b.createdAt.localeCompare(a.createdAt),
        ),
    [documents, page, tag, query, sort],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 6));
  useEffect(() => {
    setCurrentPage(1);
  }, [query, tag, page, sort]);
  useEffect(() => {
    setCurrentPage((value) => Math.min(value, pageCount));
  }, [pageCount]);
  const navigate = (destination: Page) => {
    setPage(destination);
    setSelected(null);
    setMobile(false);
    setTag('');
    setQuery('');
    setCode(false);
  };
  const openUpload = () => {
    setTitle('');
    setContent('');
    setTagsInput('');
    setFilename('');
    setDate(localDate());
    setUploadOpen(true);
  };
  async function readFile(file: File | undefined, preview = false) {
    if (!file) return;
    if (!/\.(md|markdown|txt)$/i.test(file.name)) {
      setError('Markdownファイル（.md / .markdown / .txt）を選択してください。');
      return;
    }
    if (file.size > 2_000_000) {
      setError('ファイルサイズは2MB以下にしてください。');
      return;
    }
    try {
      const text = await file.text();
      if (preview) {
        setViewer(text);
        setViewerName(file.name);
      } else {
        setContent(text);
        setFilename(file.name);
        setTitle(text.match(/^#\s+(.+)$/m)?.[1] ?? file.name.replace(/\.[^.]+$/, ''));
      }
    } catch {
      setError('ファイルを読み込めませんでした。');
    }
  }
  async function save() {
    setSaving(true);
    try {
      const record = await api<DocumentRecord>('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags: tagsInput
            .split(/[,、]/)
            .map((value) => value.trim())
            .filter(Boolean),
          createdAt: date,
        }),
      });
      setDocuments((items) => [record, ...items]);
      setUploadOpen(false);
      navigate('library');
      setNotice('Markdownを登録しました。');
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }
  async function favorite(item: DocumentRecord) {
    try {
      const updated = await api<DocumentRecord>(`/api/documents/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !item.favorite }),
      });
      setDocuments((items) => items.map((doc) => (doc.id === item.id ? updated : doc)));
      if (selected?.id === item.id) setSelected(updated);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }
  async function copy(text: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // VPN経由のHTTPではClipboard APIが無効になるため、選択コピーにフォールバックする。
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.append(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Copy failed');
      }
      setNotice('Markdown全体をコピーしました。');
    } catch {
      setError('コピーできませんでした。コード表示から選択してコピーしてください。');
    }
  }
  function download(text: string, name: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${name.replace(/[\\/:*?"<>|]/g, '_').replace(/\.(md|markdown)$/i, '')}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  async function remove() {
    if (!selected) return;
    try {
      await api(`/api/documents/${selected.id}`, { method: 'DELETE' });
      setDocuments((items) => items.filter((item) => item.id !== selected.id));
      setSelected(null);
      setDeleteOpen(false);
      setNotice('文書を削除しました。');
    } catch (reason) {
      setError((reason as Error).message);
    }
  }
  const renderMarkdown = (text: string) =>
    code ? (
      <pre className="source-code">{text}</pre>
    ) : (
      <article className="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </article>
    );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-shell">
        {mobile && <div className="sidebar-backdrop" onClick={() => setMobile(false)} />}
        <aside className={`sidebar ${mobile ? 'is-open' : ''}`}>
          <a
            className="brand"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              navigate('library');
            }}
          >
            <span className="brand-icon">
              <AutoStoriesRounded />
            </span>
            <span>
              MarkShelf<span className="brand-caption">MARKDOWN REPOSITORY</span>
            </span>
          </a>
          <div className="workspace-label">PERSONAL WORKSPACE</div>
          <nav>
            <button
              className={`nav-item ${page === 'library' ? 'active' : ''}`}
              onClick={() => navigate('library')}
            >
              <GridViewRounded />
              ライブラリ<span className="nav-count">{documents.length}</span>
            </button>
            <button
              className={`nav-item ${page === 'favorites' ? 'active' : ''}`}
              onClick={() => navigate('favorites')}
            >
              <StarBorderRounded />
              お気に入り
              <span className="nav-count">{documents.filter((item) => item.favorite).length}</span>
            </button>
            <button
              className={`nav-item ${page === 'viewer' ? 'active' : ''}`}
              onClick={() => navigate('viewer')}
            >
              <VisibilityOutlined />
              Markdownビューアー
            </button>
          </nav>
          <div className="sidebar-section-title">
            タグ <LocalOfferOutlined fontSize="small" />
          </div>
          <div className="sidebar-tags">
            {allTags.length ? (
              allTags.map((value, index) => (
                <button
                  className={tag === value ? 'selected-tag' : ''}
                  key={value}
                  onClick={() => {
                    setPage('library');
                    setSelected(null);
                    setTag(tag === value ? '' : value);
                    setCurrentPage(1);
                  }}
                >
                  <i className={`tag-dot ${tagColors[index % 4]}`} />
                  <span>{value}</span>
                  <small>{documents.filter((item) => item.tags.includes(value)).length}</small>
                </button>
              ))
            ) : (
              <span className="muted small">登録したタグが表示されます</span>
            )}
          </div>
          <div className="sidebar-bottom">
            <div className="private-status">
              <span className="status-dot" />
              プライベートライブラリ
            </div>
            <p>あなたのナレッジを、あなたの場所に。</p>
            <button className="theme-button" onClick={() => setDark(!dark)}>
              {dark ? <LightModeOutlined /> : <DarkModeOutlined />}
              {dark ? 'ライトモード' : 'ダークモード'}
              <span className={`switch ${dark ? 'on' : ''}`}>
                <i />
              </span>
            </button>
          </div>
        </aside>
        <main className="main">
          <header className="topbar">
            <div className="breadcrumb">
              <IconButton
                className="mobile-menu"
                aria-label="メニューを開く"
                onClick={() => setMobile(true)}
              >
                <MenuRounded />
              </IconButton>
              <span>ワークスペース</span>
              <ChevronRightRounded />
              <strong>
                {page === 'viewer'
                  ? 'Markdownビューアー'
                  : page === 'favorites'
                    ? 'お気に入り'
                    : 'ライブラリ'}
              </strong>
            </div>
            <div className="topbar-right">
              <span className="local-badge">
                <span className="status-dot" />
                ローカル環境
              </span>
              <div className="avatar">M</div>
            </div>
          </header>
          <div className="page-content">
            {selected ? (
              <>
                <button className="back-link" onClick={() => setSelected(null)}>
                  <ArrowBackRounded fontSize="small" />
                  ライブラリに戻る
                </button>
                <div className="detail-heading">
                  <div>
                    <span className="eyebrow">DOCUMENT / {selected.id}</span>
                    <h1>{selected.title}</h1>
                    <div className="detail-meta">
                      登録日 {formatDate(selected.createdAt)} <span>·</span>{' '}
                      {selected.tags.map((value) => (
                        <Chip key={value} size="small" label={value} />
                      ))}
                    </div>
                  </div>
                  <Tooltip title="お気に入り">
                    <IconButton onClick={() => favorite(selected)}>
                      {selected.favorite ? <StarRounded className="gold" /> : <StarBorderRounded />}
                    </IconButton>
                  </Tooltip>
                </div>
                <div className="document-panel">
                  <div className="document-toolbar">
                    <ToggleButtonGroup
                      exclusive
                      value={code ? 'code' : 'preview'}
                      size="small"
                      onChange={(_, value) => value && setCode(value === 'code')}
                    >
                      <ToggleButton value="preview">
                        <VisibilityOutlined fontSize="small" />
                        デザイン
                      </ToggleButton>
                      <ToggleButton value="code">
                        <CodeRounded fontSize="small" />
                        コード
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <div>
                      <Button
                        startIcon={<ContentCopyRounded />}
                        onClick={() => copy(selected.content)}
                      >
                        コピー
                      </Button>
                      <Tooltip title="ダウンロード">
                        <IconButton onClick={() => download(selected.content, selected.title)}>
                          <DownloadRounded />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton onClick={() => setDeleteOpen(true)}>
                          <DeleteOutlineRounded />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                  {renderMarkdown(selected.content)}
                </div>
              </>
            ) : page === 'viewer' ? (
              <>
                <div className="page-heading">
                  <div>
                    <span className="eyebrow">MARKDOWN VIEWER</span>
                    <h1>Markdownビューアー</h1>
                    <p>ファイルを開いて、Markdownをすぐにプレビュー。</p>
                  </div>
                </div>
                <div className="viewer-note">
                  <VisibilityOutlined fontSize="small" />
                  ここで開いたファイルは、ライブラリには保存されません。
                </div>
                <input
                  hidden
                  ref={viewerInput}
                  type="file"
                  accept=".md,.markdown,.txt"
                  onChange={(event) => {
                    void readFile(event.target.files?.[0], true);
                    event.target.value = '';
                  }}
                />
                {!viewerName ? (
                  <div
                    className="viewer-drop"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      void readFile(event.dataTransfer.files[0], true);
                    }}
                  >
                    <div className="upload-icon">
                      <CloudUploadOutlined />
                    </div>
                    <h2>Markdownを、読みやすく。</h2>
                    <p>ここにファイルをドラッグ＆ドロップ</p>
                    <Button
                      variant="contained"
                      startIcon={<FolderOpenRounded />}
                      onClick={() => viewerInput.current?.click()}
                    >
                      ファイルを選択
                    </Button>
                    <small>.md / .markdown / .txt ・ 最大2MB</small>
                  </div>
                ) : (
                  <div className="document-panel">
                    <div className="document-toolbar">
                      <strong>{viewerName}</strong>
                      <Button onClick={() => viewerInput.current?.click()}>
                        別のファイルを開く
                      </Button>
                    </div>
                    <div className="document-toolbar">
                      <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={code ? 'code' : 'preview'}
                        onChange={(_, value) => value && setCode(value === 'code')}
                      >
                        <ToggleButton value="preview">デザイン</ToggleButton>
                        <ToggleButton value="code">コード</ToggleButton>
                      </ToggleButtonGroup>
                      <Button startIcon={<ContentCopyRounded />} onClick={() => copy(viewer)}>
                        全体をコピー
                      </Button>
                    </div>
                    {renderMarkdown(viewer)}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="page-heading">
                  <div>
                    <span className="eyebrow">YOUR KNOWLEDGE, ORGANIZED.</span>
                    <h1>
                      {page === 'favorites' ? 'お気に入り' : 'ライブラリ'}
                      <span className="heading-count">
                        {page === 'favorites'
                          ? documents.filter((item) => item.favorite).length
                          : documents.length}
                      </span>
                    </h1>
                    <p>書き留めたことも、ひらめきも。Markdownをひとつの場所に。</p>
                  </div>
                  <Button
                    className="upload-button"
                    variant="contained"
                    startIcon={<AddRounded />}
                    onClick={openUpload}
                  >
                    Markdownを登録
                  </Button>
                </div>
                <section className="welcome-banner">
                  <div className="banner-text">
                    <span className="banner-label">
                      <span /> A LITTLE MORE ORGANIZED
                    </span>
                    <h2>あなたの知識に、いつでもアクセス。</h2>
                    <p>
                      Markdownファイルをアップロードして、読みやすく整理。
                      <br />
                      必要なときに、必要なドキュメントを見つけましょう。
                    </p>
                    <button onClick={() => navigate('viewer')}>
                      保存せずにプレビューする
                      <EastRounded fontSize="small" />
                    </button>
                  </div>
                  <div className="banner-art" aria-hidden="true">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <span className="art-plus plus-one">+</span>
                    <span className="art-plus plus-two">+</span>
                    <div className="paper paper-back" />
                    <div className="paper paper-front">
                      <div className="paper-md">
                        M<span>↓</span>
                      </div>
                      <div className="paper-line long" />
                      <div className="paper-line" />
                      <div className="paper-line short" />
                      <div className="paper-check">
                        <CheckRounded />
                      </div>
                    </div>
                    <span className="art-tag">.md</span>
                  </div>
                </section>
                <div className="library-tools">
                  <div className="library-tabs">
                    <button className={!tag ? 'active' : ''} onClick={() => setTag('')}>
                      すべてのドキュメント{' '}
                      <span>
                        {page === 'favorites'
                          ? documents.filter((item) => item.favorite).length
                          : documents.length}
                      </span>
                    </button>
                    {tag && <Chip label={tag} onDelete={() => setTag('')} />}
                  </div>
                  <span className="library-caption">あなたのナレッジベース</span>
                </div>
                <div className="filters">
                  <TextField
                    className="search-field"
                    placeholder="タイトル・タグ・本文で検索..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <SearchRounded className="search-icon" />,
                        endAdornment: query ? (
                          <IconButton
                            size="small"
                            aria-label="検索をクリア"
                            onClick={() => setQuery('')}
                          >
                            <CloseRounded fontSize="small" />
                          </IconButton>
                        ) : null,
                      },
                    }}
                  />
                  <div className="filter-right">
                    <Select
                      size="small"
                      displayEmpty
                      value={tag}
                      onChange={(event) => setTag(event.target.value)}
                      inputProps={{ 'aria-label': 'タグで絞り込み' }}
                    >
                      <MenuItem value="">すべてのタグ</MenuItem>
                      {allTags.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select
                      size="small"
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                      inputProps={{ 'aria-label': '並び順' }}
                    >
                      <MenuItem value="new">登録日が新しい順</MenuItem>
                      <MenuItem value="old">登録日が古い順</MenuItem>
                      <MenuItem value="title">タイトル順</MenuItem>
                    </Select>
                    <div className="layout-toggle">
                      <Tooltip title="グリッド表示">
                        <IconButton
                          aria-label="グリッド表示"
                          className={layout === 'grid' ? 'active' : ''}
                          onClick={() => setLayout('grid')}
                        >
                          <GridViewRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="リスト表示">
                        <IconButton
                          aria-label="リスト表示"
                          className={layout === 'list' ? 'active' : ''}
                          onClick={() => setLayout('list')}
                        >
                          <ViewListRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <div className="results-label">
                  {filtered.length} 件のドキュメント{tag && ` · ${tag}`}
                </div>
                {loading ? (
                  <LinearProgress />
                ) : filtered.length ? (
                  <div className={`document-grid ${layout === 'list' ? 'list-layout' : ''}`}>
                    {filtered.slice((currentPage - 1) * 6, currentPage * 6).map((item, index) => (
                      <section className="doc-card" key={item.id}>
                        <div className="card-top">
                          <span className={`document-icon ${tagColors[index % 4]}`}>
                            <DescriptionOutlined />
                          </span>
                          <span className="file-type">MARKDOWN</span>
                          <Tooltip title={item.favorite ? 'お気に入りを解除' : 'お気に入りに追加'}>
                            <IconButton
                              size="small"
                              aria-label={`${item.title}をお気に入り${item.favorite ? 'から解除' : 'に追加'}`}
                              onClick={() => favorite(item)}
                            >
                              {item.favorite ? (
                                <StarRounded className="gold" fontSize="small" />
                              ) : (
                                <StarBorderRounded fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </div>
                        <button
                          className="card-content"
                          onClick={() => {
                            setSelected(item);
                            setCode(false);
                          }}
                        >
                          <h3>{item.title}</h3>
                          <p>{excerpt(item.content)}</p>
                        </button>
                        <div className="card-tags">
                          {item.tags.map((value) => (
                            <button
                              key={value}
                              className={`tag-pill ${tagColors[allTags.indexOf(value) % 4]}`}
                              onClick={() => setTag(value)}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                        <div className="card-footer">
                          <span>{formatDate(item.createdAt)}</span>
                          <span className="document-id">{item.id}</span>
                          <IconButton
                            size="small"
                            aria-label={`${item.title}を開く`}
                            onClick={() => {
                              setSelected(item);
                              setCode(false);
                            }}
                          >
                            <EastRounded fontSize="small" />
                          </IconButton>
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FolderOpenRounded />
                    <h2>
                      {query || tag
                        ? '一致するドキュメントがありません'
                        : page === 'favorites'
                          ? '大切なドキュメントを、すぐそばに。'
                          : '最初のMarkdownを登録しましょう'}
                    </h2>
                    <p>
                      {page === 'favorites'
                        ? 'ドキュメントの ☆ を押すと、ここに表示されます。'
                        : 'Markdownファイルをアップロードして、知識をまとめましょう。'}
                    </p>
                    {page === 'library' && (
                      <Button variant="outlined" startIcon={<AddRounded />} onClick={openUpload}>
                        Markdownを登録
                      </Button>
                    )}
                  </div>
                )}
                <div className="pagination-row">
                  <span>
                    {filtered.length
                      ? `${(currentPage - 1) * 6 + 1}–${Math.min(currentPage * 6, filtered.length)} / ${filtered.length} 件`
                      : '0 件'}
                  </span>
                  <Pagination
                    shape="rounded"
                    count={pageCount}
                    page={currentPage}
                    onChange={(_, value) => setCurrentPage(value)}
                    color="primary"
                  />
                </div>
                <div className="library-tip">
                  <span className="tip-icon">
                    <CodeRounded fontSize="small" />
                  </span>
                  <p>
                    <strong>Markdownを、もっと身近に。</strong>
                    　コード表示とデザイン表示は、いつでも切り替えられます。
                  </p>
                </div>
              </>
            )}
            <footer className="page-footer">
              <span>
                MarkShelf <span className="footer-divider">/</span> あなた専用のMarkdownライブラリ
              </span>
              <span>
                Made for your ideas.
                <span className="footer-dot" />
              </span>
            </footer>
          </div>
        </main>
        <Dialog
          open={uploadOpen}
          onClose={() => !saving && setUploadOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle className="dialog-title">
            Markdownを登録
            <IconButton aria-label="閉じる" disabled={saving} onClick={() => setUploadOpen(false)}>
              <CloseRounded />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <p className="muted">ファイルを選択して、ドキュメントの情報を入力してください。</p>
            <input
              ref={fileInput}
              type="file"
              hidden
              accept=".md,.markdown,.txt"
              onChange={(event) => {
                void readFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <div
              className="upload-drop"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void readFile(event.dataTransfer.files[0]);
              }}
            >
              <CloudUploadOutlined />
              <strong>{filename || 'Markdownファイルをドラッグ＆ドロップ'}</strong>
              <Button onClick={() => fileInput.current?.click()}>ファイルを選択</Button>
              <small>.md / .markdown / .txt ・ 最大2MB</small>
            </div>
            <div className="form-fields">
              <TextField
                label="タイトル"
                required
                fullWidth
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 200 } }}
              />
              <div className="form-row">
                <TextField
                  label="登録日時"
                  type="datetime-local"
                  required
                  fullWidth
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="タグ"
                  placeholder="開発, メモ"
                  helperText="カンマで区切って入力（最大20個）"
                  fullWidth
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                />
              </div>
              <TextField
                label="Markdown"
                placeholder="# タイトル\n\n本文を入力することもできます。"
                multiline
                minRows={7}
                maxRows={15}
                required
                fullWidth
                value={content}
                onChange={(event) => setContent(event.target.value)}
                helperText="IDは登録時にYYYYMM + 3桁の通し番号で自動発行します。"
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button disabled={saving} onClick={() => setUploadOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="contained"
              disabled={saving || !title.trim() || !content.trim() || !date}
              onClick={save}
            >
              {saving ? '登録中...' : 'ライブラリに登録'}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <DialogTitle>ドキュメントを削除しますか？</DialogTitle>
          <DialogContent>
            「{selected?.title}」を削除します。この操作は取り消せません。
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>キャンセル</Button>
            <Button color="error" onClick={remove}>
              削除する
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice('')}>
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        </Snackbar>
        <Snackbar open={Boolean(error)} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
