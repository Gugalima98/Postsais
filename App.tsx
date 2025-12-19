import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import PostForm from './components/PostForm';
import ArticlePreview from './components/ArticlePreview';
import Settings from './components/Settings';
import SheetImportModal from './components/SheetImportModal';
import { generateGuestPostContent } from './services/gemini';
import { uploadToDrive, convertMarkdownToHtml } from './services/drive';
import { extractSheetId, fetchSheetRows, updateSheetCell } from './services/sheets';
import { AppMode, GeneratedArticle, GuestPostRequest } from './types';
import { Trash2, AlertTriangle, CheckCircle2, Cloud, History, PenTool, FileSpreadsheet, FlaskConical } from 'lucide-react';

// Declare global augmentation for window.google
declare global {
    interface Window {
        google: any;
    }
}

// Utility for safe ID generation
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Utility for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple mock for "Drive" download (local fallback)
const downloadAsDoc = (article: GeneratedArticle) => {
  const htmlContent = convertMarkdownToHtml(article.content, article.title);
  const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);
  const fileDownload = document.createElement("a");
  document.body.appendChild(fileDownload);
  fileDownload.href = source;
  fileDownload.download = `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
  fileDownload.click();
  document.body.removeChild(fileDownload);
};

// MOCK DATA FOR DEMO MODE
const DEMO_ROWS = [
    ["Importância do Yoga no Trabalho", "Blog de RH e Carreira", "https://lojasports.com/kits-yoga", "kits de yoga corporativo", "E-commerce Esportivo"],
    ["Estratégias de Marketing Digital 2024", "Portal de Tecnologia", "https://agenciaxyz.com/seo", "consultoria de SEO", "Agência de Marketing"],
    ["Dicas de Alimentação Saudável", "Revista Vida Leve", "https://nutriapp.com", "app de nutrição", "Aplicativo Mobile"]
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SINGLE);
  
  // Initialize articles from localStorage to persist data across refreshes
  const [articles, setArticles] = useState<GeneratedArticle[]>(() => {
    try {
        const saved = localStorage.getItem('guestpost_articles');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load history", e);
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeArticle, setActiveArticle] = useState<GeneratedArticle | null>(null);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Sheets Modal State
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [sheetProgress, setSheetProgress] = useState<{
      current: number; 
      total: number; 
      status: 'idle' | 'processing' | 'done' | 'error';
      logs: string[];
  }>({ current: 0, total: 0, status: 'idle', logs: [] });

  // Initialize Google Identity Services
  useEffect(() => {
    const initializeGoogle = () => {
        if (window.google && window.google.accounts) {
             console.log("Google Identity Services loaded");
        }
    };
    if (window.google) initializeGoogle();
    else window.addEventListener('load', initializeGoogle);

    const checkDemo = localStorage.getItem('guestpost_demo_mode');
    setIsDemoMode(checkDemo === 'true');

    return () => window.removeEventListener('load', initializeGoogle);
  }, [mode]); // Re-check on mode change (settings save)

  // Persist articles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('guestpost_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    if(notification) {
        const timer = setTimeout(() => setNotification(null), 4000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const addLog = (msg: string) => {
      setSheetProgress(prev => ({...prev, logs: [...prev.logs, msg]}));
  };

  const handleSheetProcess = async (urlOrId: string) => {
    // --- DEMO MODE BRANCH ---
    if (isDemoMode) {
        setSheetProgress({ current: 0, total: 0, status: 'processing', logs: ['[MODO DEMO] Iniciando simulação...'] });
        
        try {
            await delay(1000);
            addLog('[MODO DEMO] Conectando à planilha simulada...');
            await delay(1000);
            
            const validRows = DEMO_ROWS;
            setSheetProgress(prev => ({...prev, total: validRows.length, current: 0}));
            addLog(`[MODO DEMO] Encontradas ${validRows.length} linhas para processar.`);

            let processedCount = 0;

            for (const row of validRows) {
                // Mock Request
                const req: GuestPostRequest = {
                    id: generateId(),
                    keyword: row[0],
                    hostNiche: row[1],
                    targetLink: row[2],
                    anchorText: row[3],
                    targetNiche: row[4]
                };

                addLog(`Processando: ${req.keyword}... (IA Gerando)`);
                
                // REAL AI CALL (To prove it works)
                const content = await generateGuestPostContent(req);
                const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^(.+)$/m);
                const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '') : req.keyword;

                addLog(`[MODO DEMO] Salvando no Drive (Simulado)...`);
                await delay(800);

                // Mock Update Sheet
                addLog(`[MODO DEMO] Atualizando planilha...`);
                await delay(500);

                 // Update Local State
                 const newArticle: GeneratedArticle = {
                    id: generateId(),
                    requestId: req.id,
                    title: title,
                    content: content,
                    createdAt: new Date(),
                    status: 'completed',
                    driveUrl: 'https://docs.google.com/demo-doc-link', // Mock link
                    driveId: 'demo-id'
                };
                setArticles(prev => [newArticle, ...prev]);

                addLog(`Sucesso: "${req.keyword}" - Link salvo.`);

                processedCount++;
                setSheetProgress(prev => ({...prev, current: processedCount}));
            }

            addLog('Processamento finalizado!');
            setSheetProgress(prev => ({...prev, status: 'done'}));
            setNotification({ msg: 'Simulação concluída com sucesso!', type: 'success' });

        } catch (err: any) {
             setSheetProgress(prev => ({...prev, status: 'error', logs: [...prev.logs, `Erro: ${err.message}`]}));
        }
        return;
    }
    // --- END DEMO MODE ---

    const sheetId = extractSheetId(urlOrId);
    if (!sheetId) {
        setNotification({ msg: 'ID da planilha inválido.', type: 'error' });
        return;
    }

    const clientId = localStorage.getItem('google_client_id');
    if (!clientId) {
        setIsSheetModalOpen(false);
        setNotification({ msg: 'Configure o Client ID primeiro.', type: 'error' });
        setMode(AppMode.SETTINGS);
        return;
    }

    setSheetProgress({ current: 0, total: 0, status: 'processing', logs: ['Iniciando autenticação Google...'] });

    const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
        callback: async (response: any) => {
            if (response.error) {
                setSheetProgress(prev => ({...prev, status: 'error', logs: [...prev.logs, 'Erro na autenticação.']}));
                return;
            }

            try {
                addLog('Lendo planilha...');
                const rows = await fetchSheetRows(response.access_token, sheetId);
                
                if (rows.length === 0) {
                    addLog('Planilha vazia ou sem dados válidos.');
                    setSheetProgress(prev => ({...prev, status: 'done'}));
                    return;
                }

                // Filter valid rows (basic check)
                const validRows = rows.map((row: any[], index: number) => ({ row, index })).filter(item => item.row.length >= 1);
                
                setSheetProgress(prev => ({...prev, total: validRows.length, current: 0}));
                addLog(`Encontradas ${validRows.length} linhas para processar.`);

                let processedCount = 0;

                for (const item of validRows) {
                    const { row, index } = item;
                    // Format: [Keyword, HostNiche, TargetLink, AnchorText, TargetNiche]
                    // If row has less than 5 cols, skip or handle safely
                    const req: GuestPostRequest = {
                        id: generateId(),
                        keyword: row[0] || 'Sem Título',
                        hostNiche: row[1] || 'Geral',
                        targetLink: row[2] || '#',
                        anchorText: row[3] || 'link',
                        targetNiche: row[4] || 'Geral'
                    };

                    addLog(`Processando: ${req.keyword}...`);

                    try {
                        // 1. Generate Content
                        const content = await generateGuestPostContent(req);
                        
                        const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^(.+)$/m);
                        const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '') : req.keyword;

                        // 2. Upload to Drive
                        const htmlContent = convertMarkdownToHtml(content, title);
                        const driveResult = await uploadToDrive(response.access_token, title, htmlContent);

                        // 3. Update Sheet
                        await updateSheetCell(response.access_token, sheetId, index, driveResult.webViewLink);
                        
                        // 4. Update Local State
                        const newArticle: GeneratedArticle = {
                            id: generateId(),
                            requestId: req.id,
                            title: title,
                            content: content,
                            createdAt: new Date(),
                            status: 'completed',
                            driveUrl: driveResult.webViewLink,
                            driveId: driveResult.id
                        };
                        setArticles(prev => [newArticle, ...prev]);

                        addLog(`Sucesso: "${req.keyword}" - Link salvo na planilha.`);

                    } catch (err: any) {
                        console.error(err);
                        addLog(`Erro em "${req.keyword}": ${err.message}`);
                    }

                    processedCount++;
                    setSheetProgress(prev => ({...prev, current: processedCount}));
                }

                addLog('Processamento finalizado!');
                setSheetProgress(prev => ({...prev, status: 'done'}));
                setNotification({ msg: 'Importação e geração concluída!', type: 'success' });

            } catch (err: any) {
                console.error(err);
                setSheetProgress(prev => ({...prev, status: 'error', logs: [...prev.logs, `Erro fatal: ${err.message}`]}));
            }
        },
    });
    client.requestAccessToken();
  };


  const handleSaveToDrive = (article: GeneratedArticle) => {
    // --- DEMO MODE BRANCH ---
    if (isDemoMode) {
        setIsUploading(true);
        setTimeout(() => {
            const updatedArticles = articles.map(a => 
                a.id === article.id ? { ...a, driveUrl: 'https://docs.google.com/demo', driveId: 'demo' } : a
            );
            setArticles(updatedArticles);
            if (activeArticle?.id === article.id) {
                setActiveArticle({ ...article, driveUrl: 'https://docs.google.com/demo', driveId: 'demo' });
            }
            setIsUploading(false);
            setNotification({ msg: '[DEMO] Salvo com sucesso (Simulado)!', type: 'success' });
        }, 1500);
        return;
    }
    // --- END DEMO MODE ---

    const clientId = localStorage.getItem('google_client_id');
    if (!clientId) {
        setNotification({ msg: 'Configure o Client ID nas Configurações primeiro.', type: 'error' });
        setMode(AppMode.SETTINGS);
        return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (response: any) => {
            if (response.error) {
                console.error(response);
                setNotification({ msg: 'Erro na autenticação Google.', type: 'error' });
                return;
            }
            setIsUploading(true);
            try {
                const htmlContent = convertMarkdownToHtml(article.content, article.title);
                const result = await uploadToDrive(response.access_token, article.title, htmlContent);
                
                const updatedArticles = articles.map(a => 
                    a.id === article.id ? { ...a, driveUrl: result.webViewLink, driveId: result.id } : a
                );
                setArticles(updatedArticles);
                
                if (activeArticle?.id === article.id) {
                    setActiveArticle({ ...article, driveUrl: result.webViewLink, driveId: result.id });
                }

                setNotification({ msg: 'Salvo no Google Drive com sucesso!', type: 'success' });
            } catch (error: any) {
                console.error(error);
                setNotification({ msg: `Erro no upload: ${error.message}`, type: 'error' });
            } finally {
                setIsUploading(false);
            }
        },
    });
    client.requestAccessToken();
  };


  const handleGenerate = async (req: GuestPostRequest) => {
    setIsLoading(true);
    try {
      const content = await generateGuestPostContent(req);
      
      const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^(.+)$/m);
      const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '') : req.keyword;

      const newArticle: GeneratedArticle = {
        id: generateId(),
        requestId: req.id,
        title: title,
        content: content,
        createdAt: new Date(),
        status: 'completed'
      };

      setArticles(prev => [newArticle, ...prev]);
      setActiveArticle(newArticle); // This triggers the view switch
      setNotification({ msg: 'Artigo gerado com sucesso!', type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ msg: 'Falha ao gerar artigo. Verifique o console.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.SETTINGS:
          return <Settings onSave={() => {
              setNotification({ msg: 'Configurações salvas!', type: 'success' });
              // Refresh demo state in app
              const checkDemo = localStorage.getItem('guestpost_demo_mode');
              setIsDemoMode(checkDemo === 'true');
              setMode(AppMode.SINGLE);
          }} />;

      case AppMode.SINGLE:
        // CONDITIONAL RENDERING: EITHER FORM OR ARTICLE
        if (activeArticle) {
            return (
                <div className="h-full">
                    <ArticlePreview 
                        article={activeArticle} 
                        onDownloadDoc={downloadAsDoc} 
                        onSaveToDrive={handleSaveToDrive}
                        onBack={() => setActiveArticle(null)}
                        isUploading={isUploading}
                    />
                </div>
            );
        }

        // Default: Show Form (Centered)
        return (
          <div className="max-w-3xl mx-auto h-full flex flex-col justify-center py-10 relative">
            <div className="mb-8 text-center">
                <div className="inline-block p-3 rounded-2xl bg-indigo-500/10 mb-4">
                    <PenTool className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Criar Novo Guest Post</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                    Preencha as informações abaixo e nossa IA criará um artigo completo, otimizado e formatado em segundos.
                </p>
                
                {/* NEW: Sheets Import Trigger */}
                <button 
                    onClick={() => {
                        setSheetProgress({ current: 0, total: 0, status: 'idle', logs: [] });
                        setIsSheetModalOpen(true);
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 ${isDemoMode ? 'bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border-purple-600/30' : 'bg-green-600/10 hover:bg-green-600/20 text-green-400 border-green-600/30'} border rounded-lg text-sm font-medium transition-all hover:scale-105`}
                >
                    {isDemoMode ? <FlaskConical className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                    {isDemoMode ? 'Testar Geração em Massa (Demo)' : 'Importar Google Sheet'}
                </button>
            </div>
            
            <PostForm onSubmit={handleGenerate} isLoading={isLoading} />
            
            <div className="mt-8 flex justify-center">
                <button 
                    onClick={() => setMode(AppMode.SETTINGS)}
                    className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-2 transition-colors"
                >
                    <Cloud className="w-4 h-4" />
                    Configurar integração com Google Drive
                </button>
            </div>
            
            {/* Demo Indicator */}
            {isDemoMode && (
                <div className="absolute top-0 right-0 m-4 text-xs font-bold text-indigo-400 bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-2">
                    <FlaskConical className="w-3 h-3"/> MODO DEMO ATIVO
                </div>
            )}
          </div>
        );

      case AppMode.HISTORY:
        return (
          <div className="space-y-6 pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Histórico</h2>
                </div>
                <button 
                    onClick={() => setArticles([])}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                    <Trash2 className="w-4 h-4" /> Limpar Tudo
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => (
                    <div key={article.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/30 transition-all group flex flex-col justify-between h-[250px]">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-lg text-slate-200 line-clamp-2">{article.title}</h3>
                            </div>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                                {article.content.slice(0, 150)}...
                            </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                             <div className="flex gap-2 w-full">
                                <button 
                                    onClick={() => {
                                        setActiveArticle(article);
                                        setMode(AppMode.SINGLE);
                                    }}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors flex-1"
                                >
                                    Ver
                                </button>
                                {article.driveUrl ? (
                                    <a 
                                        href={article.driveUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-600/20 px-3 py-1.5 rounded-lg transition-colors flex-1 text-center flex items-center justify-center gap-1"
                                    >
                                        <Cloud className="w-3 h-3"/> Drive
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => handleSaveToDrive(article)}
                                        className="text-xs bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 border border-blue-600/20 px-3 py-1.5 rounded-lg transition-colors flex-1 text-center"
                                    >
                                        Salvar
                                    </button>
                                )}
                             </div>
                        </div>
                    </div>
                ))}
                {articles.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-600 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800">
                        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhum artigo gerado ainda.</p>
                    </div>
                )}
            </div>
          </div>
        );
    }
  };

  return (
    <Layout currentMode={mode} setMode={setMode} isFullWidth={mode === AppMode.SINGLE && activeArticle !== null}>
        {/* Toast Notification */}
        {notification && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-in ${
                notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
                {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}
                <span className="font-medium">{notification.msg}</span>
            </div>
        )}
        
        {/* Sheet Import Modal */}
        <SheetImportModal 
            isOpen={isSheetModalOpen}
            onClose={() => setIsSheetModalOpen(false)}
            onStartProcess={handleSheetProcess}
            progress={sheetProgress}
        />

        {renderContent()}
    </Layout>
  );
};

export default App;