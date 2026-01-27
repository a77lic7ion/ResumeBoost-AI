
import React, { useState, useEffect, useRef } from 'react';
import { improveResumeContent } from '../services/geminiService';
import { Wand2, X, Copy, Check, Eye, Code, FileDown, Download, Layers, LayoutTemplate, ArrowRight, AlertTriangle, Sparkles, Loader2, StopCircle, Lightbulb, PenTool, ChevronDown, PlusCircle, Search, Mail, Phone, Link as LinkIcon } from 'lucide-react';
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
type TemplateType = 'modern' | 'classic' | 'minimal';

const TEMPLATES: Record<TemplateType, string> = {
  modern: `
    font-family: 'Sora', sans-serif;
    color: #334155;
    .resume-container { display: flex; flex-direction: column; gap: 20px; }
    .header-container { display: flex; align-items: center; gap: 24px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
    .profile-photo { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; }
    h1 { color: #2563eb; font-size: 2.2em; margin-bottom: 8px; }
    h2 { color: #0f172a; margin-top: 24px; font-size: 1.25em; border-left: 4px solid #2563eb; padding-left: 12px; }
  `,
  classic: `
    font-family: 'Georgia', serif;
    color: #1a1a1a;
    .header-container { text-align: center; border-bottom: 1px solid #000; padding-bottom: 20px; }
    h1 { font-size: 2.4em; }
  `,
  minimal: `
    font-family: 'Helvetica Neue', sans-serif;
    color: #222;
    h1 { font-weight: 800; font-size: 2.8em; letter-spacing: -1px; }
    h2 { color: #888; text-transform: uppercase; font-size: 0.9em; margin-top: 2rem; }
  `
};

