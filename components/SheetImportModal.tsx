import React, { useState } from 'react';
import { X, FileSpreadsheet, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProcess: (sheetId: string) => void;
  progress: {
    current: number;
    total: number;
    status: 'idle' | 'processing' | 'done' | 'error';
    logs: string[];
  };
}

const SheetImportModal: React.FC<SheetImportModalProps> = ({ isOpen, onClose, onStartProcess, progress }) => {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-green-600/20 p-2 rounded-lg text-green-500">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Importar Google Sheets</h2>
              <p className="text-xs text-slate-400">Automatize a criação e atualização de links</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={progress.status === 'processing'}
            className="text-slate-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Instructions */}
          {progress.status === 'idle' && (
             <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-sm">
                <p className="font-semibold text-slate-300 mb-2">Instruções de Formatação:</p>
                <p className="text-slate-400 mb-2">Sua planilha deve ter as seguintes colunas (na ordem):</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['A: Palavra-chave', 'B: Nicho Host', 'C: Link Alvo', 'D: Texto Âncora', 'E: Nicho Alvo'].map(col => (
                        <span key={col} className="px-3 py-1 bg-slate-800 rounded text-slate-300 whitespace-nowrap text-xs border border-slate-700">{col}</span>
                    ))}
                </div>
                <p className="text-slate-400 mt-2 text-xs">
                    * A coluna <strong>F</strong> será preenchida automaticamente com o link do documento gerado.
                </p>
             </div>
          )}

          {/* Input Area */}
          {progress.status === 'idle' && (
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Link da Planilha ou ID</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button 
                        onClick={() => onStartProcess(url)}
                        disabled={!url}
                        className="bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Iniciar
                    </button>
                </div>
            </div>
          )}

          {/* Progress Area */}
          {progress.status !== 'idle' && (
            <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-slate-300">Progresso</span>
                    <span className="text-indigo-400">{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                    ></div>
                </div>

                {/* Logs Console */}
                <div className="bg-black/50 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs space-y-2 border border-slate-800">
                    {progress.logs.map((log, i) => (
                        <div key={i} className={`flex items-start gap-2 ${log.includes('Erro') ? 'text-red-400' : log.includes('Sucesso') ? 'text-green-400' : 'text-slate-400'}`}>
                            {log.includes('Processando') && <Loader2 className="w-3 h-3 animate-spin mt-0.5" />}
                            {log.includes('Sucesso') && <CheckCircle2 className="w-3 h-3 mt-0.5" />}
                            {log.includes('Erro') && <AlertCircle className="w-3 h-3 mt-0.5" />}
                            <span>{log}</span>
                        </div>
                    ))}
                    {progress.logs.length === 0 && <span className="text-slate-600">Aguardando início...</span>}
                </div>

                {progress.status === 'done' && (
                     <div className="flex justify-center pt-4">
                        <button onClick={onClose} className="text-white bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg text-sm font-medium">
                            Fechar
                        </button>
                     </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SheetImportModal;