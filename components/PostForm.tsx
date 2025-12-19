import React, { useState, useRef, useEffect } from 'react';
import { GuestPostRequest } from '../types';
import { 
  ArrowRight, Sparkles, ChevronLeft, Target, Link as LinkIcon, AtSign, FileSpreadsheet, Send
} from 'lucide-react';

interface PostFormProps {
  onSubmit: (data: GuestPostRequest) => void;
  isLoading: boolean;
  onOpenBatchImport: () => void;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const PostForm: React.FC<PostFormProps> = ({ onSubmit, isLoading, onOpenBatchImport }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Omit<GuestPostRequest, 'id'>>({
    keyword: '',
    hostNiche: '',
    targetLink: '',
    anchorText: '',
    targetNiche: '',
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [formData.keyword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (step === 0 && !formData.keyword) return;
    if (step === 1 && !formData.hostNiche) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFinalSubmit = () => {
    if (!formData.targetLink || !formData.anchorText) return;
    onSubmit({ ...formData, id: generateId() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (step < 2) handleNext();
          else handleFinalSubmit();
      }
  };

  // --- STEPS RENDERING ---

  // STEP 0: KEYWORD (Main Screen)
  if (step === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-500">
            <div className="w-full max-w-2xl text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 pb-2">
                        Sobre o que vamos escrever?
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Digite o tema do seu artigo ou importe uma planilha para gerar em massa.
                    </p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                    <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col">
                        <textarea
                            ref={textareaRef}
                            name="keyword"
                            value={formData.keyword}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Ex: Benefícios da IA no Marketing Digital..."
                            className="w-full bg-transparent text-white placeholder:text-slate-600 text-xl p-6 rounded-xl outline-none resize-none min-h-[80px] max-h-[200px]"
                            rows={1}
                            autoFocus
                        />
                        <div className="flex justify-between items-center px-4 pb-4">
                            <button
                                onClick={onOpenBatchImport}
                                className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Importar Planilha
                            </button>

                            <button
                                onClick={() => handleNext()}
                                disabled={!formData.keyword.trim()}
                                className={`
                                    p-3 rounded-lg transition-all duration-300
                                    ${formData.keyword.trim() 
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30' 
                                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                                `}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Visual Hints */}
                <div className="flex justify-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Otimizada</span>
                    <span className="flex items-center gap-1"><Target className="w-3 h-3"/> Links Naturais</span>
                </div>
            </div>
        </div>
      );
  }

  // STEP 1: HOST NICHE
  if (step === 1) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in slide-in-from-right duration-300">
            <div className="w-full max-w-xl space-y-6">
                <button onClick={handleBack} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Voltar
                </button>

                <div className="space-y-2">
                    <span className="text-indigo-400 text-xs font-bold tracking-wider uppercase">Passo 1 de 2</span>
                    <h2 className="text-3xl font-bold text-white">Qual o contexto?</h2>
                    <p className="text-slate-400">Em que tipo de site este artigo será publicado? Isso ajuda a ajustar o tom de voz.</p>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 flex items-center shadow-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                    <div className="p-3 bg-slate-800 rounded-lg mr-3">
                        <AtSign className="w-5 h-5 text-indigo-400" />
                    </div>
                    <input 
                        name="hostNiche"
                        value={formData.hostNiche}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: Blog de Tecnologia, Portal de Notícias, Site de Moda..."
                        className="bg-transparent w-full text-lg outline-none text-white placeholder:text-slate-600 h-12"
                        autoFocus
                    />
                    <button
                        onClick={() => handleNext()}
                        disabled={!formData.hostNiche.trim()}
                        className={`mx-2 p-2 rounded-lg transition-colors ${formData.hostNiche.trim() ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600'}`}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Tema escolhido:</div>
                    <div className="text-slate-300 font-medium">{formData.keyword}</div>
                </div>
            </div>
        </div>
      );
  }

  // STEP 2: LINK DETAILS (Final)
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in slide-in-from-right duration-300">
        <div className="w-full max-w-xl space-y-6">
            <button onClick={handleBack} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm mb-8 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Voltar
            </button>

            <div className="space-y-2">
                <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">Passo Final</span>
                <h2 className="text-3xl font-bold text-white">Configuração do Link</h2>
                <p className="text-slate-400">Defina para onde o artigo deve apontar e como o link deve aparecer.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 ml-1">Nicho do seu Link</label>
                        <input
                            name="targetNiche"
                            value={formData.targetNiche}
                            onChange={handleChange}
                            placeholder="Ex: Software SaaS"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 ml-1">Texto Âncora (Exato)</label>
                        <input
                            name="anchorText"
                            value={formData.anchorText}
                            onChange={handleChange}
                            placeholder="Ex: melhor ferramenta"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 ml-1">URL de Destino</label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-emerald-500" />
                        <input
                            name="targetLink"
                            value={formData.targetLink}
                            onChange={handleChange}
                            placeholder="https://seu-site.com/artigo"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:border-emerald-500 outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleFinalSubmit}
                disabled={isLoading || !formData.targetLink || !formData.anchorText}
                className={`
                    w-full mt-6 py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-3 text-lg transition-all hover:scale-[1.02]
                    ${isLoading 
                        ? 'bg-slate-800 cursor-wait opacity-70' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'}
                `}
            >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        <span>Escrevendo Artigo...</span>
                    </>
                ) : (
                    <>
                        <span>Gerar Artigo Agora</span>
                        <Send className="w-5 h-5" />
                    </>
                )}
            </button>
        </div>
    </div>
  );
};

export default PostForm;