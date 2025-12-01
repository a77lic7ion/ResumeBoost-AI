import React, { useState, useEffect } from 'react';
import ResumeInput from './components/ResumeInput';
import Dashboard from './components/Dashboard';
import ImprovementPanel from './components/ImprovementPanel';
import { calculateAtsScore } from './utils/atsLogic';
import { analyzeWithGemini } from './services/geminiService';
import { AnalysisResult, SavedSession } from './types';
import { FileText, Github, Moon, Sun } from 'lucide-react';
import { saveSession, generateId } from './utils/storage';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'results'>('upload');
  const [resumeText, setResumeText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImprovementPanel, setShowImprovementPanel] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Track current session ID for updates
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Initialize theme based on system preference or default to dark (modern look)
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Toggle 'dark' class on html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAnalyze = async (text: string) => {
    setIsProcessing(true);
    setResumeText(text);
    setCurrentSessionId(generateId()); // New session

    // 1. Local Algo Scoring
    const { score, issues } = calculateAtsScore(text);
    
    // 2. Gemini AI Analysis
    const aiData = await analyzeWithGemini(text);

    setAnalysisResult({
      score,
      issues,
      aiAnalysis: aiData
    });

    setIsProcessing(false);
    setCurrentStep('results');
  };

  const handleLoadSession = (session: SavedSession) => {
    setResumeText(session.resumeText);
    setAnalysisResult(session.analysisResult);
    setCurrentSessionId(session.id);
    setCurrentStep('results');
  };

  const handleSave = () => {
    if (!analysisResult || !resumeText || !currentSessionId) return;
    
    // Use the first line or AI summary as the name, fallbacks to "Resume"
    let name = "Untitled Resume";
    if (analysisResult.aiAnalysis?.summary) {
        // Take first 5 words of summary
        name = analysisResult.aiAnalysis.summary.split(' ').slice(0, 5).join(' ') + '...';
    } else {
        name = `Resume - ${new Date().toLocaleDateString()}`;
    }

    const session: SavedSession = {
        id: currentSessionId,
        name: name,
        timestamp: Date.now(),
        resumeText: resumeText,
        analysisResult: analysisResult
    };

    saveSession(session);
    alert("Session saved successfully!");
  };

  const handleUpdateOriginal = (newText: string) => {
      setResumeText(newText);
      // Re-run standard checks locally, but keep AI data to avoid cost/delay unless explicit re-analyze requested
      const { score, issues } = calculateAtsScore(newText);
      setAnalysisResult(prev => prev ? { ...prev, score, issues } : null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-primary selection:text-white">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-float-1 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[28rem] h-[28rem] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full filter blur-3xl opacity-60 animate-float-2 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-sky-500/10 dark:bg-sky-500/10 rounded-full filter blur-3xl opacity-40 animate-float-3 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentStep('upload')}>
              <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
                <FileText size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                ResumeBoost AI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <a href="#" className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                  <Github size={20} />
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            {currentStep === 'upload' ? (
              <div className="animate-fade-in-up">
                <section className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                    Beat the ATS with <span className="text-primary">AI Precision</span>
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Get an instant ATS score, uncover hidden issues, and rewrite your resume with Gemini 2.5 Flash to land more interviews.
                  </p>
                </section>
                
                <div className="max-w-6xl mx-auto">
                  <ResumeInput 
                    onAnalyze={handleAnalyze} 
                    onLoadSession={handleLoadSession}
                    isProcessing={isProcessing} 
                  />
                </div>
                
                {/* Features Grid */}
                <div className="max-w-5xl mx-auto mt-20 grid md:grid-cols-3 gap-8">
                    {[
                      { title: 'Smart Scoring', desc: '40+ point check against industry ATS standards.' },
                      { title: 'AI Analysis', desc: 'Deep content critique using Google Gemini models.' },
                      { title: 'Instant Rewrite', desc: 'Auto-optimize weak bullet points in seconds.' }
                    ].map((f, i) => (
                      <div key={i} className="glass-effect border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                <div className="mb-8 flex items-center justify-between">
                    <button 
                      onClick={() => setCurrentStep('upload')}
                      className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary font-medium flex items-center gap-2 transition-colors"
                    >
                      &larr; Analyze Another
                    </button>
                </div>
                
                {analysisResult && (
                  <Dashboard 
                    analysis={analysisResult} 
                    onImproveClick={() => setShowImprovementPanel(true)} 
                    onSave={handleSave}
                  />
                )}
              </div>
            )}
          </div>
        </main>

        {/* Improvement Modal */}
        {showImprovementPanel && (
          <ImprovementPanel 
            originalText={resumeText} 
            onClose={() => setShowImprovementPanel(false)}
            onUpdateOriginal={handleUpdateOriginal}
          />
        )}

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 mt-auto border-t border-slate-200 dark:border-slate-800">
          <div className="container mx-auto max-w-7xl text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} ResumeBoost AI. Powered by Google Gemini.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;