// ============================================================
// GEO 输入区 — 增强版（Persona + 引擎开关）
// ============================================================
import React, { useState } from 'react';
import { AnalysisRequest, ModelConfig, Persona, PERSONA_OPTIONS } from '../../types/geo';
import { Search, Loader2, Users, ToggleLeft, ToggleRight } from 'lucide-react';

interface InputSectionProps {
    onAnalyze: (data: AnalysisRequest) => void;
    isAnalyzing: boolean;
    models: ModelConfig[];
    onModelsChange: (models: ModelConfig[]) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing, models, onModelsChange }) => {
    const [brandName, setBrandName] = useState('');
    const [keyword, setKeyword] = useState('');
    const [persona, setPersona] = useState<Persona>('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (brandName.trim() && keyword.trim()) {
            const enabledModels = models.filter(m => m.enabled !== false).map(m => m.id);
            onAnalyze({ brandName, keyword, persona, enabledModels });
        }
    };

    // 切换单个引擎
    const toggleModel = (id: string) => {
        const updated = models.map(m => m.id === id ? { ...m, enabled: m.enabled === false ? true : false } : m);
        // 至少保留 1 个引擎开启
        if (updated.filter(m => m.enabled !== false).length === 0) return;
        onModelsChange(updated);
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <div className="text-center mb-10 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-5 tracking-tight">
                    GEO 搜索引擎优化透视
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
                    模拟并分析多模型 AI 引擎如何感知您的品牌，追踪推荐份额与引文来源。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 主输入栏 */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-2 md:p-3 flex flex-col md:flex-row gap-2 transition-all hover:shadow-2xl hover:border-blue-500/30">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-medium">品牌:</span>
                        </div>
                        <input
                            type="text"
                            placeholder="例如: Filez, Salesforce..."
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full h-14 pl-16 pr-4 bg-transparent border-transparent rounded-xl focus:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder-slate-400 font-medium text-slate-900"
                            required
                        />
                    </div>

                    <div className="w-px bg-slate-200 my-2 hidden md:block"></div>

                    <div className="flex-[1.5] relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-medium">搜索词:</span>
                        </div>
                        <input
                            type="text"
                            placeholder="例如: 企业网盘推荐, B2B content marketing..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full h-14 pl-20 pr-4 bg-transparent border-transparent rounded-xl focus:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder-slate-400 font-medium text-slate-900"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isAnalyzing || !brandName.trim() || !keyword.trim()}
                        className="h-14 md:px-8 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                <span>分析中...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                <span>深度洞察</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Persona + 高级选项 */}
                <div className="flex items-center justify-between">
                    {/* Persona 选择 */}
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">受众视角:</span>
                        <div className="flex gap-1">
                            {PERSONA_OPTIONS.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPersona(p.id)}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${persona === p.id
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
                                        }`}
                                    title={p.hint}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 引擎配置开关 */}
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs text-slate-400 hover:text-blue-600 transition-colors font-medium"
                    >
                        {showAdvanced ? '收起' : '引擎配置 ▾'}
                    </button>
                </div>

                {/* 引擎开关面板 */}
                {showAdvanced && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-3 font-medium">选择要分析的 AI 引擎（至少保留 1 个）：</p>
                        <div className="flex flex-wrap gap-3">
                            {models.map(m => {
                                const enabled = m.enabled !== false;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => toggleModel(m.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${enabled
                                                ? 'bg-white border-blue-200 text-slate-900 shadow-sm'
                                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                                            }`}
                                    >
                                        <span className="text-lg">{m.icon}</span>
                                        <span>{m.name}</span>
                                        {enabled
                                            ? <ToggleRight className="w-5 h-5 text-blue-500" />
                                            : <ToggleLeft className="w-5 h-5 text-slate-300" />
                                        }
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </form>

            <div className="mt-6 flex justify-center gap-6 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 多模型联合仿真</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> AI 推荐份额追踪</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 引文溯源分析</span>
            </div>
        </div>
    );
};

export default InputSection;
