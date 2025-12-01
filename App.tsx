import React, { useState, useEffect } from 'react';
import ResumeInput from './components/ResumeInput';
import Dashboard from './components/Dashboard';
import ImprovementPanel from './components/ImprovementPanel';
import SettingsModal from './components/SettingsModal';
import LandingFeatures from './components/LandingFeatures';
import PricingSection from './components/PricingSection';
import { calculateAtsScore } from './utils/atsLogic';
import { analyzeWithGemini } from './services/geminiService';
import { AnalysisResult, SavedSession } from './types';
import { Settings, Moon, Sun, Github } from 'lucide-react';
import { saveSession, generateId } from './utils/storage';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'results'>('upload');
  const [resumeText, setResumeText] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImprovementPanel, setShowImprovementPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAnalyze = async (text: string, image?: string) => {
    setIsProcessing(true);
    setResumeText(text);
    setProfileImage(image);
    setCurrentSessionId(generateId());

    const { score, issues } = calculateAtsScore(text);
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
    setProfileImage(session.profileImage);
    setCurrentSessionId(session.id);
    setCurrentStep('results');
  };

  const handleSave = () => {
    if (!analysisResult || !resumeText || !currentSessionId) return;
    let name = "Untitled Resume";
    if (analysisResult.aiAnalysis?.summary) {
        name = analysisResult.aiAnalysis.summary.split(' ').slice(0, 5).join(' ') + '...';
    } else {
        name = `Resume - ${new Date().toLocaleDateString()}`;
    }

    const session: SavedSession = {
        id: currentSessionId,
        name: name,
        timestamp: Date.now(),
        resumeText: resumeText,
        analysisResult: analysisResult,
        profileImage: profileImage
    };

    saveSession(session);
    alert("Session saved successfully!");
  };

  const handleUpdateOriginal = (newText: string) => {
      setResumeText(newText);
      const { score, issues } = calculateAtsScore(newText);
      setAnalysisResult(prev => prev ? { ...prev, score, issues } : null);
  };

  return (
    <div className="gradient-bg min-h-screen flex flex-col selection:bg-primary selection:text-white">
      
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentStep('upload')}>
                {/* Updated Navbar Logo */}
                <img 
                  src="/logo.png" 
                  alt="ResumeBoost AI" 
                  className="w-10 h-10 object-contain drop-shadow-sm" 
                  onError={(e) => {
                    // Fallback if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback Icon */}
                <span className="hidden bg-primary p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </span>
                <span className="font-bold text-xl text-gray-900 dark:text-white">ResumeBoost AI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => setCurrentStep('upload')} className="text-sm font-semibold hover:text-primary dark:hover:text-gray-300 transition-colors">Features</button>
                <button onClick={() => setCurrentStep('upload')} className="text-sm font-semibold hover:text-primary dark:hover:text-gray-300 transition-colors">Pricing</button>
                <button className="text-sm font-semibold hover:text-primary dark:hover:text-gray-300 transition-colors">About</button>
            </div>

            <div className="flex items-center space-x-4">
                 <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button 
                    onClick={() => setShowSettings(true)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                >
                    <Settings size={20} />
                </button>

                <a href="#" className="hidden sm:block text-sm font-semibold hover:text-primary dark:hover:text-gray-300 transition-colors">Sign In</a>
                <button className="gradient-btn text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
                    Get Started
                </button>
            </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
         {currentStep === 'upload' ? (
             <div className="animate-fade-in-up">
                 {/* Hero Section */}
                 <div className="container mx-auto px-6 pt-12 pb-24">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
                                Elevate Your Career with AI-Powered Resume Optimization
                            </h1>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                Unlock ATS insights, improve your score, and land more interviews instantly with Gemini 2.5 Flash.
                            </p>
                        </div>
                        <div className="order-1 md:order-2 flex justify-center">
                             {/* Updated Hero Image to use new Logo */}
                             <img 
                                alt="ResumeBoost AI Logo" 
                                className="w-full max-w-md mx-auto drop-shadow-2xl object-contain hover:scale-105 transition-transform duration-500" 
                                src="/logo.png"
                             />
                        </div>
                    </div>

                    <div className="mt-16">
                         <ResumeInput 
                            onAnalyze={handleAnalyze} 
                            onLoadSession={handleLoadSession}
                            isProcessing={isProcessing} 
                         />
                    </div>
                 </div>

                 <LandingFeatures />
                 <PricingSection />
             </div>
         ) : (
             <div className="container mx-auto px-6 py-12 animate-fade-in-up">
                  <div className="mb-8">
                     <button 
                       onClick={() => setCurrentStep('upload')}
                       className="text-gray-500 hover:text-primary dark:text-gray-400 font-medium flex items-center gap-2 transition-colors mb-4"
                     >
                       <span className="material-symbols-outlined">arrow_back</span> Analyze Another
                     </button>
                     {analysisResult && (
                        <Dashboard 
                            analysis={analysisResult} 
                            onImproveClick={() => setShowImprovementPanel(true)} 
                            onSave={handleSave}
                        />
                     )}
                  </div>
             </div>
         )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 dark:border-zinc-800 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-gray-900 dark:text-white">ResumeBoost AI</span>
             </div>
             <p className="text-sm text-gray-500 dark:text-gray-400">
                Created by AfflictedAI
             </p>
             <div className="flex gap-4">
                <a href="#" className="text-gray-500 hover:text-primary transition-colors"><Github size={20} /></a>
             </div>
        </div>
      </footer>

      {showImprovementPanel && (
          <ImprovementPanel 
            originalText={resumeText} 
            analysisResult={analysisResult}
            profileImage={profileImage}
            onClose={() => setShowImprovementPanel(false)}
            onUpdateOriginal={handleUpdateOriginal}
          />
        )}

      {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default App;