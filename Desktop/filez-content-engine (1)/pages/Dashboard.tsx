import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { GeneratedPrompt } from '../types';
import {
    Search, Sparkles, Globe, PenTool, Palette, Bot, Database,
    Zap, Activity, Calendar, FileText, ArrowRight, Clock, ShieldCheck, Mail,
    LayoutDashboard, Image, ChevronRight, Command, RefreshCw
} from 'lucide-react';

// ── 微型趋势图组件 ──
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 80, h = 24;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    return (
        <svg width={w} height={h} className="inline-block ml-2 opacity-70">
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

// ── 环形进度组件 ──
const DonutGauge = ({ percent, color, label }: { percent: number, color: string, label: string }) => {
    const r = 28, c = 2 * Math.PI * r;
    const offset = c - (percent / 100) * c;
    return (
        <div className="flex flex-col items-center">
            <svg width="72" height="72" className="transform -rotate-90">
                <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute mt-5 text-center">
                <div className="text-sm font-black text-white">{percent}%</div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 font-medium">{label}</div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [recentWorkflows, setRecentWorkflows] = useState<GeneratedPrompt[]>([]);
    const [kbCount] = useState<number>(1240);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [showCommandMenu, setShowCommandMenu] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // 轮播提示词
    const placeholders = [
        "试着问我：生成 Q3 季度战报...",
        "试着问我：分析竞品价格策略...",
        "试着问我：画一张产品发布海报...",
        "试着问我：查找上一篇白皮书...",
        "试着问我：检查 GEO 排名变化...",
    ];

    useEffect(() => {
        const timer = setInterval(() => setPlaceholderIdx(i => (i + 1) % placeholders.length), 3500);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchRecentWorkflows();
    }, []);

    const fetchRecentWorkflows = async () => {
        try {
            const { data, error } = await supabase
                .from('generated_prompts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            if (data) setRecentWorkflows(data);
        } catch (err) {
            console.error("Failed to fetch recent workflows:", err);
        }
    };

    // 命令菜单项
    const commandItems = [
        { cmd: '/image', label: '🖼️ 文生图 — 跳转到视觉设计工坊', action: () => navigate('/brand/design') },
        { cmd: '/article', label: '✍️ 写文章 — 打开内容营销智能体', action: () => navigate('/builder') },
        { cmd: '/geo', label: '🔭 查排名 — 启动 GEO 增长侦察', action: () => navigate('/brand/geo') },
        { cmd: '/email', label: '📧 写邮件 — 打开 EDM 营销工坊', action: () => navigate('/brand/mail') },
        { cmd: '/brand', label: '🧠 品牌分析 — 深度竞品洞察', action: () => navigate('/strategy') },
    ];

    const handleSearchInput = (val: string) => {
        setSearchTerm(val);
        setShowCommandMenu(val.startsWith('/'));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowCommandMenu(false);
        const term = searchTerm.toLowerCase();
        if (term.includes("图") || term.includes("poster") || term.includes("image") || term.includes("海报")) navigate('/brand/design');
        else if (term.includes("rank") || term.includes("geo") || term.includes("排名")) navigate('/brand/geo');
        else if (term.includes("文案") || term.includes("write") || term.includes("post") || term.includes("文章")) navigate('/builder');
        else if (term.includes("白皮书") || term.includes("report") || term.includes("知识")) navigate('/knowledge');
        else if (term.includes("竞品") || term.includes("brand") || term.includes("分析")) navigate('/strategy');
        else if (term.includes("邮件") || term.includes("email") || term.includes("edm")) navigate('/brand/mail');
        else navigate('/knowledge', { state: { query: searchTerm } });
    };

    // ── 模块配置 ──
    const agentModules = [
        {
            id: 'content', title: '内容营销智能体', subtitle: 'Content Agent',
            icon: PenTool, path: '/builder',
            gradient: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600',
            glowColor: 'rgba(59,130,246,0.12)', borderHover: 'hover:border-blue-300',
            status: '本周产出', metric: '12 篇', trend: '📈',
            sparkData: [3, 5, 2, 8, 6, 9, 12],
            sparkColor: '#3b82f6',
            actions: [
                { label: '新建公众号推文', emoji: '📝', onClick: () => navigate('/builder') },
                { label: '写白皮书', emoji: '📄', onClick: () => navigate('/builder') }
            ]
        },
        {
            id: 'brand', title: '品牌策略参谋', subtitle: 'Brand Strategist',
            icon: LayoutDashboard, path: '/strategy',
            gradient: 'from-purple-500 to-violet-600', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-600',
            glowColor: 'rgba(168,85,247,0.12)', borderHover: 'hover:border-purple-300',
            status: '竞品动态', metric: '3 条新预警', trend: '⚠️',
            sparkData: [1, 0, 2, 1, 3, 2, 3],
            sparkColor: '#a855f7',
            actions: [
                { label: '深度单品洞察', emoji: '🔍', onClick: () => navigate('/strategy') },
                { label: '生成攻防卡', emoji: '⚔️', onClick: () => navigate('/strategy') }
            ]
        },
        {
            id: 'design', title: '视觉设计工坊', subtitle: 'Design Studio',
            icon: Palette, path: '/brand/design',
            gradient: 'from-pink-500 to-rose-600', iconBg: 'bg-pink-500/10', iconColor: 'text-pink-600',
            glowColor: 'rgba(236,72,153,0.12)', borderHover: 'hover:border-pink-300',
            status: 'BananaArt', metric: 'Ready', trend: '🟢',
            sparkData: [4, 6, 3, 7, 5, 8, 6],
            sparkColor: '#ec4899',
            actions: [
                { label: '文生图', emoji: '🖼️', onClick: () => navigate('/brand/design') },
                { label: 'UI Mockup', emoji: '🖌️', onClick: () => navigate('/brand/design') }
            ]
        },
        {
            id: 'geo', title: 'GEO 增长侦察兵', subtitle: 'GEO Scout',
            icon: Globe, path: '/brand/geo',
            gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600',
            glowColor: 'rgba(16,185,129,0.12)', borderHover: 'hover:border-emerald-300',
            status: 'AI 品牌份额', metric: '62%', trend: '🔥',
            sparkData: [40, 45, 50, 48, 55, 58, 62],
            sparkColor: '#10b981',
            actions: [
                { label: '快速侦察', emoji: '⚡', onClick: () => navigate('/brand/geo') },
                { label: '事实注入', emoji: '💉', onClick: () => navigate('/brand/geo') }
            ]
        },
        {
            id: 'tools', title: '效率工具箱', subtitle: 'Smart Toolbox',
            icon: Bot, path: '/tools',
            gradient: 'from-slate-500 to-zinc-600', iconBg: 'bg-slate-500/10', iconColor: 'text-slate-600',
            glowColor: 'rgba(100,116,139,0.12)', borderHover: 'hover:border-slate-300',
            status: 'API 状态', metric: '正常 (8 RPM)', trend: '🟢',
            sparkData: [8, 7, 8, 8, 7, 8, 8],
            sparkColor: '#64748b',
            actions: [
                { label: '打开编辑器', emoji: '📝', onClick: () => navigate('/tools') },
                { label: '写邮件', emoji: '📧', onClick: () => navigate('/brand/mail') }
            ]
        }
    ];

    // ── 获取当前时段问候 ──
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 6) return '夜深了';
        if (h < 12) return '早上好';
        if (h < 14) return '中午好';
        if (h < 18) return '下午好';
        return '晚上好';
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto" style={{ background: 'linear-gradient(135deg, #F5F7FA 0%, #EEF1F5 50%, #F0F2F8 100%)' }}>

            {/* ══════════ 头部：欢迎 + Filez Brain ══════════ */}
            <div className="relative pt-10 pb-8 px-8">
                {/* 弥散光晕 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-indigo-400/15 via-purple-400/10 to-pink-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />

                <div className="relative z-10 max-w-4xl mx-auto text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-1.5 tracking-tight">
                        {getGreeting()}，<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">Filez 营销官</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                        全部智能体在线运行中
                    </p>
                </div>

                {/* 超级搜索框 */}
                <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto z-10">
                    {/* 呼吸光影 */}
                    <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500/20 via-purple-500/25 to-pink-500/20 rounded-3xl blur-xl animate-pulse pointer-events-none" style={{ animationDuration: '3s' }} />
                    <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(99,102,241,0.12)] rounded-2xl flex items-center p-1.5 transition-all hover:shadow-[0_8px_40px_rgba(99,102,241,0.18)] hover:bg-white/90 focus-within:bg-white focus-within:shadow-[0_8px_40px_rgba(99,102,241,0.22)]">
                        <div className="ml-4 mr-2 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
                            <Command className="w-4 h-4 text-white" />
                        </div>
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchTerm}
                            onChange={e => handleSearchInput(e.target.value)}
                            onFocus={() => searchTerm.startsWith('/') && setShowCommandMenu(true)}
                            onBlur={() => setTimeout(() => setShowCommandMenu(false), 200)}
                            placeholder={placeholders[placeholderIdx]}
                            className="w-full bg-transparent border-none outline-none px-3 py-3 text-base text-slate-700 placeholder:text-slate-400/70 font-medium transition-all"
                        />
                        <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-95 mr-0.5">
                            <Sparkles className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 命令菜单 */}
                    {showCommandMenu && (
                        <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-4">快捷指令</div>
                            {commandItems.filter(c => c.cmd.includes(searchTerm.slice(1).toLowerCase()) || searchTerm === '/').map(item => (
                                <button key={item.cmd} onClick={() => { item.action(); setShowCommandMenu(false); setSearchTerm(''); }}
                                    className="flex items-center w-full px-4 py-3 text-left hover:bg-indigo-50/80 transition-colors">
                                    <span className="text-xs font-mono text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded mr-3">{item.cmd}</span>
                                    <span className="text-sm text-slate-700">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </form>
            </div>

            {/* ══════════ 2+1 主布局 ══════════ */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-8 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ── 左侧：作战区域 (8 cols) ── */}
                <div className="lg:col-span-8 space-y-8">
                    {/* 智能体作战方阵 */}
                    <div>
                        <h2 className="text-base font-black text-slate-700 mb-5 flex items-center uppercase tracking-wide">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center mr-2.5"><Bot className="w-4 h-4 text-indigo-600" /></div>
                            智能体作战方阵
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {agentModules.map(mod => (
                                <div key={mod.id}
                                    className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${mod.borderHover}`}
                                    style={{ boxShadow: `0 4px 20px rgba(0,0,0,0.04), 0 0 0 0 ${mod.glowColor}`, transition: 'all 0.3s ease, box-shadow 0.3s ease' }}
                                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.06), 0 0 30px ${mod.glowColor}`)}
                                    onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.04), 0 0 0 0 ${mod.glowColor}`)}
                                    onClick={() => navigate(mod.path)}
                                >
                                    {/* 顶部渐变条 */}
                                    <div className={`absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r ${mod.gradient} rounded-b opacity-40 group-hover:opacity-100 transition-opacity`} />

                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-12 h-12 rounded-xl ${mod.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                                <mod.icon className={`w-6 h-6 ${mod.iconColor}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm">{mod.title}</h3>
                                                <div className="text-[10px] text-slate-400 font-medium">{mod.subtitle}</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>

                                    {/* 指标行 */}
                                    <div className="mt-4 flex items-center justify-between group-hover:mb-2 transition-all">
                                        <div className="flex items-center">
                                            <span className="text-xs text-slate-500">{mod.status}：</span>
                                            <span className="text-sm font-bold text-slate-800 ml-1">{mod.metric}</span>
                                            <span className="ml-1">{mod.trend}</span>
                                            <Sparkline data={mod.sparkData} color={mod.sparkColor} />
                                        </div>
                                    </div>

                                    {/* 快捷操作 — hover 浮出 */}
                                    <div className="mt-3 pt-3 border-t border-slate-100/0 group-hover:border-slate-100 flex gap-2 max-h-0 overflow-hidden opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300 ease-out">
                                        {mod.actions.map((act, i) => (
                                            <button key={i}
                                                onClick={e => { e.stopPropagation(); act.onClick(); }}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm hover:shadow-md active:scale-95 bg-white border-slate-200 text-slate-700 hover:text-white hover:bg-gradient-to-r hover:${mod.gradient} hover:border-transparent`}
                                            >
                                                <span>{act.emoji}</span>
                                                <span>{act.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 最近任务流 */}
                    <div>
                        <h2 className="text-base font-black text-slate-700 mb-4 flex items-center uppercase tracking-wide">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center mr-2.5"><Clock className="w-4 h-4 text-amber-600" /></div>
                            最近任务流
                        </h2>
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            {recentWorkflows.length > 0 ? (
                                <div className="divide-y divide-slate-100/80">
                                    {recentWorkflows.map(item => (
                                        <div key={item.id}
                                            className="px-6 py-4 flex items-center justify-between hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                            onClick={() => navigate('/history')}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.settings?.format === 'html' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                        {item.prompt_content.split('\n')[0].replace('# Role', '').slice(0, 45).trim() || '未命名任务'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">{item.settings?.role || 'Agent'}</span>
                                                        <span>•</span>
                                                        <span>{new Date(item.created_at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center">
                                    <div className="text-3xl mb-2">🚀</div>
                                    <div className="text-sm text-slate-500 font-medium">暂无最近任务，点击上方卡片开始你的第一个任务</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 右侧：情报区域 (4 cols) ── */}
                <div className="lg:col-span-4 space-y-5">

                    {/* 算力与模型监控 */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.3)' }}>
                        {/* 装饰光 */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

                        <h3 className="relative text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-5 flex items-center">
                            <Activity className="w-3.5 h-3.5 mr-2 text-indigo-400" /> 算力与模型监控
                        </h3>

                        <div className="relative flex justify-around items-start">
                            <DonutGauge percent={80} color="#10b981" label="Claude 3.5" />
                            <div className="text-center mt-4">
                                <div className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full">算力充沛</div>
                            </div>
                            <DonutGauge percent={98} color="#6366f1" label="Gemini 2.0" />
                        </div>
                    </div>

                    {/* 企业知识库动态 */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center">
                            <Database className="w-3.5 h-3.5 mr-2 text-blue-500" /> 企业知识库动态
                        </h3>
                        <div className="flex items-baseline space-x-2 mb-3">
                            <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">{kbCount.toLocaleString()}</span>
                            <span className="text-xs text-slate-500 font-medium">份文档已索引</span>
                        </div>
                        <div className="py-2.5 px-3 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-start space-x-2.5">
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                            <p className="text-[11px] text-emerald-800 leading-relaxed">
                                昨晚自动同步了《Filez v6.0 技术规格书》，RAG 索引已更新。
                            </p>
                        </div>
                    </div>

                    {/* 作战日历 */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-orange-500" /> 作战日历
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-orange-50/60 border border-orange-100/80 hover:bg-orange-50 transition-colors cursor-pointer group">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                    <span className="text-[8px] font-bold uppercase leading-none">MAR</span>
                                    <span className="text-lg font-black leading-none">24</span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-700 group-hover:text-orange-700 transition-colors">发布 Q3 市场战报</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">建议使用：内容营销智能体</div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100/80 hover:bg-blue-50 transition-colors cursor-pointer group">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                    <span className="text-[8px] font-bold uppercase leading-none">MAR</span>
                                    <span className="text-lg font-black leading-none">28</span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">产品新功能发布</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">建议使用：视觉设计工坊</div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* 营销小贴士 */}
                    <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-5 border border-indigo-100/60">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-2 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-2" /> 今日提示
                        </div>
                        <p className="text-xs text-indigo-800/80 leading-relaxed">
                            💡 知道吗？在 GEO 侦察中使用"事实注入"功能，可以将 AI 品牌份额提升 15-30%。试试在侦察后一键注入关键数据点！
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
