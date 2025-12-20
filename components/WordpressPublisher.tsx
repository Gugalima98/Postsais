import React, { useState } from 'react';
import { FileText, Link as LinkIcon, ArrowRight, Globe, Layout, Type, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { extractSheetId } from '../services/sheets'; // Reusing the ID extractor logic as it works for /d/ID/ patterns
import { getGoogleDocContent } from '../services/drive';

const WordpressPublisher: React.FC = () => {
  const [step, setStep] = useState<'input' | 'editor'>('input');
  const [importMode, setImportMode] = useState<'text' | 'gdoc'>('text');
  
  // Data State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [gdocLink, setGdocLink] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Google Doc Import
  const handleImportGDoc = async () => {
    setError('');
    const docId = extractSheetId(gdocLink); // Reusing logic, extracts /d/XXXX/
    
    if (!docId) {
        setError('Link do Google Docs inválido.');
        return;
    }

    const clientId = localStorage.getItem('google_client_id');
    if (!clientId) {
        setError('Client ID não configurado. Vá em Configurações.');
        return;
    }

    setIsLoading(true);

    try {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            // We need drive.readonly to read the doc content
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: async (response: any) => {
                if (response.error) {
                    setError('Erro na autenticação: ' + response.error.message);
                    setIsLoading(false);
                    return;
                }

                try {
                    const text = await getGoogleDocContent(response.access_token, docId);
                    // Try to guess title from first line
                    const lines = text.split('\n');
                    let extractedTitle = "Sem Título";
                    let extractedContent = text;

                    if (lines.length > 0 && lines[0].trim().length > 0) {
                        extractedTitle = lines[0].replace(/^#+\s*/, '').trim();
                        // Remove title from content if it looks like a header
                        extractedContent = lines.slice(1).join('\n').trim();
                    }

                    setTitle(extractedTitle);
                    setContent(extractedContent);
                    setStep('editor');
                } catch (err: any) {
                    setError('Falha ao importar: ' + err.message);
                } finally {
                    setIsLoading(false);
                }
            },
        });
        client.requestAccessToken();

    } catch (e: any) {
        setError(e.message);
        setIsLoading(false);
    }
  };

  const handleManualStart = () => {
    if(!title.trim() && !content.trim()) {
        setError("Preencha pelo menos o título ou conteúdo.");
        return;
    }
    setStep('editor');
  };

  // --- RENDER STEPS ---

  if (step === 'input') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-500">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 rounded-xl mb-4 text-blue-400">
                        <Globe className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Publicador WordPress</h1>
                    <p className="text-slate-400">Importe seu conteúdo ou escreva do zero para preparar sua publicação.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-800">
                        <button 
                            onClick={() => setImportMode('text')}
                            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${importMode === 'text' ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Colar Texto
                        </button>
                        <button 
                            onClick={() => setImportMode('gdoc')}
                            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${importMode === 'gdoc' ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <LinkIcon className="w-4 h-4" />
                            Google Docs
                        </button>
                    </div>

                    <div className="p-8">
                        {importMode === 'text' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Título do Artigo</label>
                                    <input 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                                        placeholder="Ex: Como otimizar seu SEO..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Conteúdo (Markdown ou Texto)</label>
                                    <textarea 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 outline-none focus:border-blue-500 resize-none"
                                        placeholder="Cole seu artigo aqui..."
                                    />
                                </div>
                                {error && <p className="text-red-400 text-sm">{error}</p>}
                                <button 
                                    onClick={handleManualStart}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
                                >
                                    Abrir Editor <ArrowRight className="w-4 h-4"/>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-300">Link do Google Docs</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3.5 text-slate-500">
                                            <LinkIcon className="w-5 h-5" />
                                        </div>
                                        <input 
                                            value={gdocLink}
                                            onChange={(e) => setGdocLink(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
                                            placeholder="https://docs.google.com/document/d/..."
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">O sistema irá importar o texto do documento automaticamente.</p>
                                </div>

                                {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</p>}

                                <button 
                                    onClick={handleImportGDoc}
                                    disabled={isLoading || !gdocLink}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ArrowRight className="w-5 h-5"/>}
                                    {isLoading ? 'Importando...' : 'Importar e Editar'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // EDITOR VIEW
  return (
    <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button onClick={() => setStep('input')} className="text-slate-500 hover:text-white text-sm font-medium">Voltar</button>
                <div className="h-6 w-px bg-slate-800"></div>
                <h2 className="text-white font-bold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" /> 
                    Editor de Postagem
                </h2>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                    Salvar Rascunho
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20">
                    <CheckCircle className="w-4 h-4" /> Publicar no WP
                </button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Main Content Editor */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-950">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Title Input */}
                    <div>
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-4xl font-extrabold text-white placeholder:text-slate-700 outline-none border-b border-transparent focus:border-slate-800 pb-2 transition-colors"
                            placeholder="Título do Post"
                        />
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[500px] relative group">
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full min-h-[600px] bg-transparent text-lg text-slate-300 placeholder:text-slate-700 outline-none resize-none leading-relaxed font-sans"
                            placeholder="Comece a escrever ou edite seu conteúdo importado..."
                        />
                    </div>
                </div>
            </div>

            {/* Right Sidebar - WP Config (Placeholder for now) */}
            <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto hidden lg:block">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Configurações de Publicação</h3>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Layout className="w-4 h-4 text-slate-500" /> Categoria
                        </label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-300 outline-none">
                            <option>Sem Categoria</option>
                            <option>Tecnologia</option>
                            <option>Marketing</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Type className="w-4 h-4 text-slate-500" /> Slug (URL)
                        </label>
                        <input 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-300 outline-none" 
                            placeholder="url-amigavel" 
                            defaultValue={title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <ImageIcon className="w-4 h-4 text-slate-500" /> Imagem Destacada
                        </label>
                        <div className="h-32 bg-slate-950 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-600 gap-2 hover:bg-slate-950/50 hover:border-slate-700 transition-colors cursor-pointer">
                            <ImageIcon className="w-6 h-6 opacity-50" />
                            <span className="text-xs">Clique para upload</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50">
                            <p className="text-xs text-blue-300 mb-2">Conectado a:</p>
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                meu-blog-wordpress.com
                            </p>
                        </div>
                        <button className="w-full mt-4 text-xs text-slate-500 hover:text-white underline">Alterar conexão</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default WordpressPublisher;