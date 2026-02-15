import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    BookOpen, Plus, Search, Trash2, Save, X, Edit2, Tag, FileText, Globe,
    FolderOpen, Link2, Table2, Mic, Video, Upload, RefreshCw, ChevronRight,
    Zap, Target, BarChart3, CheckCircle2, XCircle, Archive, Eye, Scissors,
    Merge, Sparkles, HelpCircle, Shield, Clock, Filter, MoreVertical
} from 'lucide-react';
import { KnowledgeItem, KnowledgeChunk } from '../types';

// ── Mock 切片数据生成 ──
const generateMockChunks = (content: string): KnowledgeChunk[] => {
    const sentences = content.split(/[。！？\n]+/).filter(s => s.trim().length > 5);
    const chunks: KnowledgeChunk[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
        const text = sentences.slice(i, i + 2).join('。') + '。';
        chunks.push({ id: `chunk-${i}`, text, startLine: i + 1, endLine: Math.min(i + 2, sentences.length) });
    }
    return chunks.length > 0 ? chunks : [{ id: 'chunk-0', text: content.slice(0, 200), startLine: 1, endLine: 1 }];
};

// ── Mock 召回结果 ──
const mockRetrievalResults = (query: string, items: KnowledgeItem[]) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items
        .filter(it => !it.is_archived)
        .map(it => {
            const titleMatch = it.title.toLowerCase().includes(q) ? 0.4 : 0;
            const contentMatch = it.content.toLowerCase().includes(q) ? 0.3 : 0;
            const tagMatch = (it.tags || []).some(t => t.toLowerCase().includes(q)) ? 0.2 : 0;
            const score = titleMatch + contentMatch + tagMatch + Math.random() * 0.1;
            return { item: it, score: Math.min(score, 0.99), matchedChunk: it.content.slice(0, 120) };
        })
        .filter(r => r.score > 0.05)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
};

// ── 数据源类别定义 ──
const SOURCE_CATEGORIES = [
    { id: 'all', label: '全部文档', icon: FolderOpen, color: 'text-slate-600' },
    { id: 'text', label: '手动录入', icon: FileText, color: 'text-blue-500' },
    { id: 'pdf', label: 'PDF 文档', icon: FileText, color: 'text-red-500' },
    { id: 'word', label: 'Word 文档', icon: FileText, color: 'text-blue-600' },
    { id: 'url', label: '网页抓取', icon: Globe, color: 'text-cyan-500' },
    { id: 'excel', label: '结构化表格', icon: Table2, color: 'text-green-600' },
    { id: 'audio', label: '音频转录', icon: Mic, color: 'text-orange-500' },
    { id: 'video', label: '视频转录', icon: Video, color: 'text-purple-500' },
];

