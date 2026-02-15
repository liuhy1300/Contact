import React from 'react';
import { BattleCardResult } from '../../types/stratagem';
import { Shield, Swords, MessageSquareQuote, Trophy, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
    data: BattleCardResult;
}

// 攻防卡结果视图 — 双栏对比 + 话术 + 异议处理
const BattleCardView: React.FC<Props> = ({ data }) => {
    return (
        <div className="space-y-8 animate-fade-in font-sans text-slate-900">
            {/* 头部 — 场景信息 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-24 bg-red-50/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                            <Swords className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">销售攻防卡</h2>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <span className="px-2.5 py-0.5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-md">VS {data.competitorName}</span>
                                <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold rounded-md">{data.industry}</span>
                                <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 text-xs font-bold rounded-md">{data.scenario}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 双栏对比 — 对方弱点 vs 我方优势 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 竞品弱点 */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide">对方弱点 ({data.competitorName})</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {data.competitorWeaknesses?.map((w, i) => (
                            <div key={i} className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                                <div className="font-bold text-slate-800 text-sm mb-1">{w.point}</div>
                                <div className="text-xs text-slate-500 leading-relaxed">{w.evidence}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 我方优势 */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide">我方优势 (Filez)</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {data.ourAdvantages?.map((a, i) => (
                            <div key={i} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                <div className="font-bold text-slate-800 text-sm mb-1">{a.point}</div>
                                <div className="text-xs text-slate-500 leading-relaxed">{a.proof}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 致胜策略 */}
            <div className="bg-gradient-to-br from-[#0066CC] to-[#004a99] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Trophy className="w-6 h-6 text-amber-300" />
                        <h3 className="text-lg font-bold">致胜策略</h3>
                    </div>
                    <p className="text-white/90 text-lg font-light leading-relaxed">{data.winStrategy}</p>
                </div>
            </div>

            {/* 推荐话术 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <MessageSquareQuote className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">推荐销售话术</h3>
                </div>
                <div className="space-y-3">
                    {data.recommendedTalkingPoints?.map((point, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">{i + 1}</span>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{point}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 异议处理 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">客户异议处理</h3>
                </div>
                <div className="space-y-4">
                    {data.objectionHandling?.map((item, i) => (
                        <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-amber-50 px-5 py-3 border-b border-amber-100">
                                <p className="text-sm font-bold text-amber-800">🤔 客户异议：{item.objection}</p>
                            </div>
                            <div className="px-5 py-3 bg-white">
                                <p className="text-sm text-slate-700 font-medium">💡 推荐回应：{item.response}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BattleCardView;
