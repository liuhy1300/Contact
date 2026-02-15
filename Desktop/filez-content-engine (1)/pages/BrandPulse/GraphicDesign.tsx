
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Download, Save, Loader2, Image as ImageIcon, Zap, Upload, X,
    Shield, Palette, Wand2, Layers, Type, LayoutGrid, ImagePlus, MonitorSmartphone
} from 'lucide-react';
import { bananaArtService, ImageGenerationResult } from '../../services/BananaArtService';
import { materialService } from '../../lib/materialService';
import {
    STYLE_PRESETS, REFINE_STYLES, BRAND_PALETTE, BRAND_COLOR_PROMPT, LOGO_CONFIG,
    POSTER_SCENES, TEXT_POSITIONS, ELEMENT_TYPES
} from '../../constants/graphicDesign';
import HackerConsole from '../../components/shared/HackerConsole';

// 工作模式定义
type WorkMode = 'creative' | 'refine' | 'elements' | 'poster';

const MODE_TABS: { id: WorkMode; name: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'creative', name: '创意生成', icon: <Sparkles className="w-4 h-4" />, desc: '文生图 + 风格预设' },
    { id: 'refine', name: '产品精修', icon: <MonitorSmartphone className="w-4 h-4" />, desc: '截图 → 产品大片' },
    { id: 'elements', name: '元素工坊', icon: <Layers className="w-4 h-4" />, desc: '图标 / 3D 元素' },
    { id: 'poster', name: '海报合成', icon: <Type className="w-4 h-4" />, desc: 'AI 底图 + 文字合成' },
];

