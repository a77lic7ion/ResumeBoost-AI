import React, { useState, useEffect } from 'react';
import { improveResumeContent } from '../services/geminiService';
import { Wand2, X, Copy, Check, Eye, Code, FileDown, Download, Layers, LayoutTemplate, ArrowRight, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { diffWords } from 'diff';
import { AnalysisResult, IssueSeverity } from '../types';

interface ImprovementPanelProps {
  originalText: string;
  analysisResult?: AnalysisResult | null;
  onClose: () => void;
  onUpdateOriginal: (newText: string) => void;
}

type ViewMode = 'edit' | 'preview' | 'diff';
type TemplateType = 'modern' | 'classic' | 'minimal';

const TEMPLATES: Record<TemplateType, string> = {
  modern: `
    font-family: 'Inter', sans-serif;
    color: #334155;
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-size: 2em; }
    h2 { color: #1e293b; margin-top: 2rem; font-size: 1.25em; font-weight: 700; border-left: 4px solid #cbd5e1; padding-left: 1rem; }
    h3 { color: #475569; font-weight: 600; margin-top: 1.5rem; }
    p { line-height: 1.6; margin-bottom: 1rem; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; position: relative; }
    li::marker { color: #2563eb; }
  `,
  classic: `
    font-family: 'Times New Roman', serif;
    color: #1a1a1a;
    h1 { text-align: center; color: #000; font-size: 2.5em; margin-bottom: 1rem; border-bottom: 1px solid #000; }
    h2 { text-transform: uppercase; border-bottom: 1px solid #666; font-size: 1.2em; margin-top: 2em; padding-bottom: 5px; }
    h3 { font-style: italic; font-weight: bold; margin-top: 1em; }
    p { text-align: justify; line-height: 1.5; }
    ul { padding-left: 20px; }
  `,
  minimal: `
    font-family: 'Arial', sans-serif;
    color: #111;
    h1 { font-weight: 900; font-size: 3em; letter-spacing: -1px; line-height: 1; margin-bottom: 2rem; }
    h2 { font-weight: 800; font-size: 1em; text-transform: uppercase; margin-top: 3rem; margin-bottom: 1rem; letter-spacing: 1px; }
    h3 { font-weight: 700; font-size: 1em; margin-bottom: 0.5rem; }
    p, li { font-size: 0.95em; line-height: 1.7; color: #444; }
    ul { list-style: none; padding: 0; }
    li:before { content: "•"; color: #f97316; font-weight: bold; display: inline-block; width: 1em; margin-left: -1em; }
  `
};

const ImprovementPanel: React.FC<ImprovementPanelProps> = ({ originalText, analysisResult, onClose, onUpdateOriginal }) => {
  const [improvedText, setImprovedText] = useState(originalText);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('diff');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  
  // Track previous version for diffing
  const [previousVersion, setPreviousVersion] = useState(originalText);

  // Initialize with original text
  useEffect(() => {
    if (!improvedText) setImprovedText(originalText);
    setViewMode('diff');
  }, [originalText]);

  const handleImprove = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse) return;

    setLoading(true);
    setLoadingStep('Analyzing Request...');
    
    // Simulate steps for better UX if the API is fast, or to show progress if slow
    const steps = ['Reading Resume...', 'Applying Best Practices...', 'Structuring Markdown...', 'Finalizing Edits...'];
    let stepIdx = 0;
    const interval = setInterval(() => {
        if (stepIdx < steps.length) {
            setLoadingStep(steps[stepIdx]);
            stepIdx++;
        }
    }, 2000);

    setPreviousVersion(improvedText); 
    
    try {
        const result = await improveResumeContent(improvedText, promptToUse);
        setImprovedText(result);
        setViewMode('diff'); 
    } catch (e) {
        console.error(e);
        alert("Optimization failed. Please try again.");
    } finally {
        clearInterval(interval);
        setLoading(false);
        setLoadingStep('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const printContent = document.getElementById('resume-preview-content');
    if (!printContent) return;
    
    const w = window.open('', '', 'width=800,height=600');
    if (w) {
      w.document.write(`
        <html>
          <head>
            <title>Resume Export - ${selectedTemplate}</title>
            <style>
              ${TEMPLATES[selectedTemplate]}
              body { padding: 40px; -webkit-print-color-adjust: exact; }
              @media print {
                 body { padding: 0; }
              }
            </style>
          </head>
          <body>${printContent.innerHTML}</body>
        </html>
      `);
      w.document.close();
      w.focus();
      setTimeout(() => {
          w.print();
          w.close();
      }, 500);
    }
  };

  const handleExportDOCX = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Resume</title>
        <style>
            ${TEMPLATES[selectedTemplate]}
        </style>
      </head>
      <body>${marked.parse(improvedText)}</body></html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_optimized.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Diff View with word-level granularity
  const renderDiff = () => {
    const diff = diffWords(previousVersion, improvedText);
    return (
      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm leading-relaxed">
        {diff.map((part, index) => {
          if (part.added) {
            return (
                <span key={index} className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold px-0.5 rounded border-b-2 border-green-500" title="Added by AI">
                    {part.value}
                </span>
            );
          }
          if (part.removed) {
            return (
                <span key={index} className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 line-through px-0.5 rounded opacity-60 decoration-red-500 decoration-2" title="Removed">
                    {part.value}
                </span>
            );
          }
          return <span key={index} className="text-slate-600 dark:text-slate-300">{part.value}</span>;
        })}
      </div>
    );
  };

  // Filter actionable issues
  const actionableIssues = analysisResult?.issues.filter(
    i => i.severity === IssueSeverity.CRITICAL || i.severity === IssueSeverity.IMPORTANT
  ) || [];

  const missingKeywords = analysisResult?.aiAnalysis?.missingKeywords || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
      <div className="glass-effect border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
               <Wand2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resume Optimizer Studio</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Powered by Gemini 2.5</span>
                <span>•</span>
                <span className={viewMode === 'edit' ? 'text-primary font-bold' : ''}>{viewMode === 'edit' ? 'Editing Mode' : 'Review Mode'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={() => {
                    onUpdateOriginal(improvedText);
                    onClose();
                }}
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5"
            >
                <Check size={18} /> Apply Changes
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            
            {/* Sidebar (Controls) */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar h-full">
                    
                    {/* Detected Issues (Dynamic) */}
                    {(actionableIssues.length > 0 || missingKeywords.length > 0) && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-3 flex items-center gap-2">
                           <AlertTriangle size={14} /> Detected Issues
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {actionableIssues.map((issue) => (
                            <div key={issue.id} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg p-3 group">
                                <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">{issue.message}</p>
                                <p className="text-[10px] text-red-600 dark:text-red-300 mb-2 leading-tight">{issue.remediation}</p>
                                <button 
                                  onClick={() => handleImprove(`Fix this specific resume issue: "${issue.message}".\n\nContext/Goal: ${issue.remediation}.\n\nApply this fix to the document while maintaining the rest of the content.`)} 
                                  className="w-full text-center text-xs bg-red-100 dark:bg-red-800/40 hover:bg-red-200 dark:hover:bg-red-700 text-red-900 dark:text-white py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                                >
                                    <Wand2 size={12} /> Auto-Fix Issue
                                </button>
                            </div>
                          ))}
                          
                          {missingKeywords.length > 0 && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg p-3">
                                <p className="text-xs font-semibold text-orange-800 dark:text-orange-200 mb-2">Missing Keywords</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {missingKeywords.slice(0, 5).map(k => <span key={k} className="text-[10px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800 text-slate-600 dark:text-slate-300">{k}</span>)}
                                </div>
                                <button 
                                  onClick={() => handleImprove(`Integrate these missing keywords into the Skills or Experience sections naturally: ${missingKeywords.join(', ')}.`)}
                                  className="w-full text-center text-xs bg-orange-100 dark:bg-orange-800/40 hover:bg-orange-200 dark:hover:bg-orange-700 text-orange-900 dark:text-white py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                                >
                                    <Sparkles size={12} /> Inject Keywords
                                </button>
                            </div>
                          )}
                        </div>
                        <hr className="border-slate-200 dark:border-slate-700 mt-6" />
                      </div>
                    )}

                    {/* General Quick Actions */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">One-Click Optimizations</label>
                        <div className="grid grid-cols-1 gap-2">
                             <button onClick={() => handleImprove("Rewrite the Experience section to be strictly result-oriented. Use 'Action Verb + Metric + Result' format for every bullet point. E.g. 'Reduced loading time by 30%'.")} className="text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg hover:border-primary dark:hover:border-primary hover:shadow-md transition-all text-slate-700 dark:text-slate-300 flex items-center justify-between group">
                                <span>Quantify Achievements (Add Metrics)</span>
                                <Wand2 size={12} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                             </button>
                             <button onClick={() => handleImprove("Remove any 'Soft Skills' or 'Personal Skills' sections. Move relevant tools to a 'Technical Skills' section grouped by category (Languages, Frameworks, etc). Remove any visual strength bars/graphs.")} className="text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg hover:border-primary dark:hover:border-primary hover:shadow-md transition-all text-slate-700 dark:text-slate-300 flex items-center justify-between group">
                                <span>Format Skills for ATS</span>
                                <Wand2 size={12} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                             </button>
                             <button onClick={() => handleImprove("Generate a strong Professional Summary at the top. It should be 2-3 sentences summarizing the candidate's core value proposition, years of experience, and key stack.")} className="text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg hover:border-primary dark:hover:border-primary hover:shadow-md transition-all text-slate-700 dark:text-slate-300 flex items-center justify-between group">
                                <span>Add Professional Summary</span>
                                <Wand2 size={12} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                             </button>
                        </div>
                    </div>

                    {/* Custom Prompt */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Custom Instruction</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-24 p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800 dark:text-slate-200 outline-none resize-none shadow-sm"
                            placeholder="E.g., 'Make the tone more senior' or 'Focus on Project Management skills'..."
                        />
                        <button 
                            onClick={() => handleImprove()}
                            disabled={loading || !prompt.trim()}
                            className={`mt-3 w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2
                                ${loading || !prompt.trim() ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover shadow-primary/20'}
                            `}
                        >
                            {loading ? <Wand2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                            {loading ? 'Optimizing...' : 'Run Custom Edit'}
                        </button>
                    </div>
                    
                    <hr className="border-slate-200 dark:border-slate-700" />
                    
                    {/* Exports */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Download As</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleExportPDF} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200">
                                <FileDown size={14} /> PDF
                            </button>
                            <button onClick={handleExportDOCX} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200">
                                <Download size={14} /> DOCX
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
                {/* Toolbar */}
                <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                        <button 
                            onClick={() => setViewMode('edit')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <Code size={14} /> Editor
                        </button>
                        <button 
                            onClick={() => setViewMode('preview')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <Eye size={14} /> Template Preview
                        </button>
                        <button 
                            onClick={() => setViewMode('diff')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'diff' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <Layers size={14} /> Changes
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {viewMode === 'preview' && (
                            <div className="flex items-center gap-2">
                                <LayoutTemplate size={16} className="text-slate-400"/>
                                <select 
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
                                    className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                                >
                                    <option value="modern">Modern Professional</option>
                                    <option value="classic">Classic Elegant</option>
                                    <option value="minimal">Creative Minimal</option>
                                </select>
                            </div>
                        )}
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
                        <button 
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'COPIED' : 'COPY'}
                        </button>
                    </div>
                </div>

                {/* Viewport */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 custom-scrollbar relative">
                    {loading && (
                        <div className="absolute inset-0 z-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                    <Loader2 size={40} className="text-primary animate-spin relative z-10" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">AI is Working...</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium min-w-[200px]">
                                        {loadingStep}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'edit' && (
                        <textarea 
                            className="w-full h-full min-h-[600px] resize-none focus:outline-none text-sm leading-7 font-mono text-slate-800 dark:text-slate-200 bg-transparent p-4 border border-transparent focus:border-slate-200 dark:focus:border-slate-700 rounded-lg" 
                            value={improvedText}
                            onChange={(e) => setImprovedText(e.target.value)}
                            spellCheck={false}
                            placeholder="Markdown content..."
                        />
                    )}
                    
                    {viewMode === 'preview' && (
                        <div 
                            id="resume-preview-content"
                            className="shadow-xl rounded-sm min-h-[1000px] bg-white text-slate-900 p-12 mx-auto max-w-[850px]"
                            style={{
                                // Determine inline styles based on template but also allow class override
                            }}
                        >   
                            <style>{TEMPLATES[selectedTemplate]}</style>
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(improvedText) as string) }} />
                        </div>
                    )}

                    {viewMode === 'diff' && (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto min-h-[600px]">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-6 flex items-center gap-2">
                                <Layers size={16}/> 
                                Diff Overview
                                <span className="ml-auto text-xs font-normal normal-case bg-green-100 text-green-800 px-2 py-0.5 rounded">Green = Added</span>
                                <span className="text-xs font-normal normal-case bg-red-100 text-red-800 px-2 py-0.5 rounded">Red = Removed</span>
                            </h3>
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