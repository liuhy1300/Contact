// ============================================================
// 引文溯源地图 (Citation Source Map)
// ============================================================
import React from 'react';
import { CitationMapResult } from '../../types/geo';
import { ExternalLink, AlertTriangle, CheckCircle2, Clock, Shield, ArrowRight, Globe, Mail, Copy, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    result: CitationMapResult;
}

// 风险等级配色
const riskColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

const CitationMap: React.FC<Props> = ({ result }) => {
    const [appealSource, setAppealSource] = useState<string | null>(null);

    const handleAppeal = (sourceName: string) => {
        setAppealSource(sourceName);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {appealSource && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl w-[600px] max-w-[90%] shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-500" />
                                自动申诉邮件生成
                            </h3>
                            <button onClick={() => setAppealSource(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">收件人</label>
                                <input type="text" value={`editor@${appealSource?.toLowerCase().replace(/\s+/g, '')}.com`} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" readOnly />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">邮件主题</label>
                                <input type="text" value={`Request for Update: Outdated Information Regarding Filez`} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800" readOnly />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">邮件正文</label>
                                <textarea
                                    className="w-full h-40 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed resize-none font-sans"
                                    value={`Dear Editor,\n\nI am writing to bring to your attention some outdated information regarding Filez in your recent article on ${appealSource}.\n\nSpecifically, the article mentions that Filez lacks "Cross-border Acceleration", which was actually released in our V6.0 update last year. We have attached the latest technical specifications and a third-party speed test report for your reference.\n\nWe would appreciate it if you could update the content to reflect the current capabilities of our platform, ensuring your readers have the most accurate information.\n\nBest regards,\nFilez Brand Team`}
                                    readOnly
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setAppealSource(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-bold text-sm transition-colors">取消</button>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all">
                                    <Copy className="w-4 h-4" /> 复制并打开邮箱
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* 风险摘要 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm text-amber-800 font-medium">{result.riskSummary}</p>
                </div>
            </div>

            {/* AI 原始回答（带引用标记） */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-slate-800">AI 原始回答</h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.aiResponse}</p>
                </div>
            </div>

            {/* 引文源列表 */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">引文来源追踪 ({result.sources.length} 个来源)</h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {result.sources.map((source, idx) => {
                        const colors = riskColors[source.riskLevel] || riskColors.low;
                        return (
                            <div key={idx} className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                {/* 风险指示器 */}
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${colors.dot}`} />

                                {/* 来源信息 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-bold text-slate-900 truncate">{source.title}</h4>
                                        {source.isOutdated && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                                                <Clock className="w-3 h-3" /> 过期
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                                            {source.riskLevel === 'high' ? '高风险' : source.riskLevel === 'medium' ? '中风险' : '低风险'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">{source.domain} {source.publishDate ? `· ${source.publishDate}` : ''}</p>
                                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                        <span className="font-bold">建议操作：</span>{source.actionSuggestion}
                                    </p>
                                    {(source.riskLevel === 'high' || source.isOutdated) && (
                                        <button
                                            onClick={() => handleAppeal(source.title)}
                                            className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                                        >
                                            <Mail className="w-3 h-3" /> 生成申诉邮件
                                        </button>
                                    )}
                                </div>

                                {/* 情感标签 */}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${source.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    source.sentiment === 'negative' ? 'bg-red-50 text-red-700 border border-red-100' :
                                        'bg-slate-50 text-slate-600 border border-slate-100'
                                    }`}>
                                    {source.sentiment === 'positive' ? '正面' : source.sentiment === 'negative' ? '负面' : '中性'}
                                </span>
                            </div>
                        );
                    })}
                    {result.sources.length === 0 && (
                        <div className="p-8 text-center text-slate-400 italic text-sm">未检测到引文来源</div>
                    )}
                </div>
            </div>

            {/* 优先行动 */}
            {result.priorityActions.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-blue-500" />
                        优先行动清单
                    </h3>
                    <ol className="space-y-3">
                        {result.priorityActions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                </span>
                                <p className="text-sm text-slate-700 leading-relaxed">{action}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
};

export default CitationMap;
