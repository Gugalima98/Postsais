import React, { useState, useEffect } from 'react';
import { Save, Key, AlertCircle, LogIn, CheckCircle2, XCircle, FlaskConical } from 'lucide-react';

interface SettingsProps {
  onSave: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  const [clientId, setClientId] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('google_client_id');
    if (stored) setClientId(stored);
    
    const demo = localStorage.getItem('guestpost_demo_mode');
    setIsDemo(demo === 'true');
  }, []);

  const handleSave = () => {
    localStorage.setItem('guestpost_demo_mode', String(isDemo));
    if (clientId.trim()) {
      localStorage.setItem('google_client_id', clientId.trim());
    }
    onSave();
  };

  const handleTestConnection = () => {
    if (isDemo) {
        setStatus('success');
        return;
    }

    if (!clientId.trim()) {
        setStatus('error');
        setErrorMsg('Por favor, insira e salve um Client ID primeiro.');
        return;
    }

    // Ensure it's saved
    localStorage.setItem('google_client_id', clientId.trim());
    setStatus('loading');
    setErrorMsg('');

    try {
        if (!window.google || !window.google.accounts) {
            setStatus('error');
            setErrorMsg('Script do Google não carregado. Recarregue a página.');
            return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId.trim(),
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (response: any) => {
                if (response.error) {
                    console.error(response);
                    setStatus('error');
                    setErrorMsg('Erro na autenticação: ' + (response.error.message || response.error));
                } else {
                    setStatus('success');
                    // We don't need to store the token here, just verifying the flow works
                }
            },
        });
        
        // This triggers the Google Popup
        client.requestAccessToken();

    } catch (e: any) {
        setStatus('error');
        setErrorMsg(e.message || 'Erro desconhecido ao tentar conectar.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Configurações</h2>
        <p className="text-slate-400">Configure a integração com o Google Drive.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        
        {/* Demo Mode Toggle */}
        <div className="flex items-start gap-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
             <div className="p-2 bg-indigo-500 rounded-lg">
                <FlaskConical className="w-5 h-5 text-white" />
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-base font-bold text-white">Modo de Demonstração</h3>
                    <button 
                        onClick={() => setIsDemo(!isDemo)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isDemo ? 'bg-indigo-500' : 'bg-slate-700'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDemo ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <p className="text-sm text-slate-300">
                    Ative para testar o fluxo completo usando dados simulados, sem precisar configurar o Google Cloud OAuth agora.
                </p>
             </div>
        </div>

        <div className={`space-y-6 transition-opacity ${isDemo ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            {/* Step 1: Client ID */}
            <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-lg">
                <Key className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">1. Configurar Google OAuth</h3>
                <p className="text-sm text-slate-400 mt-1 mb-4">
                Para salvar arquivos, você precisa de um <strong>Client ID</strong> do Google Cloud.
                <br/>
                <a href="https://console.cloud.google.com/" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">Criar ID no Google Console</a>
                </p>
                
                <label className="block text-xs font-medium text-slate-500 mb-1">CLIENT ID</label>
                <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="ex: 123456789-abcdefg.apps.googleusercontent.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm mb-2"
                />
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3">
                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-200/80">
                        Lembre-se de adicionar a URL deste site nas <strong>"Origens JavaScript autorizadas"</strong> no console do Google.
                    </div>
                </div>
            </div>
            </div>

            <div className="h-px bg-slate-800 w-full"></div>

            {/* Step 2: Connection Test */}
            <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800 rounded-lg">
                    <LogIn className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">2. Conectar Conta</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-4">
                        Teste a conexão para autorizar o aplicativo a criar arquivos no seu Google Drive.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleTestConnection}
                            disabled={!clientId || status === 'loading'}
                            className={`
                                flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                                ${status === 'success' 
                                    ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-default' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}
                            `}
                        >
                            {status === 'loading' && <div className="animate-spin w-4 h-4 border-2 border-current rounded-full border-t-transparent"></div>}
                            {status === 'idle' && 'Testar Conexão com Google'}
                            {status === 'success' && <><CheckCircle2 className="w-4 h-4"/> Conectado com Sucesso</>}
                            {status === 'error' && 'Tentar Novamente'}
                        </button>

                        {status === 'error' && (
                            <div className="text-xs text-red-400 flex items-center gap-2 bg-red-900/10 p-2 rounded border border-red-900/30">
                                <XCircle className="w-4 h-4"/> {errorMsg}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="h-px bg-slate-800 w-full"></div>

        <button
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
            <Save className="w-4 h-4" />
            Salvar e Voltar
        </button>

      </div>
    </div>
  );
};

export default Settings;