import React from 'react';
import { BrandIndexAnalysis, BrandIndexDimension } from '../../types/stratagem';
import { ShieldCheck, Zap, Activity, Quote, Target, TrendingUp, AlertOctagon, ExternalLink, SearchCheck } from 'lucide-react';
import MarketRadarChart from './MarketRadarChart';

interface Props {
    data: BrandIndexAnalysis;
}

const DimensionCard: React.FC<{
    title: string;
    dimension: BrandIndexDimension;
    icon: React.ReactNode;
    colorBase: string; // e.g. 'blue', 'emerald'
}> = ({ title, dimension, icon, colorBase }) => {
    const score = dimension.score;
    // Dynamic color classes based on score
    const scoreColor = score >= 20 ? `text-${colorBase}-600` : score >= 15 ? `text-${colorBase}-500` : 'text-slate-500';
    const barColor = `bg-${colorBase}-500`;
    const bgColorLight = `bg-${colorBase}-50`;
    const textColor = `text-${colorBase}-700`;
    const borderColor = `hover:border-${colorBase}-300`;

    return (
        <div className={`bg-white border border-slate-200 p-6 flex flex-col h-full rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ${borderColor}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 ${bgColorLight} ${textColor} rounded-lg shadow-sm`}>
                        {icon}
                    </div>
                    <h4 className="font-serif text-lg font-bold text-slate-800 tracking-tight">{title}</h4>
                </div>
                <div className="text-right">
                    <span className={`text-2xl font-bold font-serif ${scoreColor}`}>{score}</span>
                    <span className="text-xs text-slate-400 block font-medium">/ 25</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 mb-5 rounded-full overflow-hidden">
                <div
                    className={`h-2 rounded-full ${barColor}`}
                    style={{ width: `${Math.min((score / 25) * 100, 100)}%` }}
                ></div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-grow font-normal">
                {dimension.analysis || "No analysis provided."}
            </p>

            {/* Evidence Links */}
            {dimension.evidence_links && dimension.evidence_links.length > 0 && (
                <div className="pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <SearchCheck className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fact Check</span>
                    </div>
                    <ul className="space-y-2">
                        {dimension.evidence_links.slice(0, 2).map((link, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-blue-600 group cursor-pointer hover:text-blue-700 transition-colors">
                                <ExternalLink className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                <a href={link} target="_blank" rel="noopener noreferrer" className="truncate hover:underline font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const BrandIndexView: React.FC<Props> = ({ data }) => {
    const totalScore = data.total_score;
    let scoreColor = 'text-slate-900';
    if (totalScore >= 80) scoreColor = 'text-emerald-600';
    else if (totalScore >= 60) scoreColor = 'text-blue-600';
    else if (totalScore >= 40) scoreColor = 'text-amber-500';
    else scoreColor = 'text-red-600';

    const radarData = [
        { attribute: 'Visibility', score: (data.dimensions.visibility.score / 25) * 100 },
        { attribute: 'Image', score: (data.dimensions.image.score / 25) * 100 },
        { attribute: 'Structure', score: (data.dimensions.structure.score / 25) * 100 },
        { attribute: 'Activity', score: (data.dimensions.activity.score / 25) * 100 },
    ];

    const vis = data.dimensions.visibility.score;
    const img = data.dimensions.image.score;
    const str = data.dimensions.structure.score;
    const act = data.dimensions.activity.score;

    return (
        <div className="animate-fade-in font-sans text-slate-900">

            {/* 1. Executive Header (Apple Style) */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl mb-8 p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] px-2.5 py-1 font-bold uppercase tracking-widest rounded-full shadow-sm">
                                VISA Index Audit
                            </span>
                            <span className="text-slate-400 text-xs font-mono">
                                {new Date().toISOString().split('T')[0]}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
                            {data.brand_name}
                        </h1>
                        <div className="flex items-start gap-3 max-w-2xl bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                            <Quote className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                            <p className="text-lg text-slate-700 font-medium leading-relaxed italic">
                                "{data.summary_one_liner}"
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 bg-white px-8 py-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Brand Health Score</div>
                            <div className={`text-6xl font-black tracking-tighter ${scoreColor}`}>
                                {totalScore}
                            </div>
                        </div>
                        <div className="h-16 w-px bg-slate-200"></div>
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Market Position</div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                    {totalScore >= 60 ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <AlertOctagon className="w-4 h-4 text-red-600" />}
                                    <span>{totalScore >= 75 ? 'Market Leader' : totalScore >= 50 ? 'Challenger' : 'Niche Player'}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">Based on VISA™ Model</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Strategic Overview (Radar + Key Insight) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Vitality Shape
                        </h3>
                        <div className="h-[320px] -ml-6">
                            <MarketRadarChart data={radarData} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-600" />
                            Strategic Implications
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            Brand demonstrates {vis > str ? "strong market presence but potential strategic stagnation" : "high innovation potential pending market amplification"}.
                            Immediate focus should be on {Math.min(vis, img, str, act) === vis ? "Visibility" : Math.min(vis, img, str, act) === img ? "Reputation Management" : Math.min(vis, img, str, act) === str ? "Innovation Strategy" : "Engagement"}.
                        </p>
                    </div>
                </div>

                {/* Right: 4 Dimensions Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DimensionCard
                        title="Visibility (可见度)"
                        dimension={data.dimensions.visibility}
                        icon={<Target className="w-5 h-5" />}
                        colorBase="blue"
                    />
                    <DimensionCard
                        title="Image (印象)"
                        dimension={data.dimensions.image}
                        icon={<ShieldCheck className="w-5 h-5" />}
                        colorBase="emerald"
                    />
                    <DimensionCard
                        title="Structure (架构)"
                        dimension={data.dimensions.structure}
                        icon={<Activity className="w-5 h-5" />}
                        colorBase="amber"
                    />
                    <DimensionCard
                        title="Activity (活性)"
                        dimension={data.dimensions.activity}
                        icon={<Zap className="w-5 h-5" />}
                        colorBase="red"
                    />
                </div>
            </div>

            {/* 3. SWOT Analysis (Tag Cloud Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 mt-8 border-t border-slate-200">
                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-4">
                        Competitive Strengths (优势)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.swot_keywords?.strengths?.map((k, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-lg shadow-sm">
                                {k}
                            </span>
                        )) || <span className="text-slate-500 text-sm">No specific strengths identified.</span>}
                    </div>
                </div>
                <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-4">
                        Critical Weaknesses (劣势)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.swot_keywords?.weaknesses?.map((k, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white border border-red-200 text-red-700 text-sm font-semibold rounded-lg shadow-sm">
                                {k}
                            </span>
                        )) || <span className="text-slate-500 text-sm">No specific weaknesses identified.</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandIndexView;
