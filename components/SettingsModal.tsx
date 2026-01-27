
import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Save, Key, Loader2, ShieldCheck, ExternalLink, Cpu, Database } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';
import { validateApiKey, prefetchEngines } from '../services/geminiService';
import { IntelligenceProvider } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

const PROVIDERS: { id: IntelligenceProvider, name: string, description: string }[] = [
  { id: 'google', name: 'Google Gemini', description: 'Advanced multimodality & large context.' },
  { id: 'anthropic', name: 'Anthropic Claude', description: 'Nuanced reasoning & professional tone.' },
  { id: 'mistral', name: 'Mistral AI', description: 'Efficient open-source intelligence.' },
  { id: 'xai', name: 'xAI Grok', description: 'Real-time updated knowledge base.' },
  { id: 'ollama', name: 'Local Ollama', description: 'Privacy-focused local processing.' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [provider, setProvider] = useState<IntelligenceProvider>('google');
  const [engine, setEngine] = useState('gemini-3-flash-preview');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const settings = getSettings();
    if (settings.preferredProvider) setProvider(settings.preferredProvider);
    if (settings.preferredEngine) setEngine(settings.preferredEngine);
    prefetchEngines();
  }, []);

  const handleSave = () => {
    saveSettings({ 
      preferredProvider: provider,
      preferredEngine: engine 
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTestLoading(true);
    setTestStatus('idle');
    // API Key is managed externally and accessed via process.env.API_KEY inside the service
    const result = await validateApiKey();
    setIsTestLoading(false);
    setTestStatus(result.isValid ? 'success' : 'error');
    if (!result.isValid) setErrorMessage(result.error || "Service unavailable.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up overflow-y-auto">
      <div className="glass-effect border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden my-auto">
        
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu size={18} /> Intelligence Configuration
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Intelligent Service Provider</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {PROVIDERS.map(p => (
                 <div 
                   key={p.id} 
                   onClick={() => setProvider(p.id)}
                   className={`p-3 rounded-xl border cursor-pointer transition-all ${provider === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'}`}
                 >
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                      {p.id !== 'google' && <span className="text-[8px] bg-slate-200 dark:bg-slate-800 px-1 rounded text-slate-500 uppercase tracking-tighter">Coming Soon</span>}
                   </div>
                   <p className="text-[10px] text-slate-500 leading-tight">{p.description}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-blue-500 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase mb-1">Managed Intelligence</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  The system uses a pre-configured secure channel for AI processing. No manual API key entry is required or supported to ensure privacy and compliance.
                </p>
              </div>
            </div>
          </div>

          {testStatus === 'success' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Check size={16} /> Connection Validated
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleTestConnection} disabled={isTestLoading} className="flex-1 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              {isTestLoading ? <Loader2 size={16} className="animate-spin" /> : "Verify Status"}
            </button>
            <button onClick={handleSave} className="flex-1 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold transition-all flex items-center justify-center gap-2">
              <Save size={16} /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
