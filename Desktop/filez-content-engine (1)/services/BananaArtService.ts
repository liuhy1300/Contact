// BananaArt 设计服务 — gemini-3-pro-image-preview
// 支持：文生图、参考图生图（multimodal）、产品精修、元素工坊、海报底图

const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
const MODEL_NAME = 'gemini-3-pro-image-preview';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

// 回退模型
const FALLBACK_MODEL = 'gemini-2.0-flash';
const FALLBACK_URL = `https://generativelanguage.googleapis.com/v1beta/models/${FALLBACK_MODEL}:generateContent`;

export interface ImageGenerationResult {
    images: string[]; // Base64 字符串数组
    error?: string;
}

// 内部通用请求方法
const callGeminiImageAPI = async (
    parts: any[],
    temperature: number = 1
): Promise<ImageGenerationResult> => {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: { temperature }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error:", errorData);
            throw new Error(errorData.error?.message || "生成失败");
        }

        const data = await response.json();
        const responseParts = data.candidates?.[0]?.content?.parts || [];
        const images: string[] = [];

        for (const part of responseParts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                images.push(part.inlineData.data);
            }
        }

        if (images.length > 0) return { images };

        // 回退到 gemini-2.0-flash
        console.warn("主模型未返回图片，尝试回退到 gemini-2.0-flash...");
        const fallbackResponse = await fetch(`${FALLBACK_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: parts.find(p => p.text)?.text || '' }] }],
                generationConfig: { responseMimeType: "image/jpeg" }
            })
        });

        if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const fallbackParts = fallbackData.candidates?.[0]?.content?.parts || [];
            for (const part of fallbackParts) {
                if (part.inlineData?.mimeType?.startsWith('image/')) {
                    images.push(part.inlineData.data);
                }
            }
            if (images.length > 0) return { images };
        }

        // 检查是否返回了文本而不是图片
        const textPart = responseParts.find((p: any) => p.text);
        if (textPart) {
            return { images: [], error: `模型返回了文本而非图片: ${textPart.text.substring(0, 150)}...` };
        }

        return { images: [], error: "未返回任何图片" };
    } catch (error: any) {
        console.error("BananaArt Service Error:", error);
        return { images: [], error: error.message };
    }
};

export const bananaArtService = {
    /**
     * 基础文生图 (可附加风格预设 prompt)
     */
    async generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<ImageGenerationResult> {
        const enhancedPrompt = `Generate a high-quality image of: ${prompt}. Aspect ratio: ${aspectRatio}.`;
        return callGeminiImageAPI([{ text: enhancedPrompt }]);
    },

    /**
     * 带参考图生成 (Multimodal) — 用户上传参考图 + 文字描述
     */
    async generateWithImage(
        prompt: string,
        imageBase64: string,
        aspectRatio: string = '1:1'
    ): Promise<ImageGenerationResult> {
        // 提取 MIME 类型和纯 Base64 数据
        const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const enhancedPrompt = `Based on the provided reference image, generate a new high-quality image: ${prompt}. Aspect ratio: ${aspectRatio}. Use the reference image as visual inspiration for style, composition, or content.`;

        return callGeminiImageAPI([
            { text: enhancedPrompt },
            { inlineData: { mimeType, data: pureBase64 } }
        ]);
    },

    /**
     * 产品图精修 — 上传截图，应用风格化效果
     */
    async refineProductShot(
        imageBase64: string,
        styleInstruction: string,
        aspectRatio: string = '16:9'
    ): Promise<ImageGenerationResult> {
        const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        return callGeminiImageAPI([
            { text: styleInstruction + ` Aspect ratio: ${aspectRatio}. Maintain the original screen content clearly visible.` },
            { inlineData: { mimeType, data: pureBase64 } }
        ]);
    },

    /**
     * 元素工坊 — 生成独立设计元素（透明底效果通过 prompt 约束）
     */
    async generateElement(
        prompt: string,
        elementTypePrompt: string
    ): Promise<ImageGenerationResult> {
        const fullPrompt = `${elementTypePrompt}: ${prompt}. The element must be on a pure clean white background (#FFFFFF), perfectly centered, with plenty of white space around it. No text, no watermarks. Square composition 1:1.`;
        return callGeminiImageAPI([{ text: fullPrompt }]);
    },

    /**
     * 海报底图 — 生成留白区域的背景图
     */
    async generatePosterBase(
        scenePrompt: string,
        brandColorPrompt: string = ''
    ): Promise<ImageGenerationResult> {
        const fullPrompt = `${scenePrompt} ${brandColorPrompt} Aspect ratio: 9:16 (vertical poster). The image should be a background only, NO text, NO letters, NO words in the image. Leave clear empty space for text overlay.`;
        return callGeminiImageAPI([{ text: fullPrompt }]);
    }
};
