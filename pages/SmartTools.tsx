
import React, { useState, useEffect } from 'react';
import { CategoryKey, TemplateData, KnowledgeItem, HistoryItem, EditorDocument } from '../types';
import { useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Wand2, Code, Eye, Save, Copy, Check, FileDown, History, Clock, Plus, X, FileText } from 'lucide-react';

import { GeminiService } from '../services/GeminiService';
import { supabase } from '../lib/supabaseClient';
import { saveAs } from 'file-saver';
// @ts-ignore
import { asBlob } from 'html-docx-js-typescript';
import MarkdownRenderer from '../components/MarkdownRenderer';
import AIEditor from '../components/AIEditor';
import { marked } from 'marked';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

const SmartTools: React.FC = () => {
    const location = useLocation();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // History State
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Fetch history
    useEffect(() => {
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('smart_tools_history')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (!error && data) {
                setHistory(data as HistoryItem[]);
            }
        };
        fetchHistory();
    }, []);

    const saveToHistory = async (p: string, md: string, html: string) => {
        const { data, error } = await supabase
            .from('smart_tools_history')
            .insert({
                prompt: p,
                markdown_content: md,
                html_content: html,
                user_id: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single();

        if (!error && data) {
            setHistory(prev => [data as HistoryItem, ...prev]);
        }
    };

    // --- Multi-Document State ---
    const [documents, setDocuments] = useState<EditorDocument[]>([]);
    const [activeDocId, setActiveDocId] = useState<string>('');

    // Helpers to get/set active content
    const activeDoc = documents.find(d => d.id === activeDocId);
    const markdownContent = activeDoc?.markdown || '';
    const htmlContent = activeDoc?.html || '';

    const updateActiveDoc = (updates: Partial<EditorDocument>) => {
        setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, ...updates } : d));
    };

    const createNewDoc = (content: string = '', title: string = 'Untitled') => {
        const newDoc: EditorDocument = {
            id: Date.now().toString(),
            title: title || `Document ${documents.length + 1}`,
            markdown: content,
            html: marked.parse(content) as string,
            createdAt: Date.now()
        };
        setDocuments(prev => [...prev, newDoc]);
        setActiveDocId(newDoc.id);
        return newDoc;
    };

    const closeDoc = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newDocs = documents.filter(d => d.id !== id);
        setDocuments(newDocs);
        if (id === activeDocId) {
            // Switch to last available or create new if empty
            if (newDocs.length > 0) {
                setActiveDocId(newDocs[newDocs.length - 1].id);
            } else {
                createNewDoc();
            }
        }
    };

    const [activeSource, setActiveSource] = useState<'markdown' | 'html'>('markdown');
    const [activeTab, setActiveTab] = useState<'editor' | 'code' | 'preview'>('editor');
    const [isCopied, setIsCopied] = useState(false);

    // Generation Options
    const [withTitle, setWithTitle] = useState(false);
    const [withSummary, setWithSummary] = useState(false);
    const [withRAG, setWithRAG] = useState(false);

    // Save to KB State
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saveTags, setSaveTags] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Initial Load & Navigation
    useEffect(() => {
        if (location.state) {
            const { prompt: navPrompt, autoExecute } = location.state as { prompt: string; autoExecute?: boolean };
            if (navPrompt) {
                setPrompt(navPrompt);
                if (autoExecute) {
                    handleAutoGenerate(navPrompt);
                }
            }
        }
    }, [location.state]);

    const handleAutoGenerate = async (p: string) => {
        setIsGenerating(true);
        try {
            const result = await GeminiService.generateContent(p);
            // Create a new document for auto-generated content
            createNewDoc(result, `Auto-Gen ${new Date().toLocaleTimeString()}`);
            setActiveTab('editor');
            setActiveSource('markdown');
        } catch (error) {
            console.error('Generation failed:', error);
            alert('生成失败，请检查 API Key 或网络连接。');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Persistence Logic ---
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // @ts-ignore
        if (location.state?.prompt) {
            // Handled by handleAutoGenerate if autoExecute is true, 
            // or just setting prompt. 
            // We don't need to do anything special here as isLoaded logic 
            // handles the documents array initialization.
        }

        const savedDocs = localStorage.getItem('st_documents');
        const savedActiveId = localStorage.getItem('st_activeDocId');

        // Legacy migration
        const savedLegacyMarkdown = localStorage.getItem('st_markdown');

        let initialDocs: EditorDocument[] = [];

        if (savedDocs) {
            try {
                initialDocs = JSON.parse(savedDocs);
            } catch (e) { console.error('Failed to parse docs', e); }
        }

        // If no docs but legacy exists, migrate
        if (initialDocs.length === 0 && savedLegacyMarkdown) {
            initialDocs.push({
                id: 'legacy',
                title: 'Recovered Document',
                markdown: savedLegacyMarkdown,
                html: localStorage.getItem('st_html') || '',
                createdAt: Date.now()
            });
        }

        // Verify loaded docs
        if (initialDocs.length === 0) {
            const defaultDoc = {
                id: Date.now().toString(),
                title: 'Untitled',
                markdown: '',
                html: '',
                createdAt: Date.now()
            };
            initialDocs.push(defaultDoc);
        }

        setDocuments(initialDocs);

        // Set active ID
        if (savedActiveId && initialDocs.find(d => d.id === savedActiveId)) {
            setActiveDocId(savedActiveId);
        } else {
            setActiveDocId(initialDocs[initialDocs.length - 1].id);
        }

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('st_documents', JSON.stringify(documents));
            localStorage.setItem('st_activeDocId', activeDocId);
        }
    }, [documents, activeDocId, isLoaded]);
    // -------------------------

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setActiveSource('markdown');
        setActiveTab('editor');
        try {
            let finalPrompt = prompt;

            // 1. RAG Injection
            if (withRAG) {
                const { data: kbItems } = await supabase
                    .from('knowledge_base')
                    .select('title, content')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (kbItems && kbItems.length > 0) {
                    const ctx = kbItems.map(k => `- **${k.title}**: ${k.content.substring(0, 300)}...`).join('\n');
                    finalPrompt += `\n\n# Context (Knowledge Base)\nUse the following information as reference:\n${ctx}`;
                }
            }

            // 2. Output Requirements
            const reqs: string[] = [];
            if (withTitle) reqs.push("Provide 5 catchy titles.");
            if (withSummary) reqs.push("Provide a concise summary.");

            if (reqs.length > 0) {
                finalPrompt += `\n\n# requirements\n${reqs.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
            }

            const result = await GeminiService.generateContent(finalPrompt);

            // Update active document with new content
            updateActiveDoc({
                markdown: result,
                html: marked.parse(result) as string
            });

            // Save to History
            await saveToHistory(finalPrompt, result, '');

            setPrompt(''); // Clear prompt after success? Or keep it? Previous behavior was clear.
        } catch (error) {
            console.error('Generation failed:', error);
            alert('生成失败，请检查 API Key 或网络连接。');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveToKB = async () => {
        if (!saveTitle.trim()) {
            alert('请输入标题');
            return;
        }
        setIsSaving(true);
        const contentToSave = activeSource === 'markdown' ? markdownContent : htmlContent;

        try {
            const { error } = await supabase
                .from('knowledge_base')
                .insert({
                    title: saveTitle,
                    content: contentToSave,
                    tags: saveTags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
                    ref_mode: 'smart' // Default
                });

            if (error) throw error;
            setIsSaveModalOpen(false);
            alert('已保存到知识库！');
        } catch (error) {
            console.error('Save failed:', error);
            alert('保存失败，请重试');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async (format: 'word' | 'txt') => {
        const content = activeSource === 'markdown' ? markdownContent : htmlContent;
        if (!content) return alert('没有可导出的内容');

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `AI_Content_${timestamp}`;

        if (format === 'txt') {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, `${filename}.txt`);
        } else if (format === 'word') {
            let htmlToExport = htmlContent;
            if (!htmlToExport && markdownContent) {
                htmlToExport = `<html><body><pre>${markdownContent}</pre></body></html>`;
            }

            try {
                const buffer = await asBlob(htmlToExport);
                saveAs(buffer as any, `${filename}.docx`);
            } catch (e) {
                console.error(e);
                alert('导出 Word 失败');
            }
        }
    };

    const openSaveModal = () => {
        const content = activeSource === 'markdown' ? markdownContent : htmlContent;
        if (!content.trim()) {
            alert('没有可保存的内容');
            return;
        }
        setSaveTitle(`AI生成内容-${new Date().toLocaleDateString()}`);
        setSaveTags('AI生成');
        setIsSaveModalOpen(true);
    };

    const copyToClipboard = () => {
        // Copy what is currently visible or active
        let textToCopy = '';
        if (activeTab === 'editor') textToCopy = markdownContent;
        else if (activeTab === 'code') textToCopy = htmlContent;
        else {
            // In preview, copy the active source
            textToCopy = activeSource === 'markdown' ? markdownContent : htmlContent;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    // Tab Switching Logic
    const handleTabChange = (tab: 'editor' | 'code' | 'preview') => {
        setActiveTab(tab);
        if (tab === 'editor') setActiveSource('markdown');
        if (tab === 'code') setActiveSource('html');
        // If switching to Preview, we stay with whatever valid source we had.
    };

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa] font-sans">
            {/* ... (Header included in original, assuming usage is preserved by careful replacement range) */
                /* Actually, I need to be careful with the range. The range 132-640 covers logic. */
            }
            {/* Header */}
            <header className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#001C46] rounded-lg"> {/* Gartner Navy */}
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#001C46]">智能编辑器</h1> {/* Gartner Navy */}
                        <p className="text-xs text-gray-500">AI Powered Content Engine</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                        <button onClick={() => handleExport('txt')} className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-white hover:text-indigo-600 rounded-md transition-all" title="导出 TXT">
                            TXT
                        </button>
                        <div className="w-px bg-gray-300 my-1 mx-1" />
                        <button onClick={() => handleExport('word')} className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-white hover:text-indigo-600 rounded-md transition-all flex items-center gap-1" title="导出 Word">
                            <FileDown className="w-3 h-3" /> Word
                        </button>
                    </div>
                    <button
                        onClick={openSaveModal}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0071CE] hover:bg-[#005a9e] text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        保存到知识库
                    </button>
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition-all shadow-sm"
                        title="查看历史记录"
                    >
                        <History className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Save Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-[#001C46]">
                            <h3 className="font-bold text-lg text-white">保存到知识库</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#001C46] mb-1">标题</label>
                                <input
                                    type="text"
                                    value={saveTitle}
                                    onChange={e => setSaveTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0071CE] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#001C46] mb-1">标签</label>
                                <input
                                    type="text"
                                    value={saveTags}
                                    onChange={e => setSaveTags(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0071CE] outline-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsSaveModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSaveToKB}
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2 bg-[#0071CE] hover:bg-[#005a9e] text-white rounded-lg transition-colors font-bold"
                                >
                                    {isSaving ? '保存中...' : '确认保存'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-6 gap-6 max-w-[1600px] mx-auto w-full">
                {/* Left Panel: Generation Assistant */}
                <aside className="w-full md:w-[360px] flex flex-col gap-4 shrink-0">
                    {/* ... (Left Panel Content - Generation Assistant) ... */}
                    {/* I'm avoiding re-writing the whole Left Panel to keep message size check in check. 
                        Wait, I need to make sure I don't delete it. 
                        The target range starts at 132 (handleAutoGenerate) and ends at 640. 
                        This covers the entire body of the logic and UI. 
                        So I MUST provide the full UI.
                    */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-[#001C46] font-bold border-b border-gray-100 pb-4">
                            <Wand2 className="w-5 h-5 text-[#0071CE]" />
                            生成助手
                        </div>

                        <div className="flex-1 flex flex-col gap-4">
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">创作需求</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="描述您想生成的内容..."
                                    className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:bg-white focus:border-[#0071CE] focus:ring-2 focus:ring-blue-50 outline-none transition-all text-gray-800 placeholder:text-gray-400 font-medium"
                                />
                                <div className="absolute bottom-3 right-3">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt.trim()}
                                        className="p-3 bg-[#0071CE] hover:bg-[#005a9e] hover:shadow-md disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center justify-center active:scale-95"
                                        title="开始生成"
                                    >
                                        {isGenerating ? (
                                            <Sparkles className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <ArrowRight className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Generation Options */}
                        <div className="flex flex-col gap-2 px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={withTitle} onChange={e => setWithTitle(e.target.checked)} className="accent-[#0071CE] rounded w-3.5 h-3.5" />
                                <span className="text-xs text-gray-600 font-medium group-hover:text-[#0071CE] transition-colors">生成标题 (5个)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={withSummary} onChange={e => setWithSummary(e.target.checked)} className="accent-[#0071CE] rounded w-3.5 h-3.5" />
                                <span className="text-xs text-gray-600 font-medium group-hover:text-[#0071CE] transition-colors">生成摘要 (Summary)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={withRAG} onChange={e => setWithRAG(e.target.checked)} className="accent-[#0071CE] rounded w-3.5 h-3.5" />
                                <span className="text-xs text-gray-600 font-medium group-hover:text-[#0071CE] transition-colors">智能引用知识库 (Smart RAG)</span>
                            </label>
                        </div>

                        <div className="mt-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">快速指令</h4>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    "生成新闻通稿",
                                    "写一封商务邮件",
                                    "总结核心优势",
                                    "优化这段文案",
                                ].map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPrompt(p)}
                                        className="px-3 py-1.5 text-sm bg-white hover:bg-blue-50 text-gray-600 hover:text-[#0071CE] border border-gray-200 hover:border-[#0071CE] rounded px-3 py-1 transition-all truncate max-w-full font-medium"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Panel: Editor/Source/Preview */}
                <section className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
                    {/* Document Tabs */}
                    <div className="flex items-center bg-gray-100 border-b border-gray-200 px-2 overflow-x-auto no-scrollbar">
                        {documents.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => setActiveDocId(doc.id)}
                                className={`group flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] text-xs font-medium border-r border-gray-200 cursor-pointer transition-colors ${activeDocId === doc.id ? 'bg-white text-[#0071CE] border-t-2 border-t-[#0071CE]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                <FileText className={`w-3.5 h-3.5 ${activeDocId === doc.id ? 'text-[#0071CE]' : 'text-gray-400'}`} />
                                <span className="truncate flex-1">{doc.title}</span>
                                <button
                                    onClick={(e) => closeDoc(doc.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 hover:text-red-500 rounded transition-all"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => createNewDoc()}
                            className="p-2 text-gray-400 hover:text-[#0071CE] hover:bg-gray-200 transition-colors"
                            title="New Document"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Editor Tabs (Mode) */}
                    <div className="border-b border-gray-200 px-6 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex gap-6">
                            <button
                                onClick={() => handleTabChange('editor')}
                                className={`relative py-4 px-2 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'editor' ? 'text-[#0071CE]' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                <Wand2 className="w-4 h-4" /> 编辑模式 (Markdown)
                                {activeTab === 'editor' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071CE]" />}
                            </button>
                            <button
                                onClick={() => handleTabChange('code')}
                                className={`relative py-4 px-2 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'code' ? 'text-[#0071CE]' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                <Code className="w-4 h-4" /> 源码视图 (HTML)
                                {activeTab === 'code' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071CE]" />}
                            </button>
                            <button
                                onClick={() => handleTabChange('preview')}
                                className={`relative py-4 px-2 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'preview' ? 'text-[#0071CE]' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                <Eye className="w-4 h-4" /> 效果预览
                                {activeTab === 'preview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071CE]" />}
                            </button>
                        </div>
                        <div className="flex items-center gap-4 py-2">
                            <button
                                onClick={copyToClipboard}
                                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded transition-colors border ${isCopied ? "bg-green-50 text-green-700 border-green-200" : "text-[#0071CE] hover:bg-blue-50 border-transparent hover:border-blue-100"}`}
                            >
                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {isCopied ? '已复制' : '复制内容'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative bg-white">
                        {/* Editor Tab */}
                        {activeTab === 'editor' && (
                            <div className="h-full overflow-hidden">
                                {activeDoc ? (
                                    <AIEditor
                                        key={activeDocId}
                                        initialContent={marked.parse(markdownContent) as string}
                                        onContentChange={(html) => {
                                            const md = turndownService.turndown(html);
                                            updateActiveDoc({ markdown: md, html: html });
                                        }}
                                        className="h-full border-0 shadow-none rounded-none"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                        No active document
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Code Tab */}
                        {activeTab === 'code' && (
                            <div className="w-full h-full relative bg-[#fafafa]">
                                <div className="absolute top-2 right-4 text-[10px] text-gray-400 select-none pointer-events-none font-bold uppercase tracking-wider">
                                    HTML Source Mode
                                </div>
                                <textarea
                                    value={htmlContent}
                                    onChange={(e) => updateActiveDoc({ html: e.target.value, markdown: turndownService.turndown(e.target.value) })}
                                    placeholder="<!-- 在此粘贴 HTML 代码以查看预览效果 -->"
                                    className="w-full h-full p-6 bg-transparent font-mono text-sm text-gray-600 resize-none outline-none leading-relaxed"
                                />
                            </div>
                        )}

                        {/* Preview Tab */}
                        {activeTab === 'preview' && (
                            <div className="absolute inset-0 overflow-auto bg-white p-8 md:p-12 z-20">
                                <div className="prose prose-slate prose-lg max-w-4xl mx-auto prose-headings:font-bold prose-headings:text-[#001C46] prose-p:text-gray-700 prose-a:text-[#0071CE]">
                                    {activeSource === 'markdown' ? (
                                        <MarkdownRenderer content={markdownContent} />
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* History Sidebar */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center">
                        <History className="w-4 h-4 mr-2" /> 生成历史 (History)
                    </h3>
                    <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-gray-200 rounded">
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {history.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-10">暂无历史记录</p>
                    ) : (
                        history.map(item => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white text-left group">
                                <div className="text-xs text-gray-400 mb-1 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(item.created_at).toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2 font-mono bg-gray-50 p-1 rounded">
                                    {item.prompt}
                                </p>
                                <button
                                    onClick={() => {
                                        setPrompt(item.prompt);
                                        createNewDoc(item.markdown_content, `Restored: ${item.prompt.substring(0, 10)}...`);
                                        setIsHistoryOpen(false);
                                    }}
                                    className="w-full mt-1 text-xs bg-indigo-50 text-indigo-600 py-1.5 rounded hover:bg-indigo-100 font-medium transition-colors"
                                >
                                    恢复到新标签 (Restore)
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>



        </div>
    );
};


export default SmartTools;
