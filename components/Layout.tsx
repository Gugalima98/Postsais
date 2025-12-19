import React from 'react';
import { AppMode } from '../types';
import { PenTool, History, Settings, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  isFullWidth?: boolean; // New prop to control layout constraints
}

const Layout: React.FC<LayoutProps> = ({ children, currentMode, setMode, isFullWidth = false }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar - Always visible on desktop */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex z-30">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            GuestPost AI
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setMode(AppMode.SINGLE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMode === AppMode.SINGLE
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-5 h-5" />
            <span className="font-medium">Criar Post</span>
          </button>

          <button
            onClick={() => setMode(AppMode.HISTORY)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentMode === AppMode.HISTORY
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="font-medium">Histórico</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setMode(AppMode.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                currentMode === AppMode.SETTINGS
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 relative flex flex-col ${isFullWidth ? 'overflow-hidden p-0' : 'overflow-auto'}`}>
         {/* Mobile Header - Hide in full width mode to give max space to document */}
         {!isFullWidth && (
           <div className="md:hidden p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
             <span className="font-bold text-lg">GuestPost AI</span>
             <div className="flex gap-2">
               <button onClick={() => setMode(AppMode.SINGLE)} className="p-2 bg-slate-800 rounded"><PenTool size={18}/></button>
               <button onClick={() => setMode(AppMode.SETTINGS)} className="p-2 bg-slate-800 rounded"><Settings size={18}/></button>
             </div>
           </div>
         )}
         
         {/* If Full Width, render directly without container constraints */}
         {isFullWidth ? (
            <div className="w-full h-full flex flex-col">
                {children}
            </div>
         ) : (
            <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-1">
                {children}
            </div>
         )}
      </main>
    </div>
  );
};

export default Layout;