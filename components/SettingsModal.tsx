import React, { useState, useEffect } from 'react';
import { 
  X, Check, AlertCircle, Save, Key, Loader2, ShieldCheck, 
  Cpu, Database, ChevronRight, Zap, Terminal, Activity,
  Globe, Server, Box, RefreshCw
} from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';
import { validateApiKey, fetchAvailableModels, ConnectivityTelemetry } from '../services/geminiService';

interface SettingsModalProps {
  onClose: () => void;
}

type SettingsTab = 'engines' | 'connectivity' | 'debug';

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('engines');
  const [analysisModel, setAnalysisModel] = useState('gemini-3-flash-preview');
  const [enhancementModel, setEnhancementModel] = useState('gemini-3-pro-preview');
  const [visionModel, setVisionModel] = useState('gemini-2.5-flash-image');
  
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [telemetry, setTelemetry] = useState<ConnectivityTelemetry | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const settings = getSettings();
    if (settings.analysisModel) setAnalysisModel(settings.analysisModel);
    if (settings.enhancementModel) setEnhancementModel(settings.enhancementModel);
    if (settings.visionModel) setVisionModel(settings.visionModel);
    
    // Initial prefetch simulation
    handlePrefetch();
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handlePrefetch = async () => {
    setIsPrefetching(true);
    addLog("Requesting model registry prefetch...");
    const models = await fetchAvailableModels();
    setAvailableModels(models);
    setIsPrefetching(false);
    addLog(`Registry updated. ${models.length} endpoints discovered.`);
  };

  const handleSave = () => {
    saveSettings({ 
      analysisModel,
      enhancementModel,
      visionModel
    });
    addLog("Local configuration persisted to storage.");
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTestLoading(true);
    addLog(`Initiating handshake with ${analysisModel}...`);
    const result = await validateApiKey(analysisModel);
    setTelemetry(result);
    setIsTestLoading(false);
    
    if (result.isValid) {
      addLog(`SUCCESS: Response received from ${result.modelVersion} in ${result.latency}ms`);
    } else {
      addLog(`ERROR: Handshake failed. ${result.error}`);
    }
  };

  const handleOpenSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      addLog("External Credential Provider invoked.");
      await window.aistudio.openSelectKey();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-[#05070A]/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0A0D14] border border-zinc-800 rounded-none md:rounded-[24px] shadow-2xl w-full max-w-4xl h-full md:h-[640px] flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-zinc-950/50 border-r border-zinc-800 p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 px-2">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Cpu size={18} className="text-primary" />
            </div>
            <h2 className="font-bold text-white text-sm">Engine Console</h2>
          </div>

          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('engines')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'engines' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <Server size={14} /> Model Endpoints
            </button>
            <button 
              onClick={() => setActiveTab('connectivity')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'connectivity' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <Key size={14} /> Authentication
            </button>
            <button 
              onClick={() => setActiveTab('debug')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'debug' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <Activity size={14} /> Health & Telemetry
            </button>
          </nav>

          <div className="mt-auto space-y-4">
             <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Endpoint Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                   <span className="text-[10px] text-white font-bold">Cloud Service Online</span>
                </div>
             </div>
             <button onClick={onClose} className="w-full py-2.5 text-xs font-bold text-zinc-500 hover:text-white border border-zinc-800 rounded-lg">
                Close
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0D14]">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {activeTab === 'engines' && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="text-xl font-bold text-white">Model Registry</h3>
                      <p className="text-xs text-zinc-500 mt-1">Assign LLM endpoints to specific application tasks.</p>
                   </div>
                   <button 
                    onClick={handlePrefetch}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
                   >
                     <RefreshCw size={12} className={isPrefetching ? 'animate-spin' : ''} />
                     {isPrefetching ? 'Prefetching...' : 'Prefetch Registry'}
                   </button>
                </div>

                <div className="grid gap-6">
                  {[
                    { label: 'Scoring & Analysis Engine', sub: 'Calculates ATS compliance and skill categories.', val: analysisModel, set: setAnalysisModel },
                    { label: 'Professional Drafting Engine', sub: 'Generates cover letters and content rewrites.', val: enhancementModel, set: setEnhancementModel },
                    { label: 'Vision & OCR Engine', sub: 'Processes multimodal uploads (PDF/Images).', val: visionModel, set: setVisionModel },
                  ].map((field, i) => (
                    <div key={i} className="group bg-zinc-950/40 border border-zinc-800/50 p-5 rounded-2xl hover:border-zinc-700 transition-colors">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">{field.label}</label>
                        <Box size={14} className="text-zinc-700" />
                      </div>
                      <select 
                        value={field.val}
                        onChange={(e) => field.set(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3.5 text-xs font-bold outline-none focus:border-primary appearance-none cursor-pointer"
                      >
                        {availableModels.length > 0 ? (
                          availableModels.map(m => <option key={m} value={m}>{m}</option>)
                        ) : (
                          <option>{field.val}</option>
                        )}
                      </select>
                      <p className="text-[10px] text-zinc-600 mt-3 italic">{field.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'connectivity' && (
              <div className="space-y-8 animate-fade-in-up">
                <div>
                   <h3 className="text-xl font-bold text-white">Authentication Protocol</h3>
                   <p className="text-xs text-zinc-500 mt-1">Configure your backend credentials and billing projects.</p>
                </div>

                <div className="bg-zinc-950/50 p-8 rounded-3xl border border-zinc-800 border-dashed space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                         <Globe size={32} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white">Standard API Handshake</p>
                         <p className="text-xs text-zinc-500 mt-1">Manual credential management is handled through the cloud project selector.</p>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-zinc-800">
                      <button 
                        onClick={handleOpenSelectKey}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                           <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-primary/20 transition-colors">
                              <Key size={18} className="text-zinc-500 group-hover:text-primary" />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-bold text-white">Select Cloud Billing Project</p>
                              <p className="text-[10px] text-zinc-500 font-medium">Verify your Project ID and API Key status.</p>
                           </div>
                        </div>
                        <ChevronRight size={20} className="text-zinc-700 group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                   
                   <div className="flex items-center gap-2 p-3 bg-zinc-900/30 rounded-xl">
                      <ShieldCheck size={14} className="text-green-500" />
                      <span className="text-[10px] text-zinc-500 font-medium tracking-wide">Secure injection active. No keys are stored in plaintext.</span>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'debug' && (
              <div className="space-y-8 animate-fade-in-up h-full flex flex-col">
                <div className="flex justify-between items-center">
                   <div>
                      <h3 className="text-xl font-bold text-white">Health Dashboard</h3>
                      <p className="text-xs text-zinc-500 mt-1">Real-time connectivity tests and endpoint telemetry.</p>
                   </div>
                   <button 
                    onClick={handleTestConnection}
                    disabled={isTestLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                   >
                     {isTestLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                     Ping Primary Engine
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase mb-2">Endpoint Latency</p>
                        <p className="text-2xl font-bold text-white">{telemetry?.latency ? `${telemetry.latency}ms` : '--'}</p>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase mb-2">Last Handshake</p>
                        <p className={`text-2xl font-bold ${telemetry?.isValid ? 'text-green-500' : 'text-zinc-500'}`}>
                           {telemetry ? (telemetry.isValid ? 'Success' : 'Failed') : 'No Data'}
                        </p>
                    </div>
                </div>

                <div className="flex-1 bg-black rounded-2xl border border-zinc-800 p-4 font-mono text-[11px] overflow-hidden flex flex-col">
                   <div className="flex items-center gap-2 text-zinc-500 mb-3 pb-2 border-b border-zinc-900">
                      <Terminal size={12} />
                      <span className="uppercase tracking-widest font-black">System Logs</span>
                   </div>
                   <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
                      {logs.length === 0 ? (
                        <p className="text-zinc-800 italic">Waiting for developer action...</p>
                      ) : (
                        logs.map((log, i) => (
                          <p key={i} className="text-zinc-400 break-all">
                             <span className="text-primary font-bold">{'>'}</span> {log}
                          </p>
                        ))
                      )}
                   </div>
                </div>
              </div>
            )}

          </div>

          <div className="p-8 border-t border-zinc-800 bg-zinc-950/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-[10px] text-zinc-600 font-medium">
                  Configuring <span className="text-white font-bold">{analysisModel}</span> as default scoring engine.
              </div>
              <button 
                onClick={handleSave} 
                className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[2px] rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} /> Save & Apply Configuration
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;