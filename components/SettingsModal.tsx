
import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Save, Key, Loader2, ShieldCheck } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';
import { validateApiKey } from '../services/geminiService';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const settings = getSettings();
    if (settings.apiKey) {
      setApiKey(settings.apiKey);
    }
  }, []);

  const getEnvApiKey = () => {
    let key = undefined;
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        // @ts-ignore
        key = import.meta.env.VITE_API_KEY;
      }
    } catch(e) {}
    
    if (!key) {
      try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
          key = process.env.API_KEY;
        }
      } catch(e) {}
    }
    return key;
  };

  const handleSave = () => {
    saveSettings({ apiKey: apiKey.trim() });
    onClose();
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKey.trim() || getEnvApiKey();
    if (!keyToTest) {
      setTestStatus('error');
      setErrorMessage("No API Key provided to test.");
      return;
    }

    setIsTestLoading(true);
    setTestStatus('idle');
    setErrorMessage('');

    const isValid = await validateApiKey(keyToTest);

    setIsTestLoading(false);
    if (isValid) {
      setTestStatus('success');
    } else {
      setTestStatus('error');
      setErrorMessage("Connection failed. Key is invalid or lacks permissions (Error 403).");
    }
  };

  const envKey = getEnvApiKey();
  const isUsingEnv = !apiKey && !!envKey;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
      <div className="glass-effect border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key size={18} /> API Settings
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestStatus('idle');
                }}
                placeholder={isUsingEnv ? "Using Environment Variable (Hidden)" : "Enter your API Key"}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-slate-800 dark:text-slate-200"
              />
              <Key size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
            
            <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center justify-between">
                <span>
                    {isUsingEnv 
                    ? <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><ShieldCheck size={12}/> Using secure environment variable</span> 
                    : apiKey 
                        ? "Using custom key provided above" 
                        : "No key found"}
                </span>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Get API Key
                </a>
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Note for Vercel: Set variable name to <code>VITE_API_KEY</code>
              </span>
            </div>
          </div>

          {/* Status Message */}
          {testStatus === 'success' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Check size={16} /> Connection Successful!
            </div>
          )}
          
          {testStatus === 'error' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={isTestLoading}
              className="flex-1 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              {isTestLoading ? <Loader2 size={16} className="animate-spin" /> : "Test Key"}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save & Close
            </button>
          </div>
          
          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">
            Your custom key is stored locally in your browser and is never sent to our servers.
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
