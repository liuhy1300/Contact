// ============================================================
// 黑客作战大屏 (Hacker Console) — 通用加载动画组件
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, CheckCircle2, Loader2, AlertTriangle, Zap } from 'lucide-react';

// 日志条目类型
export interface LogEntry {
    text: string;
    type: 'info' | 'success' | 'warning' | 'progress' | 'system';
    delay: number; // 相对于上一条的延迟 (ms)
}

// 场景化消息模板 — 按分析类型
export const CONSOLE_SCRIPTS: Record<string, LogEntry[]> = {

    // ============ GEO 可见度分析 ============
    'geo-analysis': [
        { text: '初始化 GEO 透视引擎 v3.2.1...', type: 'system', delay: 0 },
        { text: '验证 API 密钥并建立安全隧道...', type: 'info', delay: 400 },
        { text: '🔐 与营销大脑的加密连接已建立', type: 'success', delay: 600 },
        { text: '加载多模型仿真矩阵...', type: 'info', delay: 300 },
        { text: '🤖 正在模拟 GPT-4o 回答用户搜索查询...', type: 'progress', delay: 800 },
        { text: '✨ 正在模拟 Gemini 3.0 Pro 回答...', type: 'progress', delay: 1200 },
        { text: '🧠 正在模拟 Claude 3.5 回答...', type: 'progress', delay: 1200 },
        { text: '🌐 正在模拟 Perplexity 回答（含引用源）...', type: 'progress', delay: 1200 },
        { text: '全部仿真文本已收集，正在送入语义分析管线...', type: 'info', delay: 800 },
        { text: '正在进行品牌提及检测 & 情感加权...', type: 'progress', delay: 1000 },
        { text: '正在进行排名位次提取...', type: 'progress', delay: 800 },
        { text: '正在提取竞品画像 & SWOT 因子...', type: 'progress', delay: 1000 },
        { text: '🎯 购买阶段判断：Awareness → Consideration → Decision', type: 'info', delay: 600 },
        { text: '正在聚合多模型结果并计算 GEO 可见度评分...', type: 'progress', delay: 1200 },
        { text: '✅ 分析完成！正在渲染报告...', type: 'success', delay: 500 },
    ],

    // ============ SoR 推荐份额 ============
    'geo-sor': [
        { text: '初始化 SoR 推荐份额追踪器...', type: 'system', delay: 0 },
        { text: '🔐 建立与 AI 仿真集群的安全连接...', type: 'success', delay: 500 },
        { text: '生成 10 个不同角度的搜索变体...', type: 'info', delay: 400 },
        { text: '📡 Round 1/10 — 模拟搜索 "推荐"...', type: 'progress', delay: 600 },
        { text: '📡 Round 2/10 — 模拟搜索 "最好的有哪些"...', type: 'progress', delay: 800 },
        { text: '📡 Round 3/10 — 模拟搜索 "安全可靠"...', type: 'progress', delay: 800 },
        { text: '📡 Round 4/10 — 模拟搜索 "企业级选型建议"...', type: 'progress', delay: 800 },
        { text: '📡 Round 5/10 — 模拟搜索 "市场份额排名"...', type: 'progress', delay: 800 },
        { text: '📡 Round 6-10 — 批量仿真进行中...', type: 'progress', delay: 1500 },
        { text: '全部 10 轮仿真完成，正在统计推荐排名...', type: 'info', delay: 800 },
        { text: '正在计算 Top1 推荐率 & Top3 提及率...', type: 'progress', delay: 600 },
        { text: '正在分析独占推荐率 & 竞品频次...', type: 'progress', delay: 800 },
        { text: '🧠 正在生成洞察摘要...', type: 'info', delay: 1000 },
        { text: '✅ SoR 分析完成！', type: 'success', delay: 500 },
    ],

    // ============ 引文溯源 ============
    'geo-citation': [
        { text: '初始化引文溯源引擎...', type: 'system', delay: 0 },
        { text: '🌐 正在模拟 Perplexity AI 带引用回答...', type: 'progress', delay: 600 },
        { text: '收到 AI 回答，检测到内联引用标记...', type: 'info', delay: 2000 },
        { text: '正在提取引用 URL 并验证来源...', type: 'progress', delay: 800 },
        { text: '🔗 发现来源 [1]: 评测网站 — 正在检查发布日期...', type: 'info', delay: 600 },
        { text: '🔗 发现来源 [2]: 官方文档 — 正在分析情感倾向...', type: 'info', delay: 500 },
        { text: '🔗 发现来源 [3]: 行业报告 — 正在评估风险等级...', type: 'info', delay: 500 },
        { text: '正在执行过期内容检测 & 负面信息扫描...', type: 'progress', delay: 1000 },
        { text: '计算各来源风险评分并生成行动建议...', type: 'progress', delay: 800 },
        { text: '✅ 引文溯源完成！', type: 'success', delay: 500 },
    ],

    // ============ 事实注入 ============
    'geo-factinject': [
        { text: '初始化 AI 知识包构建引擎...', type: 'system', delay: 0 },
        { text: '📚 正在扫描主流 AI 模型对品牌的认知...', type: 'progress', delay: 600 },
        { text: '正在对比 AI 认知 vs 品牌最新事实...', type: 'progress', delay: 1500 },
        { text: '⚠️ 检测到认知差距 #1 — 标记为 高严重性', type: 'warning', delay: 800 },
        { text: '⚠️ 检测到认知差距 #2 — 标记为 中等严重性', type: 'warning', delay: 600 },
        { text: '⚠️ 检测到认知差距 #3 — 标记为 低严重性', type: 'info', delay: 600 },
        { text: '正在生成结构化 FAQ 纠偏语料...', type: 'progress', delay: 1200 },
        { text: '正在构建 JSON-LD FAQPage Schema 标记...', type: 'progress', delay: 1000 },
        { text: '正在制定部署策略与优先级...', type: 'info', delay: 800 },
        { text: '✅ 知识包构建完成！', type: 'success', delay: 500 },
    ],

    // ============ 场景竞技场 ============
    'geo-arena': [
        { text: '初始化场景竞技场模拟器...', type: 'system', delay: 0 },
        { text: '⚔️ 加载对抗场景参数...', type: 'info', delay: 400 },
        { text: '🔐 建立仿真沙箱环境...', type: 'success', delay: 500 },
        { text: '正在模拟 AI 引擎处理对比查询...', type: 'progress', delay: 800 },
        { text: '收到 AI 回答，正在提取对抗结果...', type: 'info', delay: 2000 },
        { text: '正在分析品牌排名 vs 竞品排名...', type: 'progress', delay: 800 },
        { text: '正在构建 SWOT 差距矩阵...', type: 'progress', delay: 1000 },
        { text: '🧠 正在诊断差距根因...', type: 'progress', delay: 800 },
        { text: '📋 正在生成行动建议...', type: 'info', delay: 800 },
        { text: '✅ 场景对抗分析完成！', type: 'success', delay: 500 },
    ],

    // ============ 品牌营销 — 深度单品 ============
    'stratagem-single': [
        { text: '初始化深度竞品情报分析引擎...', type: 'system', delay: 0 },
        { text: '🔐 建立与 Gemini 3.0 Pro 的安全连接...', type: 'success', delay: 500 },
        { text: '正在检索品牌公开信息与市场数据...', type: 'progress', delay: 800 },
        { text: '正在构建竞品360°画像...', type: 'progress', delay: 1200 },
        { text: '正在执行 SWOT 深度分析...', type: 'progress', delay: 1000 },
        { text: '正在提取核心竞争力 & 市场定位...', type: 'progress', delay: 800 },
        { text: '🎯 正在识别差距 (GAP) 与机会点...', type: 'info', delay: 1000 },
        { text: '正在生成管理层摘要...', type: 'progress', delay: 800 },
        { text: '✅ 深度分析完成！正在渲染报告...', type: 'success', delay: 500 },
    ],

    // ============ 品牌营销 — 竞品对标 ============
    'stratagem-compare': [
        { text: '初始化多品牌对标分析引擎...', type: 'system', delay: 0 },
        { text: '🔐 建立与 AI 分析集群的安全连接...', type: 'success', delay: 500 },
        { text: '正在并行检索所有品牌数据...', type: 'progress', delay: 800 },
        { text: '正在构建对标矩阵 & 维度权重...', type: 'progress', delay: 1200 },
        { text: '正在执行逐维度评分对标...', type: 'progress', delay: 1500 },
        { text: '📊 正在计算加权排名 & 综合胜率...', type: 'info', delay: 1000 },
        { text: '正在生成差异化洞察摘要...', type: 'progress', delay: 800 },
        { text: '✅ 横向对标完成！', type: 'success', delay: 500 },
    ],

    // ============ 品牌营销 — VISA 审计 ============
    'stratagem-index': [
        { text: '初始化 VISA 品牌生命力审计引擎...', type: 'system', delay: 0 },
        { text: '🔐 连接品牌评估知识库...', type: 'success', delay: 500 },
        { text: '正在评估 V (Visibility) — 可见度维度...', type: 'progress', delay: 1000 },
        { text: '正在评估 I (Influence) — 影响力维度...', type: 'progress', delay: 1000 },
        { text: '正在评估 S (Sentiment) — 情感维度...', type: 'progress', delay: 1000 },
        { text: '正在评估 A (Authority) — 权威性维度...', type: 'progress', delay: 1000 },
        { text: '📊 正在计算 VISA 综合指数...', type: 'info', delay: 800 },
        { text: '正在生成品牌健康趋势洞察...', type: 'progress', delay: 800 },
        { text: '✅ VISA 审计完成！', type: 'success', delay: 500 },
    ],

    // ============ 品牌营销 — 场景攻防卡 ============
    'stratagem-battlecard': [
        { text: '初始化场景化攻防卡生成器...', type: 'system', delay: 0 },
        { text: '⚔️ 加载竞品情报 & 行业场景数据...', type: 'info', delay: 500 },
        { text: '🔐 连接 AI 战术推演引擎...', type: 'success', delay: 500 },
        { text: '正在分析竞品弱点 & 攻击面...', type: 'progress', delay: 1000 },
        { text: '正在构建防守话术 & 反驳策略...', type: 'progress', delay: 1200 },
        { text: '正在生成客户异议处理方案...', type: 'progress', delay: 1000 },
        { text: '💡 正在总结必胜话术 & 销售剧本...', type: 'info', delay: 800 },
        { text: '✅ 攻防卡生成完成！', type: 'success', delay: 500 },
    ],

    // ============ 品牌营销 — 语调审查 ============
    'stratagem-toneguard': [
        { text: '初始化品牌语调卫士...', type: 'system', delay: 0 },
        { text: '📝 正在加载待审查稿件...', type: 'info', delay: 400 },
        { text: '🔐 连接品牌语调模型...', type: 'success', delay: 500 },
        { text: '正在执行语调特征提取...', type: 'progress', delay: 800 },
        { text: '正在检查合规性 & 品牌一致性...', type: 'progress', delay: 1200 },
        { text: '正在识别风险表述 & 改进建议...', type: 'progress', delay: 1000 },
        { text: '正在计算合规评分...', type: 'info', delay: 600 },
        { text: '✅ 语调审查完成！', type: 'success', delay: 500 },
    ],

    // ============ 品牌营销 — 舆情危机 ============
    'stratagem-sentiment': [
        { text: '初始化 B2B 舆情雷达...', type: 'system', delay: 0 },
        { text: '📡 正在扫描多渠道舆情信号...', type: 'progress', delay: 600 },
        { text: '🔐 连接情感分析引擎...', type: 'success', delay: 500 },
        { text: '正在提取关键词云 & 话题簇...', type: 'progress', delay: 1000 },
        { text: '正在执行危机模拟 & 传播路径分析...', type: 'progress', delay: 1200 },
        { text: '正在计算渠道级情感分数...', type: 'progress', delay: 1000 },
        { text: '⚠️ 检测到潜在风险信号...', type: 'warning', delay: 800 },
        { text: '正在生成舆情应对建议...', type: 'info', delay: 600 },
        { text: '✅ 舆情分析完成！', type: 'success', delay: 500 },
    ],

    // ============ 品牌营销 — 工具包 ============
    'stratagem-brandkit': [
        { text: '初始化品牌工具包生成器...', type: 'system', delay: 0 },
        { text: '🎨 加载品牌资产模板...', type: 'info', delay: 400 },
        { text: '🔐 连接 AI 内容创作引擎...', type: 'success', delay: 500 },
        { text: '正在生成新闻稿框架...', type: 'progress', delay: 1200 },
        { text: '正在生成产品一页纸...', type: 'progress', delay: 1200 },
        { text: '正在生成 Banner 文案...', type: 'progress', delay: 1000 },
        { text: '正在生成活动邀请函...', type: 'progress', delay: 1000 },
        { text: '正在优化排版 & 一致性检查...', type: 'info', delay: 600 },
        { text: '✅ 工具包生成完成！', type: 'success', delay: 500 },
    ],

    // ============ 平面设计 — 创意生成 ============
    'graphic-creative': [
        { text: '初始化 BananaArt 创意引擎 v2.0...', type: 'system', delay: 0 },
        { text: '🔐 建立与 Gemini 3 Pro Image 的安全连接...', type: 'success', delay: 500 },
        { text: '正在解析 Prompt 语义 & 风格指令...', type: 'info', delay: 400 },
        { text: '🎨 正在构建扩散模型初始噪声场...', type: 'progress', delay: 800 },
        { text: '正在执行文本编码 → CLIP 向量映射...', type: 'progress', delay: 1000 },
        { text: '迭代去噪 Step 1/25 — 主体轮廓成形...', type: 'progress', delay: 1200 },
        { text: '迭代去噪 Step 8/25 — 色彩通道收敛...', type: 'progress', delay: 1500 },
        { text: '迭代去噪 Step 16/25 — 细节纹理渲染...', type: 'progress', delay: 1500 },
        { text: '迭代去噪 Step 25/25 — 高频增强 & 锐化...', type: 'progress', delay: 1500 },
        { text: '🖼️ 图像解码完成，正在执行品牌色校准...', type: 'info', delay: 800 },
        { text: '正在执行安全内容审核...', type: 'info', delay: 600 },
        { text: '✅ 创意图像生成完成！正在渲染预览...', type: 'success', delay: 500 },
    ],

    // ============ 平面设计 — 产品精修 ============
    'graphic-refine': [
        { text: '初始化产品精修管线...', type: 'system', delay: 0 },
        { text: '🔐 连接 AI 图像编辑引擎...', type: 'success', delay: 500 },
        { text: '📷 正在解析上传的产品截图...', type: 'info', delay: 600 },
        { text: '正在执行智能抠图 & 背景分离...', type: 'progress', delay: 1000 },
        { text: '正在分析产品主体边缘 & 透视角度...', type: 'progress', delay: 1200 },
        { text: '🎨 正在应用精修风格指令...', type: 'progress', delay: 1500 },
        { text: '正在生成高品质背景 & 光影效果...', type: 'progress', delay: 1500 },
        { text: '正在合成最终产品精修图...', type: 'progress', delay: 1200 },
        { text: '✅ 产品精修完成！', type: 'success', delay: 500 },
    ],

    // ============ 平面设计 — 元素工坊 ============
    'graphic-elements': [
        { text: '初始化元素工坊批量生成器...', type: 'system', delay: 0 },
        { text: '🔐 连接 AI 矢量元素引擎...', type: 'success', delay: 500 },
        { text: '正在解析元素描述 & 风格参数...', type: 'info', delay: 400 },
        { text: '🧩 正在生成变体 #1 — 主样式...', type: 'progress', delay: 1200 },
        { text: '正在执行透明通道处理...', type: 'progress', delay: 800 },
        { text: '🧩 正在生成变体 #2 — 替代样式...', type: 'progress', delay: 1500 },
        { text: '正在进行元素一致性检查...', type: 'info', delay: 800 },
        { text: '✅ 元素变体生成完成！', type: 'success', delay: 500 },
    ],

    // ============ 平面设计 — 海报合成 ============
    'graphic-poster': [
        { text: '初始化海报合成流水线...', type: 'system', delay: 0 },
        { text: '🔐 连接 AI 海报设计引擎...', type: 'success', delay: 500 },
        { text: '正在生成留白底图 — 场景构图...', type: 'progress', delay: 1000 },
        { text: '🎨 扩散模型渲染中...', type: 'progress', delay: 2000 },
        { text: '正在执行版面安全区检测...', type: 'info', delay: 800 },
        { text: '📝 正在叠加品牌文字排版...', type: 'progress', delay: 1200 },
        { text: '正在执行字体渲染 & 对齐校准...', type: 'progress', delay: 1000 },
        { text: '正在生成最终合成海报...', type: 'info', delay: 800 },
        { text: '✅ 海报合成完成！', type: 'success', delay: 500 },
    ],
};

