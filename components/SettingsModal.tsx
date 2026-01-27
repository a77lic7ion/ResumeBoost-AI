import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, AlertCircle, Save, Key, Loader2, ShieldCheck, 
  Cpu, Database, ChevronRight, Zap, Terminal, Activity,
  Globe, Server, Box, RefreshCw, Layers
} from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';
import { validateApiKey, ConnectivityTelemetry } from '../services/geminiService';
import { IntelligenceProvider, UserSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

type SettingsTab = 'provider' | 'engines' | 'connectivity' | 'debug';

const PROVIDER_DATA: Record<IntelligenceProvider, { name: string, icon: any, models: string[] }> = {
  google: {
    name: 'Google Gemini',
    icon: Globe,
    models: [
      'gemini-3-flash-preview',
      'gemini-3-pro-preview',
      'gemini-2.5-flash-latest',
      'gemini-2.5-flash-lite-latest',
      'gemini-2.5-flash-image',
      'gemini-3-pro-image-preview'
    ]
  },
  anthropic: {
    name: 'Anthropic Claude',
    icon: Layers,
    models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku']
  },
  mistral: {
    name: 'Mistral AI',
    icon: Box,
    models: ['mistral-large-latest', 'mistral-medium', 'open-mixtral-8x22b']
  },
  xai: {
    name: 'xAI Grok',
    icon: Activity,
    models: ['grok-1', 'grok-1.5', 'grok-2-beta']
  },
  ollama: {
    name: 'Local Ollama',
    icon: Server,
    models: ['llama3', 'mistral', 'phi3', 'qwen2']
  }
};

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('provider');
  const [provider, setProvider] = useState<IntelligenceProvider>('google');
  const [analysisModel, setAnalysisModel] = useState('gemini-3-flash-preview');
  const [enhancementModel, setEnhancementModel] = useState('gemini-3-pro-preview');
  const [visionModel, setVisionModel] = useState('gemini-2.5-flash-image');
  
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [telemetry, setTelemetry] = useState<ConnectivityTelemetry | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const settings = getSettings();
    if (settings.preferredProvider) setProvider(settings.preferredProvider);
    if (settings.analysisModel) setAnalysisModel(settings.analysisModel);
    if (settings.enhancementModel) setEnhancementModel(settings.enhancementModel);
    if (settings.visionModel) setVisionModel(settings.visionModel);
    
    addLog("Configuration loaded from persistent storage.");
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleProviderChange = (p: IntelligenceProvider) => {
    setProvider(p);
    const defaultModels = PROVIDER_DATA[p].models;
    setAnalysisModel(defaultModels[0]);
    setEnhancementModel(defaultModels[1] || defaultModels[0]);
    setVisionModel(defaultModels[2] || defaultModels[0]);
    addLog(`Switched provider to ${PROVIDER_DATA[p].name}. Default models applied.`);
  };

  const handleSave = () => {
    saveSettings({ 
      preferredProvider: provider,
      analysisModel,
      enhancementModel,
      visionModel
    });
    addLog("Service configuration synchronized.");
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTestLoading(true);
    addLog(`Initiating handshake with ${analysisModel}...`);
    const result = await validateApiKey(analysisModel);
    setTelemetry(result);
    setIsTestLoading(false);
    
    if (result.isValid) {
      addLog(`SUCCESS: ${result.modelVersion} responded in ${result.latency}ms`);
    } else {
      addLog(`ERROR: Connection failed. ${result.error}`);
    }
  };

  const handleOpenSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      addLog("Invoking platform-native credential selector...");
      await window.aistudio.openSelectKey();
      addLog("Credential selection phase completed.");
    }
  };

  const currentModels = useMemo(() => PROVIDER_DATA[provider].models, [provider]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-[#05070A]/95 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#0A0D14] border border-zinc-800 rounded-none md:rounded-[32px] shadow-2xl w-full max-w-5xl h-full md:h-[700px] flex flex-col md:flex-row overflow-hidden border-zinc-800/50">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-72 bg-zinc-950/40 border-r border-zinc-800 p-8 flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-primary/20 p-2.5 rounded-xl">
              <Cpu size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">System Config</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">v2.4.0 Build</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'provider', label: 'Intelligence Provider', icon: Globe },
              { id: 'engines', label: 'Model Endpoints', icon: Server },
              { id: 'connectivity', label: 'Cloud Handshake', icon: Key },
              { id: 'debug', label: 'Debug & Telemetry', icon: Terminal },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${activeTab === tab.id ? 'bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5' : 'text-zinc-500 border-transparent hover:text-white hover:bg-zinc-900'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
             <div className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800 group transition-colors hover:border-zinc-700">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Service Pipeline</p>
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-40"></div>
                   </div>
                   <span className="text-xs text-white font-bold">Active Connection</span>
                </div>
             </div>
             <button onClick={onClose} className="w-full py-3.5 text-xs font-black text-zinc-500 hover:text-white border border-zinc-800 rounded-xl transition-all hover:bg-zinc-900">
                DISMISS
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0D14]">
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            
            {activeTab === 'provider' && (
              <div className="space-y-8 animate-fade-in-up">
                <div>
                   <h3 className="text-2xl font-bold text-white">Select Provider</h3>
                   <p className="text-sm text-zinc-500 mt-2">Choose the primary intelligence vendor for this session's tasks.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.entries(PROVIDER_DATA) as [IntelligenceProvider, any][]).map(([id, data]) => (
                    <button 
                      key={id}
                      onClick={() => handleProviderChange(id)}
                      className={`p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4 group ${provider === id ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5' : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <div className={`p-3 rounded-xl transition-colors ${provider === id ? 'bg-primary text-white' : 'bg-zinc-900 text-zinc-500 group-hover:text-zinc-300'}`}>
                        <data.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-white text-sm">{data.name}</p>
                          {provider === id && <Check size={16} className="text-primary" />}
                        </div>
                        <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">{data.models.length} Model Variants Available</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-start gap-3">
                  <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-yellow-600/80 font-medium leading-relaxed">
                    Note: Only <b>Google Gemini</b> models are currently executable via the native GenAI SDK. Other providers are available for architectural mapping and future integration support.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'engines' && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex justify-between items-end">
                   <div>
                      <h3 className="text-2xl font-bold text-white">Model Registry</h3>
                      <p className="text-sm text-zinc-500 mt-2">Map specific {PROVIDER_DATA[provider].name} models to functional task groups.</p>
                   </div>
                   <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400">
                     Filtered: {PROVIDER_DATA[provider].name}
                   </div>
                </div>

                <div className="grid gap-6">
                  {[
                    { label: 'Analysis & Scoring', sub: 'Calculates professional ATS compatibility scores.', val: analysisModel, set: setAnalysisModel },
                    { label: 'Professional Drafting', sub: 'Used for letter generation and content refinement.', val: enhancementModel, set: setEnhancementModel },
                    { label: 'Multimodal Vision', sub: 'Processes OCR and image data extraction.', val: visionModel, set: setVisionModel },
                  ].map((field, i) => (
                    <div key={i} className="group bg-zinc-950/50 border border-zinc-800/80 p-6 rounded-2xl transition-all hover:bg-zinc-900/40">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-white uppercase tracking-widest">{field.label}</label>
                        <Activity size={14} className="text-zinc-700" />
                      </div>
                      <select 
                        value={field.val}
                        onChange={(e) => field.set(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-4 text-xs font-bold outline-none focus:border-primary appearance-none cursor-pointer transition-colors"
                      >
                        {currentModels.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <p className="text-[10px] text-zinc-600 mt-3 font-medium flex items-center gap-1.5">
                        <ChevronRight size={10} /> {field.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'connectivity' && (
              <div className="space-y-8 animate-fade-in-up">
                <div>
                   <h3 className="text-2xl font-bold text-white">Cloud Authentication</h3>
                   <p className="text-sm text-zinc-500 mt-2">Synchronize your local environment with global project credentials.</p>
                </div>

                <div className="bg-zinc-950/40 p-10 rounded-[32px] border border-zinc-800 border-dashed space-y-8">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                         <ShieldCheck size={40} />
                      </div>
                      <div>
                         <p className="text-lg font-bold text-white">Platform-Managed Key Injection</p>
                         <p className="text-xs text-zinc-500 leading-relaxed mt-1 max-w-sm">
                           Your credentials are automatically provisioned by the secure execution environment. Tap below to refresh your project binding.
                         </p>
                      </div>
                   </div>

                   <button 
                    onClick={handleOpenSelectKey}
                    className="w-full flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all group shadow-xl shadow-black/20"
                   >
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-primary/20 transition-colors">
                           <Key size={20} className="text-zinc-500 group-hover:text-primary" />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-bold text-white">Trigger Native Key Selector</p>
                           <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Secure OIDC Handshake</p>
                        </div>
                     </div>
                     <ChevronRight size={24} className="text-zinc-700 group-hover:translate-x-1 transition-transform" />
                   </button>
                   
                   <div className="flex items-center gap-3 p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
                      <Terminal size={14} className="text-primary" />
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Runtime context: Production (Injected)</span>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'debug' && (
              <div className="space-y-8 animate-fade-in-up h-full flex flex-col">
                <div className="flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-bold text-white">Service Health</h3>
                      <p className="text-sm text-zinc-500 mt-2">Real-time telemetry from active engine endpoints.</p>
                   </div>
                   <button 
                    onClick={handleTestConnection}
                    disabled={isTestLoading}
                    className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                   >
                     {isTestLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                     Verify Endpoint
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[2px] mb-3">RTT Latency</p>
                        <p className="text-3xl font-black text-white">{telemetry?.latency ? `${telemetry.latency}ms` : '--'}</p>
                    </div>
                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[2px] mb-3">Handshake Status</p>
                        <p className={`text-3xl font-black ${telemetry?.isValid ? 'text-green-500' : 'text-zinc-800'}`}>
                           {telemetry ? (telemetry.isValid ? 'Success' : 'Refused') : 'Idle'}
                        </p>
                    </div>
                </div>

                <div className="flex-1 bg-black/50 rounded-[32px] border border-zinc-800 p-8 font-mono text-[11px] overflow-hidden flex flex-col shadow-inner">
                   <div className="flex items-center gap-3 text-zinc-600 mb-6 pb-4 border-b border-zinc-900/50">
                      <Terminal size={14} />
                      <span className="uppercase tracking-[3px] font-black">Development Logs</span>
                   </div>
                   <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-2">
                      {logs.length === 0 ? (
                        <p className="text-zinc-800 italic">No events recorded in this session.</p>
                      ) : (
                        logs.map((log, i) => (
                          <p key={i} className="text-zinc-500 leading-relaxed">
                             <span className="text-primary/70 font-black mr-2">SH-3.0_</span> {log}
                          </p>
                        ))
                      )}
                   </div>
                </div>
              </div>
            )}

          </div>

          <div className="p-10 border-t border-zinc-800 bg-zinc-950/30 flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  <p className="text-[11px] text-zinc-400 font-bold tracking-wide">
                    Active Pipeline: <span className="text-white">{PROVIDER_DATA[provider].name}</span> | <span className="text-white">{analysisModel}</span>
                  </p>
              </div>
              <button 
                onClick={handleSave} 
                className="w-full sm:w-auto px-12 py-5 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[3px] rounded-2xl shadow-2xl shadow-primary/25 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Save size={18} /> Apply Config
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;