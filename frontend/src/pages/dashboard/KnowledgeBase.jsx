import React, { useState } from 'react';
import ragService from '../../services/ragService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Globe, Upload, Zap, BrainCircuit, CheckCircle2, AlertCircle,
    Loader2, FileText, Settings2, ChevronDown, ChevronUp, KeyRound, Lock, Shield,
    Code, Copy, Plus, Trash2, MessageSquare, Send, RotateCcw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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

/* ─── main component ─── */
const KnowledgeBase = () => {
    const { role } = useAuth();
    const isAdmin = String(role || '').toLowerCase() === 'admin';
    /* crawl state */
    const [maxPages, setMaxPages] = useState(20);
    const [depthLimit, setDepthLimit] = useState(2);
    const [useAdvanced, setUseAdvanced] = useState(false);
    const [useAI, setUseAI] = useState(false);

    /* auth state */
    const [authMode, _setAuthMode] = useState('none');
    const [cookieString, _setCookieString] = useState('');
    const [authHeader, _setAuthHeader] = useState('');
    const [loginUrl, _setLoginUrl] = useState('');
    const [loginUser, _setLoginUser] = useState('');
    const [loginPass, _setLoginPass] = useState('');
    const [waitSelector, _setWaitSelector] = useState('');

    /* upload state */
    const [crawlUrlBySite, setCrawlUrlBySite] = useState({});
    const [crawlStatusBySite, setCrawlStatusBySite] = useState({});
    const [crawlResultBySite, setCrawlResultBySite] = useState({});
    const [crawlErrorBySite, setCrawlErrorBySite] = useState({});
    const [uploadFileBySite, setUploadFileBySite] = useState({});
    const [uploadStatusBySite, setUploadStatusBySite] = useState({});
    const [uploadResultBySite, setUploadResultBySite] = useState({});
    const [uploadErrorBySite, setUploadErrorBySite] = useState({});

    const [deleteStatus, setDeleteStatus] = useState(null);
    const [_deleteError, setDeleteError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [showAdvOpts, setShowAdvOpts] = useState(false);
    const [excludePatterns, setExcludePatterns] = useState('login, logout, auth, signup');
    const [privacyPatterns, setPrivacyPatterns] = useState('profile, settings, account, billing');

    /* api keys state */
    const [apiKeys, setApiKeys] = useState([]);
    const [widgetConfig, setWidgetConfig] = useState(null);
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [newKeyWebsiteId, setNewKeyWebsiteId] = useState('');
    const [websiteName, setWebsiteName] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [websiteStatus, setWebsiteStatus] = useState(null);
    const [websiteError, setWebsiteError] = useState('');
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

    React.useEffect(() => {
        if (!knowledgeData) return;
        if (newKeyWebsiteId) return;
        const firstSite = (knowledgeData?.sites || [])[0];
        if (firstSite?.id) {
            setNewKeyWebsiteId(firstSite.id);
        }
    }, [knowledgeData, newKeyWebsiteId]);

    React.useEffect(() => {
        if (!knowledgeData) return;
        const nextMap = { ...crawlUrlBySite };
        (knowledgeData?.sites || []).forEach((site) => {
            const key = String(site.id ?? 'default');
            if (!nextMap[key]) {
                nextMap[key] = site.baseUrl || '';
            }
        });
        setCrawlUrlBySite(nextMap);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [knowledgeData]);

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


    const handleCrawlForSite = async (site) => {
        const key = String(site.id ?? 'default');
        const url = crawlUrlBySite[key] || site.baseUrl || '';
        if (!url) return;
        setCrawlStatusBySite((prev) => ({ ...prev, [key]: 'loading' }));
        setCrawlResultBySite((prev) => ({ ...prev, [key]: null }));
        setCrawlErrorBySite((prev) => ({ ...prev, [key]: '' }));
        try {
            const body = {
                url,
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
                    privacyPatterns: body.privacyPatterns,
                    websiteId: site.id ?? undefined,
                    websiteLabel: site.label || undefined,
                });
            setCrawlResultBySite((prev) => ({ ...prev, [key]: result }));
            setCrawlStatusBySite((prev) => ({ ...prev, [key]: 'success' }));
            fetchKnowledgeBase();
        } catch (err) {
            const isTimeout = err?.code === 'ECONNABORTED' || String(err?.message || '').toLowerCase().includes('timeout');
            const msg = isTimeout
                ? 'Crawl is taking longer than usual. Please wait; the backend may still be processing.'
                : (err?.response?.data?.details || err?.message || 'Unknown error');
            setCrawlErrorBySite((prev) => ({ ...prev, [key]: msg }));
            setCrawlStatusBySite((prev) => ({ ...prev, [key]: 'error' }));
        }
    };


    const handleUploadForSite = async (site) => {
        const key = String(site.id ?? 'default');
        const file = uploadFileBySite[key];
        if (!file) return;
        setUploadStatusBySite((prev) => ({ ...prev, [key]: 'loading' }));
        setUploadResultBySite((prev) => ({ ...prev, [key]: null }));
        setUploadErrorBySite((prev) => ({ ...prev, [key]: '' }));
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const base64 = ev.target.result.split(',')[1];
                const res = await ragService.uploadDocument(file, base64);
                setUploadResultBySite((prev) => ({ ...prev, [key]: res }));
                setUploadStatusBySite((prev) => ({ ...prev, [key]: 'success' }));
                fetchKnowledgeBase();
            } catch (err) {
                setUploadErrorBySite((prev) => ({
                    ...prev,
                    [key]: err?.response?.data?.details || err?.message || 'Unknown error',
                }));
                setUploadStatusBySite((prev) => ({ ...prev, [key]: 'error' }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!newKeyLabel) return;
        setIsCreatingKey(true);
        try {
            const fallbackSiteId = (knowledgeData?.sites || [])[0]?.id;
            const websiteId = newKeyWebsiteId || fallbackSiteId;
            await ragService.createApiKey(newKeyLabel, websiteId || undefined);
            setNewKeyLabel('');
            setNewKeyWebsiteId(websiteId || '');
            fetchApiKeys();
        } catch (err) { console.error('Failed to create key', err); }
        finally { setIsCreatingKey(false); }
    };

    const handleAddWebsite = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        if (!websiteName || !websiteUrl) return;
        setWebsiteStatus('loading');
        setWebsiteError('');
        try {
            const res = await ragService.createKnowledgeSite(websiteName, websiteUrl);
            const created = res?.data || res;
            await fetchKnowledgeBase();
            if (created?.id) {
                setWebsiteName(created.label || websiteName);
                setWebsiteUrl(created.baseUrl || websiteUrl);
                setCrawlUrlBySite((prev) => ({ ...prev, [String(created.id)]: created.baseUrl || websiteUrl }));
            }
            setWebsiteStatus('success');
        } catch (err) {
            setWebsiteError(err?.response?.data?.error || err?.message || 'Failed to add website.');
            setWebsiteStatus('error');
        }
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

    const knowledgeSites = knowledgeData?.sites || [];
    const siteCount = knowledgeSites.length;
    const totalIndexedPages = knowledgeSites.reduce((sum, site) => sum + Number(site.totalPages || 0), 0);
    const vectorCount = Number(knowledgeData?.vectorCount || 0);
    const activeTabLabel =
        activeTab === 'crawl' ? 'Knowledge' : activeTab === 'developer' ? 'Deployment' : 'Demo Chat';

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(120deg,_rgba(15,23,42,1)_0%,_rgba(30,64,175,1)_62%,_rgba(37,99,235,1)_100%)] px-4 py-5 text-white sm:px-6">
                    <span className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                    <span className="pointer-events-none absolute -bottom-16 left-16 h-40 w-40 rounded-full bg-blue-300/20 blur-2xl" />

                    <div className="relative flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                                <BrainCircuit size={22} />
                                Knowledge Base
                            </h1>
                            <p className="mt-1 text-sm text-blue-100">
                                Manage crawl sources, deployment keys, and demo chat from one workspace.
                            </p>
                        </div>
                        <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
                            Active view: {activeTabLabel}
                        </span>
                    </div>

                    <div className="relative mt-4 grid grid-cols-2 gap-2 text-xs font-semibold sm:grid-cols-4">
                        <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
                            <p className="text-blue-100">Websites</p>
                            <p className="mt-0.5 text-lg text-white">{siteCount}</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
                            <p className="text-blue-100">Indexed Pages</p>
                            <p className="mt-0.5 text-lg text-white">{totalIndexedPages}</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
                            <p className="text-blue-100">Vectors</p>
                            <p className="mt-0.5 text-lg text-white">{vectorCount}</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
                            <p className="text-blue-100">Status</p>
                            <p className="mt-0.5 text-sm text-white">{knowledgeLoading ? 'Refreshing...' : 'Ready'}</p>
                        </div>
                    </div>
                </div>

                <div className="border-b border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1">
                        <button
                            onClick={() => setActiveTab('crawl')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'crawl' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Globe size={16} /> Knowledge
                        </button>
                        <button
                            onClick={() => setActiveTab('developer')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'developer' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Code size={16} /> Deployment
                        </button>
                        <button
                            onClick={() => setActiveTab('demo')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'demo' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <MessageSquare size={16} /> Demo
                        </button>
                    </div>
                </div>

                {knowledgeError && (
                    <div className="mx-3 mb-3 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {knowledgeError}
                    </div>
                )}
            </section>

            {activeTab === 'crawl' ? (
                /* --- KNOWLEDGE TAB --- */
                <div className="grid grid-cols-1 gap-6">
                    {/* Website Setup */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"><Globe size={18} /></span>
                            <div>
                                <p className="font-semibold text-slate-900">Websites</p>
                                <p className="text-xs text-slate-500">Name and register each website before crawling</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddWebsite} className="flex flex-col lg:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder="Website Name (e.g. Marketing Site)"
                                    value={websiteName}
                                    onChange={(e) => setWebsiteName(e.target.value)}
                                    disabled={!isAdmin}
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    disabled={!isAdmin}
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={websiteStatus === 'loading' || !isAdmin}
                                    className="bg-emerald-600 text-white rounded-xl px-6 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {websiteStatus === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : <><Plus size={16} /> Add Website</>}
                                </button>
                            </form>
                            {!isAdmin && (
                                <p className="mt-3 text-xs text-slate-500">
                                    Only admins can add or edit websites.
                                </p>
                            )}
                            {websiteStatus && (
                                <div className={`mt-4 rounded-xl border p-4 ${websiteStatus === 'success' ? 'border-emerald-200 bg-emerald-50' : websiteStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                                    <StatusBadge type={websiteStatus} />
                                    {websiteError && <p className="mt-2 text-sm text-red-600">{websiteError}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {(knowledgeData?.sites || []).length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-sm text-slate-500">
                            No websites yet. Add a website above to start crawling.
                        </div>
                    ) : (
                        (knowledgeData?.sites || []).map((site) => {
                            const key = String(site.id ?? 'default');
                            const siteCrawlStatus = crawlStatusBySite[key];
                            const siteCrawlResult = crawlResultBySite[key];
                            const siteCrawlError = crawlErrorBySite[key];
                            const siteUploadStatus = uploadStatusBySite[key];
                            const siteUploadResult = uploadResultBySite[key];
                            const siteUploadError = uploadErrorBySite[key];
                            return (
                                <div key={site.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"><Globe size={18} /></span>
                                            <div>
                                                <p className="font-semibold text-slate-900">{site.label || site.baseUrl}</p>
                                                <p className="text-xs text-slate-500">{site.baseUrl}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={fetchKnowledgeBase}
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><Globe size={18} /></span>
                                                <div>
                                                    <p className="font-semibold text-slate-900">Website Crawler</p>
                                                    <p className="text-xs text-slate-500">Auto-map and index this site</p>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="url"
                                                            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                            placeholder="https://example.com"
                                                            value={crawlUrlBySite[key] || ''}
                                                            onChange={(e) => setCrawlUrlBySite((prev) => ({ ...prev, [key]: e.target.value }))}
                                                            required
                                                        />
                                                        <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCrawlForSite(site)}
                                                        disabled={siteCrawlStatus === 'loading'}
                                                        className="bg-indigo-600 text-white rounded-xl px-8 py-3 text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {siteCrawlStatus === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Crawling...</> : <><Zap size={16} /> Start Crawl</>}
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-6 pt-4">
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
                                                            className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500"
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
                                                            className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <SectionToggle open={showAdvOpts} onToggle={() => setShowAdvOpts(!showAdvOpts)} label="Advanced & Privacy" icon={<Settings2 size={13} />} />
                                                </div>

                                                {showAdvOpts && (
                                                    <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Exclusions (Skip patterns)</label>
                                                            <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" value={excludePatterns} onChange={(e) => setExcludePatterns(e.target.value)} />
                                                            <p className="mt-1 text-[10px] text-slate-400">Comma-separated keywords (e.g. login, logout)</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Privacy Patterns (AI Glimpse only)</label>
                                                            <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" value={privacyPatterns} onChange={(e) => setPrivacyPatterns(e.target.value)} />
                                                            <p className="mt-1 text-[10px] text-slate-400">Sensitive routes to be summarized instead of indexed</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {siteCrawlStatus && (
                                                    <div className={`mt-6 rounded-xl border p-4 ${siteCrawlStatus === 'success' ? 'border-emerald-200 bg-emerald-50' : siteCrawlStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <StatusBadge type={siteCrawlStatus} />
                                                            <span className="font-bold text-slate-800">{siteCrawlStatus === 'success' ? 'Crawl Complete!' : siteCrawlStatus === 'error' ? 'Crawl Failed' : 'Scanning Website...'}</span>
                                                        </div>
                                                        {siteCrawlResult && <p className="text-sm text-slate-600">Found and indexed <b>{siteCrawlResult.pagesCrawl}</b> pages ({siteCrawlResult.chunksCreated} knowledge chunks).</p>}
                                                        {siteCrawlError && <p className="text-sm text-red-600">{siteCrawlError}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white"><Upload size={18} /></span>
                                                <div>
                                                    <p className="font-semibold text-slate-900">Document Upload</p>
                                                    <p className="text-xs text-slate-500">Train with PDFs, Docs, or Text files</p>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <input type="file" onChange={(e) => setUploadFileBySite((prev) => ({ ...prev, [key]: e.target.files[0] }))} className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:bg-slate-100 transition-colors" />
                                                    <button type="button" onClick={() => handleUploadForSite(site)} disabled={siteUploadStatus === 'loading' || !uploadFileBySite[key]} className="bg-slate-900 text-white rounded-xl px-8 py-3 text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                                        {siteUploadStatus === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><FileText size={16} /> Upload Doc</>}
                                                    </button>
                                                </div>
                                                {siteUploadStatus && (
                                                    <div className={`mt-4 rounded-xl border p-4 ${siteUploadStatus === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                                                        <StatusBadge type={siteUploadStatus} />
                                                        {siteUploadResult && <p className="mt-2 text-sm text-slate-600">Successfully indexed <b>{siteUploadResult.filename}</b>.</p>}
                                                        {siteUploadError && <p className="mt-2 text-sm text-red-600">{siteUploadError}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"><BrainCircuit size={18} /></span>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">Knowledge Base</p>
                                                        <p className="text-xs text-slate-500">Live indexed pages for this website</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div className="rounded-lg border border-slate-200 p-3">
                                                        <p className="text-slate-400">Indexed Pages</p>
                                                        <p className="text-lg font-bold text-slate-900">{site.totalPages || 0}</p>
                                                    </div>
                                                    <div className="rounded-lg border border-slate-200 p-3">
                                                        <p className="text-slate-400">Vector Chunks</p>
                                                        <p className="text-lg font-bold text-slate-900">{knowledgeData?.vectorCount ?? 0}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                    {(site.pages || []).length === 0 ? (
                                                        <p className="text-xs text-slate-400">No pages indexed yet.</p>
                                                    ) : (
                                                        site.pages.map((page, idx) => (
                                                            <div key={`${site.id}-${idx}`} className="rounded-lg border border-slate-100 bg-white px-3 py-2">
                                                                <p className="text-xs font-semibold text-slate-700">{page.title || page.url}</p>
                                                                <p className="text-[11px] text-slate-400">{page.url}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Danger Zone */}
                    <div className="rounded-2xl border border-red-200 bg-white shadow-sm overflow-hidden">
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
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"><KeyRound size={18} /></span>
                            <div>
                                <p className="font-semibold text-slate-900">API Access Keys</p>
                                <p className="text-xs text-slate-500">Authorize external sites to use your chatbot</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreateKey} className="flex flex-col gap-3 mb-8 lg:flex-row">
                                <input
                                    type="text"
                                    placeholder="Key Label (e.g. My Portfolio Site)"
                                    value={newKeyLabel}
                                    onChange={(e) => setNewKeyLabel(e.target.value)}
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                                />
                                <select
                                    value={newKeyWebsiteId}
                                    onChange={(e) => setNewKeyWebsiteId(e.target.value)}
                                    className="min-w-[200px] rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500"
                                >
                                    {(knowledgeData?.sites || []).length === 0 && (
                                        <option value="">No websites yet</option>
                                    )}
                                    {(knowledgeData?.sites || []).map((site) => (
                                        <option key={site.id} value={site.id}>
                                            {site.label || site.baseUrl}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    disabled={isCreatingKey}
                                    className="bg-indigo-600 text-white rounded-xl px-6 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
                                >
                                    <Plus size={16} /> Create Key
                                </button>
                            </form>

                            <div className="space-y-3">
                                {apiKeys.map(key => {
                                    const site = (knowledgeData?.sites || []).find((s) => s.id === key.websiteId);
                                    return (
                                    <div key={key.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{key.label}</p>
                                            <p className="text-xs font-mono text-slate-500 mt-1">{key.key.substring(0, 10)}********************</p>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                {site ? `Website: ${site.label || site.baseUrl}` : 'Website: All'}
                                            </p>
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
                                )})}
                                {apiKeys.length === 0 && <p className="text-center py-8 text-sm text-slate-400 font-medium">No API keys yet. Create one to start embedding.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Embedding Snippet */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
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
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-600 text-white"><MessageSquare size={18} /></span>
                                <div>
                                    <p className="font-semibold text-slate-900">Chatbot Demo</p>
                                    <p className="text-xs text-slate-500">Test complete context-aware chatbot behavior in this dashboard</p>
                                </div>
                            </div>
                            <button
                                onClick={handleResetChat}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
                                                    a: ({ ...props }) => (
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
                                    <div className="mr-auto max-w-[85%] rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:120ms]" />
                                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:240ms]" />
                                        </div>
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
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                                <button
                                    type="submit"
                                    disabled={chatLoading || !chatInput.trim()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
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
