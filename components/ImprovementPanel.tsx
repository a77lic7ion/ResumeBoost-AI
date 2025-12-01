import React, { useState, useEffect } from 'react';
import { improveResumeContent } from '../services/geminiService';
import { Wand2, X, Copy, Check, Eye, Code, FileDown, Download, Layers } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { diffWords } from 'diff';

interface ImprovementPanelProps {
  originalText: string;
  onClose: () => void;
  onUpdateOriginal: (newText: string) => void;
}

type ViewMode = 'edit' | 'preview' | 'diff';

const ImprovementPanel: React.FC<ImprovementPanelProps> = ({ originalText, onClose, onUpdateOriginal }) => {
  const [improvedText, setImprovedText] = useState(originalText);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('Improve the experience section to be more quantitative and active.');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  
  // Track previous version for diffing
  const [previousVersion, setPreviousVersion] = useState(originalText);

  // Initialize with original text
  useEffect(() => {
    if (!improvedText) setImprovedText(originalText);
  }, [originalText]);

  const handleImprove = async () => {
    setLoading(true);
    setPreviousVersion(improvedText); // Store current as previous before update
    
    // We append the current text to context so AI knows what to improve
    const result = await improveResumeContent(improvedText, prompt);
    setImprovedText(result);
    setLoading(false);
    setViewMode('diff'); // Auto switch to diff to show changes
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
            <title>Resume Export</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; }
              h1 { font-size: 24px; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-top: 30px; }
              h2 { font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; }
              p { line-height: 1.6; margin-bottom: 10px; }
              ul { padding-left: 20px; }
              li { margin-bottom: 5px; }
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
    // Basic HTML to Doc blob approach
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Resume</title></head>
      <body>${marked.parse(improvedText)}</body></html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_optimized_${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Diff View
  const renderDiff = () => {
    const diff = diffWords(previousVersion, improvedText);
    return (
      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm">
        {diff.map((part, index) => {
          if (part.added) {
            return <span key={index} className="bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-1 rounded">{part.value}</span>;
          }
          if (part.removed) {
            return <span key={index} className="bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through px-1 rounded opacity-70">{part.value}</span>;
          }
          return <span key={index} className="text-slate-500 dark:text-slate-400">{part.value}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
      <div className="glass-effect border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl w-full max-w-[90vw] h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
               <Wand2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Resume Optimizer</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={() => {
                    onUpdateOriginal(improvedText);
                    onClose();
                }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
                <Check size={16} /> Save & Close
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
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">AI Instructions</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-32 p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800 dark:text-slate-200 outline-none resize-none shadow-sm"
                            placeholder="How should the AI improve your resume?"
                        />
                        <div className="mt-3 flex gap-2 flex-wrap">
                            <button onClick={() => setPrompt("Fix grammar and spelling errors.")} className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-full hover:border-primary dark:hover:border-primary transition-colors text-slate-600 dark:text-slate-300">Fix Grammar</button>
                            <button onClick={() => setPrompt("Make bullet points more quantitative and result-oriented.")} className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-full hover:border-primary dark:hover:border-primary transition-colors text-slate-600 dark:text-slate-300">Add Metrics</button>
                            <button onClick={() => setPrompt("Format this as a clean, professional Resume using Markdown.")} className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-full hover:border-primary dark:hover:border-primary transition-colors text-slate-600 dark:text-slate-300">Format Standard</button>
                        </div>
                    </div>

                    <button 
                        onClick={handleImprove}
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2
                            ${loading ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover shadow-primary/20'}
                        `}
                    >
                        {loading ? <Wand2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                        {loading ? 'Optimizing...' : 'Generate Improvements'}
                    </button>
                    
                    <hr className="border-slate-200 dark:border-slate-700" />
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Export</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleExportPDF} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200">
                                <FileDown size={16} /> PDF
                            </button>
                            <button onClick={handleExportDOCX} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200">
                                <Download size={16} /> DOCX
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
                {/* Toolbar */}
                <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                        <button 
                            onClick={() => setViewMode('edit')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <Code size={14} /> Code
                        </button>
                        <button 
                            onClick={() => setViewMode('preview')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <Eye size={14} /> Preview
                        </button>
                        <button 
                            onClick={() => setViewMode('diff')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'diff' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <Layers size={14} /> Diff
                        </button>
                    </div>

                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary transition-colors bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg shadow-sm"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy Text'}
                    </button>
                </div>

                {/* Viewport */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 custom-scrollbar">
                    {viewMode === 'edit' && (
                        <textarea 
                            className="w-full h-full min-h-[500px] resize-none focus:outline-none text-sm leading-relaxed font-mono text-slate-700 dark:text-slate-300 bg-transparent p-4" 
                            value={improvedText}
                            onChange={(e) => setImprovedText(e.target.value)}
                            spellCheck={false}
                        />
                    )}
                    
                    {viewMode === 'preview' && (
                        <div 
                            id="resume-preview-content"
                            className="prose dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 md:p-12 shadow-xl rounded-sm min-h-[800px] print:shadow-none print:p-0"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(improvedText) as string) }}
                        />
                    )}

                    {viewMode === 'diff' && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-4">Changes Overview</h3>
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