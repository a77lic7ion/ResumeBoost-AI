
import React, { useState, useEffect } from 'react';
// Added Zap to the lucide-react imports
import { X, Check, AlertCircle, Save, Key, Loader2, ShieldCheck, ExternalLink, Cpu, Database, ChevronRight, Zap } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';
import { validateApiKey } from '../services/geminiService';
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

const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Fast, efficient, high-performance.' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Deep reasoning, complex logic.' },
  { id: 'gemini-2.5-flash-lite-latest', name: 'Gemini 2.5 Lite', desc: 'Ultra-low latency for simple tasks.' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [provider, setProvider] = useState<IntelligenceProvider>('google');
  const [analysisModel, setAnalysisModel] = useState('gemini-3-flash-preview');
  const [enhancementModel, setEnhancementModel] = useState('gemini-3-pro-preview');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const settings = getSettings();
    if (settings.preferredProvider) setProvider(settings.preferredProvider);
    if (settings.analysisModel) setAnalysisModel(settings.analysisModel);
    if (settings.enhancementModel) setEnhancementModel(settings.enhancementModel);
  }, []);

  const handleSave = () => {
    saveSettings({ 
      preferredProvider: provider,
      analysisModel: analysisModel,
      enhancementModel: enhancementModel
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTestLoading(true);
    setTestStatus('idle');
    const result = await validateApiKey();
    setIsTestLoading(false);
    setTestStatus(result.isValid ? 'success' : 'error');
    if (!result.isValid) setErrorMessage(result.error || "Service unavailable.");
  };

  const handleOpenSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setTestStatus('idle'); // Reset test status as key might have changed
    } else {
      alert("Platform key selection is not available in this environment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070A]/80 backdrop-blur-sm animate-fade-in-up overflow-y-auto">
      <div className="glass-effect border border-zinc-800 bg-[#0A0D14] rounded-[32px] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden my-auto">
        
        <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu size={20} className="text-primary" /> Service Configuration
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Backend Optimization & Credentials</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Key Management Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Access Credentials</h3>
            <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Key size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Platform-Managed Key</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                    Your API key is managed by the secure hosting environment. You can switch projects or update billing through the native platform selector.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleOpenSelectKey}
                className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                   <Database size={18} className="text-zinc-500" />
                   <span className="text-sm font-bold text-white">Manage Project Credentials</span>
                </div>
                <ChevronRight size={18} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-2 px-1">
                 <ShieldCheck size={12} className="text-green-500" />
                 <span className="text-[10px] text-zinc-500 font-medium">Encrypted & Secure. View <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-primary hover:underline">Billing Docs</a>.</span>
              </div>
            </div>
          </div>

          {/* Model Selection Section */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Engine Selection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Analysis Engine</label>
                  <select 
                    value={analysisModel}
                    onChange={(e) => setAnalysisModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-4 text-xs font-bold outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  >
                    {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <p className="text-[10px] text-zinc-600 px-1">Used for CV scoring and skills extraction.</p>
               </div>
               
               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Enhancement Engine</label>
                  <select 
                    value={enhancementModel}
                    onChange={(e) => setEnhancementModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-4 text-xs font-bold outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  >
                    {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <p className="text-[10px] text-zinc-600 px-1">Used for rewriting and letter drafting.</p>
               </div>
            </div>
          </div>

          {/* Test & Save */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            {testStatus === 'success' && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-sm text-green-400 font-bold animate-fade-in">
                <Check size={18} /> Service Ready: Connection established successfully.
              </div>
            )}

            {testStatus === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-sm text-red-400 font-bold animate-fade-in">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p>Service Unavailable</p>
                  <p className="text-xs font-medium text-red-400/70 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleTestConnection} 
                disabled={isTestLoading} 
                className="flex-1 py-4 px-6 rounded-xl border border-zinc-800 text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTestLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="text-primary" />}
                Verify Service Status
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-4 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[2px] shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} /> Save & Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
