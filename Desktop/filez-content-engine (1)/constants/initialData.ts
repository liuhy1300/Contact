import { PromptConfig } from '../types';

export const INITIAL_DATA: PromptConfig = {
  cmsOptions: [
    { id: "none", name: "标准通用 (Standard)", desc: "标准 HTML5，无特殊限制" },
    { id: "china_cms", name: "中国版 CMS", desc: "织梦/帝国/MetInfo：强制内联样式，防过滤" },
    { id: "global_cms", name: "海外版 CMS", desc: "WordPress/Drupal：SEO 优先" },
    { id: "wechat_editor", name: "微信公众号", desc: "严禁 <style> 块，全内联 CSS" }
  ],
  roles: [
    { id: "content_expert", name: "B2B 内容集客专家", desc: "擅长挑战者销售法则，重构客户认知" },
    { id: "industry_consultant", name: "行业洞察架构师", desc: "MECE原则拆解行业痛点" },
    { id: "consulting_firm", name: "麦肯锡/MBB 顾问", desc: "金字塔原理，结论先行" },
    { id: "marketing_master", name: "神经营销学大师", desc: "制造认知失调，直击爬行脑" }
  ],
  brands: [
    { id: "filez_std", name: "企业级守门人", desc: "冷静克制，强调安全感与合规性" },
    { id: "think_innovative", name: "前沿技术布道者", desc: "科技感，语气锐利，挑战旧架构" },
    { id: "lenovo_global", name: "全球化公民", desc: "跨国视角，ESG，大气包容" },
    { id: "partner", name: "共情式顾问", desc: "温暖真诚，关注解决实际焦虑" }
  ],
  industries: [
    { id: "biopharma", name: "生物制药", painPoints: "FDA 21 CFR Part 11 合规，配方数据防泄露", suggestedPainPoints: ["合规风险", "配方泄露", "临床数据管理", "审计追溯", "跨境数据传输", "GxP合规"] },
    { id: "finance", name: "金融/证券", painPoints: "穿透式监管，IPO/M&A 核心底稿保护", suggestedPainPoints: ["数据孤岛", "监管合规", "底稿保护", "审计追踪", "跨境交易", "敏感信息泄露"] },
    { id: "manufacturing", name: "高端制造/汽车", painPoints: "IP图纸防泄露，跨国大文件传输延迟", suggestedPainPoints: ["IP泄露", "大文件传输", "供应链协同", "跨国协作", "版本混乱", "成本控制"] },
    { id: "semiconductor", name: "芯片半导体", painPoints: "EDA 数据/光刻机图纸绝对防御", suggestedPainPoints: ["EDA数据泄露", "供应链安全", "出口管制", "IP保护", "研发协同", "权限管控"] },
    { id: "new_energy", name: "新能源", painPoints: "海外建厂合规，野外弱网传输", suggestedPainPoints: ["弱网传输", "海外合规", "远程协作", "数据主权", "项目管理", "移动办公"] },
    { id: "state_digital", name: "央国企数科", painPoints: "信创国产化替代，数据资产入表", suggestedPainPoints: ["信创替代", "数据资产入表", "等保合规", "国产化适配", "统一管控", "安全审计"] },
    { id: "government", name: "政府/国企", painPoints: "电子政务合规，内外网隔离交换", suggestedPainPoints: ["内外网隔离", "电子政务", "等保三级", "文件交换", "密级管控", "审批流程"] }
  ],
  products: [
    { id: "ai_kb", name: "Filez AI 知识库", features: "企业大脑、RAG架构、精准问答" },
    { id: "ai_idp", name: "Filez AI 智能文档处理", features: "IDP引擎、发票/合同识别" },
    { id: "ai_platform", name: "Filez AI 文档中台", features: "非结构化数据管理、全栈信创" },
    { id: "content_collab", name: "Filez 内容协同平台", features: "多人实时协作、版本回溯" },
    { id: "vdr", name: "Filez-VDR 虚拟数据室", features: "投融资尽调、动态水印" },
    { id: "filez_disk", name: "Filez 企业网盘", features: "基础协作、海量存储" },
    { id: "zbox_assistant", name: "Filez 业务助手 2.0", features: "数字员工、多模态创作" }
  ],
  audiences: [
    { id: "cio", name: "CIO/CTO", focus: "技术架构、安全性、合规风险" },
    { id: "tech", name: "IT/技术人员", focus: "API文档、系统稳定性、运维" },
    { id: "ceo", name: "CEO/高管", focus: "ROI回报率、数字化战略" },
    { id: "business", name: "业务部门负责人", focus: "易用性、不改变习惯" }
  ],
  journeyStages: [
    { id: "awareness", name: "1. 认知唤醒", desc: "行业趋势、痛点共鸣" },
    { id: "consideration", name: "2. 方案考量", desc: "功能对比、技术优势" },
    { id: "decision", name: "3. 决策/购买", desc: "ROI、成功案例、SLA" },
    { id: "retention", name: "4. 客户留存", desc: "最佳实践、新功能" }
  ],
  styles: [
    { id: "whitepaper", name: "行业洞察/白皮书", desc: "深度、专业、数据驱动" },
    { id: "case_study", name: "客户案例", desc: "痛点-方案-价值-证言" },
    { id: "consultative", name: "咨询顾问风", desc: "客观分析、提供建议" },
    { id: "story", name: "故事化叙事", desc: "情景带入、引发共鸣" },
    { id: "wechat", name: "公众号推文", desc: "轻松、短句、金句频出" },
    { id: "pr", name: "PR 新闻通稿", desc: "正式、客观" }
  ],
  ctaStrategies: [
    { id: "soft_asset", name: "资料包诱饵 (Whitepaper)", desc: "互惠原则：换取用户信息" },
    { id: "hard_demo", name: "产品演示预约 (Book a Demo)", desc: "直接转化：专家1v1" },
    { id: "diagnostic", name: "互动式诊断", desc: "自我探索：测测风险等级" },
    { id: "limited_offer", name: "限时权益", desc: "稀缺性：利用 FOMO" },
    { id: "consultation", name: "专家咨询", desc: "权威效应：建立信任" },
    { id: "free_trial", name: "免费试用", desc: "禀赋效应：0元体验" }
  ],
  layoutStyles: [
    { id: "none", name: "默认样式", desc: "标准格式", css: "" },
    { id: "mckinsey", name: "麦肯锡风格", desc: "顶级咨询，经典权威", css: "/* McKinsey Style */ h1 { font-family: 'Georgia'; border-bottom: 1px solid #ddd; }" },
    { id: "gartner", name: "Gartner 风格", desc: "科技蓝图，结构化卡片", css: "/* Gartner Style */ .card { border-left: 5px solid #0056b3; }" },
    { id: "tech_blog", name: "科技极客风", desc: "暗黑代码风", css: "--bg-body: #0d1117; font-family: 'Fira Code';" },
    { id: "official", name: "红头文件风", desc: "严肃权威", css: "/* Official */ h1 { color: #d60000; text-align: center; }" },
    { id: "newsletter", name: "深度阅读风", desc: "极简阅读", css: "max-width: 680px; margin: 0 auto;" }
  ],
  multimodalOptions: [
    { id: "video", name: "视频嵌入", desc: "自动植入产品演示/案例视频" },
    { id: "data_viz", name: "动态图表", desc: "Markdown 表格或 Mermaid" },
    { id: "interactive", name: "交互式组件", desc: "ROI 计算器、自测题" },
    { id: "audio", name: "音频解说", desc: "文章朗读版" }
  ],
  competitors: [
    { id: "ideals", name: "iDeals", category: "VDR", edge: "更符合中国习惯" },
    { id: "intralinks", name: "Intralinks", category: "VDR", edge: "性价比、灵活部署" },
    { id: "datasite", name: "Datasite", category: "VDR", edge: "全流程文档协作" },
    { id: "public_cloud", name: "公有云 (BAT)", category: "General", edge: "私有化部署、数据主权" },
    { id: "box", name: "Box", category: "General", edge: "信创国产化适配" },
    { id: "aishu", name: "爱数", category: "Vertical", edge: "联想硬件底层协同" }
  ],
  channels: [
    { id: "wechat", name: "微信公众号", desc: "移动端阅读，卡片式布局", iconName: "Smartphone" },
    { id: "website", name: "官网/博客", desc: "SEO导向，H标签结构清晰", iconName: "Monitor" },
    { id: "edm", name: "EDM 营销邮件", desc: "转化导向，Table布局", iconName: "Mail" },
    { id: "report", name: "专业报告", desc: "学术排版，适合导出PDF", iconName: "FileText" }
  ],
  headlineStrategies: [
    { id: "fomo", name: "焦虑/恐惧型", desc: "强调风险与损失" },
    { id: "benefit", name: "利益承诺型", desc: "直接展示结果" },
    { id: "curiosity", name: "好奇/悬念型", desc: "制造信息差" },
    { id: "authority", name: "权威/背书型", desc: "引用大厂或标准" },
    { id: "data", name: "数字实证型", desc: "具体百分比或金额" },
    { id: "zhihu", name: "知乎/提问型", desc: "以问题开场" }
  ],
  wordCounts: [
    { id: "auto", name: "智能匹配", desc: "基于风格自动推荐" },
    { id: "short", name: "短篇 (500-800字)", desc: "快讯、社媒" },
    { id: "medium", name: "中篇 (1200-1500字)", desc: "标准公众号" },
    { id: "long", name: "长篇 (2000-3000字)", desc: "白皮书" },
    { id: "ultra_long", name: "超长篇 (5000字+)", desc: "全景分析报告" }
  ],
  languages: [
    { id: "zh_cn", name: "简体中文" },
    { id: "zh_tw", name: "繁体中文" },
    { id: "en", name: "English" }
  ],
  geoStructures: [
    { id: "direct_answer", name: "直接答案优先", desc: "段首给结论" },
    { id: "listicle", name: "列表/步骤式", desc: "1.2.3.结构" },
    { id: "comparison_table", name: "对比表格", desc: "结构化数据" },
    { id: "faq", name: "Q&A 问答模块", desc: "覆盖长尾词" }
  ],
  imageStyles: [
    { id: "mckinsey", name: "麦肯锡风格", desc: "Minimalist, clean, red accents" },
    { id: "gartner", name: "Gartner 风格", desc: "Dark blue tech, quadrant diagrams" },
    { id: "tech_future", name: "未来科技风", desc: "Cyberpunk, neon, data streams" },
    { id: "enterprise", name: "企业级摄影", desc: "High-end corporate, bright office" },
    { id: "3d_iso", name: "3D 等轴", desc: "Unreal Engine 5 render, clean lines" }
  ],
  imageRatios: [
    { id: "16:9", name: "16:9 (横屏)" },
    { id: "4:3", name: "4:3 (PPT配图)" },
    { id: "1:1", name: "1:1 (方形)" }
  ],
  marketingHooks: [
    { id: "none", name: "无特定钩子", desc: "标准开篇" },
    { id: "cognitive_conflict", name: "认知冲突", desc: "颠覆常识" },
    { id: "loss_aversion", name: "损失厌恶", desc: "强调不行动的代价" },
    { id: "golden_circle", name: "黄金圈法则", desc: "Why-How-What" },
    { id: "story_bridge", name: "故事桥梁", desc: "客户故事场景开篇" },
    { id: "data_shock", name: "数据震撼", desc: "令人震惊的数据开场" }
  ],
  distributionChannels: [
    { id: "linkedin", name: "LinkedIn 领英动态", desc: "专业、深度" },
    { id: "wechat_moment", name: "朋友圈/私域", desc: "亲切、短促" },
    { id: "xiaohongshu", name: "小红书种草", desc: "Emoji丰富" },
    { id: "video_script", name: "短视频脚本", desc: "口语化" }
  ],
  tones: [
    { id: "professional", name: "严谨合规", desc: "强调零差错" },
    { id: "innovative", name: "激进创新", desc: "强调颠覆性" },
    { id: "empathetic", name: "同理心", desc: "站在用户角度" },
    { id: "urgent", name: "紧迫感", desc: "强调风险" },
    { id: "authoritative", name: "绝对权威", desc: "不容置疑" }
  ]
};