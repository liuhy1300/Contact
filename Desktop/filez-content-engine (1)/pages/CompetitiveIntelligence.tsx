import React, { useState, useRef, useEffect } from 'react';
import {
    generateAnalysis, generateComparison, generateBrandIndex,
    generateBattleCard, generateToneGuard, generateSentimentRadar, generateBrandKit
} from '../services/StratagemService';
import {
    CompetitorAnalysis, ComparisonResult, BrandVitalityResult,
    BattleCardResult, ToneGuardResult, SentimentRadarResult, BrandKitResult,
    AnalysisRequest, AnalysisMode, HistoryItem
} from '../types/stratagem';
import {
    INDUSTRIES,
    FOCUS_PRESETS_MAP, PERSPECTIVES_MAP,
    FOCUS_PRESETS_BATTLECARD, FOCUS_PRESETS_SENTIMENT, FOCUS_PRESETS_BRANDKIT
} from '../constants/stratagem';
import BrandHealthDashboard from '../components/Stratagem/BrandHealthDashboard';
import MarketRadarChart from '../components/Stratagem/MarketRadarChart';
import SWOTMatrix from '../components/Stratagem/SWOTMatrix';
import AdminDashboard from '../components/Stratagem/AdminDashboard';
import NewsFeed from '../components/Stratagem/NewsFeed';
import ComparisonView from '../components/Stratagem/ComparisonView';
import BrandIndexView from '../components/Stratagem/BrandIndexView';
import BattleCardView from '../components/Stratagem/BattleCardView';
import ToneGuardView from '../components/Stratagem/ToneGuardView';
import SentimentView from '../components/Stratagem/SentimentView';
import BrandKitView from '../components/Stratagem/BrandKitView';
import {
    Search, Upload, Zap, Target, DollarSign,
    Megaphone, ArrowRight, Loader2, CheckCircle2,
    LayoutDashboard, Home, Users, LineChart, Plus, X, Globe,
    ThumbsUp, ThumbsDown, ExternalLink, Network, Building2,
    UserCog, HeartHandshake, Briefcase, TrendingUp, Clock, AlertCircle,
    Swords, ShieldCheck, Radio, Package, ChevronDown
} from 'lucide-react';
import HackerConsole from '../components/shared/HackerConsole';

// ============================================================
// 7 模式配置 (分组)
// ============================================================
const INSIGHT_MODES: { id: AnalysisMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'single', label: '深度单品洞察', icon: <Search className="w-5 h-5 text-blue-500" />, desc: '全维度分析单个竞品' },
    { id: 'compare', label: '竞品横向对标', icon: <Users className="w-5 h-5 text-indigo-500" />, desc: '多品牌对比' },
    { id: 'index', label: 'VISA 品牌审计', icon: <LineChart className="w-5 h-5 text-emerald-500" />, desc: '品牌生命力评分' },
    { id: 'sentiment', label: '舆情危机模拟', icon: <Radio className="w-5 h-5 text-amber-500" />, desc: 'B2B 渠道舆情' },
];

const OPERATION_MODES: { id: AnalysisMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'battlecard', label: '场景化攻防卡', icon: <Swords className="w-5 h-5 text-rose-500" />, desc: '销售 Battle Card' },
    { id: 'toneguard', label: '品牌语调卫士', icon: <ShieldCheck className="w-5 h-5 text-teal-500" />, desc: '内容语调审查' },
    { id: 'brandkit', label: '品牌工具包', icon: <Package className="w-5 h-5 text-violet-500" />, desc: '一键营销物料' },
];

const ALL_MODES = [...INSIGHT_MODES, ...OPERATION_MODES];