// ============================================================
// HackerConsole 组件
// ============================================================

interface HackerConsoleProps {
    /** 消息脚本 ID — 对应 CONSOLE_SCRIPTS 的 key */
    scriptId: string;
    /** 是否正在加载 */
    isActive: boolean;
    /** 品牌名（用于动态替换） */
    brandName?: string;
    /** 关键词（用于动态替换） */
    keyword?: string;
}

// 单条日志渲染颜色
const typeColors: Record<string, string> = {
    system: 'text-purple-400',
    info: 'text-slate-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    progress: 'text-blue-400',
};

const typePrefix: Record<string, string> = {
    system: '[SYS]',
    info: '[INF]',
    success: '[OK!]',
    warning: '[WRN]',
    progress: '[>>>]',
};

const HackerConsole: React.FC<HackerConsoleProps> = ({ scriptId, isActive, brandName, keyword }) => {
    const [visibleLogs, setVisibleLogs] = useState<{ text: string; type: string; time: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        if (!isActive) return;

        // 清空之前的日志和定时器
        setVisibleLogs([]);
        timerRef.current.forEach(t => clearTimeout(t));
        timerRef.current = [];

        const script = CONSOLE_SCRIPTS[scriptId] || CONSOLE_SCRIPTS['geo-analysis'];

        let cumulativeDelay = 0;
        script.forEach((entry, idx) => {
            cumulativeDelay += entry.delay;
            const timer = setTimeout(() => {
                // 动态替换品牌名和关键词
                let text = entry.text;
                if (brandName) {
                    text = text.replace(/品牌/g, () => brandName);
                }

                const now = new Date();
                const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

                setVisibleLogs(prev => [...prev, { text, type: entry.type, time }]);
            }, cumulativeDelay);
            timerRef.current.push(timer);
        });

        // 如果脚本播完了还在加载中，循环追加 "思考中" 日志
        const totalDuration = script.reduce((sum, e) => sum + e.delay, 0);
        const loopTimer = setTimeout(() => {
            const cycleMessages = [
                '正在深度分析，请稍候...',
                '大规模数据处理中...',
                '模型推理优化中...',
                '交叉验证结果一致性...',
                '收敛检查通过，正在组织输出...',
                '多维度结果汇总中...',
                '生成可视化数据...',
                '最终结果即将呈现...',
            ];
            let cycleIdx = 0;
            const cycleInterval = setInterval(() => {
                if (cycleIdx >= cycleMessages.length) {
                    cycleIdx = 0; // 循环
                }
                const now = new Date();
                const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                setVisibleLogs(prev => [...prev, { text: cycleMessages[cycleIdx], type: 'progress', time }]);
                cycleIdx++;
            }, 3000);
            timerRef.current.push(cycleInterval as any);
        }, totalDuration + 500);
        timerRef.current.push(loopTimer);

        return () => {
            timerRef.current.forEach(t => clearTimeout(t));
            timerRef.current = [];
        };
    }, [isActive, scriptId]);

    // 自动滚动到底部
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [visibleLogs]);

    if (!isActive) return null;

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
            {/* 终端头部 */}
            <div className="bg-slate-900 rounded-t-2xl px-5 py-3 flex items-center justify-between border border-slate-700 border-b-0">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500 opacity-80"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-80"></div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>filez-engine — 作战大屏</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] text-emerald-500 font-mono uppercase tracking-wider">Live</span>
                </div>
            </div>

            {/* 终端体 */}
            <div
                ref={scrollRef}
                className="bg-[#0d1117] rounded-b-2xl border border-slate-700 border-t-0 p-5 font-mono text-[13px] leading-relaxed overflow-y-auto transition-all"
                style={{ maxHeight: '400px', minHeight: '280px' }}
            >
                {visibleLogs.map((log, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-2 mb-1 animate-slide-in-log ${typeColors[log.type] || 'text-slate-500'}`}
                        style={{
                            animationDelay: '0ms',
                        }}
                    >
                        <span className="text-slate-600 flex-shrink-0 select-none">{log.time}</span>
                        <span className={`flex-shrink-0 w-[38px] text-right font-bold ${typeColors[log.type] || 'text-slate-500'}`}>
                            {typePrefix[log.type] || '[---]'}
                        </span>
                        <span className={log.type === 'success' ? 'text-emerald-400 font-semibold' : log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'}>
                            {log.text}
                        </span>
                    </div>
                ))}

                {/* 闪烁光标 */}
                <div className="flex items-center gap-1 mt-2">
                    <span className="text-emerald-500">❯</span>
                    <span className="w-2 h-5 bg-emerald-500/80 animate-blink"></span>
                </div>
            </div>

            {/* 底部进度条 */}
            <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full animate-progress-slide"></div>
                </div>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500" />
                    AI 正在处理
                </span>
            </div>
        </div>
    );
};

export default HackerConsole;
