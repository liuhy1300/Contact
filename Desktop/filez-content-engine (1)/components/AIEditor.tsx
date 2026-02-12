
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Sparkles, Wand2, RefreshCw, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GeminiService } from '../services/GeminiService';

interface AIEditorProps {
    initialContent?: string;
    onContentChange?: (html: string) => void;
    className?: string;
}

const AIEditor: React.FC<AIEditorProps> = ({
    initialContent = '',
    onContentChange,
    className
}) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: '在此输入内容，或使用选中文字呼出 AI 助手...',
            }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onContentChange?.(editor.getHTML());
        },
    });

    // Watch for external content updates
    useEffect(() => {
        if (editor && initialContent && editor.getHTML() !== initialContent) {
            // Only update if content is significantly different to avoid cursor jumping
            // Just a simple check for empty editor or full replacement scenario
            if (editor.isEmpty && initialContent) {
                editor.commands.setContent(initialContent);
            }
        }
    }, [initialContent, editor]);


    const handleAIAction = async (action: 'rewrite' | 'expand' | 'polish') => {
        if (!editor) return;

        const { from, to, empty } = editor.state.selection;
        if (empty) return;

        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (!selectedText) return;

        setIsProcessing(true);
        try {
            const result = await GeminiService.modifyText(selectedText, action);
            if (result) {
                editor.chain().focus().deleteSelection().insertContent(result).run();
            }
        } catch (error) {
            console.error('AI Action failed:', error);
            // Optional: Show toast or error message
        } finally {
            setIsProcessing(false);
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className={twMerge("bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col", className)}>
            {/* Toolbar - Google Docs style */}
            <div className="flex items-center gap-1 p-1.5 border-b border-gray-200 bg-[#f8f9fa] flex-wrap">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={Bold}
                    title="Bold"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={Italic}
                    title="Italic"
                />
                <div className="w-px h-5 bg-gray-300 mx-1.5" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={List}
                    title="Bullet List"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={ListOrdered}
                    title="Ordered List"
                />
            </div>

            {/* Bubble Menu for AI Actions */}
            {editor && (
                <BubbleMenu editor={editor} className="flex bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden p-1 gap-1">
                    <AIButton
                        onClick={() => handleAIAction('rewrite')}
                        icon={RefreshCw}
                        label="局部重写"
                        disabled={isProcessing}
                    />
                    <AIButton
                        onClick={() => handleAIAction('expand')}
                        icon={Wand2}
                        label="扩写"
                        disabled={isProcessing}
                    />
                    <AIButton
                        onClick={() => handleAIAction('polish')}
                        icon={Sparkles}
                        label="润色"
                        disabled={isProcessing}
                    />
                </BubbleMenu>
            )}

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {isProcessing && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="flex items-center gap-2 text-[#1a73e8] font-medium animate-pulse bg-white px-4 py-2 rounded-full shadow-md border border-blue-100">
                            <Sparkles className="w-5 h-5 animate-spin" />
                            AI 正在思考中...
                        </div>
                    </div>
                )}
                <EditorContent editor={editor} className="h-full" />
            </div>

            {/* Status Bar */}
            <div className="px-4 py-1.5 bg-white border-t border-gray-100 text-xs text-gray-500 flex justify-end">
                <span>{editor.storage.characterCount?.words?.() ?? 0} words</span>
            </div>
        </div>
    );
};

const ToolbarButton = ({ onClick, isActive, icon: Icon, title }: { onClick: () => void, isActive?: boolean, icon: LucideIcon, title: string }) => (
    <button
        onClick={onClick}
        className={clsx(
            "p-1.5 rounded hover:bg-gray-200 transition-colors text-[#5f6368]",
            isActive && "bg-blue-100 text-[#1a73e8]"
        )}
        title={title}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const AIButton = ({ onClick, icon: Icon, label, disabled }: { onClick: () => void, icon: LucideIcon, label: string, disabled?: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#1a73e8] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <Icon className="w-3.5 h-3.5" />
        {label}
    </button>
);

export default AIEditor;
