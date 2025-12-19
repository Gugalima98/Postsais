import React from 'react';
import ReactMarkdown from 'react-markdown';
import { GeneratedArticle } from '../types';
import { Download, CheckCircle, ExternalLink, Copy, UploadCloud, FileText, Calendar, ArrowLeft, Plus, Globe } from 'lucide-react';

interface ArticlePreviewProps {
  article: GeneratedArticle;
  onDownloadDoc: (article: GeneratedArticle) => void;
  onSaveToDrive: (article: GeneratedArticle) => void;
  onBack: () => void;
  isUploading: boolean;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article, onDownloadDoc, onSaveToDrive, onBack, isUploading }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(article.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom components for ReactMarkdown to ensure perfect styling
  const MarkdownComponents = {
    h1: ({...props}) => <h1 className="hidden" {...props} />, // We hide the H1 inside content because we show it in the header
    h2: ({...props}) => <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mt-12 mb-6 pb-2 border-b border-slate-800" {...props} />,
    h3: ({...props}) => <h3 className="text-xl font-semibold text-indigo-300 mt-8 mb-4" {...props} />,
    p: ({...props}) => <p className="text-slate-300 text-lg leading-8 mb-6 font-normal" {...props} />,
    ul: ({...props}) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-slate-300 text-lg" {...props} />,
    ol: ({...props}) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-slate-300 text-lg" {...props} />,
    li: ({...props}) => <li className="pl-2 leading-relaxed" {...props} />,
    a: ({...props}) => <a className="text-emerald-400 font-medium underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-400 transition-all hover:text-emerald-300" target="_blank" {...props} />,
    blockquote: ({...props}) => (
        <blockquote className="border-l-4 border-indigo-500 bg-slate-900/50 rounded-r-lg pl-6 py-4 my-8 text-slate-400 italic text-lg leading-relaxed shadow-sm" {...props} />
    ),
    strong: ({...props}) => <strong className="text-white font-bold" {...props} />,
    hr: ({...props}) => <hr className="border-slate-800 my-10" {...props} />,
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      
      {/* 1. Toolbar - Sticky Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
             <button 
                onClick={onBack}
                className="group flex items-center gap-2 pr-4 border-r border-slate-800 text-slate-400 hover:text-white transition-colors"
             >
                <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                <div className="hidden md:block text-left">
                    <span className="block text-xs font-medium text-slate-500 group-hover:text-indigo-300">Voltar</span>
                    <span className="block text-sm font-bold">Novo Post</span>
                </div>
             </button>

             <div className="flex items-center gap-3">
                 <div className="bg-green-500/10 p-2 rounded-lg text-green-400 hidden sm:block border border-green-500/20">
                    <Globe className="w-5 h-5" />
                 </div>
                 <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Preview do Post</span>
                    <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        {article.title.substring(0, 30)}{article.title.length > 30 ? '...' : ''}
                    </span>
                 </div>
             </div>
        </div>

        <div className="flex items-center gap-2">
             {/* Drive Action */}
            {article.driveUrl ? (
                <a
                    href={article.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-colors border border-emerald-500/20"
                    title="Abrir no Google Drive"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Drive</span>
                </a>
            ) : (
                <button
                    onClick={() => onSaveToDrive(article)}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
                >
                    {isUploading ? <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent"></div> : <UploadCloud className="w-4 h-4" />}
                    <span className="hidden sm:inline">Salvar Drive</span>
                </button>
            )}
            
            <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>

            {/* Local Actions */}
            <button
                onClick={() => onDownloadDoc(article)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Baixar .doc"
            >
                <Download className="w-4 h-4" />
            </button>

            <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    copied 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
            >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
        </div>
      </div>
      
      {/* 2. Document Canvas - Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950 relative">
         {/* Paper Container Simulation */}
         <div className="max-w-4xl mx-auto py-12 px-6 md:px-12 min-h-full">
            
            {/* Main Content Area */}
            <div className="bg-transparent">
                
                {/* Document Header (Title & Meta) */}
                <header className="mb-12 pb-8 border-b border-slate-800">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                        Guest Post
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 leading-[1.15] mb-6 tracking-tight">
                        {article.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             SEO Otimizado
                        </div>
                         <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {article.content.split(' ').length} palavras
                        </div>
                    </div>
                </header>

                {/* Markdown Content - Explicitly Styled */}
                <div className="article-content">
                    <ReactMarkdown components={MarkdownComponents}>
                        {article.content}
                    </ReactMarkdown>
                </div>

                {/* End of Doc Marker */}
                <div className="mt-32 mb-12 py-10 border-t border-slate-800/50 flex flex-col items-center justify-center opacity-60 gap-4">
                    <p className="text-sm text-slate-500 italic">Fim do artigo</p>
                    <button onClick={onBack} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-2 mt-2 px-6 py-3 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50">
                        <Plus className="w-4 h-4"/> Criar novo Guest Post
                    </button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ArticlePreview;