const CompetitiveIntelligence: React.FC = () => {
    const [view, setView] = useState<'home' | 'admin'>('home');
    const [mode, setMode] = useState<AnalysisMode>('single');
    const [loading, setLoading] = useState(false);

    // 所有模式的结果状态
    const [singleResult, setSingleResult] = useState<CompetitorAnalysis | null>(null);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [brandIndexResult, setBrandIndexResult] = useState<BrandVitalityResult | null>(null);
    const [battleCardResult, setBattleCardResult] = useState<BattleCardResult | null>(null);
    const [toneGuardResult, setToneGuardResult] = useState<ToneGuardResult | null>(null);
    const [sentimentResult, setSentimentResult] = useState<SentimentRadarResult | null>(null);
    const [brandKitResult, setBrandKitResult] = useState<BrandKitResult | null>(null);

    // 历史记录
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // 表单数据 — 从 localStorage 恢复
    const [formData, setFormData] = useState<AnalysisRequest>(() => {
        const saved = localStorage.getItem('stratagem_formData');
        return saved ? JSON.parse(saved) : {
            competitorName: 'Filez',
            competitorNames: [],
            brandIndexName: '',
            mode: 'single',
            perspective: '',
            focusPreset: '',
            industry: '',
            scenario: '',
            articleText: '',
            productSellingPoints: '',
            productNameForKit: '',
        };
    });

    // 持久化
    useEffect(() => {
        localStorage.setItem('stratagem_formData', JSON.stringify(formData));
    }, [formData]);

    const [compareInput, setCompareInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const addCompetitor = () => {
        if (compareInput.trim()) {
            const currentNames = formData.competitorNames || [];
            if (currentNames.length >= 4) {
                setError("最多对比4个品牌");
                return;
            }
            setFormData(prev => ({
                ...prev,
                competitorNames: [...currentNames, compareInput.trim()]
            }));
            setCompareInput('');
            setError(null);
        }
    };

    const removeCompetitor = (index: number) => {
        const newNames = [...(formData.competitorNames || [])];
        newNames.splice(index, 1);
        setFormData(prev => ({ ...prev, competitorNames: newNames }));
    };

    // 清空所有结果
    const clearResults = () => {
        setSingleResult(null);
        setComparisonResult(null);
        setBrandIndexResult(null);
        setBattleCardResult(null);
        setToneGuardResult(null);
        setSentimentResult(null);
        setBrandKitResult(null);
    };

    const handleModeSwitch = (newMode: AnalysisMode) => {
        setMode(newMode);
        // 切换模式时，重置表单的部分字段，尤其是动态字段
        setFormData(prev => ({
            ...prev,
            mode: newMode,
            focusPreset: '',
            perspective: '',
            // 保留通用字段如 industry, concern 也许更好，但这里先不清除
        }));
        clearResults();
        setError(null);
    };

    // 主分析函数
    const handleAnalysis = async () => {
        setLoading(true);
        setError(null);

        try {
            // 构建请求，注入 perspective + focusPreset
            const request: AnalysisRequest = {
                ...formData,
                mode,
                // 将 focusPreset 的 prompt 拼入 context
                context: buildEnrichedContext(),
            };

            switch (mode) {
                case 'single': {
                    if (!formData.competitorName) throw new Error("请输入品牌名称");
                    const result = await generateAnalysis(request);
                    setSingleResult(result);
                    addToHistory('single', result.competitorName, result.executiveSummary, result);
                    break;
                }
                case 'compare': {
                    if (!formData.competitorNames || formData.competitorNames.length < 2) throw new Error("请至少输入2个竞品");
                    const result = await generateComparison(request);
                    setComparisonResult(result);
                    addToHistory('compare', `对标: ${formData.competitorNames.join(' vs ')}`, result.summary, result);
                    break;
                }
                case 'index': {
                    if (!formData.brandIndexName) throw new Error("请输入品牌名称");
                    const result = await generateBrandIndex(request);
                    setBrandIndexResult(result);
                    addToHistory('index', result.brand_name, result.summary_one_liner, result);
                    break;
                }
                case 'battlecard': {
                    if (!formData.competitorName) throw new Error("请输入竞品名称");
                    if (!formData.industry) throw new Error("请选择目标行业");
                    if (!formData.scenario) throw new Error("请输入竞争场景");
                    const result = await generateBattleCard(request);
                    setBattleCardResult(result);
                    addToHistory('battlecard', `攻防卡: ${result.competitorName}`, result.winStrategy, result);
                    break;
                }
                case 'toneguard': {
                    if (!formData.articleText || formData.articleText.trim().length < 50) throw new Error("请粘贴待审查稿件（至少50字）");
                    const result = await generateToneGuard(request);
                    setToneGuardResult(result);
                    addToHistory('toneguard', `语调审查 (${result.complianceScore}分)`, result.toneAnalysis, result);
                    break;
                }
                case 'sentiment': {
                    if (!formData.competitorName) throw new Error("请输入品牌名称");
                    const result = await generateSentimentRadar(request);
                    setSentimentResult(result);
                    addToHistory('sentiment', `舆情: ${result.brandName}`, `情感分 ${result.sentimentScore}`, result);
                    break;
                }
                case 'brandkit': {
                    if (!formData.productNameForKit) throw new Error("请输入产品名称");
                    if (!formData.productSellingPoints) throw new Error("请输入核心卖点");
                    const result = await generateBrandKit(request);
                    setBrandKitResult(result);
                    addToHistory('brandkit', `工具包: ${result.productName}`, '新闻稿 + 一页纸 + Banner + 邀请函', result);
                    break;
                }
            }

            // 滚动到结果
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (err: any) {
            setError(err.message || "分析失败，请检查输入或重试");
        } finally {
            setLoading(false);
        }
    };

    // 构建富上下文 — 将 focusPreset + perspective prompt 拼入
    const buildEnrichedContext = (): string => {
        let ctx = formData.context || '';

        // 获取当前模式下的预设列表
        const currentPresets = FOCUS_PRESETS_MAP[mode] || [];
        const preset = currentPresets.find(p => p.id === formData.focusPreset);
        if (preset && preset.prompt) {
            ctx = preset.prompt + '\n\n' + ctx;
        }

        // 获取当前模式下的视角列表
        const currentPerspectives = PERSPECTIVES_MAP[mode] || [];
        const perspective = currentPerspectives.find(p => p.id === formData.perspective);
        if (perspective) {
            ctx = perspective.prompt + '\n\n' + ctx;
        }
        return ctx.trim();
    };

    const addToHistory = (type: AnalysisMode, title: string, summary: string, data: any) => {
        const newItem: HistoryItem = {
            id: Date.now().toString(),
            type,
            title,
            timestamp: Date.now(),
            summary,
            data
        };
        setHistory(prev => [newItem, ...prev]);
    };

    // 按钮文案映射
    const getButtonConfig = (): { text: string; icon: React.ReactNode } => {
        const configs: Record<AnalysisMode, { text: string; icon: React.ReactNode }> = {
            single: { text: '生成竞品深度报告', icon: <Search className="w-5 h-5 mr-2" /> },
            compare: { text: '生成横向对标报告', icon: <Users className="w-5 h-5 mr-2" /> },
            index: { text: '启动品牌审计', icon: <LineChart className="w-5 h-5 mr-2" /> },
            battlecard: { text: '生成销售攻防话术', icon: <Swords className="w-5 h-5 mr-2" /> }, // updated text
            toneguard: { text: '启动语调审查', icon: <ShieldCheck className="w-5 h-5 mr-2" /> },
            sentiment: { text: '启动推演 & 生成声明', icon: <Radio className="w-5 h-5 mr-2" /> }, // updated text
            brandkit: { text: '一键打包生成物料', icon: <Package className="w-5 h-5 mr-2" /> }, // updated text
        };
        return configs[mode];
    };

    // 判断是否有任何结果
    const hasAnyResult = singleResult || comparisonResult || brandIndexResult || battleCardResult || toneGuardResult || sentimentResult || brandKitResult;

    // ============================================================
    // 管理后台视图
    // ============================================================
    if (view === 'admin') {
        return (
            <div className="min-h-screen bg-slate-50 p-8 overflow-y-auto font-sans text-slate-900">
                <button
                    onClick={() => setView('home')}
                    className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> 返回分析台
                </button>
                <AdminDashboard
                    history={history}
                    onViewReport={(item) => {
                        // 清空所有结果
                        clearResults();
                        // 根据历史记录类型恢复结果数据
                        const m = item.type as AnalysisMode;
                        setMode(m);
                        switch (m) {
                            case 'single': setSingleResult(item.data as CompetitorAnalysis); break;
                            case 'compare': setComparisonResult(item.data as ComparisonResult); break;
                            case 'index': setBrandIndexResult(item.data as BrandVitalityResult); break;
                            case 'battlecard': setBattleCardResult(item.data as BattleCardResult); break;
                            case 'toneguard': setToneGuardResult(item.data as ToneGuardResult); break;
                            case 'sentiment': setSentimentResult(item.data as SentimentRadarResult); break;
                            case 'brandkit': setBrandKitResult(item.data as BrandKitResult); break;
                        }
                        // 切回主页面
                        setView('home');
                        // 滚动到结果区
                        setTimeout(() => {
                            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 200);
                    }}
                    onDeleteReport={(id) => setHistory(prev => prev.filter(h => h.id !== id))}
                />
            </div>
        );
    }

    // ============================================================
    // 主视图
    // ============================================================
    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-y-auto font-sans text-slate-900">
            {/* Header */}
            <header className="px-8 py-5 border-b border-slate-200 bg-white sticky top-0 z-20 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066CC] to-[#004a99] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Filez 品牌指挥中台</h1>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Brand Command Center</p>
                    </div>
                </div>
                <button
                    onClick={() => setView('admin')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all text-sm font-medium shadow-sm"
                >
                    <LayoutDashboard className="w-4 h-4" />
                    工作台看板
                </button>
            </header>

            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
                {/* Hero Section */}
                <div className="text-center space-y-4 max-w-2xl mx-auto pt-2">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        品牌指挥中台
                    </h2>
                    <p className="text-lg text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
                        7 大 AI 功能模块 · 从竞品情报到品牌管控 · 一站式品牌营销决策支持
                    </p>
                </div>

                {/* Brand Health Dashboard */}
                <BrandHealthDashboard />

                {/* Function Modules Navigation (Cards) */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Insights Group */}
                    <div className="flex-1 space-y-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">深度洞察区 (Insights)</div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {INSIGHT_MODES.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleModeSwitch(tab.id)}
                                    className={`relative p-4 rounded-xl border text-left transition-all group ${mode === tab.id
                                        ? 'bg-white border-blue-500 ring-1 ring-blue-500 shadow-md transform scale-[1.02]'
                                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                                        }`}
                                >
                                    {mode === tab.id && (
                                        <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl-lg rounded-tr-lg"></div>
                                    )}
                                    <div className={`mb-3 transition-colors ${mode === tab.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                        {tab.icon}
                                    </div>
                                    <div className={`text-sm font-bold mb-1 ${mode === tab.id ? 'text-slate-900' : 'text-slate-600'}`}>{tab.label}</div>
                                    <div className="text-[10px] text-slate-400 font-medium leading-tight">{tab.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider for mobile, Spacer for desktop */}
                    <div className="hidden md:block w-px bg-slate-200 self-stretch my-2"></div>

                    {/* Operations Group */}
                    <div className="flex-[0.8] space-y-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">实战作业区 (Operations)</div>
                        <div className="grid grid-cols-3 gap-3">
                            {OPERATION_MODES.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleModeSwitch(tab.id)}
                                    className={`relative p-4 rounded-xl border text-left transition-all group ${mode === tab.id
                                        ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-md transform scale-[1.02]'
                                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                                        }`}
                                >
                                    {mode === tab.id && (
                                        <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-bl-lg rounded-tr-lg"></div>
                                    )}
                                    <div className={`mb-3 transition-colors ${mode === tab.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                        {tab.icon}
                                    </div>
                                    <div className={`text-sm font-bold mb-1 ${mode === tab.id ? 'text-slate-900' : 'text-slate-600'}`}>{tab.label}</div>
                                    <div className="text-[10px] text-slate-400 font-medium leading-tight">{tab.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Input Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-1 shadow-xl shadow-slate-200/50 max-w-3xl mx-auto">
                    <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-100">
                        <div className="flex items-center gap-2 mb-6 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            AI Intelligence Engine Ready
                        </div>

                        <div className="space-y-6">
                            {/* ================================ */}
                            {/* 动态输入区 — 按模式渲染 */}
                            {/* ================================ */}

                            {/* 模式: single / sentiment — 品牌名输入 */}
                            {(mode === 'single' || mode === 'sentiment') && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                        目标品牌 / 产品名称 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="competitorName"
                                        value={formData.competitorName}
                                        onChange={handleInputChange}
                                        placeholder={mode === 'sentiment' ? '例如：联想 Filez / 坚果云' : '例如：Salesforce / 飞书'}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium shadow-sm"
                                    />
                                </div>
                            )}

                            {/* 模式: compare — 多品牌输入 */}
                            {mode === 'compare' && (
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">添加竞品 (2-4个)</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.competitorNames?.map((name, idx) => (
                                            <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 border border-blue-100 shadow-sm">
                                                {name}
                                                <button onClick={() => removeCompetitor(idx)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            value={compareInput}
                                            onChange={(e) => setCompareInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
                                            placeholder="输入竞品名称并按回车..."
                                            className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm"
                                        />
                                        <button
                                            onClick={addCompetitor}
                                            disabled={!compareInput.trim()}
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 rounded-xl transition-colors disabled:opacity-50 font-bold border border-slate-200 shadow-sm"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 模式: index — 品牌审计输入 */}
                            {mode === 'index' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">目标品牌 <span className="text-red-500">*</span></label>
                                    <input
                                        name="brandIndexName"
                                        value={formData.brandIndexName}
                                        onChange={handleInputChange}
                                        placeholder="例如：Tesla / 华为"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium shadow-sm"
                                    />
                                </div>
                            )}

                            {/* 模式: battlecard — 攻防卡输入 */}
                            {mode === 'battlecard' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">竞品名称 <span className="text-red-500">*</span></label>
                                        <input
                                            name="competitorName"
                                            value={formData.competitorName}
                                            onChange={handleInputChange}
                                            placeholder="例如：坚果云 / 亿方云"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium shadow-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">目标行业 <span className="text-red-500">*</span></label>
                                            <select
                                                name="industry"
                                                value={formData.industry || ''}
                                                onChange={handleInputChange}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm appearance-none"
                                            >
                                                <option value="">选择行业...</option>
                                                {INDUSTRIES.map(ind => (
                                                    <option key={ind} value={ind}>{ind}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">竞争场景 <span className="text-red-500">*</span></label>
                                            <input
                                                name="scenario"
                                                value={formData.scenario || ''}
                                                onChange={handleInputChange}
                                                placeholder="例如：合规性审查 / 大文件跨境传输"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 模式: toneguard — 稿件粘贴 */}
                            {mode === 'toneguard' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                        待审查稿件 <span className="text-red-500">*</span>
                                        <span className="text-slate-400 normal-case ml-2">粘贴新闻稿、白皮书摘要或营销文案</span>
                                    </label>
                                    <textarea
                                        name="articleText"
                                        value={formData.articleText || ''}
                                        onChange={handleInputChange}
                                        placeholder="将待审查的稿件内容粘贴到这里（至少50字）..."
                                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-48 resize-none shadow-sm font-medium leading-relaxed"
                                    />
                                    <div className="text-xs text-slate-400 text-right">
                                        {(formData.articleText || '').length} 字
                                    </div>
                                </div>
                            )}

                            {/* 模式: brandkit — 产品卖点 */}
                            {mode === 'brandkit' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">产品名称 <span className="text-red-500">*</span></label>
                                        <input
                                            name="productNameForKit"
                                            value={formData.productNameForKit || ''}
                                            onChange={handleInputChange}
                                            placeholder="例如：Filez AI 2.0 / Filez 安全空间"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">核心卖点 <span className="text-red-500">*</span></label>
                                        <textarea
                                            name="productSellingPoints"
                                            value={formData.productSellingPoints || ''}
                                            onChange={handleInputChange}
                                            placeholder="描述产品的核心卖点和差异化优势，AI 将据此生成全套营销物料..."
                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-32 resize-none shadow-sm font-medium leading-relaxed"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ================================ */}
                            {/* 通用组件：分析侧重点 + 视角切换 */}
                            {/* ================================ */}
                            {mode !== 'toneguard' && mode !== 'brandkit' && mode !== 'index' && (
                                <div className="space-y-4">
                                    {/* 分析侧重点预设标签 - 动态渲染 */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">分析侧重点</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(FOCUS_PRESETS_MAP[mode] || []).map(preset => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => setFormData(prev => ({ ...prev, focusPreset: prev.focusPreset === preset.id ? '' : preset.id }))}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${formData.focusPreset === preset.id
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100 shadow-sm'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                                                        }`}
                                                >
                                                    {preset.icon && <preset.icon className={`w-3.5 h-3.5 ${formData.focusPreset === preset.id ? 'text-blue-600' : 'text-slate-400'}`} />}
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 视角切换 - 动态渲染 */}
                                    {(PERSPECTIVES_MAP[mode] || []).length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">受众视角</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(PERSPECTIVES_MAP[mode] || []).map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setFormData(prev => ({ ...prev, perspective: prev.perspective === p.id ? '' : p.id }))}
                                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${formData.perspective === p.id
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-100 shadow-sm'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                                                            }`}
                                                    >
                                                        {p.icon && <p.icon className={`w-3.5 h-3.5 ${formData.perspective === p.id ? 'text-indigo-600' : 'text-slate-400'}`} />}
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 自定义上下文 */}
                                    {formData.focusPreset === 'custom' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">自定义分析侧重</label>
                                            <textarea
                                                name="context"
                                                value={formData.context || ''}
                                                onChange={handleInputChange}
                                                placeholder="例如：请重点分析其在医疗行业的客户案例和合规性优势..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-24 resize-none shadow-inner"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 高级选项 (single/compare 模式) */}
                            {(mode === 'single' || mode === 'compare') && (
                                <div className="pt-4 border-t border-slate-200">
                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-bold mb-4 transition-colors"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                        高级选项
                                    </button>
                                    {showAdvanced && (
                                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">我方背景 (用于 GAP 分析)</label>
                                                    <textarea
                                                        name="myProductContext"
                                                        value={formData.myProductContext || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="简述我方产品..."
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none h-16 resize-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">视觉分析 (上传截图)</label>
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="w-full h-16 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer group"
                                                    >
                                                        <Upload className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                                                        <span className="text-xs font-medium">点击上传</span>
                                                    </div>
                                                    <input type="file" ref={fileInputRef} className="hidden" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 生成按钮 — 模式感知 */}
                            <button
                                onClick={handleAnalysis}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center relative overflow-hidden group ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' : 'bg-gradient-to-r from-[#0066CC] to-[#0052a3] text-white hover:scale-[1.01] shadow-blue-500/20'}`}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {/* 雷达扫描动画层 - 仅在 loading 时显示 */}
                                {loading && (
                                    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-radar-scan"></div>
                                    </div>
                                )}
                                {loading ? (
                                    <div className="relative z-10 flex items-center">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        作战大屏已启动，请查看下方终端...
                                    </div>
                                ) : (
                                    <div className="relative z-10 flex items-center">
                                        {getButtonConfig().icon}
                                        {getButtonConfig().text}
                                    </div>
                                )}
                            </button>

                            {/* 黑客控制台 */}
                            {loading && (
                                <div className="mt-4 animate-fade-in">
                                    <HackerConsole
                                        scriptId={`stratagem-${mode}`}
                                        isActive={loading}
                                        brandName={formData.competitorName || formData.brandIndexName || formData.productNameForKit || ''}
                                    />
                                </div>
                            )}

                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center justify-center font-medium animate-shake">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* Results Section */}
                {/* ============================================================ */}
                <main ref={resultsRef} className="pb-20">
                    {hasAnyResult && (
                        <div className="animate-fade-in-up">
                            {/* 原有：单品洞察 */}
                            {mode === 'single' && singleResult && (
                                <div className="space-y-8">
                                    {/* Executive Summary */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-24 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                                                    {singleResult.competitorName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-bold text-slate-900">{singleResult.competitorName}</h2>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-600 uppercase tracking-wide">Competitor Profile</span>
                                                        <span className="text-slate-400 text-xs font-mono">{new Date().toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-4xl">
                                                {singleResult.executiveSummary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Key Stats */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: '市场份额', value: singleResult.marketShare, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                                            { label: '总部 / 地区', value: singleResult.hqLocation || 'Unknown', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                            { label: '成立时间', value: singleResult.foundedYear || 'N/A', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                                            { label: '员工规模', value: singleResult.employees || 'N/A', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`p-2 rounded-lg ${item.bg}`}>
                                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                                                </div>
                                                <p className="text-slate-900 font-bold leading-snug">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                                            <h3 className="text-sm font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">五维能力画像</h3>
                                            <div className="flex justify-center -ml-4">
                                                <MarketRadarChart data={singleResult.marketScores || []} />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                                            <h3 className="text-sm font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-600" /> 市场关键情报
                                            </h3>
                                            <NewsFeed news={singleResult.recentNews || []} />
                                        </div>
                                    </div>

                                    {/* B2B Specifics */}
                                    {singleResult.b2bSpecifics && (
                                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">B2B 核心竞争力透视</h3>
                                            </div>
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                                {[
                                                    { label: '销售模式', icon: Network, value: singleResult.b2bSpecifics?.salesModel },
                                                    { label: '决策链角色', icon: UserCog, value: singleResult.b2bSpecifics?.decisionMakers },
                                                    { label: '生态与集成', icon: CheckCircle2, value: singleResult.b2bSpecifics?.integrationEco },
                                                    { label: '客户成功体系', icon: HeartHandshake, value: singleResult.b2bSpecifics?.customerSuccess }
                                                ].map((item, i) => (
                                                    <div key={i}>
                                                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                                                            <item.icon className="w-4 h-4" />
                                                            <span className="text-[10px] font-bold uppercase">{item.label}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.value || '暂无数据'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Product & Marketing */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <DollarSign className="w-5 h-5 text-emerald-600" /> 产品与定价策略
                                            </h3>
                                            <div className="space-y-5">
                                                <div className="bg-emerald-50/50 p-4 border-l-4 border-emerald-500 rounded-r-md">
                                                    <span className="text-xs text-slate-500 uppercase font-bold block mb-1">定价模式</span>
                                                    <p className="text-sm text-slate-800 font-medium">{singleResult.productPricing?.pricingStrategy || '暂无数据'}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <span className="text-xs text-emerald-600 font-bold uppercase block mb-2 border-b border-slate-100 pb-1">功能亮点</span>
                                                        <ul className="text-sm text-slate-600 space-y-2">
                                                            {singleResult.productPricing?.features?.highlights?.slice(0, 3).map((f, i) => (
                                                                <li key={i} className="flex items-start gap-1.5">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                                                    <span>{f}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-red-500 font-bold uppercase block mb-2 border-b border-slate-100 pb-1">功能缺失</span>
                                                        <ul className="text-sm text-slate-600 space-y-2">
                                                            {singleResult.productPricing?.features?.missing?.slice(0, 3).map((f, i) => (
                                                                <li key={i} className="flex items-start gap-1.5">
                                                                    <X className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                                                                    <span>{f}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Megaphone className="w-5 h-5 text-blue-600" /> 数字营销布局
                                            </h3>
                                            <div className="space-y-6">
                                                <div>
                                                    <span className="text-xs text-slate-500 uppercase font-bold block mb-2">主要获客渠道</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {singleResult.digitalMarketing?.channels?.map((ch, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100">{ch}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-500 uppercase font-bold block mb-2">近期营销动作</span>
                                                    <ul className="space-y-3">
                                                        {singleResult.digitalMarketing?.recentCampaigns?.map((camp, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 pl-2 border-l-2 border-blue-400">
                                                                {camp}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sentiment Scores */}
                                    <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
                                        <div className="flex flex-col md:flex-row gap-10 items-center">
                                            <div className="text-center w-full md:w-1/5 border-r border-slate-100 pr-0 md:pr-10">
                                                <div className="text-6xl font-bold tracking-tighter text-slate-900 mb-2">{singleResult.customerSentiment?.overallScore || 0}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">NPS Score</div>
                                            </div>
                                            <div className="w-full md:w-4/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3 text-emerald-600 text-xs font-bold uppercase">
                                                        <ThumbsUp className="w-4 h-4" /> 用户好评
                                                    </div>
                                                    <ul className="text-sm text-slate-600 space-y-2 list-none">
                                                        {singleResult.customerSentiment?.topPraises?.map((p, i) => (
                                                            <li key={i} className="bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100 text-emerald-700 font-medium">{p}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3 text-red-600 text-xs font-bold uppercase">
                                                        <ThumbsDown className="w-4 h-4" /> 用户槽点
                                                    </div>
                                                    <ul className="text-sm text-slate-600 space-y-2 list-none">
                                                        {singleResult.customerSentiment?.topComplaints?.map((p, i) => (
                                                            <li key={i} className="bg-red-50 px-3 py-2 rounded-md border border-red-100 text-red-700 font-medium">{p}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SWOT & Insights */}
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-900 mb-6">SWOT 战略矩阵</h3>
                                            <SWOTMatrix swot={singleResult.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] }} />
                                        </div>
                                        <div className="bg-gradient-to-br from-[#0066CC] to-[#004a99] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                                            <h3 className="text-xl font-semibold mb-8 flex items-center gap-3 relative z-10">
                                                <Target className="w-6 h-6 text-blue-200" /> 关键行动建议
                                            </h3>
                                            <div className="space-y-4 relative z-10">
                                                {singleResult.actionableInsights?.map((insight, i) => (
                                                    <div key={i} className="flex items-start gap-4 p-5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-blue-700 font-bold text-xs shrink-0 mt-0.5 shadow-sm">{i + 1}</span>
                                                        <p className="text-white text-lg font-light leading-relaxed">{insight}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sources */}
                                    {singleResult.sources && singleResult.sources.length > 0 && (
                                        <div className="border-t border-slate-200 pt-6 mt-8">
                                            <p className="text-slate-500 text-[10px] uppercase font-bold mb-3 flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> Data Sources Verified
                                            </p>
                                            <div className="flex flex-wrap gap-4">
                                                {singleResult.sources.slice(0, 5).map((source, i) => (
                                                    <a
                                                        key={i}
                                                        href={source.uri}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors bg-slate-100 px-2 py-1 rounded-sm border border-slate-200 hover:border-blue-300"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        <span className="truncate max-w-[200px]">{source.title}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 原有：横向对标 */}
                            {mode === 'compare' && comparisonResult && (
                                <ComparisonView data={comparisonResult} />
                            )}

                            {/* 原有：品牌审计 */}
                            {mode === 'index' && brandIndexResult && (
                                <BrandIndexView data={brandIndexResult} />
                            )}

                            {/* 新增：攻防卡 */}
                            {mode === 'battlecard' && battleCardResult && (
                                <BattleCardView data={battleCardResult} />
                            )}

                            {/* 新增：语调卫士 */}
                            {mode === 'toneguard' && toneGuardResult && (
                                <ToneGuardView data={toneGuardResult} />
                            )}

                            {/* 新增：舆情分析 */}
                            {mode === 'sentiment' && sentimentResult && (
                                <SentimentView data={sentimentResult} />
                            )}

                            {/* 新增：品牌工具包 */}
                            {mode === 'brandkit' && brandKitResult && (
                                <BrandKitView data={brandKitResult} />
                            )}
                        </div>
                    )}
                </main>
            </main>
        </div>
    );
};

export default CompetitiveIntelligence;
