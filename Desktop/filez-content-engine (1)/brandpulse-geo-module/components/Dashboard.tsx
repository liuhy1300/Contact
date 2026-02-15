import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid } from 'recharts';
import { BrandAnalysis, AggregatedStats, ContentAuditResult } from '../types';
import { auditContentForGeo } from '../services/geminiService';

interface DashboardProps {
  results: BrandAnalysis[];
  brandName: string;
  keyword: string;
}

const Dashboard: React.FC<DashboardProps> = ({ results, brandName, keyword }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'lab'>('overview');
  
  // Lab State
  const [auditContent, setAuditContent] = useState('');
  const [auditResult, setAuditResult] = useState<ContentAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // --- Calculations ---
  const stats: AggregatedStats = useMemo(() => {
    let totalMentions = 0;
    let totalRank = 0;
    let rankedCount = 0;
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    const competitorMap = new Map<string, { count: number, ranks: number[] }>();

    results.forEach(r => {
      // Basic Stats
      if (r.isMentioned) totalMentions++;
      if (r.rank) {
        totalRank += r.rank;
        rankedCount++;
      }
      if (r.sentiment === 'Positive') sentiment.positive++;
      else if (r.sentiment === 'Neutral') sentiment.neutral++;
      else if (r.sentiment === 'Negative') sentiment.negative++;

      // Competitor Aggregation
      r.competitors.forEach(comp => {
        // Don't count self as competitor if named differently (simple check)
        if (!comp.name.toLowerCase().includes(brandName.toLowerCase())) {
          const existing = competitorMap.get(comp.name) || { count: 0, ranks: [] };
          existing.count++;
          if (comp.rank) existing.ranks.push(comp.rank);
          competitorMap.set(comp.name, existing);
        }
      });
    });

    const topCompetitors = Array.from(competitorMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgRank: data.ranks.length > 0 ? data.ranks.reduce((a, b) => a + b, 0) / data.ranks.length : 0
      }))
      .sort((a, b) => b.count - a.count) // Sort by visibility first
      .slice(0, 5);

    let score = (totalMentions / results.length) * 100;
    if (rankedCount > 0 && (totalRank / rankedCount) <= 3) score += 10;
    if (sentiment.negative > 0) score -= 20;
    
    return {
      visibilityScore: Math.min(Math.max(Math.round(score), 0), 100),
      avgRank: rankedCount > 0 ? parseFloat((totalRank / rankedCount).toFixed(1)) : null,
      sentimentBreakdown: sentiment,
      totalMentions,
      totalModels: results.length,
      topCompetitors
    };
  }, [results, brandName]);

  const runAudit = async () => {
    if (!auditContent) return;
    setIsAuditing(true);
    const res = await auditContentForGeo(keyword, auditContent);
    setAuditResult(res);
    setIsAuditing(false);
  };

  const sentimentData = [
    { name: '正面', value: stats.sentimentBreakdown.positive, color: '#22c55e' },
    { name: '中立', value: stats.sentimentBreakdown.neutral, color: '#94a3b8' },
    { name: '负面', value: stats.sentimentBreakdown.negative, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // --- Sub-Components ---
  
  const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2
        ${activeTab === id 
          ? 'border-brand-500 text-white bg-slate-800/50' 
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
        }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      Pass: 'bg-green-500/10 text-green-400 border-green-500/20',
      Warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      Critical: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs border ${colors[status as keyof typeof colors] || colors.Warning}`}>
        {status === 'Pass' ? '通过' : status === 'Warning' ? '警告' : '严重'}
      </span>
    );
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'Awareness': return '认知阶段 (介绍)';
      case 'Consideration': return '考虑阶段 (对比)';
      case 'Decision': return '决策阶段 (推荐)';
      default: return '未知';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        <TabButton id="overview" label="总览与反馈" icon="📊" />
        <TabButton id="competitors" label="竞品情报" icon="⚔️" />
        <TabButton id="lab" label="优化实验室" icon="🧪" />
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">GEO 可见性评分</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-white">{stats.visibilityScore}</span>
                <span className={`text-sm mb-1 ${stats.visibilityScore > 50 ? 'text-green-400' : 'text-red-400'}`}>
                   {stats.visibilityScore > 80 ? '卓越' : stats.visibilityScore > 50 ? '良好' : '需优化'}
                </span>
              </div>
              <div className="w-full bg-slate-700 h-1 mt-4 rounded-full">
                <div className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full" style={{ width: `${stats.visibilityScore}%` }}></div>
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">平均排名</h3>
              <div className="text-4xl font-bold text-brand-400">{stats.avgRank ? `#${stats.avgRank}` : '-'}</div>
              <p className="text-xs text-slate-500 mt-2">在提及您的 AI 回答中</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">提及覆盖率</h3>
              <div className="text-4xl font-bold text-white">{Math.round((stats.totalMentions / stats.totalModels) * 100)}%</div>
              <p className="text-xs text-slate-500 mt-2">{stats.totalMentions} / {stats.totalModels} 个模型提及</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">情感倾向</h3>
              <div className="flex-grow flex items-center">
                 <ResponsiveContainer width="100%" height={60}>
                    <PieChart>
                      <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={20} outerRadius={30} dataKey="value">
                        {sentimentData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {stats.sentimentBreakdown.positive > 0 ? '正面' : '中立'}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Detailed Feedback Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
             <div className="p-5 border-b border-slate-700">
               <h3 className="font-semibold text-white">AI 深度反馈与分析</h3>
             </div>
             <table className="w-full text-left">
               <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                 <tr>
                   <th className="p-4 w-1/6">模型</th>
                   <th className="p-4 w-1/12">排名</th>
                   <th className="p-4 w-1/4">AI 摘要 (Summary)</th>
                   <th className="p-4 w-1/6">购买阶段</th>
                   <th className="p-4 w-1/4">关键优缺点</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700 text-sm">
                 {results.map(r => (
                   <tr key={r.modelId} className="hover:bg-slate-700/30">
                     <td className="p-4 font-medium text-white">
                       <div className="flex flex-col">
                         <span>{r.modelName}</span>
                         <span className={`text-xs mt-1 ${r.isMentioned ? 'text-green-400' : 'text-slate-500'}`}>
                           {r.isMentioned ? '已提及' : '未提及'}
                         </span>
                       </div>
                     </td>
                     <td className="p-4 text-slate-300 font-bold text-lg">{r.rank ? `#${r.rank}` : '-'}</td>
                     <td className="p-4 text-slate-300">
                       <p className="line-clamp-3 text-xs leading-relaxed">{r.summary}</p>
                     </td>
                     <td className="p-4">
                       <span className={`inline-block px-2 py-1 rounded-md text-xs border ${
                         r.buyingStage === 'Decision' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                         r.buyingStage === 'Consideration' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                         'bg-slate-700 text-slate-300 border-slate-600'
                       }`}>
                         {getStageLabel(r.buyingStage)}
                       </span>
                     </td>
                     <td className="p-4">
                       <div className="space-y-2">
                         {r.pros.length > 0 && (
                           <div className="flex gap-2 items-start">
                             <span className="text-green-500 text-xs mt-0.5">👍</span>
                             <span className="text-slate-300 text-xs">{r.pros.slice(0, 2).join('; ')}</span>
                           </div>
                         )}
                         {r.cons.length > 0 && (
                           <div className="flex gap-2 items-start">
                             <span className="text-red-500 text-xs mt-0.5">👎</span>
                             <span className="text-slate-300 text-xs">{r.cons.slice(0, 2).join('; ')}</span>
                           </div>
                         )}
                         {r.pros.length === 0 && r.cons.length === 0 && <span className="text-slate-500 text-xs italic">无明显优缺点评价</span>}
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* --- COMPETITORS TAB --- */}
      {activeTab === 'competitors' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-6">竞品声量份额 (Share of Voice)</h3>
              {stats.topCompetitors.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topCompetitors} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                        cursor={{fill: '#334155', opacity: 0.4}}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                         {stats.topCompetitors.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  未在 AI 回答中检测到明显的竞争对手。
                </div>
              )}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">竞品洞察</h3>
              <div className="space-y-4">
                {stats.topCompetitors.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                        #{idx + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-200">{comp.name}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      提及 {comp.count} 次
                    </div>
                  </div>
                ))}
                {stats.topCompetitors.length === 0 && <p className="text-slate-500 text-sm">数据不足以生成洞察。</p>}
              </div>
              <div className="mt-6 p-4 bg-brand-900/20 border border-brand-500/20 rounded-lg">
                <p className="text-xs text-brand-300">
                  <span className="font-bold">💡 策略:</span> 你的头号竞争对手出现的频率比你高。检查他们的 G2 评分和维基百科词条。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LAB TAB --- */}
      {activeTab === 'lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Input Area */}
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span>🧬</span> 内容优化器
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                粘贴您的“关于我们”页面或着陆页文案。我们将根据 GEO 原则（权威性、结构、事实密度）对其进行审核。
              </p>
              <textarea
                className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none font-mono"
                placeholder={`在此粘贴关于 "${keyword}" 的品牌内容...`}
                value={auditContent}
                onChange={(e) => setAuditContent(e.target.value)}
              />
              <button
                onClick={runAudit}
                disabled={isAuditing || !auditContent}
                className="mt-4 w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAuditing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                    正在分析...
                  </>
                ) : "运行 GEO 审计"}
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="space-y-4">
            {auditResult ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-white">审计结果</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">GEO 评分:</span>
                    <span className={`text-2xl font-bold ${auditResult.score > 80 ? 'text-green-400' : auditResult.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {auditResult.score}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Suggestions List */}
                  {auditResult.suggestions.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-sm text-white font-medium mb-1">{item.message}</p>
                      <p className="text-xs text-slate-400">💡 修复建议: <span className="text-brand-300">{item.fix}</span></p>
                    </div>
                  ))}

                  {/* Missing Keywords */}
                  {auditResult.missingKeywords.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-semibold text-white mb-2">缺失的语义实体</h4>
                      <div className="flex flex-wrap gap-2">
                        {auditResult.missingKeywords.map(k => (
                          <span key={k} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center text-slate-500 border-dashed">
                <div className="text-4xl mb-4">🧪</div>
                <p>在左侧输入内容并点击运行，<br/>获取针对 LLM 的优化建议。</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;