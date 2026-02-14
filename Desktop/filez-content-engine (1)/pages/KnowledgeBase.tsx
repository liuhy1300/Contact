import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BookOpen, Plus, Search, Trash2, Save, X, Edit2, Tag, FileText, Globe } from 'lucide-react';
import { KnowledgeItem } from '../types';

const KnowledgeBase: React.FC = () => {
    const [items, setItems] = useState<KnowledgeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [refMode, setRefMode] = useState<'smart' | 'strict'>('smart');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data as KnowledgeItem[]);
        } catch (error) {
            console.error('Error fetching knowledge:', error);
            alert('加载失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item?: KnowledgeItem) => {
        if (item) {
            setEditingId(item.id);
            setTitle(item.title);
            setContent(item.content);
            const tags = Array.isArray(item.tags) ? item.tags : [];
            setTagsInput(tags.join(', '));
            setRefMode(item.ref_mode || 'smart');
        } else {
            setEditingId(null);
            setTitle('');
            setContent('');
            setTagsInput('');
            setRefMode('smart');
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) return alert('标题和内容不能为空');

        const tags = tagsInput.split(/[,，]/).map(t => t.trim()).filter(Boolean);

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('knowledge_base')
                    .update({ title, content, tags, ref_mode: refMode, updated_at: new Date().toISOString() })
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('knowledge_base')
                    .insert({ title, content, tags, ref_mode: refMode });
                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchItems();
        } catch (error: any) {
            console.error('Error saving:', error);
            alert('保存失败: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('确定要删除这条知识吗？')) return;
        try {
            const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
            if (error) throw error;
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (error: any) {
            alert('删除失败: ' + error.message);
        }
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <div className="h-full bg-[#f8f9fa] flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <BookOpen className="w-6 h-6 mr-3 text-indigo-600" />
                        RAG 知识库
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">管理 AI 生成内容的上下文参考知识</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" /> 新增知识
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col p-8 max-w-7xl mx-auto w-full">
                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="搜索知识库 (标题、内容、标签)..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64 text-gray-500">加载中...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex justify-center items-center h-64 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                        暂无知识条目，请点击右上角新增。
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col group">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={item.title}>{item.title}</h3>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(item)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="flex-1 mb-4 overflow-hidden relative">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        {/* Ref Mode Badge */}
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.ref_mode === 'strict' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                            {item.ref_mode === 'strict' ? '🔒 严格参考' : '🧠 智能参考'}
                                        </span>

                                        {/* Status Badge */}
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1
                                                ${item.status === 'indexing' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                item.status === 'failed' ? 'bg-red-50 text-red-600 border-red-200' :
                                                    'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                            {item.status === 'indexing' && <span className="animate-spin text-[8px]">↻</span>}
                                            {item.status === 'indexing' ? '解析中' :
                                                item.status === 'failed' ? '解析失败' :
                                                    '已索引'}
                                        </span>

                                        {/* Slice Count (if > 1) */}
                                        {(item.slice_count || 1) > 1 && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-500 border-slate-200">
                                                📄 {item.slice_count} 切片
                                            </span>
                                        )}
                                    </div>

                                    {/* Source Type Icon */}
                                    <div className="absolute top-0 right-0 opacity-50">
                                        {(!item.source_type || item.source_type === 'text') && <FileText className="w-12 h-12 text-slate-100 -mr-2 -mt-2" />}
                                        {item.source_type === 'pdf' && <FileText className="w-12 h-12 text-red-100 -mr-2 -mt-2" />}
                                        {item.source_type === 'word' && <FileText className="w-12 h-12 text-blue-100 -mr-2 -mt-2" />}
                                        {item.source_type === 'url' && <Globe className="w-12 h-12 text-cyan-100 -mr-2 -mt-2" />}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap relative z-10">{item.content}</p>
                                </div>
                                <div className="flex items-center flex-wrap gap-2 pt-3 border-t border-gray-100">
                                    {Array.isArray(item.tags) && item.tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">
                                            <Tag className="w-3 h-3 mr-1" /> {tag}
                                        </span>
                                    ))}
                                    {(!item.tags || item.tags.length === 0) && <span className="text-xs text-gray-400">无标签</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">{editingId ? '编辑知识' : '新增知识'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">标题</label>
                                <input
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. 产品A的技术规格"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">内容详情</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[200px]"
                                    placeholder="输入详细的知识内容..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">标签 (用逗号分隔)</label>
                                <input
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. 规格, 竞品, 销售, 话术"
                                    value={tagsInput}
                                    onChange={e => setTagsInput(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">参考模式</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${refMode === 'smart' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center">
                                            <input type="radio" name="refMode" value="smart" className="accent-green-600 mr-2" checked={refMode === 'smart'} onChange={() => setRefMode('smart')} />
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">🧠 智能参考</div>
                                                <div className="text-xs text-gray-500 mt-0.5">AI 灵活理解，作为上下文补充</div>
                                            </div>
                                        </div>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${refMode === 'strict' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center">
                                            <input type="radio" name="refMode" value="strict" className="accent-red-600 mr-2" checked={refMode === 'strict'} onChange={() => setRefMode('strict')} />
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">🔒 严格参考</div>
                                                <div className="text-xs text-gray-500 mt-0.5">AI 必须逐字或严格遵循描述</div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">取消</button>
                            <button onClick={handleSave} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center">
                                <Save className="w-4 h-4 mr-2" /> 保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeBase;
