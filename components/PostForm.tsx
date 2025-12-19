import React, { useState } from 'react';
import { GuestPostRequest } from '../types';
import { 
  Sparkles, ArrowRight, Link as LinkIcon, Globe, 
  Type, Target, MousePointer2, AtSign 
} from 'lucide-react';

interface PostFormProps {
  onSubmit: (data: GuestPostRequest) => void;
  isLoading: boolean;
}

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

const PostForm: React.FC<PostFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Omit<GuestPostRequest, 'id'>>({
    keyword: '',
    hostNiche: '',
    targetLink: '',
    anchorText: '',
    targetNiche: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: generateId() });
  };

  // Shared input class styles
  const inputClasses = "w-full bg-slate-950 border border-slate-700/50 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:ring-1 focus:border-indigo-500 placeholder:text-slate-600 transition-all text-sm";
  const labelClasses = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-4">
      
      {/* SEÇÃO 1: O ASSUNTO (Purple) */}
      <div className="relative pl-6 border-l-2 border-purple-500/30 hover:border-purple-500 transition-colors">
        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-purple-500"></div>
        
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-purple-400">01.</span> O Assunto
        </h3>
        
        <div>
            <label className={labelClasses}>Palavra-chave Principal</label>
            <div className="relative">
                <Sparkles className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                <input
                    required
                    name="keyword"
                    value={formData.keyword}
                    onChange={handleChange}
                    placeholder="Ex: Benefícios da IA no Marketing"
                    className={`${inputClasses} focus:ring-purple-500 text-base py-3`}
                />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
                Este será o tema central do artigo. O título será gerado com base nisso.
            </p>
        </div>
      </div>

      {/* SEÇÃO 2: O CONTEXTO (Blue) */}
      <div className="relative pl-6 border-l-2 border-blue-500/30 hover:border-blue-500 transition-colors">
        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500"></div>
        
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-blue-400">02.</span> Onde será publicado?
        </h3>
        
        <div>
            <label className={labelClasses}>Nicho do Site Host (Contexto)</label>
            <div className="relative">
                <AtSign className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                <input
                    required
                    name="hostNiche"
                    value={formData.hostNiche}
                    onChange={handleChange}
                    placeholder="Ex: Tecnologia e Inovação, Blog de Culinária, Portal de Notícias..."
                    className={`${inputClasses} focus:ring-blue-500`}
                />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
                A IA usará isso para adaptar o tom de voz e a audiência do artigo.
            </p>
        </div>
      </div>

      {/* SEÇÃO 3: O OBJETIVO (Emerald/Green) */}
      <div className="relative pl-6 border-l-2 border-emerald-500/30 hover:border-emerald-500 transition-colors">
        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500"></div>
        
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-emerald-400">03.</span> O Backlink (Objetivo)
        </h3>
        
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                     <label className={labelClasses}>Nicho do seu Link</label>
                     <div className="relative">
                        <Target className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
                        <input
                            required
                            name="targetNiche"
                            value={formData.targetNiche}
                            onChange={handleChange}
                            placeholder="Ex: Software SaaS"
                            className={`${inputClasses} focus:ring-emerald-500`}
                        />
                     </div>
                </div>
                <div>
                    <label className={labelClasses}>Texto Âncora (Exato)</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
                        <input
                            required
                            name="anchorText"
                            value={formData.anchorText}
                            onChange={handleChange}
                            placeholder="Ex: ferramenta de automação"
                            className={`${inputClasses} focus:ring-emerald-500`}
                        />
                    </div>
                </div>
            </div>
            
            <div>
                <label className={labelClasses}>URL de Destino</label>
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
                    <input
                        required
                        name="targetLink"
                        value={formData.targetLink}
                        onChange={handleChange}
                        placeholder="https://seu-site.com/pagina-alvo"
                        className={`${inputClasses} focus:ring-emerald-500 text-emerald-300`}
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="pt-6">
        <button
            type="submit"
            disabled={isLoading}
            className={`
                w-full group relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all
                ${isLoading 
                    ? 'bg-slate-800 cursor-wait opacity-70' 
                    : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20 hover:-translate-y-0.5'
                }
            `}
        >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-white"></div>
                    <span className="text-slate-300">Escrevendo Artigo...</span>
                </>
            ) : (
                <>
                    <span>Gerar Guest Post</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
            )}
        </button>
      </div>
    </form>
  );
};

export default PostForm;