import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Bold, Italic, List, Link as LinkIcon, Heading2, Heading3 } from 'lucide-react';

interface ContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialContent: string;
  onSave: (newContent: string) => void;
}

const ContentEditorModal: React.FC<ContentEditorModalProps> = ({ isOpen, onClose, title, initialContent, onSave }) => {
  const [content, setContent] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(content);
    onClose();
  };

   // --- EDITOR TOOLBAR LOGIC ---
   const insertFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = before + prefix + selection + suffix + after;
    
    setContent(newText);
    
    // Reset focus and cursor
    setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
        }
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div>
            <h3 className="text-lg font-bold text-white">Editar Conteúdo</h3>
            <p className="text-xs text-slate-400 truncate max-w-md">{title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

         {/* Toolbar */}
         <div className="bg-slate-800/50 p-2 flex items-center gap-1 border-b border-slate-700">
            <button onClick={() => insertFormat('## ')} title="Título 2" className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
                <Heading2 className="w-4 h-4" />
            </button>
            <button onClick={() => insertFormat('### ')} title="Título 3" className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
                <Heading3 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button onClick={() => insertFormat('**', '**')} title="Negrito" className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
                <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => insertFormat('*', '*')} title="Itálico" className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
                <Italic className="w-4 h-4" />
            </button>
             <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button onClick={() => insertFormat('- ')} title="Lista" className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
                <List className="w-4 h-4" />
            </button>
            <button onClick={() => insertFormat('[', '](url)')} title="Link" className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
                <LinkIcon className="w-4 h-4" />
            </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-0 relative">
          <textarea
            ref={textareaRef}
            className="w-full h-full bg-slate-950 p-6 text-slate-300 text-base font-mono leading-relaxed outline-none resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentEditorModal;