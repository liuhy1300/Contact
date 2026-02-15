import React from 'react';
import { Settings, BookOpen, Wand2, RefreshCw, ChevronLeft, Sliders } from 'lucide-react';

interface Props {
    config: any;
    onBack: () => void;
}

const CopilotSidebar: React.FC<Props> = ({ config, onBack }) => {
    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">写作助手</h3>
                    <p className="text-[10px] text-slate-400">Copilot Active</p>
                </div>
            </div>

            {/* Context Summary */}
            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* Strategy Context */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <Sliders className="w-3 h-3" />
                        策略参数
                    </h4>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
                        <div>
                            <span className="text-[10px] text-slate-400 block">受众</span>
                            <span className="text-xs font-bold text-slate-700">{config.selectedAudience?.name}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 block">语气</span>
                            <span className="text-xs font-bold text-slate-700">{config.selectedTone?.name}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 block">核心痛点</span>
                            <p className="text-xs text-slate-600 line-clamp-2">{config.customPainPoint}</p>
                        </div>
                        <button className="w-full mt-2 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">
                            微调参数
                        </button>
                    </div>
                </div>

                {/* Knowledge Base */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <BookOpen className="w-3 h-3" />
                        引用知识库
                    </h4>
                    <div className="space-y-2">
                        <div className="bg-blue-50/50 border border-blue-100 p-2 rounded text-[10px] text-blue-800 flex items-center gap-2 cursor-pointer hover:bg-blue-50 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Filez 产品白皮书 (V6.0)
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 p-2 rounded text-[10px] text-blue-800 flex items-center gap-2 cursor-pointer hover:bg-blue-50 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            竞品分析报告_2024Q1
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">AI 快捷指令</h4>
                <div className="grid grid-cols-2 gap-2">
                    <button className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group">
                        <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 mb-1" />
                        <span className="text-[10px] font-medium text-slate-600 group-hover:text-indigo-600">重写段落</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group">
                        <Wand2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 mb-1" />
                        <span className="text-[10px] font-medium text-slate-600 group-hover:text-indigo-600">润色扩写</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CopilotSidebar;
