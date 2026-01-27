import React, { useState, useEffect, useRef } from 'react';
import { enhanceCVContent } from '../services/geminiService';
import { Wand2, X, Copy, Check, Eye, FileDown, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { diffWords } from 'diff';
import { AnalysisResult, IssueSeverity, Issue } from '../types';
import { calculateAtsScore } from '../utils/atsLogic';

interface ImprovementPanelProps {
  originalText: string;
  analysisResult?: AnalysisResult | null;
  profileImage?: string;
  onClose: () => void;
  onUpdateOriginal: (newText: string) => void;
}

type ViewMode = 'edit' | 'preview' | 'diff';

const ImprovementPanel: React.FC<ImprovementPanelProps> = ({ originalText, onClose, onUpdateOriginal }) => {
  const [improvedText, setImprovedText] = useState(originalText);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [localIssues, setLocalIssues] = useState<Issue[]>([]);
  const [previousVersion, setPreviousVersion] = useState(originalText);

  useEffect(() => {
    const { issues } = calculateAtsScore(improvedText);
    setLocalIssues(issues);
  }, [improvedText]);

  const handleImprove = async (customPrompt?: string) => {
    const instruction = customPrompt || prompt;
    if (!instruction) return;
    setLoading(true);
    setPreviousVersion(improvedText); 
    try {
        const result = await enhanceCVContent(improvedText, instruction);
        setImprovedText(result);
        if (!customPrompt) setViewMode('diff'); 
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const printContent = document.getElementById('cv-preview-content');
    if (!printContent) return;
    const w = window.open('', '', 'width=800,height=600');
    if (w) {
      w.document.write(`<html><head><style>body { font-family: 'Sora', sans-serif; padding: 40px; } .cv-container { max-width: 800px; margin: auto; }</style></head><body><div class="cv-container">${printContent.innerHTML}</div></body></html>`);
      w.document.close(); w.print(); w.close();
    }
  };

  const getRenderedContent = () => DOMPurify.sanitize(marked.parse(improvedText) as string);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-zinc-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-none sm:rounded-2xl shadow-2xl w-full max-w-[95vw] h-full sm:h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-zinc-800">
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <Wand2 className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Professional Refinement Studio</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onUpdateOriginal(improvedText); onClose(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold transition-transform hover:scale-105">Commit Refinement</button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 p-5 bg-gray-50/30 dark:bg-zinc-900/50 overflow-y-auto">
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-3 block">Service Actions</label>
                        <div className="space-y-3">
                            {localIssues.filter(i => i.severity === IssueSeverity.CRITICAL).map(issue => (
                                <div key={issue.id} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                    <p className="text-[10px] font-bold text-red-800 dark:text-red-300 mb-1 flex items-center gap-1">
                                        <AlertTriangle size={10} /> {issue.message}
                                    </p>
                                    <button onClick={() => handleImprove(`Fix the following issue: ${issue.remediation}`)} className="w-full py-1 bg-red-600 text-white rounded text-[10px] font-bold">Auto-Correct</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-3 block">Intelligence Prompt</label>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-3 text-sm rounded-xl border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white outline-none focus:ring-1 focus:ring-primary" placeholder="Ask the service to rewrite specific sections..." />
                        <button onClick={() => handleImprove()} disabled={loading} className="mt-2 w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            {loading ? 'Processing...' : 'Enhance Profile'}
                        </button>
                    </div>

                    <div className="pt-4 border-t dark:border-zinc-800">
                        <button onClick={handleExportPDF} className="w-full py-2 bg-white dark:bg-zinc-800 border dark:border-zinc-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                            <FileDown size={14} /> Download CV
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950">
                <div className="px-6 py-3 border-b border-gray-100 dark:border-zinc-800 flex bg-gray-50/50 dark:bg-zinc-900/50 gap-2">
                    {['edit', 'preview', 'diff'].map(mode => (
                        <button key={mode} onClick={() => setViewMode(mode as ViewMode)} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${viewMode === mode ? 'bg-primary text-white' : 'text-gray-500'}`}>
                            {mode}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-12">
                    {viewMode === 'edit' && (
                        <textarea className="w-full h-full min-h-[600px] outline-none text-sm leading-relaxed font-mono dark:bg-transparent dark:text-gray-300" value={improvedText} onChange={(e) => setImprovedText(e.target.value)} />
                    )}
                    {viewMode === 'preview' && (
                        <div id="cv-preview-content" className="prose dark:prose-invert max-w-[800px] mx-auto p-12 bg-white text-zinc-900 shadow-xl min-h-[1000px]" dangerouslySetInnerHTML={{ __html: getRenderedContent() }} />
                    )}
                    {viewMode === 'diff' && (
                        <div className="max-w-4xl mx-auto space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase">Analysis of Changes</h3>
                            <div className="p-8 bg-gray-50 dark:bg-zinc-900 rounded-2xl border dark:border-zinc-800 text-sm">
                                {diffWords(previousVersion, improvedText).map((part, i) => (
                                    <span key={i} className={`${part.added ? 'text-green-600 bg-green-50' : part.removed ? 'text-red-600 bg-red-50 line-through' : 'text-gray-600'}`}>
                                        {part.value}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovementPanel;