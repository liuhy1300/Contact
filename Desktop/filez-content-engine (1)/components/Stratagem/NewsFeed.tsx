import React from 'react';
import { NewsItem } from '../../types/stratagem';
import { CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
    news: NewsItem[];
}

const NewsFeed: React.FC<Props> = ({ news }) => {
    if (!news || news.length === 0) return null;

    return (
        <div className="space-y-4">
            {news.map((item, idx) => (
                <div key={idx} className="relative pl-6 pb-6 border-l border-slate-200 last:pb-0 group">
                    <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white group-hover:bg-indigo-600 transition-all shadow-sm"></div>

                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1 font-medium">
                            <CalendarDays className="w-3 h-3" />
                            {item.date}
                        </span>
                        <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${item.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            item.sentiment === 'Negative' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                            {item.sentiment === 'Positive' && <TrendingUp className="w-3 h-3" />}
                            {item.sentiment === 'Negative' && <TrendingDown className="w-3 h-3" />}
                            {item.sentiment === 'Neutral' && <Minus className="w-3 h-3" />}
                            {item.sentiment === 'Positive' ? '利好' : item.sentiment === 'Negative' ? '风险' : '中性'}
                        </div>
                    </div>

                    <h4 className="text-slate-900 font-bold text-sm mb-1.5 leading-snug group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all cursor-default font-medium">
                        {item.summary}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default NewsFeed;
