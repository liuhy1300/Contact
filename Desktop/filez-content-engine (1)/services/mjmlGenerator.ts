// MJML 邮件模板生成器
// 支持 3 种风格：Gartner 洞察 / McKinsey 极简 / 现代企业 SaaS

import mjml2html from 'mjml-browser';
import { EmailConfig, TemplateType } from '../types/mailArchitect';

// HTML 实体转义
const escapeHtml = (unsafe: string) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br/>");
};

// 为链接添加 UTM 追踪参数
const addUtmParams = (url: string) => {
    if (!url) return '#';
    try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('utm_source', 'edm');
        urlObj.searchParams.set('utm_medium', 'email');
        return urlObj.toString();
    } catch (e) {
        return url;
    }
};

const COMMON_FONTS = "'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF_FONTS = "'Georgia', 'Times New Roman', serif";

/**
 * Gartner 风格: 权威、深色头部、数据驱动
 */
const generateGartnerStyleMJML = (config: EmailConfig): string => {
    return `
    <mjml>
      <mj-head>
        <mj-title>${escapeHtml(config.hero.headline)}</mj-title>
        <mj-preview>${escapeHtml(config.preheader)}</mj-preview>
        <mj-attributes>
          <mj-all font-family="${COMMON_FONTS}"></mj-all>
          <mj-text font-size="16px" color="#333333" line-height="26px"></mj-text>
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#F2F4F8" width="640px">
        
        <!-- 工具栏 -->
        <mj-section background-color="#F2F4F8" padding="5px 20px">
          <mj-column>
            <mj-text align="right" font-size="11px" color="#888888">
              <a href="#" style="color: #666666; text-decoration: none;">${escapeHtml(config.header.viewInBrowserText)}</a>
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- Gartner 风格头部 -->
        <mj-section background-color="${config.brandColor}" padding="30px 40px">
          <mj-column width="100%">
            ${config.header.logoUrl ? `<mj-image width="140px" align="left" src="${config.header.logoUrl}" href="${config.header.websiteUrl}" padding="0"></mj-image>` : ''}
          </mj-column>
        </mj-section>
        
        <!-- 洞察标签 -->
         <mj-section background-color="#ffffff" padding="40px 40px 0 40px">
          <mj-column>
            <mj-text font-size="12px" font-weight="bold" color="${config.brandColor}" text-transform="uppercase" letter-spacing="1px" padding-bottom="10px">
              关键洞察 (Key Insight)
            </mj-text>
            <mj-text font-size="28px" font-weight="bold" color="#111111" line-height="1.3">
               ${escapeHtml(config.hero.headline)}
            </mj-text>
            <mj-divider border-width="4px" border-color="${config.brandColor}" width="40px" align="left" padding-top="20px" padding-bottom="20px"></mj-divider>
          </mj-column>
        </mj-section>

        <!-- 主内容 -->
        <mj-section background-color="#ffffff" padding="0 40px 40px 40px">
          <mj-column>
            ${config.hero.imageUrl ? `<mj-image src="${config.hero.imageUrl}" alt="Insight Chart" border-radius="4px" padding-bottom="25px"></mj-image>` : ''}
            
            <mj-text font-size="18px" font-weight="bold" color="#444444" padding-bottom="15px">
               ${escapeHtml(config.hero.subheadline)}
            </mj-text>

            <mj-text color="#555555">
              ${escapeHtml(config.body.content)}
            </mj-text>
            
            ${config.cta.enabled ? `
              <mj-button background-color="${config.brandColor}" color="white" href="${addUtmParams(config.cta.url)}" border-radius="0px" font-weight="bold" font-size="14px" padding-top="30px" align="left">
                ${escapeHtml(config.cta.text).toUpperCase()} &nbsp; &#9656;
              </mj-button>
            ` : ''}
            
             <mj-divider border-width="1px" border-color="#eeeeee" padding-top="40px"></mj-divider>
             <mj-text font-style="italic" font-size="14px" color="#777777">
               ${escapeHtml(config.body.signature)}
             </mj-text>
          </mj-column>
        </mj-section>

        <!-- 页脚 -->
        <mj-section background-color="#F2F4F8" padding="30px 40px">
          <mj-column>
             <mj-social font-size="15px" icon-size="20px" mode="horizontal" align="left" padding-bottom="20px">
              ${config.footer.socials.linkedin ? `<mj-social-element name="linkedin" href="${config.footer.socials.linkedin}" background-color="#555555"></mj-social-element>` : ''}
              ${config.footer.socials.twitter ? `<mj-social-element name="twitter" href="${config.footer.socials.twitter}" background-color="#555555"></mj-social-element>` : ''}
              ${config.footer.socials.website ? `<mj-social-element name="web" href="${config.footer.socials.website}" background-color="#555555"></mj-social-element>` : ''}
            </mj-social>
            <mj-text font-size="11px" color="#999999" line-height="18px">
              &copy; ${new Date().getFullYear()} ${escapeHtml(config.footer.companyName)}<br/>
              ${escapeHtml(config.footer.address)}
              <br/><br/>
              <a href="#" style="color: #999999; text-decoration: underline;">${escapeHtml(config.footer.unsubscribeText)}</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
};

/**
 * McKinsey 风格: 极简、衬线标题、留白、战略感
 */
const generateMcKinseyStyleMJML = (config: EmailConfig): string => {
    return `
    <mjml>
      <mj-head>
        <mj-title>${escapeHtml(config.hero.headline)}</mj-title>
        <mj-preview>${escapeHtml(config.preheader)}</mj-preview>
        <mj-attributes>
           <mj-all font-family="${COMMON_FONTS}"></mj-all>
           <mj-text font-size="17px" color="#000000" line-height="28px"></mj-text>
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#FFFFFF" width="600px">
        
        <!-- 居中头部 -->
        <mj-section padding="40px 0 20px 0">
          <mj-column>
             ${config.header.logoUrl ? `<mj-image width="160px" src="${config.header.logoUrl}" href="${config.header.websiteUrl}"></mj-image>` : ''}
          </mj-column>
        </mj-section>

        <mj-section padding="0 20px 0 20px">
           <mj-column>
             <mj-divider border-width="1px" border-color="#000000" padding="0 0 40px 0"></mj-divider>
           </mj-column>
        </mj-section>

        <!-- 排版驱动的 Hero -->
        <mj-section padding="0 40px">
          <mj-column>
            <mj-text font-family="${SERIF_FONTS}" font-size="32px" line-height="1.2" color="#000000" padding-bottom="10px">
              ${escapeHtml(config.hero.headline)}
            </mj-text>
            <mj-text font-size="18px" color="#666666" padding-bottom="30px" font-weight="300">
               ${escapeHtml(config.hero.subheadline)}
            </mj-text>
            
            ${config.hero.imageUrl ? `<mj-image src="${config.hero.imageUrl}" alt="Feature" padding-bottom="30px"></mj-image>` : ''}

            <mj-text padding-bottom="20px">
              ${escapeHtml(config.body.content)}
            </mj-text>

             ${config.cta.enabled ? `
               <mj-text padding-top="10px">
                <a href="${addUtmParams(config.cta.url)}" style="color: ${config.brandColor}; font-weight: bold; font-family: ${SERIF_FONTS}; font-size: 18px; text-decoration: none; border-bottom: 1px solid ${config.brandColor};">
                   ${escapeHtml(config.cta.text)} &rarr;
                </a>
               </mj-text>
            ` : ''}

             <mj-text padding-top="40px" font-size="14px" color="#333333">
               ${escapeHtml(config.body.signature)}
             </mj-text>
          </mj-column>
        </mj-section>

        <!-- 极简页脚 -->
        <mj-section padding="60px 40px">
          <mj-column>
             <mj-divider border-width="1px" border-color="#E0E0E0" padding-bottom="20px"></mj-divider>
             <mj-text font-size="12px" color="#888888" align="center">
                ${escapeHtml(config.footer.companyName)} | ${escapeHtml(config.footer.address)}
             </mj-text>
             <mj-text font-size="12px" color="#888888" align="center">
               <a href="#" style="color:#888888; text-decoration:underline;">${escapeHtml(config.footer.unsubscribeText)}</a>
               &nbsp;&nbsp;
               <a href="#" style="color:#888888; text-decoration:none;">${escapeHtml(config.header.viewInBrowserText)}</a>
             </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
};

