import React from 'react';
import { SentimentRadarResult } from '../../types/stratagem';
import { Radio, AlertOctagon, Shield, MessageCircle, TrendingUp, FileText } from 'lucide-react';

interface Props {
    data: SentimentRadarResult;
}

// 舆情分析结果视图 — 渠道声量 + 危机模拟 + PR声明
const SentimentView: React.FC<Props> = ({ data }) => {
    // 情感颜色映射
    const sentimentConfig = {
        positive: { label: '正面', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
        neutral: { label: '中性', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-400' },
        negative: { label: '负面', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
    };

    const riskConfig = {
        low: { label: '低风险', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        medium: { label: '中等风险', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        high: { label: '高风险', color: 'bg-red-50 text-red-700 border-red-200' },
    };

    const overallConfig = sentimentConfig[data.overallSentiment] || sentimentConfig.neutral;
    const risk = riskConfig[data.crisisRiskLevel] || riskConfig.low;

    return (
        <div className="space-y-8 animate-fade-in font-sans text-slate-900">
            {/* 头部概览 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center">
                        <div className={`text-6xl font-black tabular-nums ${overallConfig.color}`}>{data.sentimentScore}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">舆情健康分</div>
                    </div>
                    <div className="flex-1 flex flex-wrap gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border ${overallConfig.bg} ${overallConfig.border} ${overallConfig.color}`}>
                            整体情感：{overallConfig.label}
                        </span>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border ${risk.color}`}>
                            <AlertOctagon className="w-4 h-4 inline mr-1" />
                            危机风险：{risk.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* 渠道声量分析 */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">B2B 渠道舆情扫描</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {data.channels?.map((ch, i) => {
                        const chConfig = sentimentConfig[ch.sentiment] || sentimentConfig.neutral;
                        return (
                            <div key={i} className="p-5 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-slate-800">{ch.name}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${chConfig.bg} ${chConfig.border} ${chConfig.color}`}>
                                            {chConfig.label}
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">热度：{ch.volume}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ch.keyTopics?.map((topic, j) => (
                                        <span key={j} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-slate-200">{topic}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 危机模拟 */}
            {data.crisisSimulation && (
                <div className="space-y-6">
                    {/* 模拟场景 */}
                    <div className="bg-gradient-to-br from-red-600 to-red-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-6 h-6 text-red-200" />
                                <h3 className="text-lg font-bold">危机模拟场景</h3>
                            </div>
                            <p className="text-white/90 text-lg font-light leading-relaxed">{data.crisisSimulation.scenario}</p>
                        </div>
                    </div>

                    {/* PR 声明草稿 */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-600" />
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">PR 声明草稿</h3>
                            </div>
                            <button
                                onClick={() => { navigator.clipboard.writeText(data.crisisSimulation.prStatement || ''); alert('已复制！'); }}
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                            >
                                复制声明
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{data.crisisSimulation.prStatement}</p>
                        </div>
                    </div>

                    {/* Q&A 口径 */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">媒体 Q&A 口径</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {data.crisisSimulation.qaList?.map((qa, i) => (
                                <div key={i} className="p-5">
                                    <div className="flex items-start gap-3 mb-2">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">Q{i + 1}</span>
                                        <p className="text-sm font-bold text-slate-800">{qa.question}</p>
                                    </div>
                                    <div className="flex items-start gap-3 ml-7">
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100">A</span>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{qa.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 舆情管理建议 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">舆情管理建议</h3>
                </div>
                <div className="space-y-3">
                    {data.recommendations?.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">{i + 1}</span>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SentimentView;
