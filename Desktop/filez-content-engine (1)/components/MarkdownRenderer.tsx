import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
                code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    const [isCopied, setIsCopied] = useState(false);
                    const codeString = String(children).replace(/\n$/, '');

                    const handleCopy = () => {
                        navigator.clipboard.writeText(codeString).then(() => {
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                        });
                    };

                    if (!match) {
                        return (
                            <code {...rest} className={`${className} bg-gray-100 text-pink-600 rounded px-1 py-0.5 text-sm font-mono`}>
                                {children}
                            </code>
                        );
                    }

                    return (
                        <div className="rounded-lg overflow-hidden my-4 border border-gray-700 shadow-lg">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-gray-700">
                                <span className="text-xs text-gray-400 font-mono lowercase">
                                    {match[1]}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Copy code</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <SyntaxHighlighter
                                {...rest as any}
                                PreTag="div"
                                children={codeString}
                                language={match[1]}
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    padding: '1.5rem',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6',
                                    background: '#1e1e1e', // Match VS Code Dark
                                }}
                            />
                        </div>
                    );
                },
                table({ children }) {
                    return (
                        <div className="overflow-x-auto my-6 border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                {children}
                            </table>
                        </div>
                    );
                },
                thead({ children }) {
                    return <thead className="bg-gray-50">{children}</thead>;
                },
                th({ children }) {
                    return (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {children}
                        </th>
                    );
                },
                td({ children }) {
                    return <td className="px-6 py-4 whitespace-nowrap text-gray-700">{children}</td>;
                },
                p({ children }) {
                    return <p className="mb-4 leading-relaxed text-gray-700">{children}</p>;
                },
                ul({ children }) {
                    return <ul className="list-disc list-outside ml-6 mb-4 space-y-1 text-gray-700">{children}</ul>;
                },
                ol({ children }) {
                    return <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 text-gray-700">{children}</ol>;
                },
                li({ children }) {
                    return <li className="pl-1">{children}</li>;
                },
                h1({ children }) {
                    return <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">{children}</h1>;
                },
                h2({ children }) {
                    return <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">{children}</h2>;
                },
                h3({ children }) {
                    return <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">{children}</h3>;
                },
                blockquote({ children }) {
                    return (
                        <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 bg-blue-50 text-gray-700 italic rounded-r">
                            {children}
                        </blockquote>
                    );
                },
                a({ href, children }) {
                    return (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-800 transition-colors">
                            {children}
                        </a>
                    );
                },
                hr() {
                    return <hr className="my-8 border-gray-200" />;
                }
            }}
        />
    );
};

export default MarkdownRenderer;
