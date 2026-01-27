import React, { useState, useEffect } from 'react';
import { 
  X, Check, AlertCircle, Save, Key, Loader2, ShieldCheck, 
  Cpu, Database, ChevronRight, Zap, Terminal, Activity,
  Globe, Server, Box, RefreshCw, Sliders, HardDrive, Info
} from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';
import { validateApiKey, fetchAvailableModels, ConnectivityTelemetry } from '../services/geminiService';

interface SettingsModalProps {
  onClose: () => void;
}

type TabType = 'registry' | 'parameters' | 'network' | 'console';

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('registry');
  
  // Model Settings
  const [analysisModel, setAnalysisModel] = useState('gemini-3-flash-preview');
  const [enhancementModel, setEnhancementModel] = useState('gemini-3-pro-preview');
  const [visionModel, setVisionModel] = useState('gemini-2.5-flash-image');
  
  // Param Settings
  const [temperature, setTemperature] = useState(1.0);
  const [maxTokens, setMaxTokens] = useState(4096);
  
  // State
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [telemetry, setTelemetry] = useState<ConnectivityTelemetry | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const settings = getSettings();
    if (settings.analysisModel) setAnalysisModel(settings.analysisModel);
    if (settings.enhancementModel) setEnhancementModel(settings.enhancementModel);
    if (settings.visionModel) setVisionModel(settings.visionModel);
    if (settings.temperature !== undefined) setTemperature(settings.temperature);
    if (settings.maxOutputTokens !== undefined) setMaxTokens(settings.maxOutputTokens);
    
    handleSyncRegistry();
    addLog("Core engine configuration initialised.");
  }, []);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));

  const handleSyncRegistry = async () => {
    setIsSyncing(true);
    addLog("Connecting to discovery service...");
    const models = await fetchAvailableModels();
    setAvailableModels(models);
    setIsSyncing(false);
    addLog(`Registry synchronised. Found ${models.length} active endpoints.`);
  };

  const handlePing = async () => {
    setIsPinging(true);
    addLog(`POST /v1/models/${analysisModel}:generateContent`);
    const result = await validateApiKey(analysisModel);
    setTelemetry(result);
    setIsPinging(false);
    
    if (result.isValid) {
      addLog(`HTTP/1.1 200 OK (${result.latency}ms)`);
      addLog(`Resolved: ${result.modelVersion}`);
    } else {
      addLog(`HTTP/1.1 401 Unauthorized - ${result.error}`);
    }
  };

  const handleSave = () => {
    saveSettings({ 
      analysisModel,
      enhancementModel,
      visionModel,
      temperature,
      maxOutputTokens: maxTokens
    });
    addLog("Runtime configuration committed to local storage.");
    setTimeout(onClose, 400);
  };

  const handleBindKey = async () => {
    if (window.aistudio?.openSelectKey) {
      addLog("Launching platform credential gateway...");
      await window.aistudio.openSelectKey();
      addLog("Handshake complete. Credentials updated.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-[#05070A]/95 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-[#0A0D14] border border-zinc-800 rounded-none md:rounded-[20px] shadow-2xl w-full max-w-5xl h-full md:h-[700px] flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-zinc-950/40 border-r border-zinc-800 p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                <Cpu size={22} />
             </div>
             <div>
                <h2 className="font-bold text-white text-sm">System Console</h2>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[2px]">Admin Access</p>
             </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'registry', label: 'Model Registry', icon: Server },
              { id: 'parameters', label: 'Hyperparameters', icon: Sliders },
              { id: 'network', label: 'Cloud Gateway', icon: Globe },
              { id: 'console', label: 'Terminal Logs', icon: Terminal },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${activeTab === tab.id ? 'bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5' : 'text-zinc-500 border-transparent hover:text-white hover:bg-zinc-900'}`}
              >
                <tab.icon size={15} /> {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
             <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Gateway</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">GenAI SDK 1.30.0</p>
             </div>
             <button onClick={onClose} className="w-full py-3 text-xs font-bold text-zinc-500 hover:text-white border border-zinc-800 rounded-lg transition-colors">
                EXIT CONSOLE
             </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#0A0D14] relative">
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            
            {activeTab === 'registry' && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex justify-between items-end">
                   <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Endpoint Selection</h3>
                      <p className="text-sm text-zinc-500 mt-1">Route specific functional domains to selected LLM backends.</p>
                   </div>
                   <button onClick={handleSyncRegistry} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] font-bold text-zinc-400 hover:text-white transition-all">
                      <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                      Sync Cloud Registry
                   </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[
                    { id: 'analysis', label: 'Inference & Scoring', current: analysisModel, set: setAnalysisModel },
                    { id: 'enhance', label: 'Creative Generation', current: enhancementModel, set: setEnhancementModel },
                    { id: 'vision', label: 'Vision / Multimodal', current: visionModel, set: setVisionModel },
                  ].map((group) => (
                    <div key={group.id} className="p-6 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl group hover:border-zinc-700 transition-colors">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">{group.label}</label>
                       <select 
                        value={group.current}
                        onChange={(e) => group.set(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3.5 text-xs font-bold outline-none focus:border-primary cursor-pointer transition-all"
                       >
                         {availableModels.length > 0 ? (
                           availableModels.map(m => <option key={m} value={m}>{m}</option>)
                         ) : (
                           <option>{group.current}</option>
                         )}
                       </select>
                    </div>
                  ))}
                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
                     <div className="p-3 bg-primary/20 rounded-xl text-primary">
                        <Info size={20} />
                     </div>
                     <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
                        Endpoints are dynamically resolved using the active API session context. Switch projects in the <b>Network</b> tab to update.
                     </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'parameters' && (
              <div className="space-y-8 animate-fade-in-up">
                <div>
                   <h3 className="text-2xl font-bold text-white tracking-tight">Hyperparameter Tuning</h3>
                   <p className="text-sm text-zinc-500 mt-1">Control token variance and sampling temperature for all SDK calls.</p>
                </div>

                <div className="grid gap-10">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <label className="text-xs font-bold text-white uppercase tracking-wider">Temperature</label>
                         <span className="text-xs font-mono text-primary font-bold">{temperature.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" min="0" max="2" step="0.05" value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[9px] text-zinc-600 font-bold uppercase">
                         <span>Deterministic</span>
                         <span>Balanced</span>
                         <span>Creative</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <label className="text-xs font-bold text-white uppercase tracking-wider">Max Output Tokens</label>
                         <span className="text-xs font-mono text-primary font-bold">{maxTokens}</span>
                      </div>
                      <input 
                        type="range" min="256" max="16384" step="256" value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <p className="text-[10px] text-zinc-600 italic">Determines the maximum payload size for individual generation steps.</p>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-8 animate-fade-in-up">
                <div>
                   <h3 className="text-2xl font-bold text-white tracking-tight">Manual Cloud Gateway</h3>
                   <p className="text-sm text-zinc-500 mt-1">Configure project bindings and perform connection health checks.</p>
                </div>

                <div className="bg-zinc-950/40 p-10 rounded-[32px] border border-zinc-800 border-dashed space-y-8">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                         <Globe size={36} />
                      </div>
                      <div className="flex-1">
                         <p className="text-lg font-bold text-white">GenAI Project Authentication</p>
                         <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-sm">
                           Credentials must be selected via the platform's secure vault. This ensures OIDC compliance and billing isolation.
                         </p>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={handleBindKey}
                        className="flex-1 flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all group"
                      >
                         <div className="flex items-center gap-4 text-left">
                            <div className="p-2.5 bg-zinc-800 rounded-xl group-hover:bg-primary/20 transition-colors">
                               <Key size={18} className="text-zinc-500 group-hover:text-primary" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white">Bind New Project Key</p>
                               <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black">Requires Billing Active</p>
                            </div>
                         </div>
                         <ChevronRight size={20} className="text-zinc-800 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        onClick={handlePing}
                        disabled={isPinging}
                        className="flex-none sm:w-48 flex flex-col items-center justify-center p-5 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all text-primary font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
                      >
                         {isPinging ? <Loader2 size={24} className="animate-spin mb-2" /> : <Zap size={24} className="mb-2" />}
                         Test Handshake
                      </button>
                   </div>
                </div>

                {telemetry && (
                  <div className={`p-6 rounded-2xl border flex items-center justify-between animate-fade-in ${telemetry.isValid ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-lg ${telemetry.isValid ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {telemetry.isValid ? <Check size={20} /> : <AlertCircle size={20} />}
                       </div>
                       <div>
                          <p className={`text-sm font-bold ${telemetry.isValid ? 'text-green-500' : 'text-red-500'}`}>
                             {telemetry.isValid ? `Connection Verified: ${telemetry.latency}ms` : 'Connection Refused'}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{telemetry.error || `Successfully reached ${telemetry.modelVersion}`}</p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'console' && (
              <div className="space-y-6 animate-fade-in-up h-full flex flex-col">
                <div className="flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Development Console</h3>
                      <p className="text-sm text-zinc-500 mt-1">Live application logs and API lifecycle events.</p>
                   </div>
                   <button onClick={() => setLogs([])} className="text-[10px] font-bold text-zinc-600 hover:text-white transition-colors flex items-center gap-2">
                      <RefreshCw size={12} /> Clear Logs
                   </button>
                </div>

                <div className="flex-1 bg-black rounded-2xl border border-zinc-800/80 p-8 font-mono text-[11px] overflow-hidden flex flex-col shadow-2xl">
                   <div className="flex items-center gap-3 text-zinc-700 mb-6 pb-4 border-b border-zinc-900">
                      <Terminal size={14} />
                      <span className="uppercase tracking-[3px] font-black">Standard Out / StdErr</span>
                   </div>
                   <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-2">
                      {logs.length === 0 ? (
                        <p className="text-zinc-900 italic">Awaiting backend activity...</p>
                      ) : (
                        logs.map((log, i) => (
                          <p key={i} className="text-zinc-400 break-words leading-relaxed">
                             <span className="text-primary font-black opacity-60 mr-2">$</span> {log}
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
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <p className="text-[11px] text-zinc-500 font-bold tracking-wide">
                    Architecture: <span className="text-white">GenAI 2.5 Stack</span> | <span className="text-white">Active Persistence</span>
                  </p>
              </div>
              <button 
                onClick={handleSave} 
                className="w-full sm:w-auto px-12 py-5 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[3px] rounded-2xl shadow-2xl shadow-primary/25 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Save size={18} /> Apply Changes
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
