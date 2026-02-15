import React, { useState } from 'react';
import { Target, Users, Lightbulb, ArrowRight, FileText, List, ChevronRight, Wand2, Paperclip, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    config: any; // Type this properly based on Builder state
    onGenerateOutline: () => void;
    onStartWriting: () => void;
    outline: string[];
    isGeneratingOutline: boolean;
}

const StrategyBrief: React.FC<Props> = ({ config, onGenerateOutline, onStartWriting, outline, isGeneratingOutline }) => {
    const [activeTab, setActiveTab] = useState<'brief' | 'materials'>('brief');
    const [files, setFiles] = useState<File[]>([]);

    return (
        <div className="flex flex-col h-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-200 bg-white">
                <button
                    onClick={() => setActiveTab('brief')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'brief' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileText className="w-4 h-4" /> 策略简报 (Strategy)
                </button>
                <button
                    onClick={() => setActiveTab('materials')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'materials' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Paperclip className="w-4 h-4" /> 参考素材 (Materials)
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'brief' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                        {/* Core Strategy Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                                    <Target className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">核心目标 (Goal)</span>
                                </div>
                                <div className="text-sm font-medium text-slate-800">
                                    {config.selectedJourneyStage?.name || '未设定'}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {config.selectedJourneyStage?.desc}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-purple-600">
                                    <Users className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">目标受众 (Audience)</span>
                                </div>
                                <div className="text-sm font-medium text-slate-800">
                                    {config.selectedAudience?.name || '未设定'}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {config.customAudience || '通用受众群体'}
                                </div>
                            </div>
                        </div>

                        {/* Pain Points & Value */}
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                价值锚点 (Value Proposition)
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">核心痛点</span>
                                    <p className="text-sm text-slate-700 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        {config.customPainPoint || '暂无设定'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">产品价值</span>
                                        <p className="text-sm text-slate-700 mt-1">{config.customCoreValue || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">商业价值</span>
                                        <p className="text-sm text-slate-700 mt-1">{config.customMarketValue || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Outline Generator */}
                        <div className="bg-slate-100 rounded-xl p-1 border border-slate-200">
                            <div className="bg-white rounded-lg p-5 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <List className="w-4 h-4 text-blue-500" />
                                        内容大纲 (Outline)
                                    </h3>
                                    {outline.length === 0 && (
                                        <button
                                            onClick={onGenerateOutline}
                                            disabled={isGeneratingOutline}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                        >
                                            <Wand2 className="w-3 h-3" />
                                            {isGeneratingOutline ? '生成中...' : '生成建议大纲'}
                                        </button>
                                    )}
                                </div>

                                {outline.length > 0 ? (
                                    <div className="space-y-2">
                                        {outline.map((item, index) => (
                                            <div key={index} className="flex items-start gap-2 text-sm text-slate-700 p-2 hover:bg-slate-50 rounded group">
                                                <span className="font-bold text-slate-300 select-none">{index + 1}.</span>
                                                <span className="flex-1">{item}</span>
                                                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                                    {/* Placeholder for re-ordering or editing */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                        <p className="text-xs text-slate-400 mb-2">生成全文前，建议先确认大纲结构</p>
                                        <button
                                            onClick={onGenerateOutline}
                                            disabled={isGeneratingOutline}
                                            className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                                        >
                                            {isGeneratingOutline ? '正在构思...' : '✨ 智能生成大纲'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'materials' && (
                    <div className="h-full flex flex-col p-6 animate-in fade-in duration-300">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const droppedFiles = Array.from(e.dataTransfer.files);
                                // In a real app, you'd upload these. Here we just mock the state.
                                setFiles(prev => [...prev, ...droppedFiles]);
                            }}
                            className="w-full border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-8 text-center hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer group mb-6"
                        >
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h3 className="text-sm font-bold text-indigo-900 mb-1">上传参考素材</h3>
                            <p className="text-xs text-indigo-900/60 mb-4">
                                拖拽 PDF, Word, 或粘贴 URL 到此处 <br />
                                让 AI 学习您的品牌语气或竞品分析
                            </p>
                            <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                                选择文件
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">已添加素材 ({files.length})</h4>
                            {files.length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-4">暂无素材，请上传或关联知识库</p>
                            )}
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-xs font-bold text-slate-700 truncate">{file.name}</h5>
                                        <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Mock Knowledge Base Links */}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">知识库关联 (3)</h4>
                                <div className="space-y-2">
                                    {['2024 Q1 产品白皮书.pdf', '竞品分析报告_v2.docx', '品牌语气指南.md'].map((name, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-indigo-600 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                                            <Paperclip className="w-3 h-3" />
                                            <span className="truncate flex-1">{name}</span>
                                            <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-indigo-400 font-bold">KB</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action */}
            <div className="p-4 border-t border-slate-200 bg-white">
                <button
                    onClick={onStartWriting}
                    disabled={outline.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed group"
                >
                    <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    开始撰写 (Start Writing)
                    <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default StrategyBrief;
