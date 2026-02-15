import React, { useRef } from 'react';
import { GeoMode, Persona, PERSONA_OPTIONS, ScenarioPreset, SCENARIO_PRESETS } from '../../types/geo';
import { Search, Zap, FileText, Upload, Swords, ChevronDown, Link, RefreshCw } from 'lucide-react';
import EngineStatusStrip from './EngineStatusStrip';
import { EngineState } from '../../types/geo';

interface GeoCommandInputProps {
    mode: GeoMode;
    brandName: string;
    setBrandName: (v: string) => void;
    keyword: string;
    setKeyword: (v: string) => void;
    persona: Persona;
    setPersona: (v: Persona) => void;
    selectedScenario: string;
    setSelectedScenario: (v: string) => void;
    onAnalyze: () => void;
    isLoading: boolean;
    engines: EngineState[];
}

const HIGH_FREQ_PRESETS = [
    { label: '企业网盘排行', keyword: '企业网盘排行榜 2024' },
    { label: '最安全的文件传输', keyword: '最安全的大文件传输软件' },
    { label: 'Filez vs 百度', keyword: '联想Filez 和 百度网盘企业版 对比' },
    { label: '信创办公', keyword: '信创国产化协同办公软件' },
];

const GeoCommandInput: React.FC<GeoCommandInputProps> = ({
    mode, brandName, setBrandName, keyword, setKeyword,
    persona, setPersona, selectedScenario, setSelectedScenario,
    onAnalyze, isLoading, engines
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePresetClick = (kw: string) => {
        setKeyword(kw);
    };

    // 渲染不同的输入区域
    const renderInputArea = () => {
        if (mode === 'factinject') {
            return (
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="品牌名称 (例如 Filez)"
                            className="w-full h-14 pl-5 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                        />
                    </div>
                    <div className="flex-[2] relative">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-14 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 hover:border-blue-400 hover:text-blue-600 transition-all text-slate-500 font-medium"
                        >
                            <Upload className="w-5 h-5" />
                            <span>上传技术参数表 (PDF/Excel)</span>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" />
                    </div>
                    <button
                        onClick={onAnalyze}
                        disabled={isLoading || !brandName.trim()}
                        className="h-14 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 min-w-[180px] justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        生成 JSON-LD
                    </button>
                </div>
            );
        }

        if (mode === 'arena') {
            return (
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Swords className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="我方品牌 (Filez)"
                            className="w-full h-14 pl-10 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                        />
                    </div>
                    <div className="flex-[1.5] relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                        <select
                            value={selectedScenario}
                            onChange={(e) => setSelectedScenario(e.target.value)}
                            className="w-full h-14 pl-10 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 appearance-none cursor-pointer"
                        >
                            {SCENARIO_PRESETS.map(s => (
                                <option key={s.id} value={s.id}>{s.label} (vs {s.competitor})</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={onAnalyze}
                        disabled={isLoading || !brandName.trim()}
                        className="h-14 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 min-w-[140px] justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
                        开战
                    </button>
                </div>
            );
        }

        // Default: Analysis, SoR, Citation
        return (
            <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-[0.8] relative">
                    <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="品牌 (例如 Filez)"
                        className="w-full h-14 pl-5 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                </div>
                <div className="flex-[2] relative">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="输入搜索指令 (例如：企业网盘私有化部署排名)"
                        className="w-full h-14 pl-5 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                    {/* 快速搜索指令按钮 */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                            onClick={() => onAnalyze()}
                            disabled={isLoading || !brandName.trim() || !keyword.trim()}
                            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            <span className="hidden sm:inline">深度洞察</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 shadow-inner space-y-4">
            {/* 顶部标签行：高频词 或 状态提示 */}
            <div className="flex justify-between items-center h-8">
                {mode === 'analysis' ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap hidden sm:block">高频热词:</span>
                        {HIGH_FREQ_PRESETS.map((p, idx) => (
                            <button
                                key={idx}
                                onClick={() => handlePresetClick(p.keyword)}
                                className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all whitespace-nowrap"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {mode === 'factinject' ? 'AI 认知纠偏' : mode === 'arena' ? '场景对抗模拟' : 'AI 搜索引擎指令'}
                    </div>
                )}
                {/* 引擎状态 */}
                <div className="hidden md:block">
                    <EngineStatusStrip engines={engines} />
                </div>
            </div>

            {/* 动态输入区 */}
            {renderInputArea()}

            {/* 底部配置行：Persona + 引擎 (Mobile) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">受众视角:</span>
                    <div className="flex gap-1 flex-wrap">
                        {PERSONA_OPTIONS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setPersona(p.id)}
                                className={`text-xs px-2 py-1 rounded-md font-medium transition-all ${persona === p.id
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:hidden">
                    <EngineStatusStrip engines={engines} />
                </div>
            </div>
        </div>
    );
};

export default GeoCommandInput;
