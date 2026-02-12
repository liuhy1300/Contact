import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useData } from '../context/DataContext';
import {
    PenTool, PanelsTopLeft, User, Map, Sparkles, X, Plus,
    Globe, Fingerprint, Image as ImageIcon, Link, MousePointerClick,
    Zap, Share2, Box, FileText, Copy, CircleCheckBig, CircleAlert,
    Smartphone, Monitor, Mail, Save, LayoutTemplate, FolderOpen, Trash2, BookOpen
} from 'lucide-react';
import { Industry, Product, Audience, BaseOption, Channel, LayoutStyle, Competitor, TemplateData, PromptTemplate, KnowledgeItem } from '../types';

// Helper for dynamic icons
const IconMap: { [key: string]: any } = {
    Smartphone, Monitor, Mail, FileText
};

const STORAGE_KEY = 'builder_state_v1';

const Builder: React.FC = () => {
    const { data } = useData();
    const navigate = useNavigate();

    // -- State Management --
    const [activeTab, setActiveTab] = useState<"strategy" | "visual">("strategy");
    const [isCopied, setIsCopied] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Template Management State
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
    const templateDropdownRef = useRef<HTMLDivElement>(null);

    // Core Selections (Initialized with first item from data to avoid nulls)
    const [selectedRole, setSelectedRole] = useState<BaseOption>(data.roles[0]);
    const [selectedProduct, setSelectedProduct] = useState<Product>(data.products[0]);
    const [selectedIndustry, setSelectedIndustry] = useState<Industry>(data.industries[0]);
    const [selectedAudience, setSelectedAudience] = useState<Audience>(data.audiences[0]);
    const [selectedJourneyStage, setSelectedJourneyStage] = useState<BaseOption>(data.journeyStages[0]);

    // Custom inputs
    const [customAudience, setCustomAudience] = useState("");
    const [customPainPoint, setCustomPainPoint] = useState("");
    const [customCoreValue, setCustomCoreValue] = useState("");
    const [customMarketValue, setCustomMarketValue] = useState("");
    const [customScenarios, setCustomScenarios] = useState("");
    const [customProof, setCustomProof] = useState("");

    // Competitors
    const [selectedCompetitorIds, setSelectedCompetitorIds] = useState<string[]>([]);
    const [manualCompetitor, setManualCompetitor] = useState("");
    const [isCompetitorDropdownOpen, setIsCompetitorDropdownOpen] = useState(false);
    const [showCompetitorName, setShowCompetitorName] = useState(false);
    const [expandCompetitorDetails, setExpandCompetitorDetails] = useState(false);
    const competitorDropdownRef = useRef<HTMLDivElement>(null);

    // GEO & SEO
    const [geoQuestion, setGeoQuestion] = useState("");
    const [geoKeywords, setGeoKeywords] = useState("");
    const [geoStructure, setGeoStructure] = useState<BaseOption>(data.geoStructures[0]);
    const [enableCodeGeo, setEnableCodeGeo] = useState(false);

    // Visual & Output
    const [selectedBrand, setSelectedBrand] = useState<BaseOption>(data.brands[0]);
    const [selectedHook, setSelectedHook] = useState<BaseOption>(data.marketingHooks[0]);
    const [selectedStyle, setSelectedStyle] = useState<BaseOption>(data.styles[0]);
    const [selectedTone, setSelectedTone] = useState<BaseOption>(data.tones[0]);
    const [selectedHeadlineStrategy, setSelectedHeadlineStrategy] = useState<BaseOption>(data.headlineStrategies[0]);

    // Media & Tech
    const [showImagePrompts, setShowImagePrompts] = useState(true);
    const [topImage, setTopImage] = useState("");
    const [topImageLink, setTopImageLink] = useState("");
    const [middleImage, setMiddleImage] = useState("");
    const [middleImageLink, setMiddleImageLink] = useState("");
    const [bottomImage, setBottomImage] = useState("");
    const [bottomImageLink, setBottomImageLink] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [selectedMultimodal, setSelectedMultimodal] = useState<string[]>([]);
    const [videoLink, setVideoLink] = useState("");
    const [interactiveGoal, setInteractiveGoal] = useState("");
    const [selectedImageStyle, setSelectedImageStyle] = useState<BaseOption>(data.imageStyles[0]);
    const [selectedImageRatio, setSelectedImageRatio] = useState<BaseOption>(data.imageRatios[0]);

    // Conversion
    const [selectedCTA, setSelectedCTA] = useState<BaseOption>(data.ctaStrategies[0]);
    const [ctaLink, setCtaLink] = useState("");

    // Output Configuration
    // Output Configuration
    const [selectedPrimaryChannel, setSelectedPrimaryChannel] = useState<Channel>(data.channels[0]);
    const [selectedDistChannels, setSelectedDistChannels] = useState<string[]>([]);
    const [outputFormat, setOutputFormat] = useState<"markdown" | "html">("markdown");
    const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>(data.layoutStyles[0]);
    const [selectedCMS, setSelectedCMS] = useState<BaseOption>(data.cmsOptions[0]);
    const [wordCount, setWordCount] = useState<BaseOption>(data.wordCounts[0]);
    const [selectedLanguage, setSelectedLanguage] = useState<BaseOption>(data.languages[0]);

    // Output Requirements State
    const [chkHeadlines, setChkHeadlines] = useState(true);
    const [chkMeta, setChkMeta] = useState(false);
    const [chkQuotes, setChkQuotes] = useState(true);
    const [chkHtmlOnly, setChkHtmlOnly] = useState(false);
    const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
    const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<string[]>([]);


    // --- Effects ---
    // Fetch Templates
    useEffect(() => {
        const fetchTemplates = async () => {
            const { data: tpls, error } = await supabase
                .from('prompt_templates')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && tpls) setTemplates(tpls as PromptTemplate[]);
        };
        fetchTemplates();
    }, []);

    // -- Persistence --
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                loadTemplate(parsed); // Reuse loadTemplate to restore state
            } catch (e) {
                console.error("Failed to load persistence", e);
            }
        }
    }, []);

    // Save state on change (Debounced slightly by React batching, but good to optimize in real world)
    useEffect(() => {
        const stateToSave = getCurrentState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [
        selectedRole, selectedProduct, selectedIndustry, selectedAudience, selectedJourneyStage,
        customAudience, customPainPoint, customCoreValue, customMarketValue, customScenarios, customProof,
        selectedCompetitorIds, manualCompetitor, geoQuestion, geoKeywords, geoStructure,
        selectedBrand, selectedHook, selectedStyle, selectedTone, selectedHeadlineStrategy,
        showImagePrompts, topImage, middleImage, bottomImage, topImageLink, middleImageLink, bottomImageLink,
        authorName, selectedMultimodal, videoLink, interactiveGoal, selectedImageStyle, selectedImageRatio,
        selectedCTA, ctaLink, selectedPrimaryChannel, selectedDistChannels, outputFormat, layoutStyle, selectedCMS,
        wordCount, selectedLanguage, selectedKnowledgeIds, chkHeadlines, chkMeta, chkQuotes, chkHtmlOnly
    ]);

    // Fetch Knowledge Base
    useEffect(() => {
        const fetchKnowledge = async () => {
            const { data: kItems, error } = await supabase
                .from('knowledge_base')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && kItems) setKnowledgeItems(kItems as KnowledgeItem[]);
        };
        fetchKnowledge();
    }, []);

    // Load initial defaults if state is empty/undefined (safety check)
    useEffect(() => {
        if (!selectedRole && data.roles.length > 0) setSelectedRole(data.roles[0]);
        if (!selectedProduct && data.products.length > 0) setSelectedProduct(data.products[0]);
        // ... (Repeat for others if needed, but useState initializers handle most)
    }, [data]);

    // Update custom pain point when industry changes (Only if user hasn't manually edited it? Or always?
    // Current logic: Always update. To improve: maybe check if it was manually changed. 
    // For now, keep simple behavior: industry change -> suggest pain point.
    useEffect(() => {
        if (selectedIndustry && selectedIndustry.painPoints) {
            setCustomPainPoint(selectedIndustry.painPoints);
        }
    }, [selectedIndustry]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (competitorDropdownRef.current && !competitorDropdownRef.current.contains(event.target as Node)) {
                setIsCompetitorDropdownOpen(false);
            }
            if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
                setIsTemplateDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Template Logic ---

    const getCurrentState = (): TemplateData => ({
        roleId: selectedRole?.id,
        productId: selectedProduct?.id,
        industryId: selectedIndustry?.id,
        audienceId: selectedAudience?.id,
        journeyStageId: selectedJourneyStage?.id,
        customAudience,
        customPainPoint,
        customCoreValue,
        customMarketValue,
        customScenarios,
        customProof,
        competitorIds: selectedCompetitorIds,
        manualCompetitor,
        geoQuestion,
        geoKeywords,
        geoStructureId: geoStructure?.id,
        brandId: selectedBrand?.id,
        marketingHookId: selectedHook?.id,
        styleId: selectedStyle?.id,
        toneId: selectedTone?.id,
        headlineStrategyId: selectedHeadlineStrategy?.id,
        imagePromptsEnabled: showImagePrompts,
        imageStyleId: selectedImageStyle?.id,
        imageRatioId: selectedImageRatio?.id,
        topImage,
        middleImage,
        bottomImage,
        topImageLink,
        middleImageLink,
        bottomImageLink,
        channelId: selectedPrimaryChannel?.id,
        distChannelIds: selectedDistChannels,
        ctaStrategyId: selectedCTA?.id,
        ctaLink,
        outputFormat,
        layoutStyleId: layoutStyle?.id,
        cmsOptionId: selectedCMS?.id,
        wordCountId: wordCount?.id,
        languageId: selectedLanguage?.id,
        knowledgeIds: selectedKnowledgeIds,
        chkHeadlines,
        chkMeta,
        chkQuotes,
        chkHtmlOnly
    });

    const loadTemplate = (tpl: TemplateData) => {
        // Safe find helper
        const find = (arr: any[], id: string, def: any) => arr.find(x => x.id === id) || def;

        setSelectedRole(find(data.roles, tpl.roleId, data.roles[0]));
        setSelectedProduct(find(data.products, tpl.productId, data.products[0]));
        setSelectedIndustry(find(data.industries, tpl.industryId, data.industries[0]));
        setSelectedAudience(find(data.audiences, tpl.audienceId, data.audiences[0]));
        setSelectedJourneyStage(find(data.journeyStages, tpl.journeyStageId, data.journeyStages[0]));

        setCustomAudience(tpl.customAudience || "");
        setCustomPainPoint(tpl.customPainPoint || "");
        setCustomCoreValue(tpl.customCoreValue || "");
        setCustomMarketValue(tpl.customMarketValue || "");
        setCustomScenarios(tpl.customScenarios || "");
        setCustomProof(tpl.customProof || "");

        setSelectedCompetitorIds(tpl.competitorIds || []);
        setManualCompetitor(tpl.manualCompetitor || "");

        setGeoQuestion(tpl.geoQuestion || "");
        setGeoKeywords(tpl.geoKeywords || "");
        setGeoStructure(find(data.geoStructures, tpl.geoStructureId, data.geoStructures[0]));

        setSelectedBrand(find(data.brands, tpl.brandId, data.brands[0]));
        setSelectedHook(find(data.marketingHooks, tpl.marketingHookId, data.marketingHooks[0]));
        setSelectedStyle(find(data.styles, tpl.styleId, data.styles[0]));
        setSelectedTone(find(data.tones, tpl.toneId, data.tones[0]));
        setSelectedHeadlineStrategy(find(data.headlineStrategies, tpl.headlineStrategyId, data.headlineStrategies[0]));

        setShowImagePrompts(tpl.imagePromptsEnabled);
        setSelectedImageStyle(find(data.imageStyles, tpl.imageStyleId, data.imageStyles[0]));
        setSelectedImageRatio(find(data.imageRatios, tpl.imageRatioId, data.imageRatios[0]));
        setTopImage(tpl.topImage || "");
        setMiddleImage(tpl.middleImage || "");
        setBottomImage(tpl.bottomImage || "");
        setTopImageLink(tpl.topImageLink || "");
        setMiddleImageLink(tpl.middleImageLink || "");
        setBottomImageLink(tpl.bottomImageLink || "");

        setSelectedPrimaryChannel(find(data.channels, tpl.channelId, data.channels[0]));
        setSelectedDistChannels(tpl.distChannelIds || []);
        setSelectedCTA(find(data.ctaStrategies, tpl.ctaStrategyId, data.ctaStrategies[0]));
        setCtaLink(tpl.ctaLink || "");

        setOutputFormat(tpl.outputFormat || "markdown");
        setLayoutStyle(find(data.layoutStyles, tpl.layoutStyleId, data.layoutStyles[0]));
        setSelectedCMS(find(data.cmsOptions, tpl.cmsOptionId, data.cmsOptions[0]));
        setWordCount(find(data.wordCounts, tpl.wordCountId, data.wordCounts[0]));
        setSelectedLanguage(find(data.languages, tpl.languageId, data.languages[0]));

        setSelectedKnowledgeIds(tpl.knowledgeIds || []);

        setChkHeadlines(tpl.chkHeadlines ?? true);
        setChkMeta(tpl.chkMeta ?? true);
        setChkQuotes(tpl.chkQuotes ?? true);
        setChkHtmlOnly(tpl.chkHtmlOnly ?? false);
    };

    const handleSaveTemplate = async () => {
        if (!templateName.trim()) return alert("请输入模版名称");

        const currentState = getCurrentState();
        try {
            const { data: newTpl, error } = await supabase.from('prompt_templates').insert({
                name: templateName,
                template_data: currentState
            }).select().single();

            if (error) throw error;

            setTemplates(prev => [newTpl as PromptTemplate, ...prev]);
            setIsTemplateModalOpen(false);
            setTemplateName("");
            alert("模版保存成功！");
        } catch (err: any) {
            console.error("Failed to save template", err);
            alert("保存失败: " + err.message);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!window.confirm("确定要删除这个模版吗？")) return;
        try {
            const { error } = await supabase.from('prompt_templates').delete().eq('id', id);
            if (error) throw error;
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err: any) {
            alert("删除失败: " + err.message);
        }
    };


    // PROMPT GENERATION LOGIC (Refactored to check nulls)
    useEffect(() => {
        if (!selectedRole || !selectedProduct) return;

        const buildPrompt = () => {
            // 1. Competitor Logic
            const activeCompetitors = data.competitors.filter(c => selectedCompetitorIds.includes(c.id));
            let competitorList = activeCompetitors.map(c => c.name);
            if (manualCompetitor) competitorList.push(manualCompetitor);

            const competitorNames = competitorList.join("、");
            let competitorText = "不进行特定的竞品对比，仅强调自身优势";
            if (competitorList.length > 0) {
                competitorText = showCompetitorName
                    ? `请明确对比以下竞品：**${competitorNames}**`
                    : `请含蓄对比 **${competitorNames}** 等同类竞品 (文中不要直接出现竞品名称)`;
            }
            const edgeText = activeCompetitors.length > 0 && expandCompetitorDetails
                ? `- *差异化攻击点*：${activeCompetitors.map(c => `针对${c.name}突出本产品在"${c.edge}"的优势`).join("；")}。`
                : "";

            // 2. Output & Format Logic
            let outputFormatInstruction = "";
            const safeLink = ctaLink?.trim() || "https://example.com";
            // Check selectedCTA before accessing props
            const ctaName = selectedCTA?.name || "CTA";
            const ctaButtonHtml = `<div style="text-align: center; margin: 40px 0;"><a href="${safeLink}" style="background-color: #E2231A; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">${ctaName.split(" (")[0]} →</a></div>`;
            const ctaButtonMd = `> **👉 [${ctaName.split(" (")[0]}](${safeLink})**`;

            // Image Injection Logic
            let imgInstructions: string[] = [];
            const generateImageCode = (src: string, link: string, pos: string) => {
                if (!src?.trim()) return null;
                if (outputFormat === "html") {
                    const img = `<img src="${src.trim()}" alt="${pos}" style="max-width: 100%; border-radius: 8px;" />`;
                    return link?.trim() ? `<a href="${link.trim()}" target="_blank">${img}</a>` : img;
                } else {
                    return link?.trim() ? `[![${pos}](${src.trim()})](${link.trim()})` : `![${pos}](${src.trim()})`;
                }
            };

            if (topImage) { const c = generateImageCode(topImage, topImageLink, "Hero"); if (c) imgInstructions.push(`- **Hero Image**: 将此代码置于开头: \`${c}\``); }
            if (middleImage) { const c = generateImageCode(middleImage, middleImageLink, "Body"); if (c) imgInstructions.push(`- **Body Image**: 置于核心段落后: \`${c}\``); }
            if (bottomImage) { const c = generateImageCode(bottomImage, bottomImageLink, "Footer"); if (c) imgInstructions.push(`- **Footer Image**: 置于CTA前: \`${c}\``); }

            const contentImageInstruction = imgInstructions.length > 0 ? `\n**Image Injection**:\n${imgInstructions.join("\n")}` : "";

            if (outputFormat === "html") {
                outputFormatInstruction = `5. **输出形式 (HTML精排 - ${selectedPrimaryChannel?.name})**：
   - 输出完整的 HTML 代码，包裹在Markdown代码块中。
   - **排版卫士**：确保 max-width: 100%，字体适配移动端。
   - **设计系统**：${layoutStyle?.css}
   - **CMS兼容**：${selectedCMS?.desc}
   ${contentImageInstruction}
   - **转化组件**：插入此 CTA 代码：\`${ctaButtonHtml}\``;
            } else {
                outputFormatInstruction = `5. **输出形式 (Markdown)**：
   - 使用标准 Markdown。
   - 关键数据加粗。
   ${contentImageInstruction}
   - **转化组件**：${ctaButtonMd}`;
            }

            // 3. GEO & Multimodal (Pre-calculation)
            const strictKnowledge = selectedKnowledgeIds
                .map(id => knowledgeItems.find(i => i.id === id))
                .filter(k => k && k.ref_mode === 'strict');

            const smartKnowledge = selectedKnowledgeIds
                .map(id => knowledgeItems.find(id => id === id)) // Bug here in original logic if copied blindly, let's fix. 
            // Wait, map(id => knowledgeItems.find(i => i.id === id)).filter... 
            // Let's rewrite cleaner.

            // Re-implementing logic clearly:
            const allSelectedKnowledge = knowledgeItems.filter(k => selectedKnowledgeIds.includes(k.id));
            const strictItems = allSelectedKnowledge.filter(k => k.ref_mode === 'strict');
            const smartItems = allSelectedKnowledge.filter(k => k.ref_mode !== 'strict'); // Default to smart

            const strictInstruction = strictItems.length > 0 ? `# MANDATORY CONSTRAINTS (Strict Compliance Required)
    You MUST strictly adhere to the following rules/descriptions without deviation:
    ${strictItems.map(k => `- **${k.title}**: ${k.content}`).join('\n')}` : "";

            const smartInstruction = smartItems.length > 0 ? `# Knowledge Base (Contextual References)
    Use the following information as context to enhance your response:
    ${smartItems.map(k => `- **${k.title}**: ${k.content}`).join('\n')}` : "";

            const geoInstruction = (geoQuestion || geoKeywords || enableCodeGeo) ? `# GEO Optimization (AI 引用优化)
   - *用户提问*：>"${geoQuestion || "行业常见问题"}"
   - *策略*：使用 ${geoStructure?.name} 形式回答。
   - *关键词*：${geoKeywords || "产品核心词"}
   ${enableCodeGeo ? "- **Technical SEO**: 包含 Schema.org JSON-LD 结构化数据。" : ""}` : "";

            const imageGenInstruction = showImagePrompts ? `# Image Generation Prompts
   - **风格**：${selectedImageStyle?.name}
   - **比例**：${selectedImageRatio?.name}
   - 生成3组英文 Prompt (Midjourney)。` : "";

            const multimodalInstruction = selectedMultimodal.length > 0 ? `# Multimodal Placeholders
   ${selectedMultimodal.map(mid => {
                const m = data.multimodalOptions.find(opt => opt.id === mid);
                if (mid === 'video' && videoLink) return `- **Video**: Embed YouTube link: ${videoLink}`;
                if (mid === 'interactive' && interactiveGoal) return `- **Interactive**: Design logic for "${interactiveGoal}"`;
                return `- **${m?.name}**: ${m?.desc}`;
            }).join('\n')}` : "";

            const atomizationInstruction = selectedDistChannels.length > 0 ? `# Content Atomization
   额外撰写以下渠道文案：
   ${selectedDistChannels.map(cid => {
                const c = data.distributionChannels.find(ch => ch.id === cid);
                return `- **${c?.name}**: ${c?.desc}`;
            }).join('\n')}` : "";

            // FINAL PROMPT ASSEMBLY
            // Use optional chaining generously to prevent crashes during state switches
            // Dynamic Output Requirements
            let reqIndex = 1;
            const outputInfos: string[] = [];
            if (chkHeadlines) outputInfos.push(`${reqIndex++}. **标题**：5个基于 [${selectedHeadlineStrategy?.name}] 的标题。`);
            if (chkMeta) outputInfos.push(`${reqIndex++}. **摘要**：SEO Meta Description.`);
            outputInfos.push(`${reqIndex++}. **正文**：逻辑清晰，${selectedStyle?.id === "wechat" ? "短句+Emoji" : "专业严谨"}。`);
            if (chkQuotes) outputInfos.push(`${reqIndex++}. **金句**：提取或创作3个易于传播的核心观点/金句。`);

            const prompt = `# Role
你是一位 **${selectedRole?.name}** (${selectedRole?.desc})。
**品牌调性**：${selectedBrand?.name} (${selectedBrand?.desc})。

# Task
撰写一篇 **${selectedStyle?.name}**，发布于 **${selectedPrimaryChannel?.name}**。

# Context
1. **产品**：${selectedProduct?.name} (${selectedProduct?.features})
2. **行业**：${selectedIndustry?.name} (痛点: ${customPainPoint})
3. **受众**：${customAudience ? customAudience : `${selectedAudience?.name} (${selectedAudience?.focus})`}
4. **篇幅**：${wordCount?.name}
5. **语言**：${selectedLanguage?.name}
${authorName ? `- **作者**：${authorName}` : ""}

${strictInstruction}
${smartInstruction}

# Journey Stage
**${selectedJourneyStage?.name}** (${selectedJourneyStage?.desc})

# Strategy (PMM)
1. **核心痛点**：${customPainPoint}
2. **价值主张**：${customCoreValue || "自动匹配产品核心价值"}
   - *商业价值*：${customMarketValue || "ROI 提升"}
3. **核心场景**：${customScenarios || "行业高频场景"}
4. **信任背书**：${customProof || "权威背书"}
5. **竞争对标**：${competitorText}
   ${edgeText}

# Conversion
**策略**：${selectedCTA?.name}
**链接**：${safeLink}
**开篇Hook**：${selectedHook?.name} (${selectedHook?.desc})

${geoInstruction}

# Tone
${selectedTone?.name} (${selectedTone?.desc})

# Output Requirements
${outputInfos.join('\n')}
${outputFormatInstruction}

${multimodalInstruction}
${atomizationInstruction}
${imageGenInstruction}`;

            setGeneratedPrompt(prompt.trim());
        };

        buildPrompt();
    }, [
        data, selectedRole, selectedProduct, selectedIndustry, selectedAudience, selectedJourneyStage,
        customAudience, customPainPoint, customCoreValue, customMarketValue, customScenarios, customProof,
        selectedCompetitorIds, manualCompetitor, showCompetitorName, expandCompetitorDetails,
        geoQuestion, geoKeywords, geoStructure, enableCodeGeo,
        selectedBrand, selectedHook, selectedStyle, selectedTone, selectedHeadlineStrategy,
        showImagePrompts, topImage, middleImage, bottomImage, topImageLink, middleImageLink, bottomImageLink,
        authorName, selectedMultimodal, videoLink, interactiveGoal, selectedImageStyle, selectedImageRatio,
        selectedCTA, ctaLink, selectedPrimaryChannel, selectedDistChannels, outputFormat, layoutStyle, selectedCMS,
        wordCount, selectedLanguage, selectedKnowledgeIds, knowledgeItems,
        chkHeadlines, chkMeta, chkQuotes, chkHtmlOnly
    ]);


    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedPrompt);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (e) {
            console.error("Copy failed", e);
        }
    };

    const handleSaveToHistory = async () => {
        if (!generatedPrompt) return;
        setIsSaving(true);
        try {
            const settingsSnapshot = {
                role: selectedRole?.name,
                product: selectedProduct?.name,
                industry: selectedIndustry?.name,
                format: selectedStyle?.name,
                channel: selectedPrimaryChannel?.name
            };

            const { error } = await supabase.from('generated_prompts').insert({
                prompt_content: generatedPrompt,
                settings: settingsSnapshot
            });

            if (error) throw error;

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err: any) {
            alert("Failed to save: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCompetitor = (id: string) => {
        setSelectedCompetitorIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const renderCompetitorGroup = (category: string, title: string) => {
        const groupItems = data.competitors.filter(c => c.category === category);
        if (groupItems.length === 0) return null;
        return (
            <div className="mb-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">{title}</div>
                {groupItems.map(c => (
                    <div key={c.id} onClick={() => toggleCompetitor(c.id)} className={`cursor-pointer px-3 py-2 text-xs flex items-center hover:bg-slate-50 ${selectedCompetitorIds.includes(c.id) ? "text-red-700 bg-red-50" : "text-slate-600"}`}>
                        <div className={`w-3 h-3 border rounded mr-2 flex items-center justify-center ${selectedCompetitorIds.includes(c.id) ? "bg-red-600 border-red-600" : "border-slate-300"}`}>
                            {selectedCompetitorIds.includes(c.id) && <div className="w-1 h-1 bg-white rounded-full" />}
                        </div>
                        {c.name}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col md:flex-row font-sans text-slate-800 overflow-hidden">
            {/* Left Column: Controls */}
            <div className="w-full md:w-5/12 bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-10">
                <div className="p-4 border-b border-slate-100 bg-white z-20 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">内容营销智能生成助手</h1>
                        <p className="text-xs text-slate-500 font-medium">配置参数以生成高质量 Prompt</p>
                    </div>
                    {/* Template Controls */}
                    <div className="relative" ref={templateDropdownRef}>
                        <button
                            onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors"
                        >
                            <LayoutTemplate className="w-3 h-3 mr-1.5" /> 模版
                        </button>
                        {isTemplateDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-[100] animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-1">
                                    <button
                                        onClick={() => { setIsTemplateModalOpen(true); setIsTemplateDropdownOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center"
                                    >
                                        <Save className="w-3 h-3 mr-2 text-indigo-500" /> 保存当前模版
                                    </button>
                                    <div className="my-1 border-t border-slate-100" />
                                    <div className="max-h-48 overflow-y-auto">
                                        {templates.length === 0 && <div className="px-3 py-2 text-xs text-slate-400 text-center">暂无模版</div>}
                                        {templates.map(t => (
                                            <div key={t.id} className="group flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                                <span className="text-xs text-slate-600 truncate flex-1" onClick={() => { loadTemplate(t.template_data); setIsTemplateDropdownOpen(false); }}>{t.name}</span>
                                                <Trash2
                                                    className="w-3 h-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex border-b border-slate-200 bg-slate-50">
                    <button onClick={() => setActiveTab("strategy")} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "strategy" ? "bg-white text-red-700 border-t-2 border-red-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
                        <PenTool className="w-3 h-3 inline-block mr-1 mb-0.5" /> 策略与价值
                    </button>
                    <button onClick={() => setActiveTab("visual")} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "visual" ? "bg-white text-purple-700 border-t-2 border-purple-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
                        <PanelsTopLeft className="w-3 h-3 inline-block mr-1 mb-0.5" /> 视觉与输出
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-300">
                    {activeTab === "strategy" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            {/* Role & Context */}
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                                <div className="flex items-center space-x-2 mb-2"><User className="w-4 h-4 text-slate-400" /><h3 className="text-xs font-bold uppercase text-slate-500">角色与语境</h3></div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">内容角色</label>
                                    <select className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium" value={selectedRole?.id} onChange={e => setSelectedRole(data.roles.find(r => r.id === e.target.value) || data.roles[0])}>
                                        {data.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-1 pl-1 bg-slate-100 p-1.5 rounded">{selectedRole?.desc}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">语言</label>
                                        <select className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" value={selectedLanguage?.id} onChange={e => setSelectedLanguage(data.languages.find(l => l.id === e.target.value) || data.languages[0])}>
                                            {data.languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">产品</label>
                                        <select className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm text-red-700 font-medium" value={selectedProduct?.id} onChange={e => setSelectedProduct(data.products.find(p => p.id === e.target.value) as Product || data.products[0])}>
                                            {data.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">行业</label>
                                        <select className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" value={selectedIndustry?.id} onChange={e => setSelectedIndustry(data.industries.find(i => i.id === e.target.value) as Industry || data.industries[0])}>
                                            {data.industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">受众</label>
                                        <select className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" value={selectedAudience?.id} onChange={e => setSelectedAudience(data.audiences.find(a => a.id === e.target.value) as Audience || data.audiences[0])}>
                                            {data.audiences.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <input type="text" className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-slate-200 outline-none" placeholder="自定义受众 (可选)..." value={customAudience} onChange={e => setCustomAudience(e.target.value)} />
                            </div>

                            {/* Journey Stage */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                                <div className="flex items-center space-x-2 mb-2"><Map className="w-4 h-4 text-indigo-500" /><h3 className="text-xs font-bold uppercase text-indigo-600">用户旅程阶段</h3></div>
                                <select className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-sm text-indigo-900" value={selectedJourneyStage?.id} onChange={e => setSelectedJourneyStage(data.journeyStages.find(j => j.id === e.target.value) || data.journeyStages[0])}>
                                    {data.journeyStages.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                                </select>
                                <p className="text-[10px] text-indigo-500 mt-1 pl-1">{selectedJourneyStage?.desc}</p>
                            </div>

                            {/* Value Prop */}
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/80 space-y-3">
                                <div className="flex items-center space-x-2 mb-1"><Sparkles className="w-4 h-4 text-amber-500" /><h3 className="text-xs font-bold uppercase text-amber-600">价值主张</h3></div>
                                <div><label className="block text-[10px] font-semibold text-amber-700/70 mb-1">痛点</label><textarea className="w-full p-2.5 text-xs border border-amber-200 rounded-lg bg-white h-16" value={customPainPoint} onChange={e => setCustomPainPoint(e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-[10px] font-semibold text-amber-700/70 mb-1">产品价值</label><input className="w-full p-2.5 text-xs border border-amber-200 rounded-lg bg-white" placeholder="e.g. 极速传输" value={customCoreValue} onChange={e => setCustomCoreValue(e.target.value)} /></div>
                                    <div><label className="block text-[10px] font-semibold text-amber-700/70 mb-1">商业价值</label><input className="w-full p-2.5 text-xs border border-amber-200 rounded-lg bg-white" placeholder="e.g. ROI +300%" value={customMarketValue} onChange={e => setCustomMarketValue(e.target.value)} /></div>
                                </div>
                            </div>

                            {/* Knowledge Base RAG */}
                            <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 space-y-3">
                                <div className="flex items-center space-x-2 mb-2"><BookOpen className="w-4 h-4 text-sky-500" /><h3 className="text-xs font-bold uppercase text-sky-600">知识库引用 (RAG)</h3></div>
                                {knowledgeItems.length === 0 ? (
                                    <div className="text-xs text-sky-400 italic">暂无知识条目，请前往“知识库”添加。</div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                        {knowledgeItems.map(k => (
                                            <div
                                                key={k.id}
                                                onClick={() => setSelectedKnowledgeIds(prev => prev.includes(k.id) ? prev.filter(x => x !== k.id) : [...prev, k.id])}
                                                className={`cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedKnowledgeIds.includes(k.id) ? "bg-sky-100 border-sky-300 text-sky-800" : "bg-white border-sky-100 text-slate-600 hover:border-sky-300"}`}
                                            >
                                                {k.ref_mode === 'strict' && <span className="mr-1">🔒</span>}
                                                {k.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Competitors */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-50">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-bold uppercase text-slate-500">竞争对标</h3>
                                    <div className="flex items-center space-x-3">
                                        <label className="flex items-center cursor-pointer group"><input type="checkbox" className="mr-1.5 accent-red-600" checked={showCompetitorName} onChange={e => setShowCompetitorName(e.target.checked)} /><span className="text-[10px] text-slate-500">直接点名</span></label>
                                        <label className="flex items-center cursor-pointer group"><input type="checkbox" className="mr-1.5 accent-red-600" checked={expandCompetitorDetails} onChange={e => setExpandCompetitorDetails(e.target.checked)} /><span className="text-[10px] text-slate-500">详细对比</span></label>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                                    {selectedCompetitorIds.map(id => {
                                        const c = data.competitors.find(comp => comp.id === id);
                                        return c ? <span key={id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">{c.name}<X className="w-3 h-3 ml-1.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleCompetitor(id); }} /></span> : null;
                                    })}
                                    {manualCompetitor && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">{manualCompetitor}<X className="w-3 h-3 ml-1.5 cursor-pointer" onClick={() => setManualCompetitor("")} /></span>}
                                </div>
                                <div className="space-y-2">
                                    <div className="relative" ref={competitorDropdownRef}>
                                        <button onClick={() => setIsCompetitorDropdownOpen(!isCompetitorDropdownOpen)} className="w-full flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-white"><span className="flex items-center"><Plus className="w-3 h-3 mr-1" /> 选择竞品...</span></button>
                                        {isCompetitorDropdownOpen && (
                                            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                                                {renderCompetitorGroup("VDR", "VDR 专项")}
                                                {renderCompetitorGroup("General", "通用 / 云")}
                                                {renderCompetitorGroup("Vertical", "垂直 / 信创")}
                                            </div>
                                        )}
                                    </div>
                                    <input type="text" className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 outline-none" placeholder="手动输入竞品..." value={manualCompetitor} onChange={e => setManualCompetitor(e.target.value)} />
                                </div>
                            </div>

                            {/* GEO */}
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                                <div className="flex items-center justify-between mb-1"><div className="flex items-center space-x-2"><Globe className="w-4 h-4 text-blue-500" /><h3 className="text-xs font-bold uppercase text-blue-600">GEO 优化</h3></div><label className="flex items-center cursor-pointer"><input type="checkbox" className="mr-1.5 accent-blue-600" checked={enableCodeGeo} onChange={e => setEnableCodeGeo(e.target.checked)} /><span className="text-[10px] text-blue-600 font-medium">Schema.org</span></label></div>
                                <div><label className="block text-[10px] font-semibold text-blue-700/70 mb-1">核心问题</label><input className="w-full p-2.5 text-xs border border-blue-200 rounded-lg bg-white" placeholder="e.g. 行业常见问题?" value={geoQuestion} onChange={e => setGeoQuestion(e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-[10px] font-semibold text-blue-700/70 mb-1">关键词</label><input className="w-full p-2.5 text-xs border border-blue-200 rounded-lg bg-white" value={geoKeywords} onChange={e => setGeoKeywords(e.target.value)} /></div>
                                    <div><label className="block text-[10px] font-semibold text-blue-700/70 mb-1">结构</label><select className="w-full p-2.5 text-xs border border-blue-200 rounded-lg bg-white" value={geoStructure?.id} onChange={e => setGeoStructure(data.geoStructures.find(s => s.id === e.target.value) || data.geoStructures[0])}>{data.geoStructures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "visual" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Brand & Style */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center space-x-2 mb-1"><Fingerprint className="w-4 h-4 text-slate-500" /><h3 className="text-xs font-bold uppercase text-slate-500">品牌与调性</h3></div>
                                <div><label className="block text-[10px] font-semibold text-slate-400 mb-1">品牌调性</label><select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={selectedBrand?.id} onChange={e => setSelectedBrand(data.brands.find(b => b.id === e.target.value) || data.brands[0])}>{data.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                                <div><label className="block text-[10px] font-semibold text-slate-400 mb-1">心理钩子</label><select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={selectedHook?.id} onChange={e => setSelectedHook(data.marketingHooks.find(h => h.id === e.target.value) || data.marketingHooks[0])}>{data.marketingHooks.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-[10px] font-semibold text-slate-400 mb-1">风格</label><select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={selectedStyle?.id} onChange={e => setSelectedStyle(data.styles.find(s => s.id === e.target.value) || data.styles[0])}>{data.styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                    <div><label className="block text-[10px] font-semibold text-slate-400 mb-1">语气</label><select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={selectedTone?.id} onChange={e => setSelectedTone(data.tones.find(t => t.id === e.target.value) || data.tones[0])}>{data.tones.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                                </div>
                                <div><label className="block text-[10px] font-semibold text-slate-400 mb-1">标题策略</label><select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={selectedHeadlineStrategy?.id} onChange={e => setSelectedHeadlineStrategy(data.headlineStrategies.find(h => h.id === e.target.value) || data.headlineStrategies[0])}>{data.headlineStrategies.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                            </div>

                            {/* Images */}
                            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/80">
                                <div className="flex justify-between items-center mb-4"><div className="flex items-center space-x-2"><ImageIcon className="w-4 h-4 text-purple-600" /><label className="text-xs font-bold uppercase text-purple-800">多模态与图片</label></div><div className="flex items-center"><span className="text-[10px] text-purple-600 mr-2 font-medium">{showImagePrompts ? "智能配图" : "配图关闭"}</span><div onClick={() => setShowImagePrompts(!showImagePrompts)} className={`w-9 h-5 rounded-full p-1 cursor-pointer transition-colors ${showImagePrompts ? "bg-purple-500" : "bg-slate-300"}`}><div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${showImagePrompts ? "translate-x-4" : "translate-x-0"}`} /></div></div></div>
                                <div className="space-y-4">
                                    <div className="bg-white/70 p-3 rounded-lg border border-purple-100">
                                        <label className="block text-[10px] font-semibold text-purple-800 mb-2 flex items-center"><Link className="w-3 h-3 mr-1" /> 图片植入 (Multi-Position)</label>
                                        <input className="w-full p-2 text-xs border border-purple-200 rounded-lg bg-white mb-2" placeholder="Hero Image URL..." value={topImage} onChange={e => setTopImage(e.target.value)} />
                                        <input className="w-full p-2 text-xs border border-purple-200 rounded-lg bg-white mb-2" placeholder="Body Image URL..." value={middleImage} onChange={e => setMiddleImage(e.target.value)} />
                                        <input className="w-full p-2 text-xs border border-purple-200 rounded-lg bg-white" placeholder="Footer Image URL..." value={bottomImage} onChange={e => setBottomImage(e.target.value)} />
                                    </div>
                                    <div><label className="block text-[10px] font-semibold text-purple-700/70 mb-1">作者</label><input className="w-full p-2 text-xs border border-purple-200 rounded-lg bg-white" placeholder="e.g. 资深顾问" value={authorName} onChange={e => setAuthorName(e.target.value)} /></div>
                                    {showImagePrompts && <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-purple-200/50">
                                        <select className="p-1.5 bg-white border border-purple-200 rounded text-[10px]" value={selectedImageStyle?.id} onChange={e => setSelectedImageStyle(data.imageStyles.find(s => s.id === e.target.value) || data.imageStyles[0])}>{data.imageStyles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                                        <select className="p-1.5 bg-white border border-purple-200 rounded text-[10px]" value={selectedImageRatio?.id} onChange={e => setSelectedImageRatio(data.imageRatios.find(r => r.id === e.target.value) || data.imageRatios[0])}>{data.imageRatios.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
                                    </div>}
                                </div>
                            </div>

                            {/* Conversion */}
                            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100/80 shadow-sm space-y-4">
                                <div className="flex items-center space-x-2 mb-1"><MousePointerClick className="w-4 h-4 text-red-500" /><h3 className="text-xs font-bold uppercase text-red-600">留资转化</h3></div>
                                <div><label className="block text-[10px] font-semibold text-red-700/70 mb-1">CTA 策略</label><select className="w-full p-2.5 bg-white border border-red-200 rounded-lg text-sm" value={selectedCTA?.id} onChange={e => setSelectedCTA(data.ctaStrategies.find(c => c.id === e.target.value) || data.ctaStrategies[0])}>{data.ctaStrategies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                <div><label className="block text-[10px] font-semibold text-red-700/70 mb-1">目标链接</label><input className="w-full p-2.5 text-xs border border-red-200 rounded-lg bg-white" placeholder="https://..." value={ctaLink} onChange={e => setCtaLink(e.target.value)} /></div>
                            </div>

                            {/* Output */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">排版与分发</h3>
                                <div className="mb-4">
                                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 flex items-center"><Zap className="w-3 h-3 mr-1" /> 主发布渠道</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {data.channels.map(c => {
                                            const Icon = IconMap[c.iconName] || FileText;
                                            return (
                                                <div key={c.id} onClick={() => setSelectedPrimaryChannel(c)} className={`cursor-pointer px-3 py-2 rounded-lg text-xs border flex flex-col ${selectedPrimaryChannel?.id === c.id ? "bg-red-50 border-red-300 text-red-800" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                                                    <div className="flex items-center mb-1"><Icon className="w-3 h-3 mr-1.5" /><span className="font-medium">{c.name}</span></div>
                                                    <span className="text-[9px] opacity-70 truncate">{c.desc}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 flex items-center"><Share2 className="w-3 h-3 mr-1" /> 衍生分发</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {data.distributionChannels.map(c => (
                                            <div key={c.id} onClick={() => setSelectedDistChannels(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])} className={`cursor-pointer px-3 py-2 rounded-lg text-xs border ${selectedDistChannels.includes(c.id) ? "bg-purple-50 border-purple-300 text-purple-800" : "bg-slate-50 border-slate-200 text-slate-600"}`}>{c.name}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <button onClick={() => { setOutputFormat("markdown"); setLayoutStyle(data.layoutStyles[0]) }} className={`py-2 text-xs font-medium rounded-lg border ${outputFormat === "markdown" ? "bg-slate-800 text-white" : "bg-white text-slate-600"}`}>Markdown</button>
                                    <button onClick={() => { setOutputFormat("html"); setLayoutStyle(data.layoutStyles[1]) }} className={`py-2 text-xs font-medium rounded-lg border ${outputFormat === "html" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}>HTML 精排</button>
                                </div>
                                {outputFormat === "html" && (
                                    <>
                                        <div className="mb-3"><label className="block text-[10px] font-semibold text-blue-600 mb-1">CSS 模板</label><select className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs" value={layoutStyle?.id} onChange={e => setLayoutStyle(data.layoutStyles.find(l => l.id === e.target.value) as LayoutStyle || data.layoutStyles[0])}>{data.layoutStyles.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                                        <div className="mb-3"><label className="block text-[10px] font-semibold text-orange-600 mb-1 flex items-center"><Box className="w-3 h-3 mr-1" /> CMS 兼容</label><select className="w-full p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs" value={selectedCMS?.id} onChange={e => setSelectedCMS(data.cmsOptions.find(c => c.id === e.target.value) || data.cmsOptions[0])}>{data.cmsOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                    </>
                                )}

                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <label className="block text-[10px] font-semibold text-slate-400 mb-2">输出内容配置</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" checked={chkHtmlOnly} onChange={e => setChkHtmlOnly(e.target.checked)} className="accent-indigo-600 rounded" />
                                            <span className="text-xs text-slate-600 font-medium">仅输出 HTML 代码</span>
                                        </label>
                                        {!chkHtmlOnly && (
                                            <div className="pl-6 grid grid-cols-2 gap-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={chkHeadlines} onChange={e => setChkHeadlines(e.target.checked)} className="accent-blue-500 rounded" />
                                                    <span className="text-[10px] text-slate-500">标题 (5个)</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={chkMeta} onChange={e => setChkMeta(e.target.checked)} className="accent-blue-500 rounded" />
                                                    <span className="text-[10px] text-slate-500">摘要 (Meta)</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={chkQuotes} onChange={e => setChkQuotes(e.target.checked)} className="accent-blue-500 rounded" />
                                                    <span className="text-[10px] text-slate-500">传播金句</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="w-full md:w-7/12 bg-slate-100 flex flex-col h-full border-l border-slate-200">
                <div className="p-6 md:p-8 flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center"><FileText className="w-5 h-5 mr-2 text-red-600" />Prompt 预览 (可编辑)</h2>
                            <p className="text-xs text-slate-500 mt-1">Ready for GPT-4o / Claude 3.5 Sonnet</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveToHistory}
                                disabled={isSaving || isSaved || !generatedPrompt}
                                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md transform active:scale-95 ${isSaved ? "bg-green-600 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
                            >
                                {isSaving ? <span className="animate-spin mr-2">⟳</span> : (isSaved ? <CircleCheckBig className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />)}
                                {isSaved ? "已保存" : "保存记录"}
                            </button>
                            <button onClick={() => navigate('/tools', { state: { prompt: generatedPrompt, autoExecute: true } })} className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md transform active:scale-95 bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg`}>
                                <Sparkles className="w-4 h-4 mr-2" /> 立即生成内容
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group min-h-0">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 z-10" />

                        {/* Copy Button */}
                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={handleCopy}
                                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm backdrop-blur-sm border transition-all ${isCopied ? "bg-green-100 text-green-700 border-green-200" : "bg-white/90 text-slate-600 border-slate-200 hover:bg-white hover:text-indigo-600"}`}
                            >
                                {isCopied ? <CircleCheckBig className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                                {isCopied ? "已复制" : "一键复制"}
                            </button>
                        </div>

                        <textarea
                            className="w-full h-full p-6 pt-8 font-mono text-sm leading-relaxed text-slate-600 resize-none outline-none bg-transparent"
                            value={generatedPrompt}
                            onChange={(e) => setGeneratedPrompt(e.target.value)}
                            spellCheck={false}
                            placeholder="生成的 Prompt 将显示在这里，您也可以直接编辑..."
                        />
                    </div>
                </div>
            </div>

            {/* Template Modal */}
            {
                isTemplateModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[101] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
                            <h3 className="text-lg font-bold mb-4">保存为新模版</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">模版名称</label>
                                    <input
                                        className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. B2B LinkedIn 推广"
                                        value={templateName}
                                        onChange={e => setTemplateName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-2">
                                    <button onClick={() => setIsTemplateModalOpen(false)} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
                                    <button onClick={handleSaveTemplate} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">保存</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Builder;