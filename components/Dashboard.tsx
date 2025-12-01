import React from 'react';
import { AnalysisResult, Issue, IssueSeverity } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, Wand2, Save } from 'lucide-react';

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
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
         <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Dashboard</span>
            <span className="text-slate-900 dark:text-white font-semibold">Resume Analysis Results</span>
         </div>
         <div className="flex gap-3">
             <button 
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:text-primary transition-colors shadow-sm"
             >
                <Save size={18} /> Save Session
             </button>
         </div>
      </div>

      {/* Top Section: Score & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Card */}
        <div className="glass-effect border border-slate-200 dark:border-slate-700/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg dark:shadow-black/20">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">Overall ATS Score</h3>
          <div className={`text-7xl font-extrabold mb-4 tracking-tighter ${getScoreColor(score.total)}`}>
            {score.total}
            <span className="text-3xl text-slate-400 dark:text-slate-600 ml-1">/100</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            {score.total >= 80 ? "Excellent! Your resume is ready for applications." : 
             score.total >= 60 ? "Good start, but needs optimization." : 
             "Significant improvements needed to pass ATS."}
          </p>
          <button 
            onClick={onImproveClick}
            className="w-full group flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 font-bold"
          >
            <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
            AI Optimize Resume
          </button>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 glass-effect border border-slate-200 dark:border-slate-700/80 rounded-2xl p-8 shadow-lg dark:shadow-black/20 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Score Breakdown</h3>
          {/* Explicit height to fix Recharts warning */}
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
                <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                    }}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#f97316" className="opacity-90 hover:opacity-100 transition-opacity" />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Analysis Summary */}
      {aiAnalysis && (
        <div className="glass-effect border border-indigo-200/50 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/50 to-white/50 dark:from-indigo-900/20 dark:to-slate-900/50 rounded-2xl p-8 shadow-lg">
          <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white mb-6">
             <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Wand2 size={24} />
             </div>
             Gemini AI Analysis
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Executive Summary</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiAnalysis.summary}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Tone Check</h4>
                <p className="text-slate-700 dark:text-slate-300">{aiAnalysis.toneCheck}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Key Strengths</h4>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle size={16} className="mt-1 text-green-500 shrink-0"/>
                        <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-2">Missing Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.missingKeywords.map((k, i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-sm font-medium border border-red-100 dark:border-red-900/30">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="glass-effect border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Optimization Checklist</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700/80">
          {issues.length === 0 ? (
             <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mb-4">
                    <CheckCircle size={32} />
                </div>
                <h4 className="text-lg font-medium text-slate-900 dark:text-white">All Clear!</h4>
                <p className="text-slate-500 dark:text-slate-400">Your resume passed all basic ATS checks.</p>
             </div>
          ) : (
              issues.map((issue) => (
                <div key={issue.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {getSeverityIcon(issue.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">{issue.message}</h4>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider
                          ${issue.severity === IssueSeverity.CRITICAL ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 
                            issue.severity === IssueSeverity.IMPORTANT ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{issue.remediation}</p>
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