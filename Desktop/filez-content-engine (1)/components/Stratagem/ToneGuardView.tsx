import React from 'react';
import { ToneGuardResult } from '../../types/stratagem';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle2, Info, FileText, RefreshCw } from 'lucide-react';

interface Props {
    data: ToneGuardResult;
}

// 语调卫士结果视图 — 合规仪表盘 + 问题列表 + 重写版本
const ToneGuardView: React.FC<Props> = ({ data }) => {
    // 合规分数颜色映射
    const scoreColor = data.complianceScore >= 80 ? 'emerald' : data.complianceScore >= 60 ? 'amber' : 'red';
    const VerdictIcon = data.overallVerdict === 'pass' ? ShieldCheck : data.overallVerdict === 'warning' ? ShieldAlert : ShieldX;
    const verdictText = data.overallVerdict === 'pass' ? '合规通过' : data.overallVerdict === 'warning' ? '需要注意' : '不合规';
    const verdictBg = data.overallVerdict === 'pass' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : data.overallVerdict === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700';

    // 严重等级映射
    const severityConfig = {
        high: { label: '严重', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
        medium: { label: '中等', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
        low: { label: '轻微', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    };

    return (
        <div className="space-y-8 animate-fade-in font-sans text-slate-900">
            {/* 合规仪表盘 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* 分数圆环 */}
                    <div className="relative w-40 h-40 shrink-0">
                        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                            <circle
                                cx="60" cy="60" r="50"
                                stroke={scoreColor === 'emerald' ? '#10b981' : scoreColor === 'amber' ? '#f59e0b' : '#ef4444'}
                                strokeWidth="10" fill="none"
                                strokeDasharray={`${(data.complianceScore / 100) * 314} 314`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-black text-${scoreColor}-600`}>{data.complianceScore}</span>
                            <span className="text-xs text-slate-400 font-bold">/ 100</span>
                        </div>
                    </div>

                    {/* 判定结果 */}
                    <div className="flex-1 text-center md:text-left">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm ${verdictBg} mb-3`}>
                            <VerdictIcon className="w-5 h-5" />
                            {verdictText}
                        </div>
                        <p className="text-slate-600 leading-relaxed font-medium max-w-2xl">{data.toneAnalysis}</p>
                        <div className="flex gap-4 mt-4 text-xs text-slate-500">
                            <span>发现 <strong className="text-slate-700">{data.issues?.length || 0}</strong> 处问题</span>
                            <span>严重 <strong className="text-red-600">{data.issues?.filter(i => i.severity === 'high').length || 0}</strong></span>
                            <span>中等 <strong className="text-amber-600">{data.issues?.filter(i => i.severity === 'medium').length || 0}</strong></span>
                            <span>轻微 <strong className="text-blue-600">{data.issues?.filter(i => i.severity === 'low').length || 0}</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 问题列表 */}
            {data.issues && data.issues.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">审查问题详情</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {data.issues.map((issue, i) => {
                            const config = severityConfig[issue.severity];
                            return (
                                <div key={i} className="p-5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${config.color}`}>
                                            {config.label}
                                        </span>
                                        <span className="text-xs text-slate-400">{issue.issue}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                        <div className="bg-red-50/50 p-3 rounded-lg border border-red-100">
                                            <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">原文</span>
                                            <p className="text-sm text-red-800 font-medium leading-relaxed">"{issue.originalText}"</p>
                                        </div>
                                        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase block mb-1">建议修改</span>
                                            <p className="text-sm text-emerald-800 font-medium leading-relaxed">"{issue.suggestion}"</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* AI 重写版本 */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide">合规重写版本</h3>
                    </div>
                    <button
                        onClick={() => { navigator.clipboard.writeText(data.rewrittenArticle || ''); alert('已复制到剪贴板！'); }}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200"
                    >
                        复制全文
                    </button>
                </div>
                <div className="p-6">
                    <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700 font-medium">
                        {data.rewrittenArticle}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToneGuardView;
