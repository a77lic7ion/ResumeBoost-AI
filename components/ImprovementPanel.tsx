import React, { useState } from 'react';
import { improveResumeContent } from '../services/geminiService';
import { Wand2, ArrowRight, Copy, Check, X } from 'lucide-react';

interface ImprovementPanelProps {
  originalText: string;
  onClose: () => void;
}

const ImprovementPanel: React.FC<ImprovementPanelProps> = ({ originalText, onClose }) => {
  const [improvedText, setImprovedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('Improve the experience section to be more quantitative and active.');

  const handleImprove = async () => {
    setLoading(true);
    const result = await improveResumeContent(originalText, prompt);
    setImprovedText(result);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
      <div className="glass-effect border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
               <Wand2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Resume Optimizer</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
             <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            
            {/* Input & Controls (Left) */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Instructions for AI</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-32 p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800 dark:text-slate-200 outline-none resize-none"
                            placeholder="E.g., Rewrite the professional summary to be more senior-level..."
                        />
                        <div className="mt-3 flex gap-2 flex-wrap">
                            <button onClick={() => setPrompt("Fix grammar and spelling errors.")} className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">Fix Grammar</button>
                            <button onClick={() => setPrompt("Make bullet points more quantitative and result-oriented.")} className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">Add Metrics</button>
                            <button onClick={() => setPrompt("Optimize for 'Software Engineer' role keywords.")} className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">Tech Keywords</button>
                        </div>
                    </div>

                    <button 
                        onClick={handleImprove}
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all
                            ${loading ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover shadow-primary/20'}
                        `}
                    >
                        {loading ? 'Optimizing...' : 'Generate Improvements'}
                    </button>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        <strong>Pro Tip:</strong> Focus on one section at a time. Paste just your "Experience" section into the editor to get the best results from the AI.
                    </div>
                </div>
            </div>

            {/* Editor Comparison (Right) */}
            <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-slate-900">
                <div className="grid grid-cols-2 h-full divide-x divide-slate-200 dark:divide-slate-700">
                    {/* Original View */}
                    <div className="flex flex-col">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Original Text
                        </div>
                        <textarea 
                            className="flex-1 w-full p-6 resize-none focus:outline-none text-sm leading-relaxed font-mono text-slate-600 dark:text-slate-400 bg-transparent" 
                            value={originalText}
                            readOnly
                        />
                    </div>

                    {/* Improved View */}
                    <div className="flex flex-col bg-primary/5 dark:bg-primary/5">
                         <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-primary uppercase tracking-wider flex justify-between items-center">
                            <span>Improved Version</span>
                            {improvedText && (
                                <button 
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors bg-white dark:bg-slate-700 px-2 py-1 rounded shadow-sm"
                                >
                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            )}
                        </div>
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <Wand2 className="animate-spin text-primary" size={48} />
                                <p className="animate-pulse font-medium">Rewriting your resume...</p>
                            </div>
                        ) : improvedText ? (
                            <textarea 
                                className="flex-1 w-full p-6 resize-none focus:outline-none text-sm leading-relaxed font-mono text-slate-800 dark:text-slate-200 bg-transparent" 
                                value={improvedText}
                                onChange={(e) => setImprovedText(e.target.value)}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
                                <Wand2 size={48} className="mb-4 opacity-20" />
                                <p>Click "Generate Improvements" to see the magic happen.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovementPanel;