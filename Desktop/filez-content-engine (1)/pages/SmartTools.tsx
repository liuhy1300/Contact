
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Wand2, Code, Eye, Save, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { GeminiService } from '../services/GeminiService';
import { supabase } from '../lib/supabaseClient';

const SmartTools: React.FC = () => {
    const location = useLocation();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Dual Buffer System
    const [markdownContent, setMarkdownContent] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [activeSource, setActiveSource] = useState<'markdown' | 'html'>('markdown'); // Tracks which content is "active" for preview

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
        setActiveSource('markdown'); // Reset to markdown mode on generation
        setActiveTab('editor');
        try {
            const result = await GeminiService.generateContent(p);
            setMarkdownContent(prev => prev ? prev + `\n\n${result}` : result);
        } catch (error) {
            console.error('Generation failed:', error);
            alert('生成失败，请检查 API Key 或网络连接。');
        } finally {
            setIsGenerating(false);
        }
    };

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
                    .limit(5); // Limit to top 5 recent items for context

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
            setMarkdownContent(prev => prev ? prev + `\n\n${result}` : result);
            setPrompt('');
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
        // Save whichever content is active? Or always save Markdown if available?
        // User might use this tool just to save HTML snippets. 
        // Let's save the *Active Source* content.
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
                    <button
                        onClick={openSaveModal}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0071CE] hover:bg-[#005a9e] text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        保存到知识库
                    </button>
                </div>
            </header>

            {/* Save Modal (Simplified for brevity in plan) */}
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
                    {/* Tabs */}
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
                            <textarea
                                value={markdownContent}
                                onChange={(e) => setMarkdownContent(e.target.value)}
                                placeholder="# 在此输入 Markdown 内容..."
                                className="w-full h-full p-8 bg-transparent font-sans text-base text-gray-800 resize-none outline-none leading-relaxed"
                                spellCheck={false}
                            />
                        )}

                        {/* Code Tab */}
                        {activeTab === 'code' && (
                            <div className="w-full h-full relative bg-[#fafafa]">
                                <div className="absolute top-2 right-4 text-[10px] text-gray-400 select-none pointer-events-none font-bold uppercase tracking-wider">
                                    HTML Source Mode
                                </div>
                                <textarea
                                    value={htmlContent}
                                    onChange={(e) => setHtmlContent(e.target.value)}
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
                                        <ReactMarkdown
                                            rehypePlugins={[rehypeRaw]}
                                            remarkPlugins={[remarkGfm]}
                                        >
                                            {markdownContent}
                                        </ReactMarkdown>
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SmartTools;