const GraphicDesign: React.FC = () => {
    // 通用状态
    const [workMode, setWorkMode] = useState<WorkMode>('creative');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const resultRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 创意生成状态
    const [prompt, setPrompt] = useState(() => localStorage.getItem('banana_prompt') || '');
    const [aspectRatio, setAspectRatio] = useState(() => localStorage.getItem('banana_aspectRatio') || '1:1');
    const [selectedPreset, setSelectedPreset] = useState(STYLE_PRESETS[0].id);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);

    // 品牌卫士
    const [brandLock, setBrandLock] = useState(false);
    const [autoLogo, setAutoLogo] = useState(false);

    // 产品精修
    const [refineImage, setRefineImage] = useState<string | null>(null);
    const [refineStyle, setRefineStyle] = useState(REFINE_STYLES[0].id);

    // 元素工坊
    const [elementPrompt, setElementPrompt] = useState('');
    const [elementType, setElementType] = useState(ELEMENT_TYPES[0].id);

    // 海报合成
    const [posterText, setPosterText] = useState('联想 Filez，企业协作首选');
    const [posterScene, setPosterScene] = useState(POSTER_SCENES[0].id);
    const [textPosition, setTextPosition] = useState(TEXT_POSITIONS[0].id);
    const [posterBaseImage, setPosterBaseImage] = useState<string | null>(null);

    // 持久化
    useEffect(() => { localStorage.setItem('banana_prompt', prompt); }, [prompt]);
    useEffect(() => { localStorage.setItem('banana_aspectRatio', aspectRatio); }, [aspectRatio]);

    // 文件上传处理
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, target: 'reference' | 'refine') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            if (target === 'reference') setReferenceImage(base64);
            else setRefineImage(base64);
        };
        reader.readAsDataURL(file);
    }, []);

    // 拖拽上传
    const handleDrop = useCallback((e: React.DragEvent, target: 'reference' | 'refine') => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            if (target === 'reference') setReferenceImage(base64);
            else setRefineImage(base64);
        };
        reader.readAsDataURL(file);
    }, []);

    // Logo 水印 Canvas 叠加
    const applyLogoWatermark = useCallback(async (imageBase64: string): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // 绘制简单文字水印（当无法加载外部 Logo 图片时的降级方案）
                ctx.globalAlpha = LOGO_CONFIG.opacity + 0.15;
                ctx.font = `bold ${Math.max(20, img.width * 0.04)}px sans-serif`;
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText('Filez', img.width - LOGO_CONFIG.padding, img.height - LOGO_CONFIG.padding);

                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imageBase64;
        });
    }, []);

    // 海报文字 Canvas 叠加
    const applyPosterText = useCallback(async (imageBase64: string, text: string, posId: string): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const pos = TEXT_POSITIONS.find(p => p.id === posId) || TEXT_POSITIONS[0];
                const fontSize = Math.max(32, img.width * 0.06);
                const x = img.width * pos.x;
                const y = img.height * pos.y;

                // 文字阴影
                ctx.shadowColor = 'rgba(0,0,0,0.6)';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // 主标题
                ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`;
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = pos.id === 'top-left' ? 'left' : 'center';
                ctx.textBaseline = 'middle';

                // 多行文字排版
                const lines = text.split('\n');
                lines.forEach((line, i) => {
                    ctx.fillText(line, x, y + i * (fontSize * 1.4));
                });

                // 品牌色装饰线
                ctx.shadowBlur = 0;
                ctx.fillStyle = BRAND_PALETTE.primary;
                const lineY = pos.id === 'top-left' ? y - fontSize : y + lines.length * (fontSize * 1.4) + 10;
                const lineX = pos.id === 'top-left' ? x : x - 40;
                ctx.fillRect(lineX, lineY, 80, 4);

                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imageBase64;
        });
    }, []);

    // 核心生成逻辑
    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setGeneratedImages([]);
        localStorage.removeItem('banana_generatedImage');

        try {
            let result: ImageGenerationResult;
            const preset = STYLE_PRESETS.find(p => p.id === selectedPreset);
            const brandSuffix = brandLock ? ' ' + BRAND_COLOR_PROMPT : '';

            switch (workMode) {
                case 'creative': {
                    const fullPrompt = prompt + (preset?.promptSuffix ? '. ' + preset.promptSuffix : '') + brandSuffix;
                    if (referenceImage) {
                        result = await bananaArtService.generateWithImage(fullPrompt, referenceImage, aspectRatio);
                    } else {
                        result = await bananaArtService.generateImage(fullPrompt, aspectRatio);
                    }
                    break;
                }
                case 'refine': {
                    if (!refineImage) { setError('请先上传产品截图'); setIsGenerating(false); return; }
                    const style = REFINE_STYLES.find(s => s.id === refineStyle)!;
                    result = await bananaArtService.refineProductShot(refineImage, style.promptInstruction + brandSuffix, aspectRatio);
                    break;
                }
                case 'elements': {
                    if (!elementPrompt.trim()) { setError('请输入元素描述'); setIsGenerating(false); return; }
                    const eType = ELEMENT_TYPES.find(t => t.id === elementType)!;
                    // 生成多个（串行执行 2 次以获取更多变体）
                    const results: string[] = [];
                    for (let i = 0; i < 2; i++) {
                        const r = await bananaArtService.generateElement(elementPrompt + (i > 0 ? ', variation ' + (i + 1) : ''), eType.prompt + brandSuffix);
                        if (r.images.length > 0) results.push(...r.images.map(img => `data:image/png;base64,${img}`));
                    }
                    if (results.length > 0) {
                        setGeneratedImages(results);
                        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                        setIsGenerating(false);
                        return;
                    }
                    result = { images: [], error: '生成失败' };
                    break;
                }
                case 'poster': {
                    const scene = POSTER_SCENES.find(s => s.id === posterScene)!;
                    result = await bananaArtService.generatePosterBase(scene.promptHint + brandSuffix);
                    break;
                }
                default:
                    result = { images: [], error: '未知模式' };
            }

            if (result.error) {
                setError(result.error);
            } else if (result.images && result.images.length > 0) {
                let processedImages = result.images.map(img => `data:image/png;base64,${img}`);

                // Logo 水印后处理
                if (autoLogo) {
                    processedImages = await Promise.all(processedImages.map(img => applyLogoWatermark(img)));
                }

                // 海报文字叠加
                if (workMode === 'poster' && posterText.trim()) {
                    processedImages = await Promise.all(processedImages.map(img => applyPosterText(img, posterText, textPosition)));
                    setPosterBaseImage(processedImages[0]);
                }

                setGeneratedImages(processedImages);
                setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (err: any) {
            setError(err.message || "未知错误");
        } finally {
            setIsGenerating(false);
        }
    };

    // 保存到素材库
    const handleSaveToLibrary = async (imageUrl: string) => {
        setIsSaving(true);
        try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            const file = new File([blob], `design-${Date.now()}.png`, { type: 'image/png' });
            await materialService.uploadFile(file, 'image');
            alert("已保存到素材库！");
        } catch (err: any) {
            alert("保存失败: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // 上传区域组件
    const UploadZone: React.FC<{ target: 'reference' | 'refine'; image: string | null; onClear: () => void }> = ({ target, image, onClear }) => (
        <div
            className={`relative border-2 border-dashed rounded-xl transition-all ${image ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, target)}
        >
            {image ? (
                <div className="p-3 flex items-center gap-3">
                    <img src={image} alt="上传的图片" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">已上传参考图</p>
                        <p className="text-[10px] text-slate-400">点击 × 删除</p>
                    </div>
                    <button onClick={onClear} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center p-6 cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">拖拽或点击上传图片</p>
                    <p className="text-[10px] text-slate-400 mt-1">支持 PNG / JPG / WebP</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, target)} />
                </label>
            )}
        </div>
    );

    return (
        <div className="w-full h-full min-h-screen flex flex-col md:flex-row font-sans text-slate-900 bg-slate-50 overflow-y-auto">
            {/* 左侧面板 */}
            <div className="w-full md:w-5/12 flex flex-col border-r border-slate-200 bg-white shadow-sm z-10">
                {/* 头部 */}
                <div className="p-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 flex items-center tracking-tight">
                                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mr-2">BananaArt</span>
                                Enterprise Studio
                            </h1>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Powered by Gemini 3 Pro Image</p>
                        </div>
                    </div>

                    {/* 工作模式 Tab */}
                    <div className="flex gap-1.5 mt-4 bg-slate-100 p-1 rounded-xl">
                        {MODE_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setWorkMode(tab.id); setError(null); setGeneratedImages([]); }}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-semibold transition-all ${workMode === tab.id
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.icon}
                                <span className="hidden lg:inline">{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 滚动内容区 */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={workMode}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* =================== 创意生成模式 =================== */}
                            {workMode === 'creative' && (
                                <>
                                    {/* 风格预设 */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <Palette className="w-3 h-3 text-indigo-500" /> 风格预设 (Style Preset)
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {STYLE_PRESETS.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setSelectedPreset(p.id)}
                                                    className={`py-2.5 px-2 rounded-xl border text-[11px] font-semibold transition-all text-center ${selectedPreset === p.id
                                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-500/10'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <span className="text-base block mb-0.5">{p.icon}</span>
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Prompt */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <Zap className="w-3 h-3 text-indigo-500" /> 创意描述
                                        </label>
                                        <textarea
                                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none placeholder-slate-400 transition-all shadow-inner"
                                            placeholder={selectedPreset === 'custom' ? '完全自由描述...' : '描述画面主题，风格已预设 ✨'}
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                        />
                                    </div>

                                    {/* 参考图上传 */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <ImagePlus className="w-3 h-3 text-purple-500" /> 参考图 (可选)
                                        </label>
                                        <UploadZone target="reference" image={referenceImage} onClear={() => setReferenceImage(null)} />
                                    </div>

                                    {/* 比例 */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">画面比例</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['1:1', '16:9', '9:16'].map(ratio => (
                                                <button
                                                    key={ratio}
                                                    onClick={() => setAspectRatio(ratio)}
                                                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${aspectRatio === ratio
                                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-500/10'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {ratio}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* =================== 产品精修模式 =================== */}
                            {workMode === 'refine' && (
                                <>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-xs text-blue-700 font-medium">📸 上传产品界面截图，AI 将为其添加专业级的 3D 效果、光影和场景，生成可直接用于官网的 Hero Image。</p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <Upload className="w-3 h-3 text-blue-500" /> 上传产品截图
                                        </label>
                                        <UploadZone target="refine" image={refineImage} onClear={() => setRefineImage(null)} />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">精修风格</label>
                                        <div className="space-y-2">
                                            {REFINE_STYLES.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setRefineStyle(s.id)}
                                                    className={`w-full text-left p-3 rounded-xl border transition-all ${refineStyle === s.id
                                                        ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10'
                                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="text-sm font-semibold text-slate-700">{s.name}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">输出比例</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['16:9', '1:1', '9:16'].map(ratio => (
                                                <button key={ratio} onClick={() => setAspectRatio(ratio)}
                                                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${aspectRatio === ratio ? 'bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-500/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >{ratio}</button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* =================== 元素工坊模式 =================== */}
                            {workMode === 'elements' && (
                                <>
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                                        <p className="text-xs text-emerald-700 font-medium">🎨 生成独立的设计元素（图标/插画/3D），白底输出，适合 PPT、网页素材使用。系统会自动生成多个变体供挑选。</p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">元素类型</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ELEMENT_TYPES.map(t => (
                                                <button key={t.id} onClick={() => setElementType(t.id)}
                                                    className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all ${elementType === t.id ? 'bg-emerald-50 border-emerald-200 text-emerald-600 ring-2 ring-emerald-500/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >{t.name}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <Layers className="w-3 h-3 text-emerald-500" /> 元素描述
                                        </label>
                                        <input
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none placeholder-slate-400"
                                            placeholder="例如：文件安全、云存储、协作办公..."
                                            value={elementPrompt}
                                            onChange={(e) => setElementPrompt(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* =================== 海报合成模式 =================== */}
                            {workMode === 'poster' && (
                                <>
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
                                        <p className="text-xs text-orange-700 font-medium">🖼️ AI 生成留白底图 → 自动叠加品牌文字排版。输出的是一张成品海报！</p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">海报场景</label>
                                        <div className="space-y-2">
                                            {POSTER_SCENES.map(s => (
                                                <button key={s.id} onClick={() => setPosterScene(s.id)}
                                                    className={`w-full text-left p-3 rounded-xl border transition-all ${posterScene === s.id ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-500/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    <div className="text-sm font-semibold text-slate-700">{s.name}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <Type className="w-3 h-3 text-orange-500" /> 海报文案
                                        </label>
                                        <textarea
                                            className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none placeholder-slate-400"
                                            placeholder="输入海报标题文案（支持换行）..."
                                            value={posterText}
                                            onChange={(e) => setPosterText(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">文字位置</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {TEXT_POSITIONS.map(p => (
                                                <button key={p.id} onClick={() => setTextPosition(p.id)}
                                                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${textPosition === p.id ? 'bg-orange-50 border-orange-200 text-orange-600 ring-2 ring-orange-500/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >{p.name}</button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* =================== 品牌卫士 (所有模式通用) =================== */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-violet-600" />
                                <span className="text-xs font-bold text-violet-800 uppercase tracking-wider">Brand Guard 品牌卫士</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-medium text-slate-700">锁定品牌色 (Filez Palette)</div>
                                <div className="flex gap-1.5 mt-1.5">
                                    {Object.entries(BRAND_PALETTE).slice(0, 4).map(([name, color]) => (
                                        <div key={name} className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: color }} title={`${name}: ${color}`} />
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setBrandLock(!brandLock)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${brandLock ? 'bg-violet-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${brandLock ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-violet-100">
                            <div className="text-xs font-medium text-slate-700">自动 Logo 水印</div>
                            <button onClick={() => setAutoLogo(!autoLogo)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${autoLogo ? 'bg-violet-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoLogo ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* 生成按钮 */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerate}
                        disabled={isGenerating || (workMode === 'creative' && !prompt.trim()) || (workMode === 'refine' && !refineImage) || (workMode === 'elements' && !elementPrompt.trim())}
                        className={`w-full py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl flex items-center justify-center transition-all ${isGenerating
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/20 hover:scale-[1.01]'
                            }`}
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> 作战大屏已启动，请查看右侧终端...</>
                        ) : (
                            <><Sparkles className="w-5 h-5 mr-2" /> 立即生成</>
                        )}
                    </motion.button>

                    {/* 错误提示 */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <div className="h-8" />
                </div>
            </div>

            {/* 右侧预览区域 */}
            <div className="w-full md:w-7/12 bg-slate-50/50 flex flex-col min-h-[500px] md:h-auto relative overflow-y-auto" ref={resultRef}>
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />

                <div className="flex-1 flex items-center justify-center p-8 relative z-10 min-h-full">
                    {generatedImages.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full max-w-3xl"
                        >
                            {/* 单图展示 or 多图网格 */}
                            {generatedImages.length === 1 ? (
                                <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                                    <img src={generatedImages[0]} alt="Generated" className="rounded-xl w-full h-auto object-contain bg-slate-100" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {generatedImages.map((img, i) => (
                                        <div key={i} className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 group relative">
                                            <img src={img} alt={`Variant ${i + 1}`} className="rounded-xl w-full h-auto object-contain bg-slate-100" />
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <a href={img} download={`element-${i + 1}-${Date.now()}.png`}
                                                    className="p-1.5 bg-white/90 rounded-lg shadow-sm border border-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                                                ><Download className="w-3.5 h-3.5" /></a>
                                            </div>
                                            <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                变体 {i + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 操作按钮 */}
                            <div className="mt-6 flex justify-center gap-3 flex-wrap">
                                <button
                                    onClick={() => handleSaveToLibrary(generatedImages[0])}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center font-medium shadow-sm hover:shadow-md text-sm"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    存入素材库
                                </button>
                                <a
                                    href={generatedImages[0]}
                                    download={`banana-art-${Date.now()}.png`}
                                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center font-medium shadow-sm hover:shadow-md text-sm"
                                >
                                    <Download className="w-4 h-4 mr-2" /> 下载原图
                                </a>
                                {generatedImages.length > 1 && (
                                    <button
                                        onClick={async () => { for (const img of generatedImages) await handleSaveToLibrary(img); }}
                                        className="px-5 py-2.5 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-600 hover:bg-indigo-100 transition-all flex items-center font-medium shadow-sm text-sm"
                                    >
                                        <LayoutGrid className="w-4 h-4 mr-2" /> 全部保存
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ) : isGenerating ? (
                        <div className="w-full max-w-2xl px-4">
                            <HackerConsole
                                scriptId={`graphic-${workMode}`}
                                isActive={isGenerating}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                {workMode === 'creative' && <Sparkles className="w-10 h-10 text-slate-300" />}
                                {workMode === 'refine' && <MonitorSmartphone className="w-10 h-10 text-slate-300" />}
                                {workMode === 'elements' && <Layers className="w-10 h-10 text-slate-300" />}
                                {workMode === 'poster' && <Type className="w-10 h-10 text-slate-300" />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 mb-2">
                                {MODE_TABS.find(t => t.id === workMode)?.name}
                            </h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                {MODE_TABS.find(t => t.id === workMode)?.desc}。在左侧配置后点击"立即生成"。
                            </p>
                        </div>
                    )}
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default GraphicDesign;
