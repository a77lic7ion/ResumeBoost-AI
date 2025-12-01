
import React, { useState, useEffect, useRef } from 'react';
import { improveResumeContent } from '../services/geminiService';
import { Wand2, X, Copy, Check, Eye, Code, FileDown, Download, Layers, LayoutTemplate, ArrowRight, AlertTriangle, Sparkles, Loader2, StopCircle } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { diffWords } from 'diff';
import { AnalysisResult, IssueSeverity } from '../types';

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
    font-family: 'Sora', 'Inter', sans-serif;
    color: #334155;
    .profile-photo { float: left; width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-right: 20px; border: 3px solid #e2e8f0; }
    .header-container { display: flex; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
    h1 { color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; font-size: 2em; margin: 0; }
    h2 { color: #0f172a; margin-top: 2rem; font-size: 1.25em; font-weight: 700; border-left: 4px solid #cbd5e1; padding-left: 1rem; }
    h3 { color: #475569; font-weight: 600; margin-top: 1.5rem; }
    p { line-height: 1.6; margin-bottom: 1rem; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; position: relative; }
    li::marker { color: #2563eb; }
    .clearfix::after { content: ""; display: table; clear: both; }
  `,
  classic: `
    font-family: 'Times New Roman', serif;
    color: #1a1a1a;
    .profile-photo { display: block; width: 100px; height: 100px; margin: 0 auto 15px auto; border-radius: 5px; object-fit: cover; border: 1px solid #000; }
    .header-container { text-align: center; border-bottom: 1px solid #000; padding-bottom: 1rem; margin-bottom: 1rem; }
    h1 { text-align: center; color: #000; font-size: 2.5em; margin-bottom: 0.5rem; }
    h2 { text-transform: uppercase; border-bottom: 1px solid #666; font-size: 1.2em; margin-top: 2em; padding-bottom: 5px; }
    h3 { font-style: italic; font-weight: bold; margin-top: 1em; }
    p { text-align: justify; line-height: 1.5; }
    ul { padding-left: 20px; }
    .clearfix::after { content: ""; display: table; clear: both; }
  `,
  minimal: `
    font-family: 'Arial', sans-serif;
    color: #111;
    .profile-photo { float: right; width: 80px; height: 80px; border-radius: 4px; object-fit: cover; margin-left: 20px; filter: grayscale(100%); }
    h1 { font-weight: 900; font-size: 3em; letter-spacing: -1px; line-height: 1; margin-bottom: 2rem; }
    h2 { font-weight: 800; font-size: 1em; text-transform: uppercase; margin-top: 3rem; margin-bottom: 1rem; letter-spacing: 1px; }
    h3 { font-weight: 700; font-size: 1em; margin-bottom: 0.5rem; }
    p, li { font-size: 0.95em; line-height: 1.7; color: #444; }
    ul { list-style: none; padding: 0; }
    li:before { content: "•"; color: #2563EB; font-weight: bold; display: inline-block; width: 1em; margin-left: -1em; }
    .clearfix::after { content: ""; display: table; clear: both; }
  `
};

const ImprovementPanel: React.FC<ImprovementPanelProps> = ({ originalText, analysisResult, profileImage, onClose, onUpdateOriginal }) => {
  const [improvedText, setImprovedText] = useState(originalText);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('diff');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const abortControllerRef = useRef<AbortController | null>(null);
  const [previousVersion, setPreviousVersion] = useState(originalText);

  useEffect(() => {
    if (!improvedText) setImprovedText(originalText);
    setViewMode('diff');
  }, [originalText]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
        setProgress(0);
        interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 99) return 99;
                let increment = 0;
                if (prev < 50) increment = Math.random() * 5 + 3;
                else if (prev < 80) increment = Math.random() * 2 + 1;
                else if (prev < 95) increment = 0.5;
                else increment = 0.05;
                return Math.min(prev + increment, 99.9);
            });
        }, 500);
    } else {
        setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleImprove = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse) return;

    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setPreviousVersion(improvedText); 
    
    try {
        const result = await improveResumeContent(improvedText, promptToUse);
        // Check if aborted before updating state
        if (abortControllerRef.current?.signal.aborted) {
            return;
        }
        setImprovedText(result);
        setViewMode('diff'); 
    } catch (e) {
        if (abortControllerRef.current?.signal.aborted) return;
        console.error(e);
    } finally {
        if (!abortControllerRef.current?.signal.aborted) {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    setLoading(false);
    setProgress(0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRenderedContent = () => {
     const cleanHtml = DOMPurify.sanitize(marked.parse(improvedText) as string);
     if (profileImage) {
        return `
          <div class="clearfix">
            <img src="${profileImage}" class="profile-photo" alt="Profile Photo" />
            <div class="resume-body">
                ${cleanHtml}
            </div>
          </div>
        `;
     }
     return cleanHtml;
  };

  const handleExportPDF = () => {
    const printContent = document.getElementById('resume-preview-content');
    if (!printContent) return;
    const w = window.open('', '', 'width=800,height=600');
    if (w) {
      w.document.write(`<html><head><title>Resume</title><style>${TEMPLATES[selectedTemplate]} body { padding: 40px; -webkit-print-color-adjust: exact; } @media print { body { padding: 0; } }</style></head><body>${printContent.innerHTML}</body></html>`);
      w.document.close();
      w.focus();
      setTimeout(() => { w.print(); w.close(); }, 500);
    }
  };

  const handleExportDOCX = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Resume</title><style>${TEMPLATES[selectedTemplate]}</style></head><body>${getRenderedContent()}</body></html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_optimized.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDiff = () => {
    const diff = diffWords(previousVersion, improvedText);
    return (
      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm leading-relaxed">
        {diff.map((part, index) => {
          if (part.added) return <span key={index} className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold px-0.5 rounded border-b-2 border-green-500" title="Added by AI">{part.value}</span>;
          if (part.removed) return <span key={index} className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 line-through px-0.5 rounded opacity-60 decoration-red-500 decoration-2" title="Removed">{part.value}</span>;
          return <span key={index} className="text-gray-600 dark:text-gray-300">{part.value}</span>;
        })}
      </div>
    );
  };

  const actionableIssues = analysisResult?.issues.filter(i => i.severity === IssueSeverity.CRITICAL || i.severity === IssueSeverity.IMPORTANT) || [];
  const missingKeywords = analysisResult?.aiAnalysis?.missingKeywords || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-zinc-900/80 backdrop-blur-sm animate-fade-in-up">
      {loading && (
        <div className="fixed inset-0 z-[60] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 flex flex-col items-center gap-6 mx-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 size={48} className="text-primary animate-spin relative z-10" />
                </div>
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <span>AI Optimization</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">{progress > 85 ? "Finalizing edits..." : "Applying best practices..."}</p>
                </div>
                <button onClick={handleCancel} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium text-sm transition-colors py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                    <StopCircle size={16} /> Stop Generating
                </button>
            </div>
        </div>
      )}

      <div className="glass-effect border border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 rounded-none sm:rounded-2xl shadow-2xl w-full max-w-[95vw] h-full sm:h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Wand2 size={24} /></div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Resume Optimizer Studio</h2>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Powered by Gemini 2.5</span>
                <span>•</span>
                <span className={viewMode === 'edit' ? 'text-primary font-bold' : ''}>{viewMode === 'edit' ? 'Editing Mode' : 'Review Mode'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { onUpdateOriginal(improvedText); onClose(); }} disabled={loading} className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                <Check size={18} /> Apply Changes
            </button>
            <button onClick={onClose} disabled={loading} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-gray-400 disabled:opacity-50">
                <X size={24} />
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row relative">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-gray-50/50 dark:bg-zinc-900/50 flex-shrink-0 ${loading ? 'pointer-events-none opacity-50' : ''}`}>
                <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar h-full">
                    {/* Template Selector */}
                    {viewMode === 'preview' && (
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                               <LayoutTemplate size={14} /> Resume Template
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['modern', 'classic', 'minimal'].map(t => (
                                    <button key={t} onClick={() => setSelectedTemplate(t as TemplateType)} className={`flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all ${selectedTemplate === t ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'}`}>
                                        <div className="w-full aspect-[3/4] bg-white border border-gray-200 p-1 flex flex-col gap-1 shadow-sm opacity-60"></div>
                                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 capitalize">{t}</span>
                                    </button>
                                ))}
                            </div>
                            <hr className="border-gray-200 dark:border-zinc-800 mt-6" />
                         </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">One-Click Optimizations</label>
                        <div className="grid grid-cols-1 gap-2">
                             <button onClick={() => handleImprove("Rewrite the Experience section to be result-oriented using specific metrics.")} className="text-left text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-3 rounded-lg hover:border-primary dark:hover:border-primary hover:shadow-md transition-all text-gray-700 dark:text-gray-300 flex items-center justify-between group">
                                <span>Add Metrics</span><Wand2 size={12} className="opacity-0 group-hover:opacity-100 text-primary" />
                             </button>
                             <button onClick={() => handleImprove("Format skills section for ATS readability.")} className="text-left text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-3 rounded-lg hover:border-primary dark:hover:border-primary hover:shadow-md transition-all text-gray-700 dark:text-gray-300 flex items-center justify-between group">
                                <span>Format Skills</span><Wand2 size={12} className="opacity-0 group-hover:opacity-100 text-primary" />
                             </button>
                             <button onClick={() => handleImprove("Generate a professional summary.")} className="text-left text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-3 rounded-lg hover:border-primary dark:hover:border-primary hover:shadow-md transition-all text-gray-700 dark:text-gray-300 flex items-center justify-between group">
                                <span>Create Summary</span><Wand2 size={12} className="opacity-0 group-hover:opacity-100 text-primary" />
                             </button>
                        </div>
                    </div>

                    {/* Custom Prompt */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Custom Instruction</label>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-800 dark:text-gray-200 outline-none resize-none shadow-sm" placeholder="E.g., 'Make the tone more senior'..." />
                        <button onClick={() => handleImprove()} disabled={loading || !prompt.trim()} className={`mt-3 w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${loading || !prompt.trim() ? 'bg-gray-400 cursor-not-allowed' : 'gradient-btn'}`}>
                            {loading ? <Wand2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                            {loading ? 'Optimizing...' : 'Run Custom Edit'}
                        </button>
                    </div>
                    
                    <hr className="border-gray-200 dark:border-zinc-800" />
                    
                    {/* Exports */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Download</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleExportPDF} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-xs font-bold text-gray-700 dark:text-gray-200"><FileDown size={14} /> PDF</button>
                            <button onClick={handleExportDOCX} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-xs font-bold text-gray-700 dark:text-gray-200"><Download size={14} /> DOCX</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-zinc-900 min-w-0 transition-opacity ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="px-6 py-3 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/80 dark:bg-zinc-800/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex bg-gray-200 dark:bg-zinc-700 rounded-lg p-1">
                        {['edit', 'preview', 'diff'].map(mode => (
                             <button key={mode} onClick={() => setViewMode(mode as ViewMode)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${viewMode === mode ? 'bg-white dark:bg-zinc-600 text-primary shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                                {mode === 'edit' && <Code size={14} />}{mode === 'preview' && <Eye size={14} />}{mode === 'diff' && <Layers size={14} />} {mode}
                             </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-4 w-px bg-gray-300 dark:bg-zinc-600"></div>
                        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors">
                            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'COPIED' : 'COPY'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-900/50 p-6 md:p-8 custom-scrollbar relative">
                    {viewMode === 'edit' && (
                        <textarea className="w-full h-full min-h-[600px] resize-none focus:outline-none text-sm leading-7 font-mono text-gray-800 dark:text-gray-200 bg-transparent p-4 border border-transparent focus:border-gray-200 dark:focus:border-zinc-700 rounded-lg" value={improvedText} onChange={(e) => setImprovedText(e.target.value)} spellCheck={false} placeholder="Markdown content..." />
                    )}
                    {viewMode === 'preview' && (
                        <div id="resume-preview-content" className="shadow-xl rounded-sm min-h-[1000px] bg-white text-gray-900 p-12 mx-auto max-w-[850px]">   
                            <style>{TEMPLATES[selectedTemplate]}</style>
                            <div dangerouslySetInnerHTML={{ __html: getRenderedContent() }} />
                        </div>
                    )}
                    {viewMode === 'diff' && (
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 max-w-4xl mx-auto min-h-[600px]">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-6 flex items-center gap-2"><Layers size={16}/> Diff Overview</h3>
                            {renderDiff()}
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
