import React, { useState } from 'react';
import { AnalysisRequest } from '../types';

interface InputSectionProps {
  onAnalyze: (data: AnalysisRequest) => void;
  isAnalyzing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [brandName, setBrandName] = useState('');
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName.trim() && keyword.trim()) {
      onAnalyze({ brandName, keyword });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 text-center">
      <div className="inline-block px-4 py-1.5 rounded-full bg-brand-900/30 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6 animate-fade-in">
        全新: 包含竞品分析与内容实验室 🧪
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        主宰 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-500">生成式引擎</span> 搜索
      </h1>
      <p className="text-slate-400 mb-8 text-lg max-w-2xl mx-auto">
        不仅监控排名，更像 Surfer SEO 一样优化您的品牌内容。
        查看 Gemini、ChatGPT、Claude 对您和竞品的真实评价。
      </p>

      <form onSubmit={handleSubmit} className="bg-slate-800/50 p-2 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-500">🏢</span>
          </div>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="您的品牌 (例如: 钉钉)"
            className="w-full pl-10 pr-4 py-4 bg-slate-900/50 border border-transparent rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white placeholder-slate-500 outline-none transition-all"
            required
          />
        </div>
        
        <div className="flex-[2] relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-500">🔍</span>
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="目标关键词 (例如: 最佳企业协作软件)"
            className="w-full pl-10 pr-4 py-4 bg-slate-900/50 border border-transparent rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white placeholder-slate-500 outline-none transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className={`px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 min-w-[140px]
            ${isAnalyzing 
              ? 'bg-slate-700 cursor-wait opacity-80' 
              : 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 hover:shadow-brand-500/25'
            }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>深度分析...</span>
            </>
          ) : (
            <>
              <span>开始审计</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;