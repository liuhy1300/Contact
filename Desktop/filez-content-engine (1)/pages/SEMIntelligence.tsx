// SEM 智数 — 搜索引擎营销智能分析模块
import React, { useState, useRef } from 'react';
import {
    Search, Zap, TrendingUp, Target, DollarSign, FileText, BarChart3,
    Sparkles, ChevronRight, AlertTriangle, CheckCircle2, XCircle,
    Copy, RefreshCw, ArrowRight, Star, Award, Activity, Layers,
    Upload, MessageSquare, Send, Bot, User, Table2, FileDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SEMService, KeywordInsight, AdCopyVariant, QualityScoreAudit, BidStrategy, CSVAnalysisResult } from '../services/SEMService';

// ── 子模块 Tab 定义 ──
type SEMTab = 'keywords' | 'adcopy' | 'quality' | 'bidding' | 'audit' | 'advisor';

const TABS: { id: SEMTab; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'advisor', label: '智投参谋', icon: BarChart3, color: 'text-indigo-500', desc: 'CSV 数据分析 + AI 问数' },
    { id: 'keywords', label: '关键词拓展', icon: Search, color: 'text-blue-500', desc: '智能拓词 + 竞争分析' },
    { id: 'adcopy', label: '广告文案', icon: FileText, color: 'text-purple-500', desc: 'AI 生成高质量创意' },
    { id: 'quality', label: '质量诊断', icon: Activity, color: 'text-amber-500', desc: '质量得分审计优化' },
    { id: 'bidding', label: '出价策略', icon: DollarSign, color: 'text-emerald-500', desc: '智能出价建议' },
    { id: 'audit', label: '账户诊断', icon: Award, color: 'text-red-500', desc: '全面健康检查' },
];

