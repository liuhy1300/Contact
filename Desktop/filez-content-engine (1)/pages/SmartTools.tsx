
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, Code, Eye } from 'lucide-react';
import AIEditor from '../components/AIEditor';
import { GeminiService } from '../services/GeminiService';

const SmartTools: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [activeTab, setActiveTab] = useState<'editor' | 'code' | 'preview'>('editor');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const result = await GeminiService.generateContent(prompt);
            setEditorContent(prev => prev ? prev + `<p>${result}</p>` : result);
            setPrompt('');
        } catch (error) {
            console.error('Generation failed:', error);
            alert('生成失败，请检查 API Key 或网络连接。');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(editorContent);
        // Could add a toast here
    };

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa] font-sans">
            {/* Header - Refined Style */}
            <header className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Sparkles className="w-6 h-6 text-[#1a73e8]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-medium text-gray-800">智能编辑器</h1>
                        <p className="text-xs text-gray-500">AI 驱动的创作助手</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Optional Header Actions */}
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-6 gap-6 max-w-[1600px] mx-auto w-full">
                {/* Left Panel: Generation Assistant */}
                <aside className="w-full md:w-[360px] flex flex-col gap-4 shrink-0">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-gray-700 font-medium">
                            <Wand2 className="w-5 h-5 text-[#1a73e8]" />
                            生成助手
                        </div>

                        <div className="flex-1 flex flex-col gap-4">
                            <div className="relative group">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">创作需求</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="描述您想生成的内容..."
                                    className="w-full h-48 p-4 bg-gray-50 border border-transparent rounded-2xl resize-none focus:bg-white focus:border-[#1a73e8] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                                />
                                <div className="absolute bottom-3 right-3">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt.trim()}
                                        className="p-3 bg-[#1a73e8] hover:bg-[#1557b0] hover:shadow-md disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center justify-center active:scale-95"
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

                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">快速指令</h4>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "生成新闻通稿",
                                        "写一封商务邮件",
                                        "总结核心优势",
                                        "优化这段文案",
                                        "翻译成英文"
                                    ].map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPrompt(p)}
                                            className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-[#1a73e8] border border-gray-100 hover:border-blue-100 rounded-full transition-colors truncate max-w-full"
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Panel: Editor/Source/Preview */}
                <section className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 px-6 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex gap-6">
                            {[
                                { id: 'editor', label: '编辑模式', icon: Wand2 },
                                { id: 'code', label: '源码视图', icon: Code },
                                { id: 'preview', label: '效果预览', icon: Eye },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`
                                            relative py-4 px-2 text-sm font-medium flex items-center gap-2 transition-colors
                                            ${isActive ? 'text-[#1a73e8]' : 'text-gray-500 hover:text-gray-700'}
                                        `}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                        {isActive && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8] rounded-t-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {activeTab === 'code' && (
                            <div className="flex items-center gap-4 py-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="text-xs font-medium text-[#1a73e8] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                >
                                    复制全部
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {/* Editor Tab */}
                        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'editor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                            <AIEditor
                                initialContent={editorContent}
                                onContentChange={setEditorContent}
                                className="h-full border-0 rounded-none shadow-none"
                            />
                        </div>

                        {/* Source Code Tab - Editable */}
                        {activeTab === 'code' && (
                            <div className="absolute inset-0 overflow-auto bg-[#fafafa] p-0">
                                <textarea
                                    value={editorContent}
                                    onChange={(e) => setEditorContent(e.target.value)}
                                    placeholder="在此输入 HTML 代码..."
                                    className="w-full h-full p-6 bg-transparent font-mono text-sm text-gray-600 resize-none outline-none leading-relaxed focus:bg-white transition-colors"
                                    spellCheck={false}
                                />
                            </div>
                        )}

                        {/* Preview Tab */}
                        {activeTab === 'preview' && (
                            <div className="absolute inset-0 overflow-auto bg-white p-8">
                                <div
                                    className="prose prose-slate max-w-3xl mx-auto"
                                    dangerouslySetInnerHTML={{ __html: editorContent }}
                                />
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SmartTools;
