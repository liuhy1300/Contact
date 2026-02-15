// ============================================================
// 事实注入生成器 (Fact Injector)
// ============================================================
import React, { useState } from 'react';
import { FactInjectionResult } from '../../types/geo';
import { AlertCircle, FileCode, FileText, Rocket, Copy, Check, ChevronDown, ChevronUp, MessageSquare, RefreshCw } from 'lucide-react';

interface Props {
    result: FactInjectionResult;
}

// 复制按钮
const CopyBtn: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
        >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copied ? '已复制' : '复制'}
        </button>
    );
};

// 严重性颜色
const severityColors: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const FactInjector: React.FC<Props> = ({ result }) => {
    const [expandFaq, setExpandFaq] = useState(true);
    const [expandJsonLd, setExpandJsonLd] = useState(false);
    const [corrections, setCorrections] = useState<Record<number, string>>({});
    const [generating, setGenerating] = useState<Record<number, boolean>>({});

    const handleGenerateCorrection = (idx: number, fact: string) => {
        setGenerating(prev => ({ ...prev, [idx]: true }));
        // Mock generation delay
        setTimeout(() => {
            setCorrections(prev => ({
                ...prev,
                [idx]: `针对 "${fact}" 的反击话术：\nFilez 采用了最新的 AES-256 加密技术，并符合 ISO 27001 标准，实测安全性评分高于竞品 15%。（数据来源：2024 安全白皮书）`
            }));
            setGenerating(prev => ({ ...prev, [idx]: false }));
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 知识差距卡片 */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        AI 认知差距检测 ({result.gaps.length} 项)
                    </h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {result.gaps.map((gap, idx) => {
                        const colors = severityColors[gap.severity] || severityColors.low;
                        return (
                            <div key={idx} className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                                        {gap.severity === 'high' ? '严重' : gap.severity === 'medium' ? '中等' : '轻微'}
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900">{gap.topic}</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-red-500 uppercase mb-1">AI 目前认知</p>
                                        <p className="text-xs text-red-700 leading-relaxed">{gap.currentAIBelief}</p>
                                    </div>
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">正确信息</p>
                                        <p className="text-xs text-emerald-700 leading-relaxed">{gap.correctFact}</p>
                                    </div>
                                </div>
                                {/* One-Click Correction */}
                                <div className="mt-3 pt-3 border-t border-slate-50">
                                    {!corrections[idx] ? (
                                        <button
                                            onClick={() => handleGenerateCorrection(idx, gap.correctFact)}
                                            disabled={generating[idx]}
                                            className="ml-auto flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline disabled:opacity-50 disabled:no-underline"
                                        >
                                            {generating[idx] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                            一键生成反击话术
                                        </button>
                                    ) : (
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 animate-fade-in">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" /> 赢单话术卡
                                                </span>
                                                <CopyBtn text={corrections[idx]} />
                                            </div>
                                            <p className="text-xs text-indigo-900 leading-relaxed font-medium">{corrections[idx]}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        );
                    })}
                    {result.gaps.length === 0 && (
                        <div className="p-8 text-center text-slate-400 italic text-sm">未检测到知识差距</div>
                    )}
                </div>
            </div>

            {/* FAQ 纠偏语料 */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div
                    className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandFaq(!expandFaq)}
                >
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        生成的 FAQ 纠偏语料
                    </h3>
                    <div className="flex items-center gap-2">
                        {expandFaq && <CopyBtn text={result.faqContent} />}
                        {expandFaq ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                </div>
                {expandFaq && (
                    <div className="p-6">
                        <pre className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-80 overflow-y-auto">
                            {result.faqContent || '暂无内容'}
                        </pre>
                    </div>
                )}
            </div>

            {/* JSON-LD 结构化代码 */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div
                    className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandJsonLd(!expandJsonLd)}
                >
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-purple-500" />
                        JSON-LD 结构化标记
                    </h3>
                    <div className="flex items-center gap-2">
                        {expandJsonLd && <CopyBtn text={result.jsonLdCode} />}
                        {expandJsonLd ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                </div>
                {expandJsonLd && (
                    <div className="p-6">
                        <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-slate-900 rounded-xl p-4 border border-slate-700 max-h-80 overflow-y-auto">
                            {result.jsonLdCode || '暂无代码'}
                        </pre>
                    </div>
                )}
            </div>

            {/* 部署建议 */}
            {
                result.deploymentGuide && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                        <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <Rocket className="w-4 h-4" />
                            部署建议
                        </h3>
                        <p className="text-sm text-blue-700 leading-relaxed whitespace-pre-wrap">{result.deploymentGuide}</p>
                    </div>
                )
            }
        </div >
    );
};

export default FactInjector;
