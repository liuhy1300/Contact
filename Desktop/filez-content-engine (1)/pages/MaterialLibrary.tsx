import React, { useState, useEffect, useRef } from 'react';
import {
    Image as ImageIcon, FileText, Link as LinkIcon, Plus, Trash2,
    ExternalLink, Download, X, Upload, Loader2, MoreVertical
} from 'lucide-react';
import { MaterialItem } from '../types';
import { materialService } from '../lib/materialService';

// --- Components ---

const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---

const MaterialLibrary: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'image' | 'document' | 'link'>('image');
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Upload/Add States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Link Form State
    const [linkForm, setLinkForm] = useState({ name: '', url: '' });

    // Preview State
    const [previewItem, setPreviewItem] = useState<MaterialItem | null>(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await materialService.getMaterials(activeTab);
                setMaterials(data);
            } catch (error) {
                console.error("Failed to fetch materials", error);
                // Could add toast notification here
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab, refreshTrigger]);

    // Handlers
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        // Simple validation based on tab
        if (activeTab === 'image' && !file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }
        if (activeTab === 'document' && file.type.startsWith('image/')) {
            // Just a warning, but allow generic files for docs
            // alert('当前在文档库，建议上传文档');
        }

        setUploading(true);
        try {
            await materialService.uploadFile(file, activeTab as 'image' | 'document');
            setIsUploadModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Upload failed", error);
            alert('上传失败，请重试');
        } finally {
            setUploading(false);
        }
    };

    const handleLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkForm.name || !linkForm.url) return;

        setUploading(true);
        try {
            await materialService.addLink(linkForm.name, linkForm.url);
            setIsLinkModalOpen(false);
            setLinkForm({ name: '', url: '' });
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Add link failed", error);
            alert('添加链接失败');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, url: string, type: string, meta: any) => {
        if (!window.confirm('确定要删除这个素材吗？')) return;

        try {
            await materialService.deleteMaterial(id, type, meta);
            setMaterials(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            alert('删除失败');
        }
    };

    const openAddModal = () => {
        if (activeTab === 'link') {
            setIsLinkModalOpen(true);
        } else {
            setIsUploadModalOpen(true);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">素材库 (Assets)</h1>
                    <p className="text-slate-500 text-sm mt-1">管理图片、文档和常用链接资源</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    <span>
                        {activeTab === 'image' ? '上传图片' : activeTab === 'document' ? '上传文档' : '添加链接'}
                    </span>
                </button>
            </div>

            {/* Tabs */}
            <div className="px-8 pt-6 pb-0 shrink-0 bg-white border-b border-slate-200">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('image')}
                        className={`pb-4 px-1 flex items-center font-medium text-sm transition-colors border-b-2 ${activeTab === 'image'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        图片库
                    </button>
                    <button
                        onClick={() => setActiveTab('document')}
                        className={`pb-4 px-1 flex items-center font-medium text-sm transition-colors border-b-2 ${activeTab === 'document'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        文档资料
                    </button>
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`pb-4 px-1 flex items-center font-medium text-sm transition-colors border-b-2 ${activeTab === 'link'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        链接索引
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                        <p className="text-slate-400">加载素材中...</p>
                    </div>
                ) : materials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            {activeTab === 'image' && <ImageIcon className="w-8 h-8 text-slate-400" />}
                            {activeTab === 'document' && <FileText className="w-8 h-8 text-slate-400" />}
                            {activeTab === 'link' && <LinkIcon className="w-8 h-8 text-slate-400" />}
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">暂无内容</h3>
                        <p className="text-slate-500 mt-1 mb-4">
                            {activeTab === 'image' ? '还没有上传任何图片' : activeTab === 'document' ? '还没有上传任何文档' : '还没有添加任何链接'}
                        </p>
                        <button
                            onClick={openAddModal}
                            className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                        >
                            点击此处添加
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {materials.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                            >
                                {/* Thumbnail / Icon */}
                                <div
                                    className="aspect-square bg-slate-100 relative overflow-hidden cursor-pointer"
                                    onClick={() => item.type === 'image' ? setPreviewItem(item) : window.open(item.url, '_blank')}
                                >
                                    {item.type === 'image' ? (
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : item.type === 'document' ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                            <FileText className="w-12 h-12 text-blue-500 mb-2" />
                                            <span className="text-xs text-slate-400 uppercase font-medium">{item.name.split('.').pop() || 'FILE'}</span>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50/50">
                                            <LinkIcon className="w-10 h-10 text-indigo-400" />
                                        </div>
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {item.type === 'image' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                                                className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-indigo-600 hover:bg-white transition-colors"
                                                title="预览"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }}
                                            className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-indigo-600 hover:bg-white transition-colors"
                                            title={item.type === 'link' ? '访问链接' : '下载/查看'}
                                        >
                                            {item.type === 'link' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.url, item.type, item.meta); }}
                                            className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-red-600 hover:bg-white transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h4 className="font-medium text-slate-800 text-sm truncate" title={item.name}>{item.name}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-slate-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                        {item.meta?.size && (
                                            <span className="text-xs text-slate-400">
                                                {(item.meta.size / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => !uploading && setIsUploadModalOpen(false)}
                title={activeTab === 'image' ? '上传图片' : '上传文档'}
            >
                <div className="text-center">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            accept={activeTab === 'image' ? "image/*" : "*"}
                        />
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <p className="text-slate-900 font-medium">
                            {uploading ? '上传中...' : '点击或拖拽文件到此处'}
                        </p>
                        <p className="text-slate-500 text-sm mt-1">
                            支持 {activeTab === 'image' ? 'JPG, PNG, GIF, WEBP' : 'PDF, DOCX, PPTX 等'}
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Add Link Modal */}
            <Modal
                isOpen={isLinkModalOpen}
                onClose={() => !uploading && setIsLinkModalOpen(false)}
                title="添加链接"
            >
                <form onSubmit={handleLinkSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">链接标题</label>
                        <input
                            type="text"
                            required
                            value={linkForm.name}
                            onChange={e => setLinkForm({ ...linkForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="例如：公司官网首页"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL 地址</label>
                        <input
                            type="url"
                            required
                            value={linkForm.url}
                            onChange={e => setLinkForm({ ...linkForm, url: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="https://example.com"
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : '确认添加'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Image Preview Modal */}
            {previewItem && (
                <div
                    className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
                        onClick={() => setPreviewItem(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={previewItem.url}
                        alt={previewItem.name}
                        className="max-w-full max-h-screen object-contain rounded shadow-2xl"
                    />
                    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                        <span className="inline-block bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md">
                            {previewItem.name}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialLibrary;
