
import React from 'react';
import { ShieldCheck, Zap, Target, BarChart3, Bot, FileSearch } from 'lucide-react';

const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-white" />,
      title: "AI-Powered Parsing",
      desc: "Our engine reads PDFs and images just like a recruiter, extracting hidden text and structure.",
      color: "bg-blue-500"
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "ATS Simulation",
      desc: "We run 40+ checks used by Fortune 500 applicant tracking systems to ensure you don't get filtered out.",
      color: "bg-primary"
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Instant Rewrite",
      desc: "Don't just get feedback—get fixed content. Our AI rewrites generic bullet points into impact statements.",
      color: "bg-amber-500"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      title: "100% Private",
      desc: "Your resume is processed in-memory and via secure API. We never store your personal data.",
      color: "bg-emerald-500"
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent dark:via-slate-900/50 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Why use <span className="text-primary">ResumeBoost?</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Stop guessing why you aren't getting callbacks. We provide the data-driven insights you need to land the interview.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-300 overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 ${f.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
              
              <div className={`w-14 h-14 ${f.color} rounded-xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {f.title}
              </h3>
              
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Infographic Section */}
        <div className="mt-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider rounded-full mb-6">
                The Competitive Edge
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Turn "Applied" into "Interviewed"
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <FileSearch size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Keyword Matching</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">We compare your resume against millions of job descriptions to find exactly what's missing.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Metric Injection</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Our AI detects vague claims and prompts you to add specific numbers, boosting credibility by 40%.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
               {/* Visual mock of a report */}
               <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 blur-3xl opacity-20 rounded-full"></div>
               <div className="relative bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="space-y-2">
                        <div className="h-2 w-24 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        <div className="h-2 w-16 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    </div>
                    <div className="text-3xl font-bold text-green-500">92<span className="text-sm text-slate-400">/100</span></div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500"><ShieldCheck size={14}/></div>
                        <span>ATS Compliant Headers</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500"><Zap size={14}/></div>
                        <span>Strong Action Verbs</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500"><Target size={14}/></div>
                        <span>Quantified Results</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