const SEMIntelligence: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SEMTab>('advisor');
    const [loading, setLoading] = useState(false);

    // ── CSV 智投参谋状态 ──
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
    const [csvColumns, setCsvColumns] = useState<string[]>([]);
    const [csvFileName, setCsvFileName] = useState('');
    const [csvAnalysis, setCsvAnalysis] = useState<CSVAnalysisResult | null>(null);
    const [csvSearchTerm, setCsvSearchTerm] = useState('');
    const [csvSortCol, setCsvSortCol] = useState('');
    const [csvSortAsc, setCsvSortAsc] = useState(true);
    // AI 问数对话
    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // ── 关键词模块状态 ──
    const [kwSeed, setKwSeed] = useState('');
    const [kwIndustry, setKwIndustry] = useState('');
    const [kwBudget, setKwBudget] = useState('');
    const [kwResults, setKwResults] = useState<KeywordInsight[]>([]);

    // ── 广告文案模块状态 ──
    const [adProduct, setAdProduct] = useState('');
    const [adKeywords, setAdKeywords] = useState('');
    const [adUSP, setAdUSP] = useState('');
    const [adTone, setAdTone] = useState('专业可信');
    const [adResults, setAdResults] = useState<AdCopyVariant[]>([]);

    // ── 质量诊断模块状态 ──
    const [qsKeyword, setQsKeyword] = useState('');
    const [qsAdText, setQsAdText] = useState('');
    const [qsLandingDesc, setQsLandingDesc] = useState('');
    const [qsResult, setQsResult] = useState<QualityScoreAudit | null>(null);

    // ── 出价策略模块状态 ──
    const [bidKeywords, setBidKeywords] = useState('');
    const [bidBudget, setBidBudget] = useState('');
    const [bidGoal, setBidGoal] = useState('最大化转化');
    const [bidIndustry, setBidIndustry] = useState('');
    const [bidResult, setBidResult] = useState<BidStrategy | null>(null);

    // ── 账户诊断状态 ──
    const [auditDesc, setAuditDesc] = useState('');
    const [auditMetrics, setAuditMetrics] = useState('');
    const [auditResult, setAuditResult] = useState<any>(null);

    // ── Toast ──
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
    const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── CSV 解析（支持百度推广元数据行跳过） ──
    const parseCSV = (text: string): { rows: Record<string, string>[]; columns: string[] } => {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return { rows: [], columns: [] };

        // 智能检测表头行：跳过百度推广元数据行（5-7 行如“数据生成时间”等）
        // 找到包含 “日期”或“计划”或“关键词”或“展现”等关键字的行作为电子表头
        const headerKeywords = ['日期', '计划', '关键词', '展现', '点击', '消费', 'date', 'campaign', 'keyword', 'impression', 'click', 'cost'];
        let headerIndex = 0;
        for (let i = 0; i < Math.min(lines.length, 15); i++) {
            const lower = lines[i].toLowerCase();
            const matchCount = headerKeywords.filter(kw => lower.includes(kw)).length;
            if (matchCount >= 2) {
                headerIndex = i;
                break;
            }
        }

        // 智能检测分隔符
        const headerLine = lines[headerIndex];
        const separator = headerLine.includes('\t') ? '\t' : ',';
        const headers = headerLine.split(separator).map(h => h.replace(/^"|"$/g, '').trim());

        const rows: Record<string, string>[] = [];
        for (let i = headerIndex + 1; i < lines.length; i++) {
            const values = lines[i].split(separator).map(v => v.replace(/^"|"$/g, '').trim());
            // 跳过空行或元数据尾行
            if (values.length < headers.length * 0.5) continue;
            const row: Record<string, string> = {};
            headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
            // 跳过展现量为 0 的行（根据 PRD 清洗规则）
            const impressionCol = headers.find(h => h.includes('展现') || h.toLowerCase().includes('impression'));
            if (impressionCol && row[impressionCol] === '0') continue;
            rows.push(row);
        }
        return { rows, columns: headers };
    };

    const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith('.csv') && !file.name.endsWith('.tsv')) {
            return showToast('请上传 CSV 或 TSV 文件', 'err');
        }
        setLoading(true);
        setCsvFileName(file.name);
        try {
            // 自动检测编码：优先 UTF-8，若乱码则回退 GBK（百度推广 CSV 常用 GBK）
            const arrayBuffer = await file.arrayBuffer();
            let text = new TextDecoder('utf-8').decode(arrayBuffer);
            // 检测是否有大量乱码（UTF-8 解码 GBK 会产生 replacement character U+FFFD）
            const garbledRatio = (text.match(/\uFFFD/g) || []).length / text.length;
            if (garbledRatio > 0.01) {
                // 回退到 GBK 解码
                try {
                    text = new TextDecoder('gbk').decode(arrayBuffer);
                } catch {
                    // 如果浏览器不支持 GBK，尝试 gb2312 / gb18030
                    try {
                        text = new TextDecoder('gb18030').decode(arrayBuffer);
                    } catch {
                        // 最终回退到原始 UTF-8
                    }
                }
            }
            const { rows, columns } = parseCSV(text);
            if (rows.length === 0) return showToast('文件为空或格式错误', 'err');
            setCsvData(rows);
            setCsvColumns(columns);
            showToast(`已解析 ${rows.length} 行数据 ✅`);

            // 自动触发 AI 分析（传递全量数据）
            const csvSummary = `共 ${rows.length} 行数据，${columns.length} 列`;
            // 将所有行转换为字符串，不进行截断
            const csvContent = rows.map(r => columns.map(c => r[c]).join(' | ')).join('\n');
            const analysis = await SEMService.analyzeCSVData({ csvSummary, csvContent, columns });
            setCsvAnalysis(analysis);
            // 添加 AI 欢迎消息
            setChatMessages([{
                role: 'ai',
                content: `你好！我是您的 SEM 智投参谋。\n我能为您做什么？\n\n• 分析 **计划/单元** 的宏观表现\n• 诊断 **关键词** 质量度与效率\n• 提供具体的**优化策略建议**\n\n数据已加载：${file.name}（${rows.length} 行）`
            }]);
            showToast('AI 分析完成 ✅');
        } catch (err: any) {
            showToast('分析失败: ' + err.message, 'err');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ── PDF 导出 ──
    const reportRef = useRef<HTMLDivElement>(null);
    const handleExportPDF = async () => {
        if (!reportRef.current) return;
        const btn = document.getElementById('export-btn');
        if (btn) btn.style.display = 'none'; // 截图时隐藏按钮

        try {
            showToast('正在生成 PDF...', 'ok');
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // 提高清晰度
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff' // 确保背景色
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            // 按比例缩放，如果高度超过一页，可能需要切分，这里简化为适应宽度（长图可能被压缩或单页展示）
            // 更优解是按 A4 高度分页，但在 web 报表导出场景，保持完整性通常更重要，或者只按宽度适应
            const finalWidth = pdfWidth;
            const finalHeight = (imgHeight * pdfWidth) / imgWidth;

            // 简单的长图分页逻辑
            let heightLeft = finalHeight;
            let position = 0;
            const pageHeight = pdfHeight;

            pdf.addImage(imgData, 'PNG', 0, position, finalWidth, finalHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - finalHeight; // move image up
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, finalWidth, finalHeight); // position ignores negative? jsPDF tricky part
                // 这里简易实现：如果不分页太复杂，直接输出单页长 PDF (不再支持标准打印，但适合阅读)
                // 或者简单适应一页
                heightLeft -= pageHeight;
            }
            // 修正：上述循环逻辑在 jsPDF 中处理复杂 dom 截图并不完美。
            // 我们可以直接调整 PDF 页面大小以适应内容高度（非标准 A4），适合屏幕阅读
            const autoHeightPdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
            autoHeightPdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            autoHeightPdf.save(`${csvFileName || 'SEM_Report'}_${new Date().toISOString().slice(0, 10)}.pdf`);

            showToast('PDF 导出成功 ✅');
        } catch (err: any) {
            console.error(err);
            showToast('导出失败，请重试', 'err');
        } finally {
            if (btn) btn.style.display = 'flex';
        }
    };

    // ── AI 问数对话 ──
    const handleChatSend = async (question?: string) => {
        const q = question || chatInput.trim();
        if (!q) return;
        if (csvData.length === 0) return showToast('请先上传数据', 'err');

        const userMsg = { role: 'user' as const, content: q };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setChatLoading(true);

        try {
            const csvSummary = `共 ${csvData.length} 行数据，${csvColumns.length} 列`;
            // 传递全量数据给 AI 进行问答
            const csvContent = csvData.map(r => csvColumns.map(c => r[c]).join(' | ')).join('\n');
            const answer = await SEMService.chatWithData({
                question: q,
                csvSummary,
                csvContent,
                columns: csvColumns,
                chatHistory: chatMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            });
            setChatMessages(prev => [...prev, { role: 'ai', content: answer }]);
        } catch (err: any) {
            setChatMessages(prev => [...prev, { role: 'ai', content: '❌ ' + err.message }]);
        } finally {
            setChatLoading(false);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    // ── CSV 表格排序/搜索 ──
    const getFilteredSortedData = () => {
        let data = [...csvData];
        if (csvSearchTerm) {
            const term = csvSearchTerm.toLowerCase();
            data = data.filter(row => csvColumns.some(c => (row[c] || '').toLowerCase().includes(term)));
        }
        if (csvSortCol) {
            data.sort((a, b) => {
                const va = a[csvSortCol] || '';
                const vb = b[csvSortCol] || '';
                const na = parseFloat(va.replace(/[^\d.-]/g, ''));
                const nb = parseFloat(vb.replace(/[^\d.-]/g, ''));
                if (!isNaN(na) && !isNaN(nb)) return csvSortAsc ? na - nb : nb - na;
                return csvSortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            });
        }
        return data;
    };

    // ── 关键词分析 ──
    const handleKeywordAnalysis = async () => {
        if (!kwSeed.trim()) return showToast('请输入种子关键词', 'err');
        if (!kwIndustry.trim()) return showToast('请输入行业', 'err');
        setLoading(true);
        try {
            const results = await SEMService.analyzeKeywords({
                seed_keywords: kwSeed, industry: kwIndustry, budget: kwBudget || undefined,
            });
            setKwResults(results);
            showToast(`已分析 ${results.length} 个关键词 ✅`);
        } catch (err: any) { showToast(err.message, 'err'); }
        finally { setLoading(false); }
    };

    // ── 广告文案生成 ──
    const handleAdCopyGen = async () => {
        if (!adProduct.trim() || !adKeywords.trim() || !adUSP.trim()) return showToast('请填写完整信息', 'err');
        setLoading(true);
        try {
            const results = await SEMService.generateAdCopy({
                product: adProduct, keywords: adKeywords, usp: adUSP, tone: adTone,
            });
            setAdResults(results);
            showToast(`已生成 ${results.length} 组广告创意 ✅`);
        } catch (err: any) { showToast(err.message, 'err'); }
        finally { setLoading(false); }
    };

    // ── 质量诊断 ──
    const handleQualityAudit = async () => {
        if (!qsKeyword.trim() || !qsAdText.trim()) return showToast('请填写关键词和广告文案', 'err');
        setLoading(true);
        try {
            const result = await SEMService.auditQualityScore({
                keyword: qsKeyword, ad_text: qsAdText, landing_page_desc: qsLandingDesc || '通用企业官网',
            });
            setQsResult(result);
            showToast('质量诊断完成 ✅');
        } catch (err: any) { showToast(err.message, 'err'); }
        finally { setLoading(false); }
    };

    // ── 出价策略 ──
    const handleBidStrategy = async () => {
        if (!bidKeywords.trim() || !bidBudget.trim()) return showToast('请填写关键词和预算', 'err');
        setLoading(true);
        try {
            const result = await SEMService.suggestBidStrategy({
                keywords: bidKeywords, daily_budget: bidBudget, goal: bidGoal, industry: bidIndustry || '互联网',
            });
            setBidResult(result);
            showToast('出价策略已生成 ✅');
        } catch (err: any) { showToast(err.message, 'err'); }
        finally { setLoading(false); }
    };

    // ── 账户诊断 ──
    const handleCampaignAudit = async () => {
        if (!auditDesc.trim()) return showToast('请描述广告计划', 'err');
        setLoading(true);
        try {
            const result = await SEMService.auditCampaign({
                campaign_desc: auditDesc, current_metrics: auditMetrics || undefined,
            });
            setAuditResult(result);
            showToast('账户诊断完成 ✅');
        } catch (err: any) { showToast(err.message, 'err'); }
        finally { setLoading(false); }
    };

    // ── 得分颜色 ──
    const scoreColor = (score: number, max: number = 10) => {
        const pct = score / max;
        if (pct >= 0.7) return 'text-emerald-600';
        if (pct >= 0.4) return 'text-amber-600';
        return 'text-red-600';
    };
    const scoreBg = (score: number, max: number = 10) => {
        const pct = score / max;
        if (pct >= 0.7) return 'bg-emerald-500';
        if (pct >= 0.4) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0F4FF 0%, #F5F3FF 50%, #FDF2F8 100%)' }}>
            {/* 顶部标题栏 */}
            <div className="shrink-0 px-6 py-4 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">SEM 智数</h1>
                            <p className="text-[11px] text-slate-500 mt-0.5">搜索引擎营销 AI 智能分析 · Powered by Gemini</p>
                        </div>
                    </div>
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
                            <RefreshCw className="w-4 h-4 animate-spin" /> AI 分析中...
                        </div>
                    )}
                </div>

                {/* Tab 导航 */}
                <div className="flex gap-2 mt-4">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white shadow-lg shadow-slate-200/50 text-slate-900 ring-1 ring-slate-200'
                                : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'}`}>
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                            <span className="hidden lg:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* ═══════ 关键词拓展 ═══════ */}
                {activeTab === 'keywords' && (
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                            <h2 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-blue-500" /> 智能关键词拓展
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">种子关键词 *</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 企业文件管理, 协同办公" value={kwSeed} onChange={e => setKwSeed(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">所属行业 *</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 企业级 SaaS" value={kwIndustry} onChange={e => setKwIndustry(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">月预算 (可选)</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. ¥50,000" value={kwBudget} onChange={e => setKwBudget(e.target.value)} />
                                </div>
                            </div>
                            <button onClick={handleKeywordAnalysis} disabled={loading}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> AI 拓词分析
                            </button>
                        </div>

                        {/* 关键词结果 */}
                        {kwResults.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-blue-500" /> 分析结果 · {kwResults.length} 个关键词
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                                <th className="px-4 py-3 text-left">关键词</th>
                                                <th className="px-4 py-3 text-center">月搜索量</th>
                                                <th className="px-4 py-3 text-center">竞争度</th>
                                                <th className="px-4 py-3 text-center">预估 CPC</th>
                                                <th className="px-4 py-3 text-center">相关度</th>
                                                <th className="px-4 py-3 text-left">搜索意图</th>
                                                <th className="px-4 py-3 text-left">建议</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {kwResults.map((kw, idx) => (
                                                <tr key={idx} className="border-t border-slate-100 hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-slate-800">{kw.keyword}</td>
                                                    <td className="px-4 py-3 text-center text-slate-600">{kw.search_volume}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kw.competition === '高' ? 'bg-red-100 text-red-700' : kw.competition === '中' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {kw.competition}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-mono text-slate-700">{kw.cpc_estimate}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${scoreBg(kw.relevance_score, 100)}`} style={{ width: `${kw.relevance_score}%` }} />
                                                            </div>
                                                            <span className={`text-[10px] font-bold ${scoreColor(kw.relevance_score, 100)}`}>{kw.relevance_score}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-slate-500">{kw.intent}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate" title={kw.suggestion}>{kw.suggestion}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ 广告文案生成 ═══════ */}
                {activeTab === 'adcopy' && (
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                            <h2 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-500" /> AI 广告文案生成器
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">产品/服务 *</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. Filez 企业文件管理平台" value={adProduct} onChange={e => setAdProduct(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">核心关键词 *</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. 企业网盘, 文件协同" value={adKeywords} onChange={e => setAdKeywords(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">核心卖点 (USP) *</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. 200+格式预览, 军工级安全" value={adUSP} onChange={e => setAdUSP(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">品牌调性</label>
                                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={adTone} onChange={e => setAdTone(e.target.value)}>
                                        <option>专业可信</option>
                                        <option>创新科技</option>
                                        <option>亲和友好</option>
                                        <option>高端商务</option>
                                        <option>活力年轻</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleAdCopyGen} disabled={loading}
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> 生成广告创意
                            </button>
                        </div>

                        {/* 广告创意结果 */}
                        {adResults.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {adResults.map((ad, idx) => (
                                    <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">创意 #{idx + 1}</span>
                                            <div className="flex items-center gap-1">
                                                <Star className={`w-3 h-3 ${ad.quality_prediction >= 7 ? 'text-amber-500' : 'text-slate-300'}`} />
                                                <span className={`text-xs font-black ${scoreColor(ad.quality_prediction)}`}>{ad.quality_prediction}/10</span>
                                            </div>
                                        </div>
                                        {/* 模拟 Google Ads 预览 */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-3">
                                            <div className="text-[10px] text-slate-400 mb-1">广告 · {ad.display_url}</div>
                                            <div className="text-base text-blue-700 font-bold leading-snug hover:underline cursor-default">
                                                {ad.headline1} | {ad.headline2}
                                            </div>
                                            {ad.headline3 && <div className="text-sm text-blue-700 font-medium">{ad.headline3}</div>}
                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ad.description1}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed">{ad.description2}</p>
                                            {ad.sitelinks.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {ad.sitelinks.map((sl, i) => (
                                                        <span key={i} className="text-[10px] text-blue-600 hover:underline cursor-default">{sl}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">{ad.rationale}</p>
                                        <button onClick={() => { navigator.clipboard.writeText(`${ad.headline1} | ${ad.headline2}\n${ad.description1}\n${ad.description2}`); showToast('已复制到剪贴板'); }}
                                            className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Copy className="w-3 h-3" /> 复制文案
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ 质量诊断 ═══════ */}
                {activeTab === 'quality' && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                            <h2 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-amber-500" /> 质量得分诊断
                            </h2>
                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">目标关键词 *</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="e.g. 企业级文件管理平台" value={qsKeyword} onChange={e => setQsKeyword(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">当前广告文案 *</label>
                                    <textarea className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none min-h-[80px]"
                                        placeholder="粘贴您当前的广告标题和描述..." value={qsAdText} onChange={e => setQsAdText(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">着陆页描述 (可选)</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="简述落地页内容和核心卖点" value={qsLandingDesc} onChange={e => setQsLandingDesc(e.target.value)} />
                                </div>
                            </div>
                            <button onClick={handleQualityAudit} disabled={loading}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> 开始诊断
                            </button>
                        </div>

                        {/* 质量诊断结果 */}
                        {qsResult && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-slate-800 text-sm">诊断报告</h3>
                                    <div className={`text-3xl font-black ${scoreColor(qsResult.overall_score)}`}>{qsResult.overall_score}/10</div>
                                </div>

                                {/* 三维雷达展示 */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {[
                                        { label: '广告相关性', score: qsResult.ad_relevance },
                                        { label: '着陆页体验', score: qsResult.landing_page_experience },
                                        { label: '预期点击率', score: qsResult.expected_ctr },
                                    ].map((dim, i) => (
                                        <div key={i} className="text-center bg-slate-50 rounded-xl p-4">
                                            <div className={`text-2xl font-black ${scoreColor(dim.score)}`}>{dim.score}</div>
                                            <div className="text-[10px] text-slate-500 font-bold mt-1">{dim.label}</div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                                <div className={`h-1.5 rounded-full transition-all ${scoreBg(dim.score)}`} style={{ width: `${dim.score * 10}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 问题列表 */}
                                {qsResult.issues.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-xs font-bold text-slate-700 mb-2">⚠️ 发现的问题</h4>
                                        <div className="space-y-2">
                                            {qsResult.issues.map((issue, i) => (
                                                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${issue.severity === '高' ? 'bg-red-50 border-red-200' : issue.severity === '中' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${issue.severity === '高' ? 'bg-red-200 text-red-700' : issue.severity === '中' ? 'bg-amber-200 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>{issue.severity}</span>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-700">{issue.area}: {issue.detail}</div>
                                                        <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1"><ArrowRight className="w-3 h-3" /> {issue.fix}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 建议 */}
                                {qsResult.recommendations.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-700 mb-2">💡 优化建议</h4>
                                        <ul className="space-y-1.5">
                                            {qsResult.recommendations.map((rec, i) => (
                                                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ 出价策略 ═══════ */}
                {activeTab === 'bidding' && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                            <h2 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-500" /> 智能出价策略
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">目标关键词 *</label>
                                    <textarea className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
                                        placeholder="每行一个关键词&#10;e.g. 企业网盘&#10;文件管理平台" value={bidKeywords} onChange={e => setBidKeywords(e.target.value)} />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">日预算 *</label>
                                        <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="e.g. ¥3,000" value={bidBudget} onChange={e => setBidBudget(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">投放目标</label>
                                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={bidGoal} onChange={e => setBidGoal(e.target.value)}>
                                            <option>最大化转化</option>
                                            <option>最大化点击</option>
                                            <option>目标 CPA</option>
                                            <option>目标 ROAS</option>
                                            <option>品牌曝光</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">行业</label>
                                        <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="e.g. 企业级 SaaS" value={bidIndustry} onChange={e => setBidIndustry(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleBidStrategy} disabled={loading}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> 生成出价策略
                            </button>
                        </div>

                        {/* 出价结果 */}
                        {bidResult && (
                            <div className="space-y-4">
                                {/* 策略摘要 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                                    <h3 className="text-sm font-black text-slate-800 mb-3">{bidResult.strategy_name}</h3>
                                    <p className="text-xs text-slate-600 mb-4">{bidResult.description}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: '目标 CPA', value: bidResult.target_cpa, color: 'text-blue-600' },
                                            { label: '目标 ROAS', value: bidResult.target_roas, color: 'text-purple-600' },
                                            { label: '建议日预算', value: bidResult.daily_budget_suggestion, color: 'text-emerald-600' },
                                            { label: '预估花费', value: bidResult.forecast.cost, color: 'text-amber-600' },
                                        ].map((m, i) => (
                                            <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                                                <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
                                                <div className="text-[10px] text-slate-500 font-bold">{m.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 关键词出价明细 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                                    <div className="px-6 py-3 border-b border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-800">关键词出价明细</h3>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50/80 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                                <th className="px-4 py-3 text-left">关键词</th>
                                                <th className="px-4 py-3 text-center">建议出价</th>
                                                <th className="px-4 py-3 text-left">理由</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bidResult.keyword_bids.map((kb, i) => (
                                                <tr key={i} className="border-t border-slate-100 hover:bg-emerald-50/30 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-slate-700">{kb.keyword}</td>
                                                    <td className="px-4 py-3 text-center font-mono text-emerald-700 font-bold">{kb.suggested_bid}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-500">{kb.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 效果预测 */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/60 p-5">
                                    <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> 效果预测 (月)
                                    </h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            { label: '预估展示量', value: bidResult.forecast.impressions },
                                            { label: '预估点击量', value: bidResult.forecast.clicks },
                                            { label: '预估转化量', value: bidResult.forecast.conversions },
                                            { label: '预估花费', value: bidResult.forecast.cost },
                                        ].map((f, i) => (
                                            <div key={i} className="text-center">
                                                <div className="text-xl font-black text-emerald-700">{f.value}</div>
                                                <div className="text-[10px] text-emerald-600/70 font-bold">{f.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ 账户诊断 ═══════ */}
                {activeTab === 'audit' && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                            <h2 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-red-500" /> 广告账户全面诊断
                            </h2>
                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">广告计划描述 *</label>
                                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[100px]"
                                        placeholder="描述您的广告账户情况：投放平台、推广产品、目标受众、当前策略..."
                                        value={auditDesc} onChange={e => setAuditDesc(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">当前指标 (可选)</label>
                                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="e.g. CTR 2.3%, CPC ¥5.8, 月花费 ¥80,000"
                                        value={auditMetrics} onChange={e => setAuditMetrics(e.target.value)} />
                                </div>
                            </div>
                            <button onClick={handleCampaignAudit} disabled={loading}
                                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-bold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> 开始全面诊断
                            </button>
                        </div>

                        {/* 诊断结果 */}
                        {auditResult && (
                            <div className="space-y-4">
                                {/* 评分卡 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${auditResult.score >= 70 ? 'bg-emerald-100' : auditResult.score >= 40 ? 'bg-amber-100' : 'bg-red-100'}`}>
                                            <div className={`text-3xl font-black ${scoreColor(auditResult.score, 100)}`}>{auditResult.score}</div>
                                            <div className="text-[10px] font-bold text-slate-500">/ 100</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-lg font-black ${scoreColor(auditResult.score, 100)}`}>等级 {auditResult.grade}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">{auditResult.summary}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 优势 & 劣势 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-emerald-50/60 backdrop-blur-sm rounded-2xl border border-emerald-200/60 p-5">
                                        <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> 优势
                                        </h3>
                                        <ul className="space-y-2">
                                            {auditResult.strengths.map((s: string, i: number) => (
                                                <li key={i} className="text-xs text-emerald-700 flex items-start gap-2">
                                                    <span className="text-emerald-500 mt-0.5">✓</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-red-50/60 backdrop-blur-sm rounded-2xl border border-red-200/60 p-5">
                                        <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                                            <XCircle className="w-4 h-4" /> 待改善
                                        </h3>
                                        <ul className="space-y-2">
                                            {auditResult.weaknesses.map((w: string, i: number) => (
                                                <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">✗</span> {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* 行动项 */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-indigo-500" /> 优先行动项
                                    </h3>
                                    <div className="space-y-2">
                                        {auditResult.action_items.map((item: any, i: number) => (
                                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${item.priority === '高' ? 'bg-red-50 border-red-200' : item.priority === '中' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${item.priority === '高' ? 'bg-red-200 text-red-700' : item.priority === '中' ? 'bg-amber-200 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                                                    P{item.priority === '高' ? '0' : item.priority === '中' ? '1' : '2'}
                                                </span>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-700">{item.action}</div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5">预期效果: {item.expected_impact}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ 智投参谋 — CSV 数据分析 + AI 问数 ═══════ */}
                {activeTab === 'advisor' && (
                    <div className="max-w-[1400px] mx-auto">
                        {/* 未上传状态 — 上传引导 */}
                        {csvData.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-6">
                                    <Upload className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 mb-2">SEM 智投参谋</h2>
                                <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
                                    上传您的 SEM 广告数据（CSV/TSV），AI 将自动生成智能日报、数据仪表盘，并支持自然语言问数分析
                                </p>
                                <input ref={fileInputRef} type="file" accept=".csv,.tsv" onChange={handleCSVUpload} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> 上传 CSV 数据文件
                                </button>
                                <div className="mt-8 bg-white/60 rounded-2xl border border-slate-200/60 p-5 max-w-lg">
                                    <h3 className="text-xs font-bold text-slate-700 mb-3">💡 支持的数据格式</h3>
                                    <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500">
                                        <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> 百度推广数据导出 CSV</div>
                                        <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> Google Ads 报告 CSV</div>
                                        <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> 搜索词报告 / 关键词报告</div>
                                        <div className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> 自定义 SEM 数据表</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 加载中 */}
                        {loading && csvData.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                <p className="text-sm text-slate-600 font-bold">正在解析数据并生成 AI 分析...</p>
                            </div>
                        )}

                        {/* 已上传数据 — 分析仪表盘 */}
                        {csvData.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                {/* 左侧 — 智能日报 + 数据表 (占 2 列) */}
                                <div className="lg:col-span-2 space-y-5">
                                    {/* 头部操作栏 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
                                            <div>
                                                <h2 className="text-lg font-black text-slate-800">SEM 智投参谋</h2>
                                                <p className="text-[11px] text-slate-400">{csvFileName} · {csvData.length} 行数据</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button id="export-btn" onClick={handleExportPDF}
                                                className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors">
                                                <FileDown className="w-3.5 h-3.5" /> 导出报告 (PDF)
                                            </button>
                                            <input ref={fileInputRef} type="file" accept=".csv,.tsv" onChange={handleCSVUpload} className="hidden" />
                                            <button onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
                                                <Upload className="w-3 h-3" /> 更换数据
                                            </button>
                                        </div>
                                    </div>

                                    {/* 每日智能日报卡片（PDF 导出区域） */}
                                    <div ref={reportRef} className="space-y-5 bg-transparent">
                                        {csvAnalysis && (
                                            <>
                                                {/* KPI 指标条 */}
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                    {[
                                                        { label: '总消费', value: csvAnalysis.total_cost, icon: DollarSign, color: 'from-blue-500 to-blue-600' },
                                                        { label: '总展示量', value: csvAnalysis.total_impressions, icon: BarChart3, color: 'from-purple-500 to-purple-600' },
                                                        { label: '总点击量', value: csvAnalysis.total_clicks, icon: Target, color: 'from-emerald-500 to-emerald-600' },
                                                        { label: '平均CTR', value: csvAnalysis.avg_ctr, icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
                                                        { label: '平均CPC', value: csvAnalysis.avg_cpc, icon: Zap, color: 'from-rose-500 to-rose-600' },
                                                    ].map((kpi, i) => (
                                                        <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                                                    <kpi.icon className="w-3.5 h-3.5 text-white" />
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 font-bold">{kpi.label}</span>
                                                            </div>
                                                            <div className="text-lg font-black text-slate-800">{kpi.value}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* 智能日报 */}
                                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-xl shadow-indigo-500/20">
                                                    <h3 className="text-base font-black mb-3 flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4" /> 每日智能日报
                                                    </h3>
                                                    <p className="text-sm text-white/90 leading-relaxed mb-4">{csvAnalysis.overall_summary}</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        {/* 风险预警 */}
                                                        {csvAnalysis.risk_alerts.length > 0 && (
                                                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                                                <h4 className="text-[11px] font-bold text-amber-300 mb-2 flex items-center gap-1">
                                                                    <AlertTriangle className="w-3 h-3" /> 风险预警
                                                                </h4>
                                                                {csvAnalysis.risk_alerts.map((r, i) => (
                                                                    <div key={i} className="mb-2 last:mb-0">
                                                                        <div className="text-[11px] font-bold text-white/90">{r.title}</div>
                                                                        <div className="text-[10px] text-white/60">{r.detail}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {/* 机会提示 */}
                                                        {csvAnalysis.opportunities.length > 0 && (
                                                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                                                <h4 className="text-[11px] font-bold text-emerald-300 mb-2 flex items-center gap-1">
                                                                    <TrendingUp className="w-3 h-3" /> 机会提示
                                                                </h4>
                                                                {csvAnalysis.opportunities.map((o, i) => (
                                                                    <div key={i} className="mb-2 last:mb-0">
                                                                        <div className="text-[11px] font-bold text-white/90">{o.title}</div>
                                                                        <div className="text-[10px] text-white/60">{o.detail}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {/* 行动项 */}
                                                        {csvAnalysis.action_items.length > 0 && (
                                                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                                                <h4 className="text-[11px] font-bold text-blue-300 mb-2 flex items-center gap-1">
                                                                    <Target className="w-3 h-3" /> 今日行动
                                                                </h4>
                                                                {csvAnalysis.action_items.slice(0, 3).map((a, i) => (
                                                                    <div key={i} className="mb-2 last:mb-0 flex items-start gap-1.5">
                                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${a.priority === '高' ? 'bg-red-400/30 text-red-200' : 'bg-amber-400/30 text-amber-200'}`}>
                                                                            {a.priority}
                                                                        </span>
                                                                        <div className="text-[10px] text-white/80">{a.action}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* ═══ 4 大分析维度 ═══ */}

                                                {/* 消费透视 */}
                                                {csvAnalysis.spend_analysis && (
                                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                                                        <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4" /> 消费透视
                                                        </h3>
                                                        {csvAnalysis.spend_analysis.zero_conversion_waste && (
                                                            <div className="mb-3 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
                                                                <span className="text-[10px] font-bold text-red-700">零转化浪费：</span>
                                                                <span className="text-[11px] text-red-600 ml-1">{csvAnalysis.spend_analysis.zero_conversion_waste}</span>
                                                            </div>
                                                        )}
                                                        {csvAnalysis.spend_analysis.high_cost_low_effect.length > 0 && (
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-[11px]">
                                                                    <thead>
                                                                        <tr className="bg-blue-50 text-blue-600 font-bold">
                                                                            <th className="px-3 py-1.5 text-left rounded-l-lg">关键词/计划</th>
                                                                            <th className="px-3 py-1.5 text-right">消费</th>
                                                                            <th className="px-3 py-1.5 text-right">CTR</th>
                                                                            <th className="px-3 py-1.5 text-left rounded-r-lg">问题</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {csvAnalysis.spend_analysis.high_cost_low_effect.map((item, i) => (
                                                                            <tr key={i} className="border-t border-slate-50">
                                                                                <td className="px-3 py-1.5 font-bold text-slate-700">{item.name}</td>
                                                                                <td className="px-3 py-1.5 text-right text-red-600 font-bold">{item.cost}</td>
                                                                                <td className="px-3 py-1.5 text-right text-amber-600">{item.ctr}</td>
                                                                                <td className="px-3 py-1.5 text-slate-500">{item.issue}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* 质量度诊断 + 流量异常检测 */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* 质量度诊断 */}
                                                    {csvAnalysis.quality_diagnosis && (
                                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                                                            <h3 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                                                                <Activity className="w-4 h-4" /> 质量度诊断
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                                <div className="p-2.5 bg-amber-50 rounded-xl text-center border border-amber-100">
                                                                    <div className="text-[10px] text-amber-500 font-bold">低分词数量</div>
                                                                    <div className="text-lg font-black text-amber-700">{csvAnalysis.quality_diagnosis.low_score_count}</div>
                                                                </div>
                                                                <div className="p-2.5 bg-amber-50 rounded-xl text-center border border-amber-100">
                                                                    <div className="text-[10px] text-amber-500 font-bold">低分词消耗占比</div>
                                                                    <div className="text-lg font-black text-amber-700">{csvAnalysis.quality_diagnosis.low_score_cost_ratio}</div>
                                                                </div>
                                                            </div>
                                                            {csvAnalysis.quality_diagnosis.quality_suggestions.length > 0 && (
                                                                <div className="space-y-1.5">
                                                                    <div className="text-[10px] font-bold text-slate-500 mb-1">优化建议：</div>
                                                                    {csvAnalysis.quality_diagnosis.quality_suggestions.map((s, i) => (
                                                                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                                                                            <CheckCircle2 className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                                                            {s}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* 流量异常检测 */}
                                                    {csvAnalysis.anomaly_detection && (
                                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                                                            <h3 className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-2">
                                                                <AlertTriangle className="w-4 h-4" /> 流量异常检测
                                                            </h3>
                                                            {csvAnalysis.anomaly_detection.high_impression_low_ctr.length > 0 && (
                                                                <div className="mb-3">
                                                                    <div className="text-[10px] font-bold text-slate-500 mb-1.5">高展低点（创意待优化）</div>
                                                                    {csvAnalysis.anomaly_detection.high_impression_low_ctr.map((item, i) => (
                                                                        <div key={i} className="flex items-center justify-between p-2 bg-rose-50 rounded-lg border border-rose-100 mb-1.5 last:mb-0">
                                                                            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[40%]">{item.name}</span>
                                                                            <div className="flex items-center gap-3 text-[10px]">
                                                                                <span className="text-slate-500">展现: {item.impressions}</span>
                                                                                <span className="text-red-600 font-bold">CTR: {item.ctr}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {csvAnalysis.anomaly_detection.high_cpc_anomaly.length > 0 && (
                                                                <div>
                                                                    <div className="text-[10px] font-bold text-slate-500 mb-1.5">高价异常（CPC 远超均值）</div>
                                                                    {csvAnalysis.anomaly_detection.high_cpc_anomaly.map((item, i) => (
                                                                        <div key={i} className="flex items-center justify-between p-2 bg-rose-50 rounded-lg border border-rose-100 mb-1.5 last:mb-0">
                                                                            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[40%]">{item.name}</span>
                                                                            <div className="flex items-center gap-3 text-[10px]">
                                                                                <span className="text-red-600 font-bold">CPC: {item.cpc}</span>
                                                                                <span className="text-slate-400">均值: {item.avg_cpc}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 策略建议 */}
                                                {csvAnalysis.strategy_advice && csvAnalysis.strategy_advice.length > 0 && (
                                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/60 p-5">
                                                        <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                                                            <Sparkles className="w-4 h-4" /> 账户优化策略建议
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {csvAnalysis.strategy_advice.map((advice, i) => (
                                                                <div key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
                                                                    <span className="w-5 h-5 bg-indigo-200/50 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                                                                    <span>{advice}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 最佳 & 最差计划 */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* 最佳计划 */}
                                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                                                        <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4" /> 表现最佳
                                                        </h3>
                                                        <div className="space-y-2.5">
                                                            {csvAnalysis.top_campaigns.map((c, i) => (
                                                                <div key={i} className="flex items-start gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                                                                    <div className="min-w-0">
                                                                        <div className="text-xs font-bold text-slate-700 truncate">{c.name}</div>
                                                                        <div className="text-[10px] text-slate-500">消费: {c.cost} · CTR: {c.ctr}</div>
                                                                        <div className="text-[10px] text-emerald-600 mt-0.5">{c.suggestion}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* 最差计划 */}
                                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                                                        <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                                                            <AlertTriangle className="w-4 h-4" /> 需要优化
                                                        </h3>
                                                        <div className="space-y-2.5">
                                                            {csvAnalysis.worst_campaigns.map((c, i) => (
                                                                <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50/60 rounded-xl border border-red-100">
                                                                    <span className="text-[10px] font-black text-red-600 bg-red-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">!</span>
                                                                    <div className="min-w-0">
                                                                        <div className="text-xs font-bold text-slate-700 truncate">{c.name}</div>
                                                                        <div className="text-[10px] text-red-600">{c.issue}</div>
                                                                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                                            <ArrowRight className="w-2.5 h-2.5" /> {c.suggestion}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div> {/* End of PDF Export Ref */}

                                    {/* 宏观监控数据表 */}
                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <Table2 className="w-4 h-4 text-indigo-500" /> 宏观监控 (Plan & Unit)
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <input className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-48 focus:ring-1 focus:ring-indigo-400"
                                                    placeholder="搜索关键词 / 计划名..."
                                                    value={csvSearchTerm} onChange={e => setCsvSearchTerm(e.target.value)} />
                                                <span className="text-[10px] text-slate-400">{getFilteredSortedData().length} 行</span>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                                            <table className="w-full text-xs">
                                                <thead className="sticky top-0 z-10">
                                                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                                        {csvColumns.map(col => (
                                                            <th key={col} className="px-3 py-2.5 text-left cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap"
                                                                onClick={() => { setCsvSortCol(col); setCsvSortAsc(csvSortCol === col ? !csvSortAsc : true); }}>
                                                                {col} {csvSortCol === col ? (csvSortAsc ? '↑' : '↓') : ''}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getFilteredSortedData().slice(0, 100).map((row, idx) => (
                                                        <tr key={idx} className="border-t border-slate-50 hover:bg-indigo-50/30 transition-colors">
                                                            {csvColumns.map(col => {
                                                                const val = row[col] || '';
                                                                // 对数值型数据着色
                                                                const num = parseFloat(val.replace(/[^0-9.-]/g, ''));
                                                                const isCTR = col.toLowerCase().includes('ctr') || col.toLowerCase().includes('点击率');
                                                                const isQS = col.toLowerCase().includes('质量') || col.toLowerCase().includes('quality');
                                                                let cellColor = 'text-slate-600';
                                                                if (isCTR && !isNaN(num)) {
                                                                    cellColor = num >= 3 ? 'text-emerald-600 font-bold' : num <= 1 ? 'text-red-600 font-bold' : 'text-slate-600';
                                                                }
                                                                if (isQS && !isNaN(num)) {
                                                                    cellColor = num >= 7 ? 'text-emerald-600 font-bold' : num <= 4 ? 'text-red-600 font-bold' : 'text-amber-600 font-bold';
                                                                }
                                                                return (
                                                                    <td key={col} className={`px-3 py-2 whitespace-nowrap ${cellColor}`}>
                                                                        {val}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* 右侧 — AI 问数对话 (占 1 列) */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm flex flex-col h-[calc(100vh-180px)] sticky top-0">
                                        {/* 对话头部 */}
                                        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0">
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                <MessageSquare className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">智能问数</h3>
                                                <p className="text-[9px] text-slate-400">基于数据的 AI 分析</p>
                                            </div>
                                        </div>

                                        {/* 对话消息区 */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {chatMessages.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] ${msg.role === 'user'
                                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5'
                                                        : 'bg-slate-50 text-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5 border border-slate-100'
                                                        }`}>
                                                        {msg.role === 'ai' && (
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                                                <span className="text-[9px] text-indigo-500 font-bold">SEM 参谋</span>
                                                            </div>
                                                        )}
                                                        <div className="text-xs leading-relaxed overflow-x-auto">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    table: ({ node, ...props }) => <table className="w-full text-left border-collapse my-2 text-[11px]" {...props} />,
                                                                    thead: ({ node, ...props }) => <thead className="bg-slate-100 text-slate-700" {...props} />,
                                                                    th: ({ node, ...props }) => <th className="px-2 py-1.5 border border-slate-200 font-bold whitespace-nowrap" {...props} />,
                                                                    td: ({ node, ...props }) => <td className="px-2 py-1.5 border border-slate-200" {...props} />,
                                                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-1" {...props} />,
                                                                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-1" {...props} />,
                                                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                                    strong: ({ node, ...props }) => <strong className="font-black text-indigo-700" {...props} />,
                                                                    h1: ({ node, ...props }) => <h1 className="text-sm font-black text-slate-800 mt-3 mb-2" {...props} />,
                                                                    h2: ({ node, ...props }) => <h2 className="text-xs font-bold text-slate-800 mt-2 mb-1" {...props} />,
                                                                    h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-slate-700 mt-2 mb-1" {...props} />,
                                                                    p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0" {...props} />,
                                                                }}
                                                            >
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {chatLoading && (
                                                <div className="flex justify-start">
                                                    <div className="bg-slate-50 rounded-2xl rounded-bl-sm px-4 py-3 border border-slate-100">
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" /> 分析中...
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* 快捷问题 */}
                                        <div className="px-3 py-2 border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0">
                                            {[
                                                '高消低效词有哪些？',
                                                '质量度低于 5 分的词占比多少？',
                                                '哪些词 CPC 异常偏高？',
                                                '给我 3 条否词建议',
                                                '生成优化师总结报告',
                                            ].map((q, i) => (
                                                <button key={i} onClick={() => handleChatSend(q)}
                                                    className="text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                                                    {q}
                                                </button>
                                            ))}
                                        </div>

                                        {/* 输入框 */}
                                        <div className="px-3 py-2.5 border-t border-slate-100 shrink-0">
                                            <div className="flex items-center gap-2">
                                                <input className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-400"
                                                    placeholder="输入问题，例如：分析一下品牌词计划的表现"
                                                    value={chatInput}
                                                    onChange={e => setChatInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSend()} />
                                                <button onClick={() => handleChatSend()} disabled={chatLoading || !chatInput.trim()}
                                                    className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-40">
                                                    <Send className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Toast 通知 */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default SEMIntelligence;
