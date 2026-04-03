import React, { useState } from 'react';
import ragService from '../../services/ragService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Globe, Upload, Zap, BrainCircuit, CheckCircle2, AlertCircle,
    Loader2, FileText, Settings2, ChevronDown, ChevronUp, KeyRound, Lock, Shield,
    Code, Copy, Plus, Trash2, MessageSquare, Send, RotateCcw
} from 'lucide-react';

/* ─── tiny helpers ─── */
const StatusBadge = ({ type }) => {
    const map = {
        success: { cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={12} />, label: 'Success' },
        error: { cls: 'text-red-700 bg-red-50 border-red-200', icon: <AlertCircle size={12} />, label: 'Error' },
        loading: { cls: 'text-blue-700 bg-blue-50 border-blue-200', icon: <Loader2 size={12} className="animate-spin" />, label: 'Running…' },
    };
    const s = map[type] || map.loading;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
            {s.icon}{s.label}
        </span>
    );
};

const SectionToggle = ({ open, onToggle, label, icon }) => (
    <button type="button" onClick={onToggle}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        {icon}{label}{open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    </button>
);

const panelClass =
    'rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-36px_rgba(15,23,42,0.65)] ring-1 ring-white/70 overflow-hidden';

const panelHeadClass =
    'flex items-center gap-3 border-b border-slate-100 bg-[linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(255,255,255,0.95))] px-6 py-4';

const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

const primaryBtnClass =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50';

const subtleBtnClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50';

/* ─── main component ─── */
const KnowledgeBase = () => {
    /* crawl state */
    const [crawlUrl, setCrawlUrl] = useState('');
    const [maxPages, setMaxPages] = useState(20);
    const [depthLimit, setDepthLimit] = useState(2);
    const [useAdvanced, setUseAdvanced] = useState(false);
    const [useAI, setUseAI] = useState(false);
    const [crawlStatus, setCrawlStatus] = useState(null);
    const [crawlResult, setCrawlResult] = useState(null);
    const [crawlError, setCrawlError] = useState('');

    /* auth state */
    const [authMode, setAuthMode] = useState('none');
    const [cookieString, setCookieString] = useState('');
    const [authHeader, setAuthHeader] = useState('');
    const [loginUrl, setLoginUrl] = useState('');
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [waitSelector, setWaitSelector] = useState('');

    /* upload state */
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploadError, setUploadError] = useState('');

    const [deleteStatus, setDeleteStatus] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [showAdvOpts, setShowAdvOpts] = useState(false);
    const [excludePatterns, setExcludePatterns] = useState('login, logout, auth, signup');
    const [privacyPatterns, setPrivacyPatterns] = useState('profile, settings, account, billing');

    /* api keys state */
    const [apiKeys, setApiKeys] = useState([]);
    const [widgetConfig, setWidgetConfig] = useState(null);
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [activeTab, setActiveTab] = useState('crawl');
    const [knowledgeData, setKnowledgeData] = useState(null);
    const [knowledgeLoading, setKnowledgeLoading] = useState(false);
    const [knowledgeError, setKnowledgeError] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState('');
    const [chatSessionId, setChatSessionId] = useState(`demo-${Date.now()}`);
    const [chatMessages, setChatMessages] = useState([
        {
            id: `assistant-welcome-${Date.now()}`,
            role: 'assistant',
            content: 'Hi! I am your support assistant demo. Ask me anything about the crawled website or uploaded documents.',
            sources: [],
        },
    ]);

    /* effects */
    React.useEffect(() => {
        fetchApiKeys();
        fetchWidgetConfig();
        fetchKnowledgeBase();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const data = await ragService.getApiKeys();
            setApiKeys(data);
        } catch (err) { console.error('Failed to fetch keys', err); }
    };

    const fetchWidgetConfig = async () => {
        try {
            const data = await ragService.getWidgetConfig();
            setWidgetConfig(data);
        } catch (err) { console.error('Failed to fetch widget config', err); }
    };

    const fetchKnowledgeBase = async () => {
        try {
            setKnowledgeLoading(true);
            setKnowledgeError('');
            const data = await ragService.getKnowledgeBase();
            setKnowledgeData(data);
        } catch (err) {
            setKnowledgeError(err?.response?.data?.error || err?.message || 'Failed to fetch knowledge base.');
        } finally {
            setKnowledgeLoading(false);
        }
    };

    /* ── helpers ── */
    const buildAuth = () => {
        if (authMode === 'cookies') {
            const cookies = cookieString.split(';')
                .map(s => s.trim()).filter(Boolean)
                .map(s => { const [name, ...rest] = s.split('='); return { name: name.trim(), value: rest.join('=').trim() }; });
            const headers = authHeader ? { Authorization: authHeader } : undefined;
            return { cookies: cookies.length ? cookies : undefined, extraHTTPHeaders: headers };
        }
        if (authMode === 'login') {
            return {
                loginFlow: {
                    loginUrl,
                    username: loginUser,
                    password: loginPass,
                    waitForSelector: waitSelector || undefined,
                }
            };
        }
        return {};
    };

    const handleCrawl = async (e) => {
        e.preventDefault();
        if (!crawlUrl) return;
        setCrawlStatus('loading'); setCrawlResult(null); setCrawlError('');
        try {
            const body = {
                url: crawlUrl,
                maxPages,
                depthLimit,
                useAdvanced,
                useAI,
                auth: buildAuth(),
                excludePatterns: excludePatterns.split(',').map(s => s.trim()).filter(Boolean),
                privacyPatterns: privacyPatterns.split(',').map(s => s.trim()).filter(Boolean),
            };
            const result = await ragService.startCrawl(
                body.url,
                body.maxPages,
                body.depthLimit,
                body.useAdvanced,
                body.useAI,
                body.auth,
                {
                excludePatterns: body.excludePatterns,
                privacyPatterns: body.privacyPatterns
            });
            setCrawlResult(result); setCrawlStatus('success');
            fetchKnowledgeBase();
        } catch (err) {
            const isTimeout = err?.code === 'ECONNABORTED' || String(err?.message || '').toLowerCase().includes('timeout');
            if (isTimeout) {
                setCrawlError('Crawl is taking longer than usual. Please wait; the backend may still be processing.');
            } else {
                setCrawlError(err?.response?.data?.details || err?.message || 'Unknown error');
            }
            setCrawlStatus('error');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;
        setUploadStatus('loading'); setUploadResult(null); setUploadError('');
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const base64 = ev.target.result.split(',')[1];
                const res = await ragService.uploadDocument(uploadFile, base64);
                setUploadResult(res); setUploadStatus('success');
                fetchKnowledgeBase();
            } catch (err) {
                setUploadError(err?.response?.data?.details || err?.message || 'Unknown error');
                setUploadStatus('error');
            }
        };
        reader.readAsDataURL(uploadFile);
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!newKeyLabel) return;
        setIsCreatingKey(true);
        try {
            await ragService.createApiKey(newKeyLabel);
            setNewKeyLabel('');
            fetchApiKeys();
        } catch (err) { console.error('Failed to create key', err); }
        finally { setIsCreatingKey(false); }
    };

    const handleDeleteKey = async (id) => {
        try {
            await ragService.deleteApiKey(id);
            fetchApiKeys();
        } catch (err) { console.error('Failed to delete key', err); }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard');
    };

    const handleDeleteKnowledge = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        setDeleteStatus('loading'); setDeleteError('');
        try {
            await ragService.deleteKnowledgeBase();
            setDeleteStatus('success');
            setConfirmDelete(false);
            fetchKnowledgeBase();
        } catch (err) {
            setDeleteError(err?.response?.data?.details || err?.message || 'Failed to clear knowledge base');
            setDeleteStatus('error');
        }
    };

    const widgetSnippet = `import { createChatbotWidget } from "chatbot-package";

createChatbotWidget({
  title: "Support AI",
  aiSupport: {
    apiBaseUrl: "${window.location.origin}/api",
    apiKey: "${widgetConfig?.widgetKey || apiKeys[0]?.key || 'YOUR_WIDGET_API_KEY'}"
  },
  humanSupport: {
    apiBaseUrl: "${window.location.origin}/api"
  }
});`;

    const handleSendMessage = async (e) => {
        e?.preventDefault?.();
        const trimmed = chatInput.trim();
        if (!trimmed || chatLoading) return;

        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmed,
        };
        setChatMessages((prev) => [...prev, userMessage]);
        setChatInput('');
        setChatError('');
        setChatLoading(true);

        try {
            const res = await ragService.chat(trimmed, chatSessionId);
            const answer =
                res?.answer ||
                res?.response ||
                res?.message ||
                'I processed your query, but no final answer text was returned.';
            const sources = Array.isArray(res?.sources) ? res.sources : [];
            setChatMessages((prev) => [
                ...prev,
                {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: answer,
                    sources,
                    needsHandoff: Boolean(res?.needs_handoff),
                    confidence: typeof res?.confidence === 'number' ? res.confidence : null,
                    supportContact: res?.support_contact || null,
                },
            ]);
        } catch (err) {
            const isTimeout = err?.code === 'ECONNABORTED' || String(err?.message || '').toLowerCase().includes('timeout');
            if (isTimeout) {
                setChatError('Response is taking longer than usual. Please wait; request is still being processed.');
            } else {
                setChatError(err?.response?.data?.error || err?.message || 'Failed to send message');
            }
        } finally {
            setChatLoading(false);
        }
    };

    const handleResetChat = () => {
        const newSessionId = `demo-${Date.now()}`;
        setChatSessionId(newSessionId);
        setChatError('');
        setChatLoading(false);
        setChatMessages([
            {
                id: `assistant-reset-${Date.now()}`,
                role: 'assistant',
                content: 'New chat session started. Ask your next question to test context-aware replies.',
                sources: [],
                needsHandoff: false,
                confidence: null,
                supportContact: null,
            },
        ]);
    };

    return (
        <div className="relative mx-auto max-w-6xl space-y-8 px-4 pb-8 pt-6 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div aria-hidden className="pointer-events-none absolute -top-16 left-0 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute right-10 top-24 h-56 w-56 rounded-full bg-indigo-200/35 blur-3xl" />

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(130deg,_rgba(15,23,42,1)_0%,_rgba(30,64,175,1)_52%,_rgba(56,189,248,0.95)_100%)] px-6 py-7 text-white shadow-[0_26px_45px_-34px_rgba(15,23,42,0.95)]">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight md:text-4xl">
                            <BrainCircuit className="text-cyan-200" size={36} /> Support Chatbot
                        </h1>
                        <p className="mt-2 text-base text-blue-100 md:text-lg">
                            Teach, test, and deploy your AI assistant from one workspace.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-blue-100">
                        <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2">
                            <p>Pages</p>
                            <p className="mt-0.5 text-base text-white">{knowledgeData?.totalPages ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2">
                            <p>Chunks</p>
                            <p className="mt-0.5 text-base text-white">{knowledgeData?.vectorCount ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2">
                            <p>Keys</p>
                            <p className="mt-0.5 text-base text-white">{apiKeys.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm backdrop-blur">
                <button
                    onClick={() => setActiveTab('crawl')}
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 inline-flex items-center gap-2 ${activeTab === 'crawl' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                    <Globe size={16} /> Knowledge
                </button>
                <button
                    onClick={() => setActiveTab('developer')}
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 inline-flex items-center gap-2 ${activeTab === 'developer' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                    <Code size={16} /> Deployment
                </button>
                <button
                    onClick={() => setActiveTab('demo')}
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 inline-flex items-center gap-2 ${activeTab === 'demo' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                    <MessageSquare size={16} /> Demo
                </button>
            </div>

            {activeTab === 'crawl' ? (
                /* --- KNOWLEDGE TAB --- */
                <div className="grid grid-cols-1 gap-6">
                    {/* Crawler Card */}
                    <div className={panelClass}>
                        <div className={panelHeadClass}>
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><Globe size={18} /></span>
                            <div>
                                <p className="font-semibold text-slate-900">Website Crawler</p>
                                <p className="text-xs text-slate-500">Auto-map and index your entire site</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCrawl} className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="url"
                                            className={`${fieldClass} pl-10`}
                                            placeholder="https://example.com"
                                            value={crawlUrl}
                                            onChange={(e) => setCrawlUrl(e.target.value)}
                                            required
                                        />
                                        <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={crawlStatus === 'loading'}
                                        className={primaryBtnClass}
                                    >
                                        {crawlStatus === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Crawling...</> : <><Zap size={16} /> Start Crawl</>}
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" checked={useAdvanced} onChange={(e) => setUseAdvanced(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Playwright Mode (Best for JS sites)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" checked={useAI} onChange={(e) => setUseAI(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">AI Content Cleaning</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-600">Max Pages:</span>
                                        <input
                                            type="number"
                                            min={1}
                                            value={maxPages}
                                            onChange={(e) => setMaxPages(parseInt(e.target.value, 10) || 1)}
                                            className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none transition focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-600">Depth Limit:</span>
                                        <input
                                            type="number"
                                            min={0}
                                            max={10}
                                            value={depthLimit}
                                            onChange={(e) => setDepthLimit(parseInt(e.target.value, 10) || 0)}
                                            className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none transition focus:border-indigo-500"
                                        />
                                    </div>
                                    <SectionToggle open={showAdvOpts} onToggle={() => setShowAdvOpts(!showAdvOpts)} label="Advanced & Privacy" icon={<Settings2 size={13} />} />
                                </div>

                                {showAdvOpts && (
                                    <div className="mt-4 grid grid-cols-1 gap-6 rounded-xl border border-slate-100 bg-[linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(255,255,255,0.95))] p-5 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Exclusions (Skip patterns)</label>
                                            <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-indigo-500" value={excludePatterns} onChange={(e) => setExcludePatterns(e.target.value)} />
                                            <p className="mt-1 text-[10px] text-slate-400">Comma-separated keywords (e.g. login, logout)</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Privacy Patterns (AI Glimpse only)</label>
                                            <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-indigo-500" value={privacyPatterns} onChange={(e) => setPrivacyPatterns(e.target.value)} />
                                            <p className="mt-1 text-[10px] text-slate-400">Sensitive routes to be summarized instead of indexed</p>
                                        </div>
                                    </div>
                                )}
                            </form>

                            {crawlStatus && (
                                <div className={`mt-6 rounded-xl border p-4 ${crawlStatus === 'success' ? 'border-emerald-200 bg-emerald-50' : crawlStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <StatusBadge type={crawlStatus} />
                                        <span className="font-bold text-slate-800">{crawlStatus === 'success' ? 'Crawl Complete!' : crawlStatus === 'error' ? 'Crawl Failed' : 'Scanning Website...'}</span>
                                    </div>
                                    {crawlResult && <p className="text-sm text-slate-600">Found and indexed <b>{crawlResult.pagesCrawl}</b> pages ({crawlResult.chunksCreated} knowledge chunks).</p>}
                                    {crawlError && <p className="text-sm text-red-600">{crawlError}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Document Upload */}
                    <div className={panelClass}>
                        <div className={panelHeadClass}>
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white"><Upload size={18} /></span>
                            <div>
                                <p className="font-semibold text-slate-900">Document Upload</p>
                                <p className="text-xs text-slate-500">Train with PDFs, Docs, or Text files</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4">
                                <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm transition-colors file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-indigo-600 hover:bg-slate-100" />
                                <button type="submit" disabled={uploadStatus === 'loading' || !uploadFile} className={primaryBtnClass}>
                                    {uploadStatus === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><FileText size={16} /> Upload Doc</>}
                                </button>
                            </form>
                            {uploadStatus && (
                                <div className={`mt-4 rounded-xl border p-4 ${uploadStatus === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                                    <StatusBadge type={uploadStatus} />
                                    {uploadResult && <p className="mt-2 text-sm text-slate-600">Successfully indexed <b>{uploadResult.filename}</b>.</p>}
                                    {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Knowledge Base (Dynamic) */}
                    <div className={panelClass}>
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-[linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(255,255,255,0.95))] px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"><BrainCircuit size={18} /></span>
                                <div>
                                    <p className="font-semibold text-slate-900">Knowledge Base</p>
                                    <p className="text-xs text-slate-500">Live indexed pages from your crawls/uploads</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={fetchKnowledgeBase}
                                className={subtleBtnClass}
                            >
                                Refresh
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {knowledgeLoading ? (
                                <p className="text-sm text-slate-500">Loading knowledge base…</p>
                            ) : knowledgeError ? (
                                <p className="text-sm text-red-600">{knowledgeError}</p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="rounded-lg border border-slate-200 p-3">
                                            <p className="text-slate-400">Indexed Pages</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">
                                                {knowledgeData?.totalPages ?? 0}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-slate-200 p-3">
                                            <p className="text-slate-400">Vector Chunks</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">
                                                {knowledgeData?.vectorCount ?? 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="max-h-[260px] space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3">
                                        {(knowledgeData?.pages || []).length === 0 ? (
                                            <p className="text-sm text-slate-500">No indexed pages yet.</p>
                                        ) : (
                                            knowledgeData.pages.map((page, idx) => (
                                                <div key={`${page.url}-${idx}`} className="rounded-lg bg-white p-3 shadow-sm">
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        {page.title || page.url}
                                                    </p>
                                                    <p className="mt-1 text-[11px] text-slate-500 break-all">
                                                        {page.url}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-3xl border border-red-200 bg-white shadow-[0_24px_48px_-36px_rgba(15,23,42,0.65)] ring-1 ring-white/70 overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-red-100 bg-red-50/50 px-6 py-4">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white"><AlertCircle size={18} /></span>
                            <div>
                                <p className="font-semibold text-red-900">Danger Zone</p>
                                <p className="text-xs text-red-500">Permanent data destruction</p>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Wipe Knowledge Base</p>
                                <p className="text-xs text-slate-500">Remove all crawled pages and docs from the vector database.</p>
                            </div>
                            <button onClick={handleDeleteKnowledge} disabled={deleteStatus === 'loading'} className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${confirmDelete ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}>
                                {deleteStatus === 'loading' ? 'Wiping...' : confirmDelete ? 'Confirm Delete?' : 'Clear Everything'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'developer' ? (
                /* --- DEVELOPER TOOLS TAB --- */
                <div className="grid grid-cols-1 gap-6">
                    {/* API Keys */}
                    <div className={panelClass}>
                        <div className={panelHeadClass}>
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"><KeyRound size={18} /></span>
                            <div>
                                <p className="font-semibold text-slate-900">API Access Keys</p>
                                <p className="text-xs text-slate-500">Authorize external sites to use your chatbot</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreateKey} className="flex gap-3 mb-8">
                                <input type="text" placeholder="Key Label (e.g. My Portfolio Site)" value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                                <button type="submit" disabled={isCreatingKey} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50">
                                    <Plus size={16} /> Create Key
                                </button>
                            </form>

                            <div className="space-y-3">
                                {apiKeys.map(key => (
                                    <div key={key.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{key.label}</p>
                                            <p className="text-xs font-mono text-slate-500 mt-1">{key.key.substring(0, 10)}********************</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => copyToClipboard(key.key)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                                                <Copy size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteKey(key.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {apiKeys.length === 0 && <p className="text-center py-8 text-sm text-slate-400 font-medium">No API keys yet. Create one to start embedding.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Embedding Snippet */}
                    <div className={panelClass}>
                        <div className={panelHeadClass}>
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"><Code size={18} /></span>
                            <div>
                                <p className="font-semibold text-slate-900">Embeddable Widget</p>
                                <p className="text-xs text-slate-500">Copy this code into your website's HEAD or BODY</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="relative">
                                <pre className="bg-slate-900 text-slate-300 p-6 rounded-xl text-xs overflow-x-auto leading-relaxed font-mono">
                                    {widgetSnippet}
                                </pre>
                                <button
                                    onClick={() => copyToClipboard(widgetSnippet)}
                                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div className="mt-6 flex items-start gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <Shield className="text-indigo-600 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm font-bold text-indigo-900">Security Note</p>
                                    <p className="text-xs text-indigo-700 mt-1">Ensure you whitelist your domain in the dashboard (coming soon) to prevent unauthorized usage of your API keys.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- DEMO CHAT TAB --- */
                <div className="grid grid-cols-1 gap-6">
                    <div className={panelClass}>
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-[linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(255,255,255,0.95))] px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-600 text-white"><MessageSquare size={18} /></span>
                                <div>
                                    <p className="font-semibold text-slate-900">Chatbot Demo</p>
                                    <p className="text-xs text-slate-500">Test complete context-aware chatbot behavior in this dashboard</p>
                                </div>
                            </div>
                            <button
                                onClick={handleResetChat}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                <RotateCcw size={14} /> New Session
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                Session ID: <span className="font-mono text-slate-700">{chatSessionId}</span>
                            </div>

                            <div className="h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                                {chatMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'ml-auto bg-indigo-600 text-white'
                                            : 'mr-auto bg-slate-100 text-slate-800 border border-slate-200'
                                            }`}
                                    >
                                        <div className="prose prose-sm max-w-none whitespace-pre-wrap prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-table:my-2 prose-th:border prose-th:border-slate-300 prose-th:px-2 prose-th:py-1 prose-td:border prose-td:border-slate-300 prose-td:px-2 prose-td:py-1">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: ({ node, ...props }) => (
                                                        <a
                                                            {...props}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-indigo-700 underline break-all"
                                                        />
                                                    ),
                                                }}
                                            >
                                                {msg.content || ''}
                                            </ReactMarkdown>
                                        </div>
                                        {msg.role === 'assistant' && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                                            <div className="mt-3">
                                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Sources</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {msg.sources.slice(0, 5).map((src, i) => (
                                                        <a
                                                            key={`${src.url}-${i}`}
                                                            href={src.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex max-w-[260px] items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:border-indigo-400 hover:text-indigo-700"
                                                            title={src.url}
                                                        >
                                                            <span className="truncate">{src.title || src.url || 'Source'}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {msg.role === 'assistant' && (msg.needsHandoff || (typeof msg.confidence === 'number' && msg.confidence < 0.62)) && (
                                            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                                <p className="font-semibold">Need verified help?</p>
                                                <p className="mt-1">This answer may be incomplete. Use customer support for a guaranteed response.</p>
                                                {msg.supportContact?.url && (
                                                    <a
                                                        href={msg.supportContact.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-2 inline-flex rounded-full border border-amber-400 bg-white px-3 py-1 font-semibold text-amber-800 hover:bg-amber-100"
                                                    >
                                                        {msg.supportContact.title || 'Contact Support'}
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {chatLoading && (
                                    <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
                                        <Loader2 size={14} className="animate-spin" /> Thinking...
                                    </div>
                                )}
                            </div>

                            {chatError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {chatError}
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask: Where is billing? How can I update profile? What is pricing?"
                                    className={fieldClass}
                                />
                                <button
                                    type="submit"
                                    disabled={chatLoading || !chatInput.trim()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50"
                                >
                                    {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeBase;
