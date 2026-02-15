// ============================================================
// 场景化竞技场 (Scenario Arena)
// ============================================================
import React from 'react';
import { ScenarioArenaResult } from '../../types/geo';
import { Swords, Trophy, Target, AlertTriangle, ArrowRight, ThumbsUp, ThumbsDown, Shield, Zap, DollarSign, Layers, FileText, Copy, Printer } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface Props {
    result: ScenarioArenaResult;
}

const ScenarioArena: React.FC<Props> = ({ result }) => {
    const isBrandWin = result.winner === 'brand';
    const isTie = result.winner === 'tie';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 对抗头部 */}
            <div className={`rounded-2xl p-6 border ${isBrandWin ? 'bg-emerald-50/50 border-emerald-200' : isTie ? 'bg-slate-50 border-slate-200' : 'bg-red-50/50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">场景</p>
                        <h2 className="text-lg font-bold text-slate-900">{result.scenarioLabel}</h2>
                    </div>
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm ${isBrandWin ? 'bg-emerald-100 text-emerald-700' : isTie ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-700'
                        }`}>
                        <Trophy className="w-4 h-4" />
                        {isBrandWin ? `${result.brandName} 胜出` : isTie ? '势均力敌' : `${result.competitorName} 胜出`}
                    </div>
                </div>

                {/* VS 对比 */}
                <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{result.brandName}</p>
                        <p className={`text-sm font-bold mt-1 ${result.brandRank !== null ? 'text-blue-600' : 'text-slate-400'}`}>
                            {result.brandRank !== null ? `排名 #${result.brandRank}` : '未被提及'}
                        </p>
                    </div>
                    <div className="text-center">
                        <Swords className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs text-slate-400 mt-1">VS</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{result.competitorName}</p>
                        <p className={`text-sm font-bold mt-1 ${result.competitorRank !== null ? 'text-blue-600' : 'text-slate-400'}`}>
                            {result.competitorRank !== null ? `排名 #${result.competitorRank}` : '未被提及'}
                        </p>
                    </div>
                </div>
            </div>

            {/* AI 原始回答 */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm">AI 原始回答</h3>
                    <p className="text-xs text-slate-400 mt-0.5">查询：{result.query}</p>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.aiResponse}</p>
                </div>
            </div>

            {/* SWOT 差距分析 */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        SWOT 差距分析
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 品牌优势 */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" /> {result.brandName} 优势
                        </h4>
                        <ul className="space-y-1.5">
                            {result.swotGap.brandStrengths.map((s, i) => (
                                <li key={i} className="text-xs text-emerald-700 flex items-start gap-1.5">
                                    <span className="text-emerald-400 mt-0.5">•</span> {s}
                                </li>
                            ))}
                            {result.swotGap.brandStrengths.length === 0 && <li className="text-xs text-slate-400 italic">无数据</li>}
                        </ul>
                    </div>

                    {/* 品牌劣势 */}
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-1">
                            <ThumbsDown className="w-3.5 h-3.5" /> {result.brandName} 劣势
                        </h4>
                        <ul className="space-y-1.5">
                            {result.swotGap.brandWeaknesses.map((w, i) => (
                                <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                                    <span className="text-red-400 mt-0.5">•</span> {w}
                                </li>
                            ))}
                            {result.swotGap.brandWeaknesses.length === 0 && <li className="text-xs text-slate-400 italic">无数据</li>}
                        </ul>
                    </div>

                    {/* 竞品优势 */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" /> {result.competitorName} 优势
                        </h4>
                        <ul className="space-y-1.5">
                            {result.swotGap.competitorStrengths.map((s, i) => (
                                <li key={i} className="text-xs text-blue-700 flex items-start gap-1.5">
                                    <span className="text-blue-400 mt-0.5">•</span> {s}
                                </li>
                            ))}
                            {result.swotGap.competitorStrengths.length === 0 && <li className="text-xs text-slate-400 italic">无数据</li>}
                        </ul>
                    </div>

                    {/* 竞品劣势 */}
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-amber-600 uppercase mb-2 flex items-center gap-1">
                            <ThumbsDown className="w-3.5 h-3.5" /> {result.competitorName} 劣势
                        </h4>
                        <ul className="space-y-1.5">
                            {result.swotGap.competitorWeaknesses.map((w, i) => (
                                <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                                    <span className="text-amber-400 mt-0.5">•</span> {w}
                                </li>
                            ))}
                            {result.swotGap.competitorWeaknesses.length === 0 && <li className="text-xs text-slate-400 italic">无数据</li>}
                        </ul>
                    </div>
                </div>
            </div>

            {/* 差距根因 + 行动建议 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        差距根因
                    </h3>
                    <p className="text-sm text-amber-700 leading-relaxed">{result.rootCause}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                        <ArrowRight className="w-4 h-4" />
                        行动建议
                    </h3>
                    <p className="text-sm text-blue-700 leading-relaxed">{result.actionPlan}</p>
                </div>
            </div>
            {/* 核心指标对比雷达图 */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        核心作战指标对比 (5D Radar)
                    </h3>
                </div>
                <div className="p-6">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                { subject: '安全性', A: 95, B: 70, fullMark: 100 },
                                { subject: '传输速度', A: 90, B: 85, fullMark: 100 },
                                { subject: '合规性', A: 98, B: 60, fullMark: 100 },
                                { subject: '易用性', A: 80, B: 90, fullMark: 100 },
                                { subject: '价格竞争力', A: 75, B: 85, fullMark: 100 },
                            ]}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                <Radar name={result.brandName} dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                                <Radar name={result.competitorName} dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 赢单话术卡 (Kill Sheet) */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl text-white">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Swords className="w-5 h-5 text-amber-400" />
                        销售赢单话术卡 (Kill Sheet)
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                            <Copy className="w-4 h-4 text-slate-300" />
                        </button>
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                            <Printer className="w-4 h-4 text-slate-300" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-amber-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                <Shield className="w-3 h-3" /> 当客户质疑安全性时...
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                "虽然 {result.competitorName} 价格较低，但他们在 ISO27001 审计中缺失了针对跨国传输的加密模块。Filez 拥有独家的银行业务级加密通道，能确保您的核心资产万无一失。您更看重 10% 的预算节省，还是 100% 的数据安全？"
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-blue-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                <Zap className="w-3 h-3" /> 当客户提到速度时...
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                "{result.competitorName} 的节点主要集中在北美，而 Filez 在亚太地区拥有 50+ 骨干网节点。实测显示，在中国及东南亚地区，我们的上传速度比他们快 3 倍以上。我们可以现在就为您开通测试账号体验一下。"
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-emerald-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                <DollarSign className="w-3 h-3" /> 价值锚定话术
                            </h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 font-bold">•</span>
                                    <span>本地化部署服务响应时间 <span className="text-white font-bold">2小时 vs 24小时</span></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 font-bold">•</span>
                                    <span>信创环境 100% 适配认证</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 font-bold">•</span>
                                    <span>无隐形数据取回费用</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center justify-center text-center h-[120px] cursor-pointer hover:bg-white/20 transition-all group">
                            <div>
                                <FileText className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-white transition-colors" />
                                <span className="text-xs font-bold text-slate-400 group-hover:text-white">下载完整竞品分析报告 (PDF)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioArena;
