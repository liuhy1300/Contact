// ============================================================
// AI 推荐份额仪表盘 (SoR Dashboard)
// ============================================================
import React from 'react';
import { SoRResult } from '../../types/geo';
import { Trophy, TrendingUp, Shield, Target, ChevronDown, ChevronUp, Hash } from 'lucide-react';

// 环形仪表盘组件
const GaugeRing: React.FC<{ value: number; label: string; color: string; size?: number }> = ({ value, label, color, size = 120 }) => {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth="8" fill="none" />
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        stroke={color} strokeWidth="8" fill="none"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{value}%</span>
                </div>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
    );
};

interface Props {
    result: SoRResult;
}

const SoRDashboard: React.FC<Props> = ({ result }) => {
    const [expandedRound, setExpandedRound] = React.useState<number | null>(null);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 洞察条 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 font-medium leading-relaxed">{result.insight}</p>
            </div>

            {/* 三大核心指标 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center shadow-sm">
                    <GaugeRing value={result.top1Rate} label="Top1 推荐率" color="#3b82f6" />
                    <p className="text-xs text-slate-400 mt-2">AI 第一个推荐 {result.brandName} 的比例</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center shadow-sm">
                    <GaugeRing value={result.top3Rate} label="前三提及率" color="#10b981" />
                    <p className="text-xs text-slate-400 mt-2">进入 AI 候选名单 (Top 3) 的比例</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center shadow-sm">
                    <GaugeRing value={result.exclusivityRate} label="独占推荐率" color="#8b5cf6" />
                    <p className="text-xs text-slate-400 mt-2">AI 只推荐 {result.brandName} 不提竞品</p>
                </div>
            </div>

            {/* 辅助指标行 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">模拟轮次</p>
                    <p className="text-2xl font-bold text-slate-900">{result.totalRounds}</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">平均排名</p>
                    <p className="text-2xl font-bold text-slate-900">{result.avgRank ?? '-'}</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm col-span-2">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">主要竞品</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {result.topCompetitors.map((c, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-100 font-medium">
                                {c.name} <span className="text-red-400">×{c.count}</span>
                            </span>
                        ))}
                        {result.topCompetitors.length === 0 && <span className="text-xs text-slate-400">无竞品数据</span>}
                    </div>
                </div>
            </div>

            {/* 逐轮明细 */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        逐轮模拟明细
                    </h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {result.rounds.map((round, idx) => (
                        <div key={idx}
                            className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => setExpandedRound(expandedRound === idx ? null : idx)}
                        >
                            <span className="text-xs font-mono text-slate-400 w-6">#{idx + 1}</span>
                            <span className="text-sm text-slate-700 flex-1 truncate">{round.query}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${round.isTop1 ? 'bg-blue-100 text-blue-700' : round.isTop3 ? 'bg-emerald-100 text-emerald-700' : round.rank !== null ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                {round.rank !== null ? `#${round.rank}` : '未提及'}
                            </span>
                            {round.isExclusive && <Shield className="w-3.5 h-3.5 text-purple-500" />}
                            {expandedRound === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SoRDashboard;
