
import React from 'react';
import { AnalysisResult, Issue, IssueSeverity } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, Wand2, Save, Cpu, BrainCircuit, Target } from 'lucide-react';

interface DashboardProps {
  analysis: AnalysisResult;
  onImproveClick: () => void;
  onSave: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, onImproveClick, onSave }) => {
  const { score, issues, aiAnalysis } = analysis;

  const data = [
    { name: 'Format', score: score.breakdown.format, max: 25 },
    { name: 'Content', score: score.breakdown.content, max: 25 },
    { name: 'ATS', score: score.breakdown.atsCompatibility, max: 25 },
    { name: 'Keywords', score: score.breakdown.keywords, max: 15 },
    { name: 'Impact', score: score.breakdown.impact, max: 10 },
  ];

  const getScoreColor = (total: number) => {
    if (total >= 90) return 'text-green-500';
    if (total >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityIcon = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL: return <XCircle className="text-red-500" size={20} />;
      case IssueSeverity.IMPORTANT: return <AlertTriangle className="text-orange-500" size={20} />;
      case IssueSeverity.MINOR: return <CheckCircle className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Action Header */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
         <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Dashboard</span>
            <span className="text-gray-900 dark:text-white font-semibold">Resume Analysis Results</span>
         </div>
         <div className="flex gap-3">
             <button 
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:text-primary transition-colors shadow-sm"
             >
                <Save size={18} /> Save Session
             </button>
         </div>
      </div>

      {/* Top Section: Score & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg dark:shadow-black/20">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Overall ATS Score</h3>
          <div className={`text-7xl font-extrabold mb-4 tracking-tighter ${getScoreColor(score.total)}`}>
            {score.total}
            <span className="text-3xl text-gray-400 dark:text-gray-600 ml-1">/100</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            {score.total >= 80 ? "Excellent! Your resume is ready for applications." : 
             score.total >= 60 ? "Good start, but needs optimization." : 
             "Significant improvements needed to pass ATS."}
          </p>
          <button 
            onClick={onImproveClick}
            className="w-full group flex items-center justify-center gap-2 gradient-btn text-white py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl font-bold"
          >
            <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
            AI Optimize Resume
          </button>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-lg dark:shadow-black/20 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Score Breakdown</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" domain={[0, 25]} hide />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 500 }} 
                    width={80} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#2563EB" />
                    ))}
                    <LabelList dataKey="score" position="right" fill="#94a3b8" fontSize={12} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Analysis Section */}
      {aiAnalysis?.categorizedSkills && aiAnalysis.categorizedSkills.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-lg">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
                  <Cpu size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills Matrix & Optimization</h3>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiAnalysis.categorizedSkills.map((cat, i) => (
                <div key={i} className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
                       <BrainCircuit size={16} /> {cat.category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {cat.skills.map((s, si) => (
                            <span key={si} className="text-xs px-2 py-1 bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded border border-gray-200 dark:border-zinc-600">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
              ))}

              {/* High-Demand Suggestions */}
              {aiAnalysis.suggestedKeywords && aiAnalysis.suggestedKeywords.length > 0 && (
                <div className="md:col-span-2 lg:col-span-3 mt-4 p-5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="text-indigo-600 dark:text-indigo-400" size={18} />
                        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wide">High-Demand Skill Suggestions</h4>
                    </div>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-4">Based on your experience, employers often look for these missing keywords in your industry:</p>
                    <div className="flex flex-wrap gap-2">
                        {aiAnalysis.suggestedKeywords.map((k, i) => (
                            <span key={i} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer hover:bg-indigo-700 transition-colors">
                                <Target size={12} /> {k}
                            </span>
                        ))}
                    </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* AI Analysis Summary */}
      {aiAnalysis && (
        <div className="bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 rounded-2xl p-8 shadow-lg">
          <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white mb-6">
             <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Wand2 size={24} />
             </div>
             Gemini AI Insight
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Executive Summary</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.summary}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Tone Check</h4>
                <p className="text-gray-700 dark:text-gray-300">{aiAnalysis.toneCheck}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Key Strengths</h4>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle size={16} className="mt-1 text-green-500 shrink-0"/>
                        <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">ATS Optimization Checklist</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-zinc-800">
          {issues.length === 0 ? (
             <div className="p-12 text-center">
                <CheckCircle size={32} className="mx-auto text-green-500 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">All Clear!</h4>
             </div>
          ) : (
              issues.map((issue) => (
                <div key={issue.id} className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">{getSeverityIcon(issue.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">{issue.message}</h4>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider
                          ${issue.severity === IssueSeverity.CRITICAL ? 'bg-red-100 text-red-700' : 
                            issue.severity === IssueSeverity.IMPORTANT ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{issue.remediation}</p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