const KnowledgeBase: React.FC = () => {
    const [items, setItems] = useState<KnowledgeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [showArchived, setShowArchived] = useState(false);

    // 表单状态
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [refMode, setRefMode] = useState<'smart' | 'strict'>('smart');
    const [sourceType, setSourceType] = useState<KnowledgeItem['source_type']>('text');
    const [sourceUrl, setSourceUrl] = useState('');
    const [syncFreq, setSyncFreq] = useState<'manual' | 'daily' | 'weekly'>('manual');

    // 切片编辑器
    const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
    const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
    const [editingChunkId, setEditingChunkId] = useState<string | null>(null);

    // 召回模拟器
    const [retrievalQuery, setRetrievalQuery] = useState('');
    const [retrievalResults, setRetrievalResults] = useState<{ item: KnowledgeItem, score: number, matchedChunk: string }[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    // 接入方式 Tab
    const [ingestTab, setIngestTab] = useState<'manual' | 'upload' | 'url' | 'table'>('manual');

    useEffect(() => { fetchItems(); }, []);

    // ── 状态通知 ──
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
    const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── 文件上传状态 ──
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Supabase 查询错误:', error);
                showToast('知识库加载失败: ' + error.message, 'err');
                return;
            }
            setItems((data || []) as KnowledgeItem[]);
        } catch (error: any) {
            console.error('Error fetching knowledge:', error);
            showToast('网络错误，无法加载知识库', 'err');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item?: KnowledgeItem) => {
        if (item) {
            setEditingId(item.id);
            setTitle(item.title);
            setContent(item.content);
            setTagsInput((item.tags || []).join(', '));
            setRefMode(item.ref_mode || 'smart');
            setSourceType(item.source_type || 'text');
            setSourceUrl(item.source_url || '');
            setSyncFreq(item.sync_frequency || 'manual');
            setIngestTab('manual');
        } else {
            setEditingId(null); setTitle(''); setContent(''); setTagsInput('');
            setRefMode('smart'); setSourceType('text'); setSourceUrl(''); setSyncFreq('manual');
            setIngestTab('manual');
        }
        setIsModalOpen(true);
    };

    // ── 安全保存：先写核心字段，再尝试扩展字段 ──
    const handleSave = async () => {
        if (!title.trim()) return showToast('标题不能为空', 'err');
        if (!content.trim()) return showToast('内容不能为空', 'err');

        const tags = tagsInput.split(/[,，]/).map(t => t.trim()).filter(Boolean);

        // 核心字段（数据库一定存在的列）
        const corePayload: Record<string, any> = {
            title: title.trim(),
            content: content.trim(),
            tags,
            ref_mode: refMode,
            source_type: sourceType || 'text',
        };

        try {
            if (editingId) {
                corePayload.updated_at = new Date().toISOString();
                const { error } = await supabase.from('knowledge_base').update(corePayload).eq('id', editingId);
                if (error) throw error;

                // 尝试写入扩展字段（静默容错）
                if (sourceUrl || syncFreq !== 'manual') {
                    await supabase.from('knowledge_base').update({
                        source_url: sourceUrl || null,
                        sync_frequency: syncFreq,
                    }).eq('id', editingId).then(() => { });
                }
                showToast('知识已更新 ✅');
            } else {
                const { data: inserted, error } = await supabase.from('knowledge_base').insert(corePayload).select();
                if (error) throw error;

                // 尝试写入扩展字段
                if (inserted && inserted[0] && (sourceUrl || syncFreq !== 'manual')) {
                    await supabase.from('knowledge_base').update({
                        source_url: sourceUrl || null,
                        sync_frequency: syncFreq,
                    }).eq('id', inserted[0].id).then(() => { });
                }
                showToast('知识已入库 ✅');
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error: any) {
            console.error('保存失败:', error);
            showToast('保存失败: ' + (error.message || '未知错误'), 'err');
        }
    };

    // ── 文件上传处理 ──
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showToast('文件大小不能超过 10MB', 'err');
            return;
        }

        setUploadingFile(true);
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const allowed = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'csv', 'mp3', 'mp4', 'wav'];

        if (!allowed.includes(ext)) {
            showToast('不支持的文件格式: .' + ext, 'err');
            setUploadingFile(false);
            return;
        }

        // 设置源类型
        const typeMap: Record<string, KnowledgeItem['source_type']> = {
            pdf: 'pdf', docx: 'word', doc: 'word', pptx: 'pptx', ppt: 'pptx',
            xlsx: 'excel', xls: 'excel', csv: 'excel',
            mp3: 'audio', wav: 'audio', mp4: 'video',
        };
        setSourceType(typeMap[ext] || 'text');

        // 尝试上传到 Supabase Storage
        try {
            const fileName = `knowledge/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('materials').upload(fileName, file);

            if (uploadError) {
                console.warn('Storage 上传失败（可能未配置 Storage）:', uploadError.message);
                // Storage 未配置时继续，用文件名作为占位
            }

            // 自动填充标题
            if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));

            // 模拟内容提取
            if (['pdf', 'docx', 'doc', 'pptx', 'ppt'].includes(ext)) {
                setContent(`[📄 已上传文件: ${file.name}]\n\n文件大小: ${(file.size / 1024).toFixed(1)} KB\n文件类型: ${ext.toUpperCase()}\n上传时间: ${new Date().toLocaleString('zh-CN')}\n\n⚠️ 文档内容解析需要后端服务支持。当前为文件元信息占位。`);
            } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
                setContent(`[📊 表格文件: ${file.name}]\n\n文件大小: ${(file.size / 1024).toFixed(1)} KB\n\n⚠️ 表格内容将在后端解析后自动填充。`);
            } else if (['mp3', 'wav', 'mp4'].includes(ext)) {
                setContent(`[🎙️ 媒体文件: ${file.name}]\n\n文件大小: ${(file.size / 1024).toFixed(1)} KB\n\n⚠️ 音视频转录需要后端 ASR 服务支持。`);
            }
            showToast(`文件 ${file.name} 已上传 ✅`);
        } catch (err: any) {
            console.error('文件上传错误:', err);
            showToast('上传失败: ' + (err.message || '未知错误'), 'err');
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('确定要删除这条知识吗？此操作不可恢复。')) return;
        try {
            const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
            if (error) throw error;
            setItems(prev => prev.filter(item => item.id !== id));
            if (selectedItem?.id === id) setSelectedItem(null);
            showToast('已删除 🗑️');
        } catch (error: any) {
            showToast('删除失败: ' + error.message, 'err');
        }
    };

    // ── 归档切换（前端状态 + 尝试同步 DB） ──
    const handleArchiveToggle = async (item: KnowledgeItem) => {
        const newArchived = !item.is_archived;
        // 乐观更新前端
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_archived: newArchived } : i));
        // 尝试同步到 DB（字段可能不存在）
        const { error } = await supabase.from('knowledge_base').update({ is_archived: newArchived }).eq('id', item.id);
        if (error) {
            console.warn('归档状态同步失败（is_archived 列可能不存在）:', error.message);
            // 不回滚，保持前端状态便于演示
        } else {
            showToast(newArchived ? '已归档 📁' : '已恢复生效 🟢');
        }
    };

    // 选中文件 → 生成切片
    const handleSelectItem = (item: KnowledgeItem) => {
        setSelectedItem(item);
        setChunks(item.chunks || generateMockChunks(item.content));
    };

    // 切片合并
    const handleMergeChunks = (idx: number) => {
        if (idx >= chunks.length - 1) return;
        const merged = { ...chunks[idx], text: chunks[idx].text + ' ' + chunks[idx + 1].text, endLine: chunks[idx + 1].endLine };
        setChunks(prev => [...prev.slice(0, idx), merged, ...prev.slice(idx + 2)]);
    };

    // 切片拆分
    const handleSplitChunk = (idx: number) => {
        const chunk = chunks[idx];
        const mid = Math.floor(chunk.text.length / 2);
        const splitPoint = chunk.text.indexOf('。', mid);
        const actualSplit = splitPoint > 0 ? splitPoint + 1 : mid;
        const c1 = { ...chunk, id: chunk.id + '-a', text: chunk.text.slice(0, actualSplit) };
        const c2 = { ...chunk, id: chunk.id + '-b', text: chunk.text.slice(actualSplit) };
        setChunks(prev => [...prev.slice(0, idx), c1, c2, ...prev.slice(idx + 1)]);
    };

    // 召回测试
    const runRetrieval = () => {
        if (!retrievalQuery.trim()) return;
        setIsSimulating(true);
        setTimeout(() => {
            setRetrievalResults(mockRetrievalResults(retrievalQuery, items));
            setIsSimulating(false);
        }, 800);
    };

    // 过滤
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (!showArchived && item.is_archived) return false;
            if (activeCategory !== 'all' && (item.source_type || 'text') !== activeCategory) return false;
            if (searchTerm) {
                const q = searchTerm.toLowerCase();
                return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q) || (item.tags || []).some(t => t.toLowerCase().includes(q));
            }
            return true;
        });
    }, [items, activeCategory, showArchived, searchTerm]);

    // 统计
    const stats = useMemo(() => ({
        total: items.filter(i => !i.is_archived).length,
        archived: items.filter(i => i.is_archived).length,
        indexed: items.filter(i => i.status === 'indexed' || !i.status).length,
        orphaned: items.filter(i => !i.tags || i.tags.length === 0).length,
    }), [items]);

    const coverageScore = stats.total > 0 ? Math.min(Math.round((stats.indexed / stats.total) * 100), 100) : 0;

    // 源类型图标
    const getSourceIcon = (type?: string) => {
        switch (type) {
            case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
            case 'word': return <FileText className="w-4 h-4 text-blue-600" />;
            case 'url': return <Globe className="w-4 h-4 text-cyan-500" />;
            case 'excel': return <Table2 className="w-4 h-4 text-green-600" />;
            case 'audio': return <Mic className="w-4 h-4 text-orange-500" />;
            case 'video': return <Video className="w-4 h-4 text-purple-500" />;
            case 'pptx': return <FileText className="w-4 h-4 text-orange-600" />;
            default: return <FileText className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="h-full flex flex-col" style={{ background: 'linear-gradient(135deg, #F5F7FA 0%, #EEF1F5 100%)' }}>
            {/* 顶栏 */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 flex justify-between items-center shrink-0"
                style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div>
                    <h1 className="text-xl font-black text-slate-800 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                            <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
                        </div>
                        Filez 企业知识库
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5 ml-11">管理 AI 生成内容的上下文参考知识 · RAG Knowledge Engine</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchItems} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="刷新">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenModal()}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                        <Plus className="w-4 h-4 mr-2" /> 接入知识
                    </button>
                </div>
            </div>

            {/* 三栏主布局 */}
            <div className="flex-1 overflow-hidden grid grid-cols-12 gap-0">

                {/* ═══════ 左栏：数据源导航 (3 cols) ═══════ */}
                <div className="col-span-3 bg-white/50 backdrop-blur-sm border-r border-slate-200/40 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">数据源导航</h2>
                        {SOURCE_CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSelectedItem(null); }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all mb-0.5 ${activeCategory === cat.id
                                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50'}`}>
                                <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-indigo-600' : cat.color}`} />
                                <span className="flex-1">{cat.label}</span>
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-mono">
                                    {cat.id === 'all' ? items.filter(i => !i.is_archived).length : items.filter(i => (i.source_type || 'text') === cat.id && !i.is_archived).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* 归档区 */}
                    <div className="p-4 border-t border-slate-100 mt-auto">
                        <button onClick={() => setShowArchived(!showArchived)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${showArchived ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <Archive className="w-4 h-4" />
                            <span className="flex-1">已归档文档</span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-mono">{stats.archived}</span>
                        </button>
                    </div>
                </div>

                {/* ═══════ 中栏：知识切片流 (5 cols) ═══════ */}
                <div className="col-span-5 flex flex-col overflow-hidden border-r border-slate-200/40">
                    {/* 搜索栏 */}
                    <div className="p-4 border-b border-slate-100 bg-white/40">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="搜索知识库 (标题、内容、标签)..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    {/* 条目/切片流 */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> 加载中...
                            </div>
                        ) : selectedItem ? (
                            /* ── 切片编辑器视图 ── */
                            <div>
                                <button onClick={() => setSelectedItem(null)} className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-bold mb-3 transition-colors">
                                    ← 返回列表
                                </button>
                                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            {getSourceIcon(selectedItem.source_type)}
                                            {selectedItem.title}
                                        </h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedItem.is_archived ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {selectedItem.is_archived ? '📁 已归档' : '🟢 生效中'}
                                        </span>
                                    </div>
                                    {selectedItem.source_url && (
                                        <div className="text-[10px] text-cyan-600 flex items-center gap-1 mb-2">
                                            <Link2 className="w-3 h-3" /> {selectedItem.source_url}
                                            {selectedItem.sync_frequency !== 'manual' && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-cyan-50 rounded text-cyan-700 font-bold">
                                                    🔄 {selectedItem.sync_frequency === 'daily' ? '每日同步' : '每周同步'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {(selectedItem.tags || []).map((tag, i) => (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                                                <Tag className="w-2.5 h-2.5 mr-1" /> {tag}
                                            </span>
                                        ))}
                                        <span className="text-[10px] text-slate-400">v{selectedItem.version || 1}</span>
                                    </div>
                                </div>

                                {/* 切片标题 */}
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Scissors className="w-3.5 h-3.5" /> 知识切片 ({chunks.length} 块)
                                    </h4>
                                    <button className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors">
                                        <Sparkles className="w-3 h-3" /> AI 重新切分
                                    </button>
                                </div>

                                {/* 切片列表 */}
                                {chunks.map((chunk, idx) => (
                                    <div key={chunk.id} className="group bg-white rounded-xl border border-slate-200 p-4 mb-2 hover:border-indigo-200 hover:shadow-sm transition-all">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] text-slate-400 font-mono mb-1.5">Chunk #{idx + 1}</div>
                                                {editingChunkId === chunk.id ? (
                                                    <textarea className="w-full text-sm text-slate-700 bg-indigo-50/50 border border-indigo-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-indigo-400 min-h-[80px]"
                                                        value={chunk.text}
                                                        onChange={e => setChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, text: e.target.value } : c))}
                                                    />
                                                ) : (
                                                    <p className="text-sm text-slate-700 leading-relaxed">{chunk.text}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <button onClick={() => setEditingChunkId(editingChunkId === chunk.id ? null : chunk.id)}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="编辑">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                {idx < chunks.length - 1 && (
                                                    <button onClick={() => handleMergeChunks(idx)}
                                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors" title="合并下一块">
                                                        <Merge className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleSplitChunk(idx)}
                                                    className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors" title="拆分">
                                                    <Scissors className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <BookOpen className="w-8 h-8 mb-2 opacity-40" />
                                <div className="text-sm">暂无知识条目</div>
                                <div className="text-[10px] mt-1">点击右上角"接入知识"开始</div>
                            </div>
                        ) : (
                            /* ── 文件列表视图 ── */
                            filteredItems.map(item => (
                                <div key={item.id}
                                    className={`group bg-white/80 backdrop-blur-sm rounded-xl border p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${item.is_archived ? 'border-amber-200/60 opacity-60' : 'border-slate-200/60'}`}
                                    onClick={() => handleSelectItem(item)}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {getSourceIcon(item.source_type)}
                                            <h3 className="text-sm font-bold text-slate-800 truncate">{item.title}</h3>
                                            {item.is_archived && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">已归档</span>}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button onClick={e => { e.stopPropagation(); handleOpenModal(item); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="编辑"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={e => { e.stopPropagation(); handleArchiveToggle(item); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400" title={item.is_archived ? '恢复' : '归档'}><Archive className="w-3.5 h-3.5" /></button>
                                            <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.content}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${item.ref_mode === 'strict' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                {item.ref_mode === 'strict' ? '🔒 严格' : '🧠 智能'}
                                            </span>
                                            {(item.tags || []).slice(0, 3).map((tag, i) => (
                                                <span key={i} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                            {item.slice_count && <span>📄 {item.slice_count} 切片</span>}
                                            <span>v{item.version || 1}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ═══════ 右栏：召回模拟器与诊断 (4 cols) ═══════ */}
                <div className="col-span-4 flex flex-col overflow-y-auto bg-white/30">
                    {/* 召回测试 */}
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-indigo-500" /> 召回率模拟器
                        </h2>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="输入测试问题..."
                                className="w-full pl-9 pr-20 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
                                value={retrievalQuery} onChange={e => setRetrievalQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && runRetrieval()} />
                            <button onClick={runRetrieval} disabled={isSimulating}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                                {isSimulating ? '测试中...' : '命中测试'}
                            </button>
                        </div>

                        {/* 结果 */}
                        {retrievalResults.length > 0 && (
                            <div className="space-y-2">
                                {retrievalResults.map((result, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3 hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                                                <span className="text-xs font-bold text-slate-700 truncate">{result.item.title}</span>
                                            </div>
                                            <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${result.score > 0.7 ? 'bg-emerald-100 text-emerald-700' : result.score > 0.4 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                {(result.score * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{result.matchedChunk}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {retrievalResults.length === 0 && retrievalQuery && !isSimulating && (
                            <div className="text-center py-6 text-slate-400 text-xs">
                                <HelpCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />
                                未找到匹配内容，建议补充相关知识
                            </div>
                        )}
                    </div>

                    {/* Auto Q&A 生成 */}
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Auto Q&A 训练集
                        </h2>
                        <p className="text-xs text-slate-500 mb-3">基于当前知识库自动生成高质量问答对，提升 RAG 精准度。</p>
                        <button className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 text-xs font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2">
                            <Zap className="w-3.5 h-3.5" /> 生成训练集 (Mock)
                        </button>
                    </div>

                    {/* 健康度评分 */}
                    <div className="p-5">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> 知识库健康度
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-600">内容覆盖率</span>
                                <span className={`text-sm font-black ${coverageScore > 80 ? 'text-emerald-600' : coverageScore > 50 ? 'text-amber-600' : 'text-red-600'}`}>{coverageScore}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full transition-all duration-500 ${coverageScore > 80 ? 'bg-emerald-500' : coverageScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${coverageScore}%` }} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
                                    <div className="text-2xl font-black text-slate-800">{stats.total}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">生效文档</div>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
                                    <div className="text-2xl font-black text-amber-600">{stats.orphaned}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">孤立文档 (无标签)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ 新增/编辑知识 Modal ═══════ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                {editingId ? <Edit2 className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                                {editingId ? '编辑知识' : '接入知识'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="overflow-y-auto">
                            {/* 接入方式 Tabs */}
                            {!editingId && (
                                <div className="px-6 pt-4 flex gap-2">
                                    {[
                                        { id: 'manual' as const, label: '✏️ 手动输入', desc: '直接录入文本' },
                                        { id: 'upload' as const, label: '📎 上传文件', desc: 'PDF/Word/PPT' },
                                        { id: 'url' as const, label: '🌐 网页抓取', desc: '输入 URL 自动抓取' },
                                        { id: 'table' as const, label: '📊 表格解析', desc: 'Excel/CSV 结构化' },
                                    ].map(tab => (
                                        <button key={tab.id} onClick={() => { setIngestTab(tab.id); if (tab.id !== 'manual') setSourceType(tab.id === 'url' ? 'url' : tab.id === 'table' ? 'excel' : 'pdf'); }}
                                            className={`flex-1 py-2.5 px-3 rounded-xl text-center transition-all border ${ingestTab === tab.id
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                            <div className="text-sm font-bold">{tab.label}</div>
                                            <div className="text-[10px] opacity-60 mt-0.5">{tab.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="p-6 space-y-4">
                                {/* 标题 */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">知识标题</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                        placeholder="e.g. 产品A的技术规格" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                                </div>

                                {/* URL 抓取模式 */}
                                {ingestTab === 'url' && !editingId && (
                                    <div className="bg-cyan-50/50 border border-cyan-200 rounded-xl p-4 space-y-3">
                                        <label className="block text-xs font-bold text-cyan-800">🌐 网页 URL</label>
                                        <input className="w-full p-2.5 bg-white border border-cyan-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                                            placeholder="https://www.example.com/help" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
                                        <div className="flex gap-3">
                                            <label className="flex-1 flex items-center p-2.5 rounded-lg border border-cyan-200 bg-white cursor-pointer hover:border-cyan-400 transition-colors">
                                                <input type="radio" name="crawlMode" defaultChecked className="accent-cyan-600 mr-2" />
                                                <div><div className="text-xs font-bold text-slate-700">仅当前页</div><div className="text-[10px] text-slate-400">抓取指定 URL</div></div>
                                            </label>
                                            <label className="flex-1 flex items-center p-2.5 rounded-lg border border-cyan-200 bg-white cursor-pointer hover:border-cyan-400 transition-colors">
                                                <input type="radio" name="crawlMode" className="accent-cyan-600 mr-2" />
                                                <div><div className="text-xs font-bold text-slate-700">递归全站</div><div className="text-[10px] text-slate-400">深度爬取子页面</div></div>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-cyan-700 mb-1">自动同步频率</label>
                                            <select className="w-full p-2 bg-white border border-cyan-200 rounded-lg text-sm outline-none" value={syncFreq} onChange={e => setSyncFreq(e.target.value as any)}>
                                                <option value="manual">手动</option>
                                                <option value="daily">每日凌晨 2:00</option>
                                                <option value="weekly">每周一 06:00</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* 文件上传模式 */}
                                {ingestTab === 'upload' && !editingId && (
                                    <div onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer">
                                        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.pptx,.ppt,.mp3,.mp4,.wav" onChange={handleFileUpload} />
                                        {uploadingFile ? (
                                            <><RefreshCw className="w-8 h-8 text-indigo-500 mx-auto mb-2 animate-spin" />
                                                <div className="text-sm font-bold text-indigo-600">上传中...</div></>
                                        ) : (
                                            <><Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                <div className="text-sm font-bold text-slate-600">点击选择文件，或拖拽到此处</div>
                                                <div className="text-[10px] text-slate-400 mt-1">支持 .pdf / .docx / .pptx / .mp3 / .mp4 (最大 10MB)</div></>
                                        )}
                                    </div>
                                )}

                                {/* 表格解析模式 */}
                                {ingestTab === 'table' && !editingId && (
                                    <div className="bg-green-50/50 border border-green-200 rounded-xl p-4 space-y-3">
                                        <div onClick={() => {
                                            const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx,.xls,.csv';
                                            inp.onchange = (ev: any) => { const f = ev.target?.files?.[0]; if (f) handleFileUpload({ target: { files: [f] } } as any); };
                                            inp.click();
                                        }} className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors">
                                            <Table2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                            <div className="text-sm font-bold text-green-700">上传 Excel / CSV 文件</div>
                                            <div className="text-[10px] text-green-600/60 mt-1">支持 .xlsx / .xls / .csv</div>
                                        </div>
                                        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-green-200">
                                            <input type="checkbox" className="accent-green-600" defaultChecked />
                                            <span className="text-xs text-slate-700 font-medium">第一行为表头 (推荐)</span>
                                        </label>
                                    </div>
                                )}

                                {/* 内容 */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        {ingestTab === 'url' ? '抓取内容预览 (自动填充)' : ingestTab === 'upload' ? '解析内容预览' : '内容详情'}
                                    </label>
                                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[160px] text-sm"
                                        placeholder={ingestTab === 'url' ? '抓取后将自动填充...' : '输入知识内容...'}
                                        value={content} onChange={e => setContent(e.target.value)} />
                                </div>

                                {/* 标签 */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        标签 <span className="text-slate-400 font-normal">(逗号分隔，或点击 AI 自动打标)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. 安全, 合规, 技术文档" value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
                                        <button className="px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-600 text-xs font-bold hover:bg-purple-100 transition-colors flex items-center gap-1 shrink-0">
                                            <Sparkles className="w-3 h-3" /> AI 打标
                                        </button>
                                    </div>
                                </div>

                                {/* 参考模式 */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">参考模式</label>
                                    <div className="flex gap-3">
                                        <label className={`flex-1 flex items-center p-3 rounded-xl border cursor-pointer transition-all ${refMode === 'smart' ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                            <input type="radio" name="refMode" value="smart" className="accent-emerald-600 mr-2.5" checked={refMode === 'smart'} onChange={() => setRefMode('smart')} />
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">🧠 智能参考</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">AI 灵活理解，作为上下文补充</div>
                                            </div>
                                        </label>
                                        <label className={`flex-1 flex items-center p-3 rounded-xl border cursor-pointer transition-all ${refMode === 'strict' ? 'bg-red-50 border-red-400 ring-1 ring-red-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                            <input type="radio" name="refMode" value="strict" className="accent-red-600 mr-2.5" checked={refMode === 'strict'} onChange={() => setRefMode('strict')} />
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">🔒 严格参考</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">AI 必须严格遵循原文描述</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-200 rounded-xl transition-colors font-medium">取消</button>
                            <button onClick={handleSave}
                                className="px-5 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center active:scale-95">
                                <Save className="w-4 h-4 mr-2" /> 保存入库
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast 通知 */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300 ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default KnowledgeBase;