const ImprovementPanel: React.FC<ImprovementPanelProps> = ({ originalText, analysisResult, profileImage, onClose, onUpdateOriginal }) => {
  const [improvedText, setImprovedText] = useState(originalText);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [showIssuesList, setShowIssuesList] = useState(true);
  const [localIssues, setLocalIssues] = useState<Issue[]>([]);
  const [quickFixValue, setQuickFixValue] = useState('');
  const [activeFixId, setActiveFixId] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const [previousVersion, setPreviousVersion] = useState(originalText);

  useEffect(() => {
    const { issues } = calculateAtsScore(improvedText);
    setLocalIssues(issues);
  }, [improvedText]);

  const handleImprove = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse) return;
    setLoading(true);
    setPreviousVersion(improvedText); 
    try {
        const result = await improveResumeContent(improvedText, promptToUse);
        setImprovedText(result);
        if (!customPrompt) setViewMode('diff'); 
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleManualFix = (issueId: string, value: string) => {
    if (!value.trim()) return;
    let newText = improvedText;
    const lines = newText.split('\n');
    const headerEnd = lines.findIndex(l => l.startsWith('##'));
    const insertAt = headerEnd !== -1 ? headerEnd : 1;

    if (issueId === 'missing-email') newText = lines.slice(0, insertAt).join('\n') + `\nEmail: ${value}\n` + lines.slice(insertAt).join('\n');
    if (issueId === 'missing-phone') newText = lines.slice(0, insertAt).join('\n') + `\nPhone: ${value}\n` + lines.slice(insertAt).join('\n');
    if (issueId.includes('missing-section')) {
        const sectionName = issueId.split('-')[2];
        newText = `${improvedText}\n\n## ${sectionName.toUpperCase()}\n- ${value}`;
    }

    setImprovedText(newText);
    setActiveFixId(null);
    setQuickFixValue('');
  };

  const handleExportPDF = () => {
    const printContent = document.getElementById('resume-preview-content');
    if (!printContent) return;
    const w = window.open('', '', 'width=800,height=600');
    if (w) {
      w.document.write(`<html><head><style>${TEMPLATES[selectedTemplate]}</style></head><body>${printContent.innerHTML}</body></html>`);
      w.document.close();
      w.print();
      w.close();
    }
  };

  const getRenderedContent = () => {
     const cleanHtml = DOMPurify.sanitize(marked.parse(improvedText) as string);
     return `<div class="resume-container">${cleanHtml}</div>`;
  };

  const criticalIssues = localIssues.filter(i => i.severity === IssueSeverity.CRITICAL || i.severity === IssueSeverity.IMPORTANT);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-zinc-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-none sm:rounded-2xl shadow-2xl w-full max-w-[95vw] h-full sm:h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <Wand2 className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Refinement Studio</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onUpdateOriginal(improvedText); onClose(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Apply Changes</button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            {/* Sidebar with Suggestions */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 p-5 bg-gray-50/30 dark:bg-zinc-900/50 overflow-y-auto">
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-3 block">Quick Fix Actions</label>
                        <div className="space-y-3">
                            {criticalIssues.map(issue => (
                                <div key={issue.id} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                    <p className="text-xs font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-1.5">
                                        <AlertTriangle size={12} /> {issue.message}
                                    </p>
                                    
                                    {activeFixId === issue.id ? (
                                        <div className="flex flex-col gap-2">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                className="w-full px-2 py-1.5 text-xs rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                                placeholder={`Enter missing information...`}
                                                value={quickFixValue}
                                                onChange={(e) => setQuickFixValue(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleManualFix(issue.id, quickFixValue)} className="flex-1 py-1 bg-green-500 text-white rounded text-[10px] font-bold">Save</button>
                                                <button onClick={() => setActiveFixId(null)} className="px-2 py-1 bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded text-[10px]">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setActiveFixId(issue.id)}
                                            className="w-full py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-[10px] font-bold border border-red-200 dark:border-red-900/30 hover:bg-red-200 transition-colors"
                                        >
                                            Fix Now
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-3 block">AI Keyword & Skill Matching</label>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-3 text-sm rounded-xl border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="Custom instruction..." />
                        <button onClick={() => handleImprove()} className="mt-2 w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                            <Sparkles size={16} /> Optimise Content
                        </button>
                    </div>

                    <div className="pt-4 border-t dark:border-zinc-800">
                        <label className="text-xs font-bold uppercase text-gray-400 mb-3 block">Exports</label>
                        <button onClick={handleExportPDF} className="w-full py-2 bg-white dark:bg-zinc-800 border dark:border-zinc-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                            <FileDown size={14} /> Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950">
                <div className="px-6 py-3 border-b border-gray-100 dark:border-zinc-800 flex bg-gray-50/50 dark:bg-zinc-900/50">
                    {['edit', 'preview', 'diff'].map(mode => (
                        <button key={mode} onClick={() => setViewMode(mode as ViewMode)} className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewMode === mode ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            {mode}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-12">
                    {viewMode === 'edit' && (
                        <textarea className="w-full h-full min-h-[600px] resize-none focus:outline-none text-sm leading-relaxed font-mono dark:bg-transparent dark:text-gray-300" value={improvedText} onChange={(e) => setImprovedText(e.target.value)} spellCheck={false} />
                    )}
                    {viewMode === 'preview' && (
                        <div id="resume-preview-content" className="shadow-2xl bg-white text-gray-900 p-12 mx-auto max-w-[800px] min-h-[1000px]">   
                            <style>{TEMPLATES[selectedTemplate]}</style>
                            <div dangerouslySetInnerHTML={{ __html: getRenderedContent() }} />
                        </div>
                    )}
                    {viewMode === 'diff' && (
                        <div className="max-w-4xl mx-auto space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase">Changes Made</h3>
                            <div className="p-8 bg-gray-50 dark:bg-zinc-900 rounded-2xl border dark:border-zinc-800">
                                {diffWords(previousVersion, improvedText).map((part, i) => (
                                    <span key={i} className={`${part.added ? 'bg-green-100 text-green-700' : part.removed ? 'bg-red-100 text-red-700 line-through' : 'text-gray-600 dark:text-gray-400'}`}>
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
