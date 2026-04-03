import React, { useState } from 'react';
import ragService from '../../services/ragService';
import {
    Globe, Upload, Zap, BrainCircuit, CheckCircle2, AlertCircle,
    Loader2, FileText, Settings2, ChevronDown, ChevronUp, KeyRound, Lock, Shield,
    Code, Copy, Plus, Trash2
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

/* ─── main component ─── */
const KnowledgeBase = () => {
    /* crawl state */
    const [crawlUrl, setCrawlUrl] = useState('');
    const [maxPages, setMaxPages] = useState(20);
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
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [activeTab, setActiveTab] = useState('crawl');

    /* effects */
    React.useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const data = await ragService.getApiKeys();
            setApiKeys(data);
        } catch (err) { console.error('Failed to fetch keys', err); }
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
                useAdvanced,
                useAI,
                auth: buildAuth(),
                excludePatterns: excludePatterns.split(',').map(s => s.trim()).filter(Boolean),
                privacyPatterns: privacyPatterns.split(',').map(s => s.trim()).filter(Boolean),
            };
            const result = await ragService.startCrawl(body.url, body.maxPages, body.useAdvanced, body.useAI, body.auth, {
                excludePatterns: body.excludePatterns,
                privacyPatterns: body.privacyPatterns
            });
            setCrawlResult(result); setCrawlStatus('success');
        } catch (err) {
            setCrawlError(err?.response?.data?.details || err?.message || 'Unknown error');
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
        } catch (err) {
            setDeleteError(err?.response?.data?.details || err?.message || 'Failed to clear knowledge base');
            setDeleteStatus('error');
        }
    };

    const widgetSnippet = `<script>
  window.SUPPORT_BOT_CONFIG = {
    apiKey: "${apiKeys[0]?.key || 'YOUR_API_KEY'}",
    companyId: 1
  };
</script>
<script src="${window.location.origin}/widget.js" async></script>`;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <BrainCircuit className="text-indigo-600" size={36} /> Support Chatbot
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Teach and deploy your AI assistant anywhere.</p>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('crawl')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === 'crawl' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Globe size={16} /> Knowledge
                    </button>
                    <button
                        onClick={() => setActiveTab('developer')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === 'developer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Code size={16} /> Deployment
                    </button>
                </div>
            </div>

            {activeTab === 'crawl' ? (
                /* --- KNOWLEDGE TAB --- */
                <div className="grid grid-cols-1 gap-10">
                    {/* Crawler Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
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
                                            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
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
                                        className="bg-indigo-600 text-white rounded-xl px-8 py-3 text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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
                                        <span className="text-sm font-semibold text-slate-600">Depth Limit:</span>
                                        <input type="number" value={maxPages} onChange={(e) => setMaxPages(parseInt(e.target.value))} className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500" />
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
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white"><Upload size={18} /></span>
                            <div>
                                <p className="font-semibold text-slate-900">Document Upload</p>
                                <p className="text-xs text-slate-500">Train with PDFs, Docs, or Text files</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4">
                                <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:bg-slate-100 transition-colors" />
                                <button type="submit" disabled={uploadStatus === 'loading' || !uploadFile} className="bg-slate-900 text-white rounded-xl px-8 py-3 text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
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
            ) : (
                /* --- DEVELOPER TOOLS TAB --- */
                <div className="grid grid-cols-1 gap-10">
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
                            <form onSubmit={handleCreateKey} className="flex gap-3 mb-8">
                                <input type="text" placeholder="Key Label (e.g. My Portfolio Site)" value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
                                <button type="submit" disabled={isCreatingKey} className="bg-indigo-600 text-white rounded-xl px-6 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
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
            )}
        </div>
    );
};

export default KnowledgeBase;
