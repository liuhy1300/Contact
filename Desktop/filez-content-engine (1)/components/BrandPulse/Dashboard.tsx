// ============================================================
// GEO 结果仪表盘 — 增强版（红绿高亮 + SoR 简报）
// ============================================================
import React from 'react';
import { BrandAnalysis } from '../../types/geo';
import { CheckCircle2, XCircle, Trophy, ThumbsUp, ThumbsDown, Minus, Info } from 'lucide-react';

// 情感条形图
const SentimentBar = ({ positive, neutral, negative }: { positive: number, neutral: number, negative: number }) => {
    const total = positive + neutral + negative;
    const p = total ? (positive / total) * 100 : 0;
    const n = total ? (neutral / total) * 100 : 0;
    const neg = total ? (negative / total) * 100 : 0;

    return (
        <div className="h-2 flex rounded-full overflow-hidden w-full bg-slate-100">
            <div style={{ width: `${p}%` }} className="bg-emerald-500" />
            <div style={{ width: `${n}%` }} className="bg-slate-400" />
            <div style={{ width: `${neg}%` }} className="bg-red-500" />
        </div>
    );
};

// 红绿高亮渲染器
const HighlightedText: React.FC<{ text: string; brandName: string; competitors: string[] }> = ({ text, brandName, competitors }) => {
    if (!text) return <span className="text-slate-400 italic">无内容</span>;

    // 构建匹配规则
    const brandTerms = [brandName, ...brandName.split(/\s+/)].filter(t => t.length >= 2);
    const competitorTerms = competitors.filter(c => c.length >= 2);

    // 正向关键词（品牌相关）
    const positiveWords = ['安全', '稳定', '可靠', '领先', '推荐', '首选', '优秀', '强大', ...brandTerms];
    // 风险词（竞品/负面）
    const negativeWords = ['不足', '缺点', '贵', '落后', '不如', '问题', '风险', ...competitorTerms];

    // 逐词高亮
    const parts: { text: string; type: 'positive' | 'negative' | 'normal' }[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        let earliestIdx = remaining.length;
        let bestMatch = '';
        let bestType: 'positive' | 'negative' = 'positive';

        // 找最早出现的关键词
        for (const w of positiveWords) {
            const idx = remaining.toLowerCase().indexOf(w.toLowerCase());
            if (idx !== -1 && idx < earliestIdx) {
                earliestIdx = idx;
                bestMatch = remaining.substring(idx, idx + w.length);
                bestType = 'positive';
            }
        }
        for (const w of negativeWords) {
            const idx = remaining.toLowerCase().indexOf(w.toLowerCase());
            if (idx !== -1 && idx < earliestIdx) {
                earliestIdx = idx;
                bestMatch = remaining.substring(idx, idx + w.length);
                bestType = 'negative';
            }
        }

        if (earliestIdx === remaining.length) {
            // 没有更多匹配
            parts.push({ text: remaining, type: 'normal' });
            break;
        }

        // 前面的普通文本
        if (earliestIdx > 0) {
            parts.push({ text: remaining.substring(0, earliestIdx), type: 'normal' });
        }
        // 匹配到的关键词
        parts.push({ text: bestMatch, type: bestType });
        remaining = remaining.substring(earliestIdx + bestMatch.length);
    }

    return (
        <span>
            {parts.map((p, i) => {
                if (p.type === 'positive') {
                    return <span key={i} className="bg-emerald-100 text-emerald-800 px-0.5 rounded font-medium">{p.text}</span>;
                }
                if (p.type === 'negative') {
                    return <span key={i} className="bg-red-100 text-red-800 px-0.5 rounded font-medium">{p.text}</span>;
                }
                return <span key={i}>{p.text}</span>;
            })}
        </span>
    );
};

interface DashboardProps {
    results: BrandAnalysis[];
    brandName: string;
    keyword: string;
}