/**
 * 现代企业风格: 清爽、SaaS 感、圆角、卡片式布局
 */
const generateModernEnterpriseMJML = (config: EmailConfig): string => {
    return `
    <mjml>
      <mj-head>
         <mj-title>${escapeHtml(config.hero.headline)}</mj-title>
         <mj-preview>${escapeHtml(config.preheader)}</mj-preview>
         <mj-attributes>
           <mj-all font-family="${COMMON_FONTS}"></mj-all>
           <mj-button border-radius="6px" font-weight="600"></mj-button>
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f8fafc" width="600px">
        
        <!-- Preheader 链接 -->
        <mj-section padding="10px 0">
           <mj-column>
             <mj-text align="center" font-size="11px" color="#94a3b8">
                ${escapeHtml(config.preheader)} · <a href="#" style="color: #64748b; text-decoration: underline;">${escapeHtml(config.header.viewInBrowserText)}</a>
             </mj-text>
           </mj-column>
        </mj-section>

        <!-- 卡片容器 -->
        <mj-wrapper background-color="#ffffff" border-radius="8px" padding="0" border="1px solid #e2e8f0">
           
           <!-- 头部 -->
           <mj-section padding="24px 32px">
             <mj-column>
                ${config.header.logoUrl ? `<mj-image width="130px" align="left" src="${config.header.logoUrl}" href="${config.header.websiteUrl}" padding="0"></mj-image>` : ''}
             </mj-column>
           </mj-section>

           <!-- Hero -->
           <mj-section padding="0">
              <mj-column>
                 ${config.hero.imageUrl ? `<mj-image src="${config.hero.imageUrl}" alt="Hero" padding="0"></mj-image>` : ''}
              </mj-column>
           </mj-section>

           <!-- 正文 -->
           <mj-section padding="32px">
             <mj-column>
                <mj-text font-size="24px" font-weight="800" color="#0f172a" line-height="1.3" padding-bottom="12px">
                   ${escapeHtml(config.hero.headline)}
                </mj-text>
                <mj-text font-size="16px" color="#475569" padding-bottom="24px">
                   ${escapeHtml(config.hero.subheadline)}
                </mj-text>
                <mj-divider border-width="1px" border-color="#e2e8f0" padding-bottom="24px"></mj-divider>
                
                <mj-text font-size="16px" color="#334155" line-height="26px">
                   ${escapeHtml(config.body.content)}
                </mj-text>

                ${config.cta.enabled ? `
                <mj-button background-color="${config.brandColor}" color="#ffffff" href="${addUtmParams(config.cta.url)}" width="100%" padding-top="24px" font-size="16px" height="48px">
                  ${escapeHtml(config.cta.text)}
                </mj-button>
                ` : ''}
                
                <mj-text padding-top="24px" font-size="14px" color="#64748b">
                   ${escapeHtml(config.body.signature)}
                </mj-text>
             </mj-column>
           </mj-section>
        </mj-wrapper>

        <!-- 页脚 -->
         <mj-section padding="24px 0 40px 0">
          <mj-column>
            <mj-social font-size="14px" icon-size="24px" mode="horizontal" align="center" padding-bottom="16px">
              ${config.footer.socials.linkedin ? `<mj-social-element src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" href="${config.footer.socials.linkedin}" background-color="transparent" padding="0 10px"></mj-social-element>` : ''}
              ${config.footer.socials.website ? `<mj-social-element src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" href="${config.footer.socials.website}" background-color="transparent" padding="0 10px"></mj-social-element>` : ''}
            </mj-social>

            <mj-text align="center" font-size="12px" color="#94a3b8" line-height="20px">
               ${escapeHtml(config.footer.companyName)}<br/>
               ${escapeHtml(config.footer.address)}<br/>
               <a href="#" style="color: #94a3b8; text-decoration: underline;">${escapeHtml(config.footer.unsubscribeText)}</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
};

/**
 * 主入口: 根据配置生成完整的 HTML 邮件
 */
export const generateHtml = (config: EmailConfig): { html: string; errors: any[] } => {
    let mjmlString = '';

    switch (config.template) {
        case TemplateType.MCKINSEY_MINIMAL:
            mjmlString = generateMcKinseyStyleMJML(config);
            break;
        case TemplateType.GARTNER_INSIGHT:
            mjmlString = generateGartnerStyleMJML(config);
            break;
        case TemplateType.MODERN_ENTERPRISE:
        default:
            mjmlString = generateModernEnterpriseMJML(config);
            break;
    }

    try {
        const response = mjml2html(mjmlString, {
            minify: true,
            validationLevel: 'soft',
        });
        return { html: response.html, errors: response.errors };
    } catch (error) {
        console.error("MJML Compilation Error", error);
        return { html: '<h1>Error generating email</h1><p>Please check console.</p>', errors: [] };
    }
};
