
import React, { useState } from 'react';
// Corrected import name to match geminiService.ts
import { analyseJobDescription } from '../services/geminiService';
import { JobAnalysisResult } from '../types';
import { Search, Briefcase, Zap, Brain, ListChecks, Loader2, ArrowRight } from 'lucide-react';

const JobAnalyzer: React.FC = () => {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    try {
      // Corrected function call to match exported member
      const analysis = await analyseJobDescription(jdText);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert("Failed to analyse job description. Please check your system configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Briefcase className="text-primary" /> Role Match Intelligence
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Paste a South African job description below to get an instant decoding of keywords and required professional skills.
        </p>
      </div>

      {!result ? (
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-800">
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste local or international Job Description here..."
            className="w-full h-64 p-4 bg-zinc-950/30 border border-zinc-800 rounded-xl focus:border-primary/50 outline-none resize-none text-white text-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !jdText.trim()}
            className={`mt-4 w-full py-4 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 
              ${loading || !jdText.trim() ? 'bg-zinc-800 cursor-not-allowed text-zinc-600' : 'bg-primary hover:bg-primary-hover hover:scale-[1.01]'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            {loading ? "Analysing Requirements..." : "Analyse Job Description"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Requirement Insights</h3>
              <button 
                onClick={() => { setResult(null); setJdText(''); }}
                className="text-xs text-primary hover:underline font-bold uppercase tracking-widest"
              >
                Analyse Another
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role & Culture */}
              <div className="col-span-1 md:col-span-2 bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                  <h4 className="text-lg font-bold text-blue-100 mb-1">{result.roleTitle}</h4>
                  <p className="text-sm text-blue-300 italic">{result.cultureFit}</p>
              </div>

              {/* Hard Skills */}
              <div className="bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-800">
                 <h4 className="flex items-center gap-2 font-bold text-white mb-4">
                    <Zap className="text-orange-500" size={20} /> Professional Skills
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {result.hardSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-bold border border-orange-500/20 uppercase tracking-wider">
                            {skill}
                        </span>
                    ))}
                 </div>
              </div>

              {/* Soft Skills */}
              <div className="bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-800">
                 <h4 className="flex items-center gap-2 font-bold text-white mb-4">
                    <Brain className="text-purple-500" size={20} /> Core Competencies
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {result.softSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-bold border border-purple-500/20 uppercase tracking-wider">
                            {skill}
                        </span>
                    ))}
                 </div>
              </div>

              {/* Keywords */}
              <div className="bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-800">
                 <h4 className="flex items-center gap-2 font-bold text-white mb-4">
                    <Search className="text-green-500" size={20} /> High-Value Keywords
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {result.keywords.map((word, i) => (
                        <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-md text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">
                            {word}
                        </span>
                    ))}
                 </div>
              </div>

              {/* Responsibilities */}
              <div className="bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-800">
                 <h4 className="flex items-center gap-2 font-bold text-white mb-4">
                    <ListChecks className="text-blue-500" size={20} /> Critical Deliverables
                 </h4>
                 <ul className="space-y-3">
                    {result.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                            <ArrowRight size={16} className="mt-0.5 text-blue-500 shrink-0" />
                            {resp}
                        </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default JobAnalyzer;