const Dashboard: React.FC<DashboardProps> = ({ results, brandName, keyword }) => {
    // 聚合统计
    const totalModels = results.length;
    const mentions = results.filter(r => r.isMentioned).length;
    const visibilityScore = Math.round((mentions / totalModels) * 100);

    const ranks = results.filter(r => r.rank !== null).map(r => r.rank as number);
    const avgRank = ranks.length > 0 ? (ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(1) : '-';

    const top1Count = results.filter(r => r.rank === 1).length;
    const top3Count = results.filter(r => r.rank !== null && r.rank <= 3).length;

    const positive = results.filter(r => r.sentiment === 'Positive').length;
    const neutral = results.filter(r => r.sentiment === 'Neutral').length;
    const negative = results.filter(r => r.sentiment === 'Negative').length;

    // 收集所有竞品名
    const allCompetitors = [...new Set(results.flatMap(r => r.competitors.map(c => c.name)))];

    return (
        <div className="space-y-8 animate-fade-in-up">

            {/* 概览卡片 — 升级为 SoR 风格 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Trophy className="w-4 h-4" /></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">GEO 可见度</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{visibilityScore}%</span>
                        <span className="text-xs text-slate-400">({mentions}/{totalModels})</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${visibilityScore}%` }}></div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Trophy className="w-4 h-4" /></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">平均排名</h3>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{avgRank}</div>
                    <p className="text-xs text-slate-400 mt-1">Top1 {top1Count}次 · Top3 {top3Count}次</p>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><ThumbsUp className="w-4 h-4" /></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">情感倾向</h3>
                    </div>
                    <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-xs font-medium text-slate-600">
                            <span>正面 {positive}</span><span>中性 {neutral}</span><span>负面 {negative}</span>
                        </div>
                        <SentimentBar positive={positive} neutral={neutral} negative={negative} />
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-red-50 text-red-600 rounded-lg"><XCircle className="w-4 h-4" /></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">竞品威胁</h3>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {allCompetitors.slice(0, 5).map((c, i) => (
                            <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full border border-red-100 font-medium">{c}</span>
                        ))}
                        {allCompetitors.length === 0 && <span className="text-xs text-slate-400 italic">无竞品提及</span>}
                    </div>
                </div>
            </div>

            {/* 高亮图例 */}
            <div className="flex items-center gap-4 text-xs text-slate-500 px-1">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 bg-emerald-100 rounded border border-emerald-200"></span> 品牌强关联 / 正面词
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 bg-red-100 rounded border border-red-200"></span> 风险词 / 竞品词
                </span>
            </div>

            {/* 逐模型卡片 — 带红绿高亮 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.map((result) => (
                    <div key={result.modelName} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                        {/* 卡头 */}
                        <div className={`px-6 py-4 border-b border-slate-50 flex justify-between items-center ${result.isMentioned ? 'bg-blue-50/30' : 'bg-slate-50/50'}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-slate-800">{result.modelName}</span>
                                {result.buyingStage && result.buyingStage !== 'Unknown' && (
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                        {result.buyingStage} Stage
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {result.isMentioned ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> 已提及
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                                        <Minus className="w-3.5 h-3.5" /> 未提及
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 卡体 */}
                        <div className="p-6 flex-grow flex flex-col gap-4">
                            {/* 摘要 — 带红绿高亮 */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    <HighlightedText text={result.summary} brandName={brandName} competitors={allCompetitors} />
                                </p>
                            </div>

                            {/* 优劣势 */}
                            {(result.pros.length > 0 || result.cons.length > 0) && (
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1">
                                            <ThumbsUp className="w-3.5 h-3.5" /> 优势
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {result.pros.slice(0, 3).map((pro, i) => (
                                                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                    <span className="text-emerald-500 mt-0.5">•</span>
                                                    <HighlightedText text={pro} brandName={brandName} competitors={allCompetitors} />
                                                </li>
                                            ))}
                                            {result.pros.length === 0 && <span className="text-xs text-slate-400 italic">无明显优势</span>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-1">
                                            <ThumbsDown className="w-3.5 h-3.5" /> 劣势
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {result.cons.slice(0, 3).map((con, i) => (
                                                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                    <span className="text-red-400 mt-0.5">•</span>
                                                    <HighlightedText text={con} brandName={brandName} competitors={allCompetitors} />
                                                </li>
                                            ))}
                                            {result.cons.length === 0 && <span className="text-xs text-slate-400 italic">无明显劣势</span>}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* 排名与情感 */}
                            {result.isMentioned && (
                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">排名:</span>
                                        <span className="font-bold text-slate-900 text-lg">#{result.rank ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">情感:</span>
                                        <span className={`font-bold px-2 py-0.5 rounded-md text-xs ${result.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' :
                                            result.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>{result.sentiment === 'Positive' ? '正面' : result.sentiment === 'Negative' ? '负面' : '中性'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
