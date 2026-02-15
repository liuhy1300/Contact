// ============================================================
// GEO 优化主页面 — 5 Tab 模式
// ============================================================
import React, { useState } from 'react';
import {
    ModelConfig, AnalysisRequest, BrandAnalysis, GeoMode, Persona,
    SoRResult, CitationMapResult, FactInjectionResult, ScenarioArenaResult,
    SCENARIO_PRESETS, PERSONA_OPTIONS, GeoDashboardMetrics, EngineState
} from '../../types/geo';
import {
    runGeoAnalysis, runSoRAnalysis, analyzeCitationSources,
    generateFactInjection, runScenarioArena
} from '../../services/GeoService';
import GeoDashboard from '../../components/BrandPulse/GeoDashboard';
import GeoCommandInput from '../../components/BrandPulse/GeoCommandInput';
import Dashboard from '../../components/BrandPulse/Dashboard';
import SoRDashboard from '../../components/BrandPulse/SoRDashboard';
import CitationMap from '../../components/BrandPulse/CitationMap';
import FactInjector from '../../components/BrandPulse/FactInjector';
import ScenarioArena from '../../components/BrandPulse/ScenarioArena';
import HackerConsole from '../../components/shared/HackerConsole';
import {
    Search, BarChart3, Link2, Zap, Swords, ArrowLeft,
    Users, ToggleLeft, ToggleRight, ChevronDown
} from 'lucide-react';

// 默认 AI 模型
const DEFAULT_MODELS: ModelConfig[] = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '🤖', enabled: true },
    { id: 'gemini-3-pro', name: 'Gemini 3.0 Pro', provider: 'Google', icon: '✨', enabled: true },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '🧠', enabled: true },
    { id: 'perplexity', name: 'Perplexity', provider: 'Perplexity', icon: '🌐', enabled: true },
];

// Tab 配置
// 战术卡片配置
const TACTICAL_CARDS: { id: GeoMode; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
    { id: 'analysis', label: '排名侦察 (Active)', icon: <Search className="w-5 h-5" />, desc: '全网可见度分析', color: 'blue' },
    { id: 'sor', label: '份额追踪', icon: <BarChart3 className="w-5 h-5" />, desc: 'SoR 占有率', color: 'emerald' },
    { id: 'citation', label: '引文清洗', icon: <Link2 className="w-5 h-5" />, desc: '负面溯源与压制', color: 'amber' },
    { id: 'factinject', label: '事实注入', icon: <Zap className="w-5 h-5" />, desc: 'AI 认知纠偏', color: 'red' },
    { id: 'arena', label: '场景竞技', icon: <Swords className="w-5 h-5" />, desc: 'B2B 场景对抗', color: 'purple' },
];

