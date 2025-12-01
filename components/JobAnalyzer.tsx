
import React, { useState } from 'react';
import { analyzeJobDescription } from '../services/geminiService';
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
      const analysis = await analyzeJobDescription(jdText);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze job description. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Briefcase className="text-primary" /> Job Description Decoder
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Paste a job description below to get an instant cheat sheet of keywords and required skills.
        </p>
      </div>

      {!result ? (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste Job Description here..."
            className="w-full h-64 p-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-gray-800 dark:text-gray-200"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !jdText.trim()}
            className={`mt-4 w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 
              ${loading || !jdText.trim() ? 'bg-gray-400 cursor-not-allowed' : 'gradient-btn hover:scale-[1.01]'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            {loading ? "Analyzing..." : "Analyze Job Description"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Results</h3>
              <button 
                onClick={() => { setResult(null); setJdText(''); }}
                className="text-sm text-primary hover:underline font-semibold"
              >
                Analyze Another
              </button>
           </div>
           
           <div className="grid md:grid-cols-2 gap-6">
              {/* Role & Culture */}
              <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                  <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">{result.roleTitle}</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 italic">{result.cultureFit}</p>
              </div>

              {/* Hard Skills */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800">
                 <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                    <Zap className="text-orange-500" size={20} /> Hard Skills
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {result.hardSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium border border-orange-100 dark:border-orange-900/30">
                            {skill}
                        </span>
                    ))}
                 </div>
              </div>

              {/* Soft Skills */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800">
                 <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                    <Brain className="text-purple-500" size={20} /> Soft Skills
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {result.softSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-100 dark:border-purple-900/30">
                            {skill}
                        </span>
                    ))}
                 </div>
              </div>

              {/* Keywords */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800">
                 <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                    <Search className="text-green-500" size={20} /> ATS Keywords
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {result.keywords.map((word, i) => (
                        <span key={i} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm font-mono border border-green-100 dark:border-green-900/30">
                            {word}
                        </span>
                    ))}
                 </div>
              </div>

              {/* Responsibilities */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800">
                 <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                    <ListChecks className="text-blue-500" size={20} /> Key Responsibilities
                 </h4>
                 <ul className="space-y-3">
                    {result.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
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
