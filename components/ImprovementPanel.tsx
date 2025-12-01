
import React, { useState, useEffect, useRef } from 'react';
import { improveResumeContent } from '../services/geminiService';
import { Wand2, X, Copy, Check, Eye, Code, FileDown, Download, Layers, LayoutTemplate, ArrowRight, AlertTriangle, Sparkles, Loader2, StopCircle, Lightbulb, PenTool, ChevronDown, PlusCircle, Search } from 'lucide-react';
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
    font-family: 'Sora', 'Inter', sans-serif;
    color: #334155;
    .resume-container { display: flex; flex-direction: column; gap: 20px; }
    .header-container { display: flex; align-items: center; gap: 24px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
    .header-content { flex: 1; }
    .profile-photo { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); flex-shrink: 0; }
    h1 { color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; font-size: 2.2em; margin: 0 0 8px 0; line-height: 1.1; }
    .contact-info { font-size: 0.9em; color: #64748b; margin-bottom: 0; }
    h2 { color: #0f172a; margin-top: 24px; font-size: 1.25em; font-weight: 700; border-left: 4px solid #2563eb; padding-left: 12px; display: flex; align-items: center; text-transform: uppercase; letter-spacing: 0.05em; }
    h3 { color: #475569; font-weight: 600; font-size: 1.1em; margin-top: 16px; margin-bottom: 4px; }
    p { line-height: 1.6; margin-bottom: 8px; color: #475569; }
    ul { padding-left: 1.2rem; margin-top: 4px; }
    li { margin-bottom: 6px; position: relative; line-height: 1.5; color: #334155; }
    li::marker { color: #2563eb; }
    strong { color: #0f172a; font-weight: 700; }
  `,
  classic: `
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #1a1a1a;
    .resume-container { max-width: 100%; }
    .header-container { text-align: center; border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; }
    .profile-photo { width: 100px; height: 100px; margin-bottom: 15px; border-radius: 4px; object-fit: cover; border: 1px solid #ccc; padding: 3px; background: white; }
    h1 { font-size: 2.4em; margin: 0 0 10px 0; color: #000; font-weight: normal; font-family: 'Times New Roman', serif; }
    .contact-info { font-style: italic; color: #444; font-size: 1em; }
    h2 { text-transform: uppercase; border-bottom: 1px solid #666; font-size: 1.1em; margin-top: 2em; padding-bottom: 5px; font-weight: bold; letter-spacing: 1px; }
    h3 { font-weight: bold; margin-top: 1.2em; font-size: 1.05em; color: #222; }
    p { text-align: justify; line-height: 1.6; margin-bottom: 0.8em; }
    ul { padding-left: 20px; margin-top: 0.5em; }
    li { margin-bottom: 0.4em; }
  `,
  minimal: `
    font-family: 'Helvetica Neue', 'Arial', sans-serif;
    color: #222;
    .resume-container { display: block; }
    .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem; border-bottom: 1px solid #eee; padding-bottom: 2rem; }
    .header-content { flex: 1; padding-right: 20px; }
    .profile-photo { width: 90px; height: 90px; border-radius: 8px; object-fit: cover; filter: grayscale(100%); flex-shrink: 0; }
    h1 { font-weight: 800; font-size: 2.8em; letter-spacing: -1px; line-height: 1; margin: 0 0 10px 0; color: #000; }
    .contact-info { font-size: 0.9em; color: #666; font-weight: 500; }
    h2 { font-weight: 700; font-size: 0.9em; text-transform: uppercase; margin-top: 2.5rem; margin-bottom: 1rem; letter-spacing: 1.5px; color: #888; }
    h3 { font-weight: 700; font-size: 1.1em; margin-bottom: 0.2rem; color: #000; }
    p, li { font-size: 0.95em; line-height: 1.6; color: #444; }
    ul { list-style: none; padding: 0; }
    li { padding-left: 1.2em; text-indent: -1.2em; margin-bottom: 0.5em; }
    li:before { content: "—"; color: #999; margin-right: 0.5em; }
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
  const [longRunning, setLongRunning] = useState(false);
  const [showIssuesList, setShowIssuesList] = useState(false);
  
  // Real-time Analysis State
  const [localIssues, setLocalIssues] = useState<Issue[]>([]);
  const [quickFixValue, setQuickFixValue] = useState('');
  const [activeFixId, setActiveFixId] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const [previousVersion, setPreviousVersion] = useState(originalText);

  // Sync initial text and set initial issues
  useEffect(() => {
    if (!improvedText) setImprovedText(originalText);
    const { issues } = calculateAtsScore(originalText);
    setLocalIssues(issues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalText]);

  // Real-time re-analysis when text changes
  useEffect(() => {
    const timer = setTimeout(() => {
        const { issues } = calculateAtsScore(improvedText);
        setLocalIssues(issues);
    }, 500); // Debounce for performance
    return () => clearTimeout(timer);
  }, [improvedText]);

  // Handle Progress Bar
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
        setProgress(0);
        setLongRunning(false);
        interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) {
                    setLongRunning(true);
                    return prev < 98 ? prev + 0.1 : 98;
                }
                let increment = 0;
                if (prev < 30) increment = Math.random() * 8 + 2;
                else if (prev < 60) increment = Math.random() * 3 + 1;
                else if (prev < 80) increment = 0.8;
                else increment = 0.2;
                return prev + increment;
            });
        }, 400);
    } else {
        setProgress(100);
        setLongRunning(false);
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
    const currentSignal = abortControllerRef.current.signal;

    setLoading(true);
    setPreviousVersion(improvedText); 
    
    try {
        const result = await improveResumeContent(improvedText, promptToUse);
        if (currentSignal.aborted) return;
        setImprovedText(result);
        if (!customPrompt) setViewMode('diff'); 
    } catch (e) {
        if (currentSignal.aborted) return;
        console.error(e);
        alert("Optimization failed. Please check your API key.");
    } finally {
        if (!currentSignal.aborted) {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }
  };

  const handleManualFix = (issueId: string, value: string) => {
    if (!value.trim()) return;
    
    // Simple injection logic for basic fields
    let newText = improvedText;
    
    if (issueId === 'missing-email' || issueId === 'missing-phone' || issueId === 'missing-linkedin') {
        // Try to inject in the first few lines
        const lines = newText.split('\n');
        // Find the title/name line (usually first H1 #)
        const nameLineIndex = lines.findIndex(l => l.startsWith('# '));
        
        if (nameLineIndex !== -1 && nameLineIndex < 5) {
            // Inject after name
            lines.splice(nameLineIndex + 1, 0, `**${value}**`);
            newText = lines.join('\n');
        } else {
            // Prepend to top
            newText = `${value}\n\n${improvedText}`;
        }
    } else if (issueId.includes('missing-section')) {
        // Append section to end
        // Clean up the value to ensure it's markdown ready
        const sectionName = issueId.split('-')[2];
        const formattedTitle = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        newText = `${improvedText}\n\n## ${formattedTitle}\n${value}`;
    }

    setImprovedText(newText);
    setActiveFixId(null);
    setQuickFixValue('');
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
    setLoading(false);
    setProgress(0);
    setLongRunning(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRenderedContent = () => {
     const cleanHtml = DOMPurify.sanitize(marked.parse(improvedText) as string);
     if (profileImage) {
        // We use a container to manage flex layout in css
        return `
          <div class="resume-container">
            <div class="header-container">
                <img src="${profileImage}" class="profile-photo" alt="Profile" />
                <div class="header-content">
                     ${cleanHtml.split('<h2')[0]} <!-- Hacky: Extract header part before first H2 -->
                </div>
            </div>
            <div class="resume-body">
                <h2${cleanHtml.split('<h2').slice(1).join('<h2')} <!-- Remainder -->
            </div>
          </div>
        `;
     }
     // If no image, normal render but wrapped
     return `<div class="resume-container">${cleanHtml}</div>`;
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
    const content = getRenderedContent();
    const styles = TEMPLATES[selectedTemplate];
    
    // Create a complete HTML document structure to satisfy Google Docs/Word
    const fullHtml = `<!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Resume</title>
      <style>
        body { font-family: sans-serif; }
        ${styles}
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>`;

    // Use Blob with HTML MIME type (Word handles HTML files well)
    // Adding the Byte Order Mark (\ufeff) is crucial for UTF-8 encoding
    const blob = new Blob(['\ufeff', fullHtml], {
        type: 'application/msword' // Using .doc MIME type often triggers Word's HTML import more reliably than .docx for raw HTML
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Changed to .doc (Word 97-2003) for better compatibility with HTML based content
    link.download = `Resume_Optimized.doc`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  // Filter Critical Issues from LOCAL analysis (Real-time)
  const criticalIssues = localIssues.filter(i => i.severity === IssueSeverity.CRITICAL || i.severity === IssueSeverity.IMPORTANT);
  
  const getSmartSuggestions = () => {
    const suggestions = [];

    // 1. Critical Issues based suggestions (Real-time from localIssues)
    const hasLowImpact = localIssues.some(i => i.category === 'impact');
    const hasMissingSummary = localIssues.some(i => i.id === 'missing-summary');
    const hasWeakSkills = localIssues.some(i => i.id === 'weak-skills');
    const hasBuzzwords = localIssues.some(i => i.id === 'buzzwords');

    if (hasLowImpact) {
        suggestions.push({
          label: "Quantify Impact",
          prompt: "Identify areas in the Experience section where specific numbers, percentages, or dollar amounts can be inferred or added to demonstrate value. Rewrite bullet points to emphasize results over duties.",
          icon: <Layers size={14} className="text-blue-500" />
        });
    }

    if (hasMissingSummary) {
        suggestions.push({
            label: "Write Summary",
            prompt: "Generate a compelling 2-3 sentence professional summary for the top of the resume. Highlight key years of experience, core competencies, and career objectives.",
            icon: <PenTool size={14} className="text-orange-500" />
        });
    }

    if (hasWeakSkills) {
        suggestions.push({
            label: "Optimize Skills",
            prompt: "Rewrite the Skills section to categorize technical and soft skills clearly. Ensure high-priority keywords are listed first.",
            icon: <Wand2 size={14} className="text-green-500" />
        });
    }

    if (hasBuzzwords) {
        suggestions.push({
            label: "Remove Buzzwords",
            prompt: "Identify and remove generic buzzwords (like 'hard worker', 'team player') and replace them with specific examples or action-oriented language.",
            icon: <AlertTriangle size={14} className="text-red-500" />
        });
    }

    // 2. Fallback/Additions from Analysis Result (Deep Analysis)
    if (analysisResult?.aiAnalysis?.missingKeywords && analysisResult.aiAnalysis.missingKeywords.length > 0) {
         // Only add if we haven't suggested too many things yet
         if (suggestions.length < 3) {
             const missing = analysisResult.aiAnalysis.missingKeywords.slice(0, 3).join(', ');
             suggestions.push({
                label: "Add Keywords",
                prompt: `Rewrite the experience section to naturally incorporate these missing industry keywords: ${missing}.`,
                icon: <Search size={14} className="text-purple-500" />
             });
         }
    }
    
    // 3. Always available standard suggestions if list is short
    if (suggestions.length < 3) {
        suggestions.push({
          label: "Polish Tone",
          prompt: "Rewrite the resume to sound more senior, authoritative, and result-oriented. Remove passive language and ensure strong action verbs are used.",
          icon: <Sparkles size={14} className="text-indigo-500" />
        });
    }
    
     if (suggestions.length < 3) {
        suggestions.push({
            label: "Fix Formatting",
             prompt: "Standardize formatting: ensure all dates are aligned, bullet points are consistent, and section headers are clear.",
            icon: <LayoutTemplate size={14} className="text-gray-500" />
        });
    }

    return suggestions.slice(0, 4); // Limit to top 4
  };

  const suggestions = getSmartSuggestions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-zinc-900/80 backdrop-blur-sm animate-fade-in-up">
      {loading && (
        <div className="fixed inset-0 z-[60] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center">
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
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                      {longRunning ? "Taking longer than usual... still working..." : progress > 85 ? "Finalizing edits..." : "Applying best practices..."}
                    </p>
                </div>
                <button 
                  onClick={handleCancel} 
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium text-sm transition-colors py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
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
                         <div className="animate-fade-in-up">
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

                    {/* Sidebar Critical Issues List (Mobile only, or duplicate list) */}
                    {criticalIssues.length > 0 && !showIssuesList && (
                      <div className="animate-fade-in-up md:hidden">
                        <label className="block text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-3 flex items-center gap-2">
                          <AlertTriangle size={14} /> Critical Fixes
                        </label>
                        <div className="space-y-2">
                          {criticalIssues.map(issue => (
                             <div key={issue.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-3 rounded-lg">
                               <p className="text-xs text-red-700 dark:text-red-300 font-medium mb-2">{issue.message}</p>
                             </div>
                          ))}
                        </div>
                        <hr className="border-gray-200 dark:border-zinc-800 mt-6" />
                      </div>
                    )}

                    {/* Smart Suggestions */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                          <Lightbulb size={14} /> Smart Suggestions
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {suggestions.map((s, i) => (
                              <button 
                                key={i} 
                                onClick={() => handleImprove(s.prompt)} 
                                className="text-left text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-3 rounded-lg hover:border-primary dark:hover:border-primary hover:shadow-md transition-all text-gray-700 dark:text-gray-300 flex items-center justify-between group"
                              >
                                <span>{s.label}</span>
                                <span className="opacity-70 group-hover:opacity-100 transition-opacity">{s.icon}</span>
                              </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Prompt */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 mt-4">Custom Instruction</label>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-800 dark:text-gray-200 outline-none resize-none shadow-sm" placeholder="E.g., 'Make the tone more senior' or 'Quantify my achievements'..." />
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
                            <button onClick={handleExportDOCX} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-xs font-bold text-gray-700 dark:text-gray-200"><Download size={14} /> DOC</button>
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

                {/* Inline Critical Alert Banner (With Add Field Options) */}
                {viewMode === 'edit' && criticalIssues.length > 0 && (
                   <div className="bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-900/30">
                        <div className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-colors" onClick={() => setShowIssuesList(!showIssuesList)}>
                             <div className="flex items-center gap-3">
                                 <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 dark:text-red-400">
                                     <AlertTriangle size={16} />
                                 </div>
                                 <span className="text-sm text-red-800 dark:text-red-200 font-bold">
                                     {criticalIssues.length} Critical Issues Detected
                                 </span>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="text-xs text-red-500 dark:text-red-400 font-medium hidden sm:block">Click to view & fix</span>
                                <ChevronDown size={16} className={`text-red-500 transition-transform ${showIssuesList ? 'rotate-180' : ''}`} />
                             </div>
                        </div>
                        
                        {showIssuesList && (
                            <div className="px-6 pb-4 space-y-2 animate-fade-in-up bg-red-50/50 dark:bg-red-900/10">
                                {criticalIssues.map(issue => (
                                    <div key={issue.id} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
                                        <div className="flex-1">
                                             <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-wider">{issue.severity}</span>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white">{issue.message}</p>
                                             </div>
                                             <p className="text-xs text-gray-600 dark:text-gray-400">{issue.remediation}</p>
                                        </div>
                                        
                                        {/* Action Area: Input Field or AI Fix */}
                                        {(issue.id.includes('missing-email') || issue.id.includes('missing-phone') || issue.id.includes('missing-linkedin')) ? (
                                            <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                {activeFixId === issue.id ? (
                                                     <div className="flex items-center gap-2 w-full">
                                                         <input 
                                                            autoFocus
                                                            type="text" 
                                                            placeholder={`Enter ${issue.id.split('-')[1]}...`}
                                                            className="flex-1 min-w-[150px] px-2 py-1.5 text-xs border border-gray-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                                                            value={quickFixValue}
                                                            onChange={(e) => setQuickFixValue(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleManualFix(issue.id, quickFixValue)}
                                                         />
                                                         <button 
                                                            onClick={() => handleManualFix(issue.id, quickFixValue)}
                                                            className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                                                         >
                                                             <Check size={12} />
                                                         </button>
                                                         <button 
                                                            onClick={() => setActiveFixId(null)}
                                                            className="p-1.5 bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300"
                                                         >
                                                             <X size={12} />
                                                         </button>
                                                     </div>
                                                ) : (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setActiveFixId(issue.id); setQuickFixValue(''); }}
                                                        className="w-full md:w-auto text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-600 dark:text-blue-300 px-3 py-2 rounded transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                                                    >
                                                        <PlusCircle size={12} /> Add {issue.id.split('-')[1]}
                                                    </button>
                                                )}
                                            </div>
                                        ) : issue.id.includes('missing-section') ? (
                                            /* Dedicated Section Add */
                                            <div className="w-full md:w-auto mt-2 md:mt-0">
                                                {activeFixId === issue.id ? (
                                                     <div className="flex flex-col gap-2 w-full md:min-w-[300px]">
                                                         <textarea
                                                            autoFocus
                                                            placeholder={`Enter content for ${issue.id.split('-')[2]} section...`}
                                                            className="w-full h-24 px-2 py-1.5 text-xs border border-gray-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-white resize-none"
                                                            value={quickFixValue}
                                                            onChange={(e) => setQuickFixValue(e.target.value)}
                                                         />
                                                         <div className="flex gap-2 justify-end">
                                                            <button 
                                                                onClick={() => setActiveFixId(null)}
                                                                className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-300"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={() => handleManualFix(issue.id, quickFixValue)}
                                                                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                            >
                                                                Add Section
                                                            </button>
                                                         </div>
                                                     </div>
                                                ) : (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setActiveFixId(issue.id); setQuickFixValue(''); }}
                                                        className="w-full md:w-auto text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-600 dark:text-blue-300 px-3 py-2 rounded transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                                                    >
                                                        <PlusCircle size={12} /> Create Section
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleImprove(`Fix this issue: ${issue.message}. ${issue.remediation}`); }}
                                                className="w-full md:w-auto mt-2 md:mt-0 text-[10px] font-bold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                                            >
                                                <Wand2 size={12} /> Auto-Fix
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                   </div>
                )}

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
