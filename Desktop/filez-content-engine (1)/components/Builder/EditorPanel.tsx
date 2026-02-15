import React, { useState, useEffect } from 'react';
import { Save, FileDown, Copy, Check, Users, Sparkles } from 'lucide-react';
import AIEditor from '../AIEditor';
import MarkdownRenderer from '../MarkdownRenderer';
import { marked } from 'marked';
import TurndownService from 'turndown';

// Mock service for demo - in real app import from services
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

interface Props {
    initialContent?: string;
}

const EditorPanel: React.FC<Props> = ({ initialContent = '' }) => {
    const [content, setContent] = useState(initialContent);
    const [isCopied, setIsCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const [isCollaborating, setIsCollaborating] = useState(false);

    useEffect(() => {
        if (initialContent) setContent(initialContent);
    }, [initialContent]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const [ghostText, setGhostText] = useState("");
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [pendingParagraph, setPendingParagraph] = useState("");

    // Simulate arriving content
    useEffect(() => {
        if (!initialContent) return;
        // In a real app, this would be triggered by a stream
        // For demo, we split content into paragraphs and show them one by one if in ghost mode
        // But here, we'll just simulate a "Ghost Paragraph" appearing
        if (content.length > 50 && !isGhostMode && Math.random() > 0.5) {
            // Randomly trigger ghost mode for demo purposes after some content is there
            // Or explicitly trigger it.
        }
    }, [content]);

    const handleAcceptGhost = () => {
        setContent(prev => prev + "\n\n" + ghostText);
        setGhostText("");
        setIsGhostMode(false);
    };

    const handleRejectGhost = () => {
        setGhostText("Scanning for better alternatives...");
        setTimeout(() => setGhostText("Alternative paragraph based on your feedback..."), 1000);
    };

    // Demo: Trigger ghost text manually for now
    const triggerGhostDemo = () => {
        setIsGhostMode(true);
        setGhostText("");
        const demoText = "此外，通过 Filez 的安全网关技术，企业可以确保所有传输都在加密通道中进行，彻底消除数据泄露隐患。";
        let i = 0;
        const interval = setInterval(() => {
            setGhostText(demoText.slice(0, i));
            i++;
            if (i > demoText.length) clearInterval(interval);
        }, 30);
    };

    const handleCollaborate = () => {
        setIsCollaborating(true);
        setTimeout(() => {
            setIsCollaborating(false);
            alert("已创建 zOffice 协作链接，可分享给团队。");
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`text-sm font-bold transition-colors ${activeTab === 'edit' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        智能编辑
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`text-sm font-bold transition-colors ${activeTab === 'preview' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        阅读预览
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCollaborate}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg transition-all"
                    >
                        {isCollaborating ? <span className="animate-spin">⟳</span> : <Users className="w-3.5 h-3.5" />}
                        zOffice 协同
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {isCopied ? '已复制' : '复制全文'}
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-200 transition-all">
                        <FileDown className="w-3.5 h-3.5" />
                        导出文档
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'edit' ? (
                    <AIEditor
                        initialContent={content} // Note: AIEditor expects HTML usually, but we might pass markdown if we convert it. 
                        // Assuming AIEditor handles basic text or we convert. 
                        // For this demo let's assume raw text/markdown is fine or we parse it.
                        // Actually existing AIEditor likely takes HTML string.
                        // Let's parse markdown to html for initialContent.
                        key={initialContent ? 'loaded' : 'empty'}
                        onContentChange={(html) => {
                            const md = turndownService.turndown(html);
                            setContent(md);
                        }}
                        className="h-full border-0"
                    />
                ) : (
                    <div className="h-full overflow-y-auto p-8 md:p-12 bg-slate-50 relative">
                        <div className="max-w-3xl mx-auto bg-white shadow-sm p-10 min-h-full rounded-xl">
                            <MarkdownRenderer content={content} />

                            {/* Ghost Paragraph Overlay */}
                            {isGhostMode && (
                                <div className="mt-6 border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50/50 rounded-r-lg animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-slate-600 font-mono text-sm leading-relaxed">{ghostText}<span className="animate-pulse inline-block w-2 h-4 bg-indigo-500 ml-1 align-middle"></span></p>

                                    {/* Ghost Controls */}
                                    {ghostText.length > 20 && (
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={handleAcceptGhost} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1">
                                                <Check className="w-3 h-3" /> 保留 (Keep)
                                            </button>
                                            <button onClick={handleRejectGhost} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-amber-500" /> 重写 (Rewrite)
                                            </button>
                                            <button onClick={() => setIsGhostMode(false)} className="px-3 py-1.5 text-slate-400 hover:text-slate-600 text-xs font-medium transition-all">
                                                忽略
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Demo Trigger Button (Temporary) */}
                            {!isGhostMode && (
                                <button onClick={triggerGhostDemo} className="mt-8 px-4 py-2 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-xs font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all w-full flex items-center justify-center gap-2">
                                    <Sparkles className="w-3 h-3" /> 模拟 AI 续写 (Demo Ghost Text)
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorPanel;
