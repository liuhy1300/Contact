import React from 'react';
import { HistoryItem } from '../../types/stratagem';
import { FileBarChart, Layers, Activity, Clock, Trash2, Eye, Search } from 'lucide-react';

interface Props {
    history: HistoryItem[];
    onViewReport: (item: HistoryItem) => void;
    onDeleteReport: (id: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; iconBg: string }> = ({ title, value, icon, color, iconBg }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
        <div>
            <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2 font-sans">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${iconBg} ${color}`}>
            {icon}
        </div>
    </div>
);

const AdminDashboard: React.FC<Props> = ({ history, onViewReport, onDeleteReport }) => {
    const singleCount = history.filter(h => h.type === 'single').length;
    const compareCount = history.filter(h => h.type === 'compare').length;
    const indexCount = history.filter(h => h.type === 'index').length;

    return (
        <div className="animate-fade-in font-sans max-w-7xl mx-auto">
            <div className="mb-10 border-b border-slate-200 pb-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">战略情报控制台</h2>
                <p className="text-slate-500 font-medium">查看所有的 B2B 市场分析、竞品对比与品牌审计记录。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    title="深度单品分析 (Reports)"
                    value={singleCount}
                    icon={<Search className="w-6 h-6" />}
                    color="text-blue-600"
                    iconBg="bg-blue-50"
                />
                <StatCard
                    title="多维竞品对比 (Audits)"
                    value={compareCount}
                    icon={<Layers className="w-6 h-6" />}
                    color="text-emerald-600"
                    iconBg="bg-emerald-50"
                />
                <StatCard
                    title="VISA 品牌指数 (Index)"
                    value={indexCount}
                    icon={<Activity className="w-6 h-6" />}
                    color="text-amber-600"
                    iconBg="bg-amber-50"
                />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-500" />
                        情报档案库
                    </h3>
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md border border-slate-200">LOCAL_SYNC_ACTIVE</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-200">
                                <th className="p-5 font-sans">报告类型</th>
                                <th className="p-5 font-sans">目标对象 / 标题</th>
                                <th className="p-5 font-sans">生成时间</th>
                                <th className="p-5 font-sans">核心摘要 / 洞察</th>
                                <th className="p-5 font-sans text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-500 font-medium italic">
                                        暂无情报记录。请开始新的市场分析任务。
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${item.type === 'single' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    item.type === 'compare' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        item.type === 'index' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            item.type === 'battlecard' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                item.type === 'toneguard' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                    item.type === 'sentiment' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                                                                        item.type === 'brandkit' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                                                            'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}>
                                                {item.type === 'single' ? '单品深析' :
                                                    item.type === 'compare' ? '竞品对比' :
                                                        item.type === 'index' ? 'VISA 指数' :
                                                            item.type === 'battlecard' ? '攻防卡' :
                                                                item.type === 'toneguard' ? '语调审查' :
                                                                    item.type === 'sentiment' ? '舆情分析' :
                                                                        item.type === 'brandkit' ? '工具包' : item.type}
                                            </span>
                                        </td>
                                        <td className="p-5 text-slate-900 font-bold text-lg tracking-tight">
                                            {item.title}
                                        </td>
                                        <td className="p-5 text-slate-500 text-sm font-mono">
                                            {new Date(item.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-5 text-slate-600 text-sm max-w-md">
                                            <p className="truncate opacity-80 group-hover:opacity-100 transition-opacity font-medium">
                                                {item.summary}
                                            </p>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onViewReport(item)}
                                                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> 查看
                                                </button>
                                                <button
                                                    onClick={() => onDeleteReport(item.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                    title="删除"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
