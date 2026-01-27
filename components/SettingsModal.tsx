
import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Save, Key, Loader2, ShieldCheck, ExternalLink, Globe, Cpu, Server } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';
import { fetchModels } from '../services/aiService';
import { AiProvider, AiModel } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');

  const [availableModels, setAvailableModels] = useState<AiModel[]>([]);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const settings = getSettings();
    setProvider(settings.provider || 'gemini');
    setApiKey(settings.apiKey || '');
    setModelId(settings.modelId || '');
    setOllamaUrl(settings.ollamaUrl || 'http://localhost:11434');
  }, []);

  const handleSave = () => {
    saveSettings({
        provider,
        apiKey: apiKey.trim(),
        modelId,
        ollamaUrl: ollamaUrl.trim(),
        theme: getSettings().theme
    });
    onClose();
  };

  const handleFetchModels = async () => {
    setIsTestLoading(true);
    setTestStatus('idle');
    setErrorMessage('');
    setAvailableModels([]);

    try {
        const models = await fetchModels(provider, apiKey.trim(), ollamaUrl.trim());
        if (models && models.length > 0) {
            setAvailableModels(models);
            setTestStatus('success');
            // Auto select first model if none selected
            if (!modelId || !models.find(m => m.id === modelId)) {
                setModelId(models[0].id);
            }
        } else {
            setTestStatus('error');
            setErrorMessage("No models found. Check your API key or connection.");
        }
    } catch (error: any) {
        setTestStatus('error');
        setErrorMessage(error.message || "Failed to fetch models.");
    } finally {
        setIsTestLoading(false);
    }
  };

  const providers: { id: AiProvider; name: string; icon: any; color: string }[] = [
    { id: 'gemini', name: 'Google Gemini', icon: Globe, color: 'text-blue-500' },
    { id: 'claude', name: 'Anthropic Claude', icon: ShieldCheck, color: 'text-orange-500' },
    { id: 'mistral', name: 'Mistral AI', icon: Cpu, color: 'text-amber-500' },
    { id: 'grok', name: 'xAI Grok', icon: Key, color: 'text-slate-900 dark:text-white' },
    { id: 'ollama', name: 'Ollama (Local)', icon: Server, color: 'text-zinc-500' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
      <div className="glass-effect border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu size={18} /> Intelligent Service Settings
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Analysis Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {providers.map(p => (
                    <button
                        key={p.id}
                        onClick={() => {
                            setProvider(p.id);
                            setTestStatus('idle');
                            setAvailableModels([]);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${provider === p.id
                            ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                    >
                        <p.icon size={20} className={`mb-2 ${p.color}`} />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{p.name}</span>
                    </button>
                ))}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* API Key / URL Input */}
            {provider === 'ollama' ? (
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Ollama API URL</label>
                    <input
                        type="text"
                        value={ollamaUrl}
                        onChange={(e) => setOllamaUrl(e.target.value)}
                        placeholder="http://localhost:11434"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-lg outline-none text-sm"
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">API Key</label>
                        <a href={provider === 'gemini' ? "https://aistudio.google.com/app/apikey" : "#"} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                            Get Key <ExternalLink size={10} />
                        </a>
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={`Enter ${provider} API Key`}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-lg outline-none text-sm"
                        />
                        <Key size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    </div>
                </div>
            )}

            {/* Model Fetching */}
            <div className="flex gap-2 items-end">
                <div className="flex-grow space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Model Selection</label>
                    <select
                        value={modelId}
                        onChange={(e) => setModelId(e.target.value)}
                        disabled={availableModels.length === 0}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-lg outline-none text-sm disabled:opacity-50"
                    >
                        {availableModels.length === 0 ? (
                            <option value="">No models fetched</option>
                        ) : (
                            availableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)
                        )}
                    </select>
                </div>
                <button
                    onClick={handleFetchModels}
                    disabled={isTestLoading || (provider !== 'ollama' && !apiKey)}
                    className="py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                    {isTestLoading ? <Loader2 size={16} className="animate-spin" /> : "Fetch Models"}
                </button>
            </div>

            {/* Status Messages */}
            {testStatus === 'success' && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
                <Check size={14} /> Connection successful! {availableModels.length} models found.
                </div>
            )}

            {testStatus === 'error' && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap">{errorMessage}</span>
                </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Settings
            </button>
          </div>
          
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">
            Your settings are stored locally. Note: Browser CORS restrictions may apply to some direct API calls.
          </p>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
