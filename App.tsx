
import React, { useState, useEffect } from 'react';
import ResumeInput from './components/ResumeInput';
import Dashboard from './components/Dashboard';
import ImprovementPanel from './components/ImprovementPanel';
import SettingsModal from './components/SettingsModal';
import LandingFeatures from './components/LandingFeatures';
import PricingSection from './components/PricingSection';
import JobAnalyzer from './components/JobAnalyzer';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import { calculateAtsScore } from './utils/atsLogic';
import { analyseWithIntelligence } from './services/geminiService';
import { AnalysisResult, SavedSession } from './types';
import { Settings, Moon, Sun, FileText, Briefcase, PenTool, Zap } from 'lucide-react';
import { saveSession, duplicateSession, generateId } from './utils/storage';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'results'>('upload');
  const [activeTab, setActiveTab] = useState<'resume' | 'job' | 'cover'>('resume');
  
  const [resumeText, setResumeText] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImprovementPanel, setShowImprovementPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleAnalyze = async (text: string, image?: string) => {
    setIsProcessing(true);
    setResumeText(text);
    setProfileImage(image);
    setCurrentSessionId(generateId());

    const { score, issues } = calculateAtsScore(text);
    const aiData = await analyseWithIntelligence(text);

    setAnalysisResult({ score, issues, aiAnalysis: aiData });
    setIsProcessing(false);
    setCurrentStep('results');
    setActiveTab('resume');
  };

  const handleLoadSession = (session: SavedSession) => {
    setResumeText(session.resumeText);
    setAnalysisResult(session.analysisResult);
    setProfileImage(session.profileImage);
    setCurrentSessionId(session.id);
    setCurrentStep('results');
    setActiveTab('resume');
  };

  const handleSave = () => {
    if (!analysisResult || !resumeText || !currentSessionId) return;
    saveSession({
        id: currentSessionId,
        name: `CV Refinement - ${new Date().toLocaleDateString()}`,
        timestamp: Date.now(),
        resumeText: resumeText,
        analysisResult: analysisResult,
        profileImage: profileImage
    });
    alert("Progress updated successfully.");
  };

  const handleSaveAs = () => {
    if (!analysisResult || !resumeText || !currentSessionId) return;
    const currentName = `CV Refinement - ${new Date().toLocaleDateString()}`;
    const newName = prompt("Enter a name for this new session version:", currentName);
    if (newName) {
      const newSession = duplicateSession({
          id: currentSessionId,
          name: newName,
          timestamp: Date.now(),
          resumeText: resumeText,
          analysisResult: analysisResult,
          profileImage: profileImage
      }, newName);
      setCurrentSessionId(newSession.id);
      alert(`Saved as: ${newName}`);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex flex-col selection:bg-primary selection:text-white">
      <header className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentStep('upload')}>
                <div className="bg-primary p-1 md:p-1.5 rounded-lg text-white">
                  <FileText size={18} />
                </div>
                <span className="font-bold text-lg md:text-xl text-white tracking-tight">ResumeBoost AI</span>
            </div>
            
            <div className="flex items-center space-x-3 md:space-x-8">
                 <button className="hidden sm:block text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</button>
                 <button className="hidden sm:block text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</button>
                 <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-white/5 text-gray-400">
                    <Settings size={18} />
                </button>
                <button className="bg-white text-black text-[10px] md:text-xs font-bold px-3 md:px-5 py-2 md:py-2.5 rounded-lg hover:bg-gray-200 transition-colors">Get Started</button>
            </div>
        </nav>
      </header>

      <main className="flex-grow">
         {currentStep === 'upload' ? (
             <div className="animate-fade-in-up">
                 <div className="container mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-20 md:pb-24">
                    <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                        <div className="text-center lg:text-left space-y-6 md:space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                                <Zap size={10} fill="currentColor" /> Powered by Intelligent Services
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white tracking-tight">
                                Accelerate Your Career with <span className="text-primary">Professional CV Optimisation</span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-400 max-w-lg leading-relaxed mx-auto lg:mx-0">
                                Unlock professional ATS insights, improve your score, and land more interviews across South Africa with our bespoke backend engine.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 justify-center lg:justify-start">
                                <button onClick={() => document.getElementById('cv-input-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto gradient-btn text-white text-sm font-bold py-4 px-10 rounded-xl shadow-lg uppercase tracking-wider">
                                    Analyse Now
                                </button>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#05070A] bg-zinc-800 flex items-center justify-center text-[7px] md:text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Pro</div>)}
                                    </div>
                                    <span className="text-[10px] md:text-xs text-gray-500 font-medium">Trusted by 10K+ SA professionals</span>
                                </div>
                            </div>
                        </div>
                        <div id="cv-input-section" className="scroll-mt-24">
                             <ResumeInput onAnalyze={handleAnalyze} onLoadSession={handleLoadSession} isProcessing={isProcessing} />
                        </div>
                    </div>
                 </div>

                 <LandingFeatures />
                 <PricingSection />
             </div>
         ) : (
             <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 animate-fade-in-up">
                  <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <button onClick={() => setCurrentStep('upload')} className="text-gray-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
                       <span className="material-symbols-outlined text-sm">arrow_back</span> Return
                     </button>
                  </div>

                  <div className="flex overflow-x-auto gap-2 mb-8 bg-zinc-900/50 p-1.5 rounded-xl shadow-sm border border-zinc-800 w-full sm:w-fit scrollbar-hide">
                      <button onClick={() => setActiveTab('resume')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-w-[120px] ${activeTab === 'resume' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-white/5'}`}>
                         <FileText size={14} /> CV Scoring
                      </button>
                      <button onClick={() => setActiveTab('job')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-w-[120px] ${activeTab === 'job' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-white/5'}`}>
                         <Briefcase size={14} /> Role Matcher
                      </button>
                      <button onClick={() => setActiveTab('cover')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-w-[120px] ${activeTab === 'cover' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-white/5'}`}>
                         <PenTool size={14} /> Professional Drafting
                      </button>
                  </div>

                  <div className="animate-fade-in">
                      {activeTab === 'resume' && <Dashboard analysis={analysisResult!} onImproveClick={() => setShowImprovementPanel(true)} onSave={handleSave} onSaveAs={handleSaveAs} />}
                      {activeTab === 'job' && <JobAnalyzer />}
                      {activeTab === 'cover' && <CoverLetterGenerator resumeText={resumeText} />}
                  </div>
             </div>
         )}
      </main>

      {showImprovementPanel && (
          <ImprovementPanel 
            originalText={resumeText} analysisResult={analysisResult} profileImage={profileImage}
            onClose={() => setShowImprovementPanel(false)} onUpdateOriginal={(t) => { setResumeText(t); const {score, issues} = calculateAtsScore(t); setAnalysisResult(p => p ? {...p, score, issues} : null); }}
          />
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      
      <footer className="bg-[#05070A] border-t border-zinc-900 py-10 md:py-16 mt-auto">
          <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-3 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                        <div className="bg-primary p-1 rounded-lg text-white">
                          <FileText size={14} />
                        </div>
                        <span className="font-bold text-base md:text-lg text-white tracking-tight">ResumeBoost AI</span>
                    </div>
                    <p className="text-gray-500 text-[10px] md:text-xs">Leading career acceleration platform for SA professionals.</p>
                  </div>
                  <div className="flex items-center gap-6 md:gap-8">
                      <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-wider">Privacy</button>
                      <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-wider">Terms</button>
                      <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-wider">Contact</button>
                  </div>
                  <p className="text-gray-600 text-[9px] md:text-[10px] font-medium">© 2026 ResumeBoost AI. Designed by Afflicted.ai</p>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default App;