const GeoOptimization: React.FC = () => {
    // 通用状态
    const [mode, setMode] = useState<GeoMode>('analysis');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [models, setModels] = useState<ModelConfig[]>(DEFAULT_MODELS);

    // 共用输入
    const [brandName, setBrandName] = useState('');
    const [keyword, setKeyword] = useState('');
    const [persona, setPersona] = useState<Persona>('');

    // 各模式结果
    const [analysisResults, setAnalysisResults] = useState<BrandAnalysis[] | null>(null);
    const [sorResult, setSorResult] = useState<SoRResult | null>(null);
    const [citationResult, setCitationResult] = useState<CitationMapResult | null>(null);
    const [factResult, setFactResult] = useState<FactInjectionResult | null>(null);
    const [arenaResult, setArenaResult] = useState<ScenarioArenaResult | null>(null);

    // 事实注入 — 额外输入
    const [knownFacts, setKnownFacts] = useState('');

    // 场景竞技场 — 选择的场景
    const [selectedScenario, setSelectedScenario] = useState(SCENARIO_PRESETS[0].id);

    // 仪表盘数据 (Mock)
    const [dashboardMetrics] = useState<GeoDashboardMetrics>({
        sorScore: 62,
        visibilityLevel: 'High',
        negativeCitations: 2,
        engineCoverage: 4
    });

    // 引擎状态 (Mock)
    const [engineStates] = useState<EngineState[]>([
        { id: 'gpt-4o', name: 'GPT-4o', status: 'online', latency: 120 },
        { id: 'claude', name: 'Claude 3.5', status: 'online', latency: 150 },
        { id: 'perplexity', name: 'Perplexity', status: 'latency', latency: 800 },
        { id: 'gemini', name: 'Gemini', status: 'online', latency: 200 },
    ]);

    // 判断当前模式是否有结果
    const hasResult = () => {
        switch (mode) {
            case 'analysis': return analysisResults !== null;
            case 'sor': return sorResult !== null;
            case 'citation': return citationResult !== null;
            case 'factinject': return factResult !== null;
            case 'arena': return arenaResult !== null;
        }
    };

    // 通用分析入口（从 InputSection 触发）
    const handleAnalyze = async (data: AnalysisRequest) => {
        setBrandName(data.brandName);
        setKeyword(data.keyword);
        setPersona(data.persona || '');
        setIsLoading(true);
        setError(null);

        try {
            const enabledModels = models.filter(m => m.enabled !== false);
            if (mode === 'analysis') {
                const results = await runGeoAnalysis(data.brandName, data.keyword, enabledModels, data.persona);
                setAnalysisResults(results);
            } else if (mode === 'sor') {
                const result = await runSoRAnalysis(data.brandName, data.keyword, data.persona);
                setSorResult(result);
            } else if (mode === 'citation') {
                const result = await analyzeCitationSources(data.brandName, data.keyword, data.persona);
                setCitationResult(result);
            }
        } catch (err) {
            console.error(err);
            setError("分析失败，请检查网络连接或 API 密钥。");
        } finally {
            setIsLoading(false);
        }
    };

    // 事实注入生成
    const handleFactInject = async () => {
        if (!brandName.trim() || !keyword.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateFactInjection(brandName, keyword, knownFacts);
            setFactResult(result);
        } catch (err) {
            console.error(err);
            setError("事实注入生成失败。");
        } finally {
            setIsLoading(false);
        }
    };

    // 场景竞技场
    const handleArenaRun = async () => {
        if (!brandName.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const scenario = SCENARIO_PRESETS.find(s => s.id === selectedScenario) || SCENARIO_PRESETS[0];
            const result = await runScenarioArena(
                brandName, scenario.query, scenario.competitor, scenario.label, persona
            );
            setArenaResult(result);
        } catch (err) {
            console.error(err);
            setError("场景对抗分析失败。");
        } finally {
            setIsLoading(false);
        }
    };

    // 统一各模式的调用逻辑
    const handleCommandAnalyze = () => {
        if (mode === 'factinject') {
            handleFactInject();
        } else if (mode === 'arena') {
            handleArenaRun();
        } else {
            // Analysis, SoR, Citation
            handleAnalyze({
                brandName,
                keyword,
                persona,
                enabledModels: models.filter(m => m.enabled !== false).map(m => m.id) // models state needs to be synced or just use default
            });
        }
    };

    // 重置 — 只清空当前模式的结果
    const handleReset = () => {
        setError(null);
        switch (mode) {
            case 'analysis': setAnalysisResults(null); break;
            case 'sor': setSorResult(null); break;
            case 'citation': setCitationResult(null); break;
            case 'factinject': setFactResult(null); setKnownFacts(''); break;
            case 'arena': setArenaResult(null); break;
        }
    };

    // 切换 Tab — 不清空结果，保留各模式数据
    const handleModeChange = (newMode: GeoMode) => {
        if (isLoading) return; // 加载中禁止切换
        setMode(newMode);
        setError(null);
    };

    return (
        <div className="flex bg-[#F5F7FA] h-full overflow-y-auto font-sans text-slate-900">
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* 顶部仪表盘 */}
                    <GeoDashboard metrics={dashboardMetrics} />

                    {/* 战术卡片导航 */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        {TACTICAL_CARDS.map(card => {
                            const active = mode === card.id;
                            // 颜色映射
                            const activeClass = {
                                blue: 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500',
                                emerald: 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500',
                                amber: 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500',
                                red: 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500',
                                purple: 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500',
                            }[card.color];

                            return (
                                <button
                                    key={card.id}
                                    onClick={() => handleModeChange(card.id)}
                                    className={`relative p-4 rounded-xl border text-left transition-all group hover:scale-[1.02] ${active
                                        ? activeClass + ' shadow-md'
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {active && (
                                        <div className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg rounded-tr-lg ${active ? `bg-${card.color}-500` : '' // Tailwind dynamic class might fail, hardcoding better but keeping simple for now
                                            }`}></div>
                                    )}
                                    <div className={`mb-2 ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity`}>
                                        {card.icon}
                                    </div>
                                    <div className={`text-sm font-bold mb-0.5 ${active ? 'text-slate-900' : 'text-slate-600'}`}>{card.label}</div>
                                    <div className="text-[10px] text-slate-400 font-medium leading-tight">{card.desc}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* 动态作战控制台 (Input) */}
                    <GeoCommandInput
                        mode={mode}
                        brandName={brandName}
                        setBrandName={setBrandName}
                        keyword={keyword}
                        setKeyword={setKeyword}
                        persona={persona}
                        setPersona={setPersona}
                        selectedScenario={selectedScenario}
                        setSelectedScenario={setSelectedScenario}
                        onAnalyze={handleCommandAnalyze}
                        isLoading={isLoading}
                        engines={engineStates}
                    />

                    {/* 结果展示区 */}
                    {hasResult() && (
                        <div className="animate-fade-in-up mt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                                    分析报告: {TACTICAL_CARDS.find(t => t.id === mode)?.label}
                                </h2>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 text-sm text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors shadow-sm flex items-center gap-1.5"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> 清除结果
                                </button>
                            </div>

                            {mode === 'analysis' && analysisResults && (
                                <Dashboard results={analysisResults} brandName={brandName} keyword={keyword} />
                            )}
                            {mode === 'sor' && sorResult && (
                                <SoRDashboard result={sorResult} />
                            )}
                            {mode === 'citation' && citationResult && (
                                <CitationMap result={citationResult} />
                            )}
                            {mode === 'factinject' && factResult && (
                                <FactInjector result={factResult} />
                            )}
                            {mode === 'arena' && arenaResult && (
                                <ScenarioArena result={arenaResult} />
                            )}
                        </div>
                    )}

                    {/* 加载态 */}
                    {isLoading && (
                        <div className="py-10">
                            <HackerConsole
                                scriptId={`geo-${mode}`}
                                isActive={isLoading}
                                brandName={brandName}
                                keyword={keyword}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GeoOptimization;
