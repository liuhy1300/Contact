
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GeneratedPrompt } from '../types';
import { Copy, Trash2, Calendar, FileText, ChevronRight, Check } from 'lucide-react';

const History: React.FC = () => {
    const [history, setHistory] = useState<GeneratedPrompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Detail view
    const [selectedPrompt, setSelectedPrompt] = useState<GeneratedPrompt | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('generated_prompts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (err: any) {
            console.error("Failed to fetch history:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Delete this record?")) return;

        try {
            const { error } = await supabase
                .from('generated_prompts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setHistory(prev => prev.filter(p => p.id !== id));
            if (selectedPrompt?.id === id) setSelectedPrompt(null);
        } catch (err: any) {
            alert("Delete failed: " + err.message);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleString('zh-CN', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="h-full bg-slate-50 flex overflow-hidden">
            {/* List Column */}
            <div className={`w-full md:w-1/3 bg-white border-r border-slate-200 flex flex-col ${selectedPrompt ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h1 className="text-lg font-bold text-slate-800">生成历史 (History)</h1>
                    <button onClick={fetchHistory} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">刷新</button>
                </div>

                {loading && <div className="p-10 text-center text-slate-400">Loading...</div>}

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {history.length === 0 && !loading && (
                        <div className="p-10 text-center text-slate-400 text-sm">暂无历史记录</div>
                    )}

                    {history.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedPrompt(item)}
                            className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedPrompt?.id === item.id ? "bg-red-50/50 border-l-4 border-l-red-600" : "border-l-4 border-l-transparent"}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-slate-700 line-clamp-1">
                                    {item.prompt_content.split('\n')[0].replace('# Role', '').trim() || "Untitled Prompt"}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center shrink-0 ml-2">
                                    <Calendar className="w-3 h-3 mr-1" /> {formatDate(item.created_at)}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mb-2 h-8">
                                {item.prompt_content}
                            </p>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-1">
                                    {item.settings?.role && <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] text-slate-500">{item.settings.role}</span>}
                                    {item.settings?.format && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px]">{item.settings.format}</span>}
                                </div>
                                <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="p-1 text-slate-300 hover:text-red-500 rounded"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Column */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 ${selectedPrompt ? 'flex fixed inset-0 z-50 md:static' : 'hidden md:flex'}`}>
                {selectedPrompt ? (
                    <>
                        <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm">
                            <button onClick={() => setSelectedPrompt(null)} className="md:hidden text-slate-500 mr-2"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                            <div className="flex-1">
                                <h2 className="text-sm font-bold text-slate-800">Prompt详情</h2>
                                <p className="text-xs text-slate-500">Created: {formatDate(selectedPrompt.created_at)}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(selectedPrompt.prompt_content)}
                                className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold transition-all ${isCopied ? "bg-green-600 text-white" : "bg-red-600 text-white hover:bg-red-700"}`}
                            >
                                {isCopied ? <Check className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />}
                                {isCopied ? "已复制" : "复制全文"}
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-hidden">
                            <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500" />
                                <div className="h-full overflow-auto p-6 scrollbar-thin">
                                    <pre className="font-mono text-sm leading-relaxed text-slate-600 whitespace-pre-wrap break-words">
                                        {selectedPrompt.prompt_content}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <FileText className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-sm">Select a prompt to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
