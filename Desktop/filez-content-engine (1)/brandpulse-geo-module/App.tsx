import React, { useState } from 'react';
import { ModelConfig, AnalysisRequest, BrandAnalysis } from './types';
import { runGeoAnalysis } from './services/geminiService';
import InputSection from './components/InputSection';
import Dashboard from './components/Dashboard';

// Configuration for the models
const MODELS: ModelConfig[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '🤖' },
  { id: 'gemini-3-pro', name: 'Gemini 3.0 Pro', provider: 'Google', icon: '✨' }, // Updated to 3.0 Pro
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '🧠' },
  { id: 'perplexity', name: 'Perplexity', provider: 'Perplexity', icon: '🌐' },
];

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<BrandAnalysis[] | null>(null);
  const [requestData, setRequestData] = useState<AnalysisRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (data: AnalysisRequest) => {
    setIsAnalyzing(true);
    setResults(null);
    setError(null);
    setRequestData(data);

    try {
      const analysisResults = await runGeoAnalysis(data.brandName, data.keyword, MODELS);
      setResults(analysisResults);
    } catch (err) {
      console.error(err);
      setError("无法运行分析。请检查您的网络连接或 API 密钥。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setRequestData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      {/* Navbar - Cleaned up */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
               BP
             </div>
             <span className="font-bold text-lg tracking-tight">BrandPulse <span className="text-brand-500">GEO</span></span>
          </div>
          <div className="flex items-center gap-4">
             {/* Removed Links as requested */}
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
               👤
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        {!results && !isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] animate-fade-in">
            <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            
            {/* Social Proof / Badges */}
            <div className="mt-16 flex gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
               <span className="text-xl font-bold flex items-center gap-2"><span className="text-2xl">🤖</span> OpenAI</span>
               <span className="text-xl font-bold flex items-center gap-2"><span className="text-2xl">✨</span> Gemini</span>
               <span className="text-xl font-bold flex items-center gap-2"><span className="text-2xl">🧠</span> Anthropic</span>
               <span className="text-xl font-bold flex items-center gap-2"><span className="text-2xl">🌐</span> Perplexity</span>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
             {/* Header during analysis or results */}
             <div className="flex justify-between items-center mb-8">
               <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isAnalyzing ? "正在进行深度分析..." : "GEO 分析报告"}
                  </h2>
                  {requestData && (
                    <p className="text-slate-400 mt-1">
                      查询: <span className="text-brand-400">"{requestData.keyword}"</span> • 品牌: <span className="text-white font-medium">{requestData.brandName}</span>
                    </p>
                  )}
               </div>
               {!isAnalyzing && (
                 <button 
                   onClick={handleReset}
                   className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                 >
                   新搜索
                 </button>
               )}
             </div>

             {/* Error State */}
             {error && (
               <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                 {error}
               </div>
             )}

             {/* Loading State */}
             {isAnalyzing && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 bg-slate-800 rounded-2xl border border-slate-700/50"></div>
                  ))}
                  <div className="col-span-full h-96 bg-slate-800 rounded-2xl border border-slate-700/50 mt-4"></div>
               </div>
             )}

             {/* Results Dashboard */}
             {results && requestData && (
               <Dashboard results={results} brandName={requestData.brandName} keyword={requestData.keyword} />
             )}
          </div>
        )}
      </main>

      {/* Footer - Removed content as requested */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-4"></footer>
    </div>
  );
};

export default App;