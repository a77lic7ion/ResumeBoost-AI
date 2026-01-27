
import React from 'react';
import { AnalysisResult, Issue, IssueSeverity } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, Wand2, Save, Cpu, BrainCircuit, Copy } from 'lucide-react';

interface DashboardProps {
  analysis: AnalysisResult;
  onImproveClick: () => void;
  onSave: () => void;
  onSaveAs: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, onImproveClick, onSave, onSaveAs }) => {
  const { score, issues, aiAnalysis } = analysis;

  const data = [
    { name: 'Format', score: score.breakdown.format, max: 20 },
    { name: 'Content', score: score.breakdown.content, max: 20 },
    { name: 'ATS', score: score.breakdown.atsCompatibility, max: 30 },
    { name: 'Keywords', score: score.breakdown.keywords, max: 15 },
    { name: 'Impact', score: score.breakdown.impact, max: 15 },
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
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 shadow-sm gap-4">
         <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Analysis Engine Report</span>
            <span className="text-white font-semibold">Professional Performance Results</span>
         </div>
         <div className="flex flex-wrap gap-2 w-full sm:w-auto">
             <button onClick={onSave} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-colors">
                <Save size={16} /> Update
             </button>
             <button onClick={onSaveAs} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-colors">
                <Copy size={16} /> Save As...
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-lg">
          <h3 className="text-base font-bold text-gray-400 mb-2 uppercase tracking-widest">Aggregate Score</h3>
          <div className={`text-6xl md:text-7xl font-extrabold mb-4 tracking-tighter ${getScoreColor(score.total)}`}>
            {score.total}
            <span className="text-2xl text-zinc-600 ml-1">/100</span>
          </div>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-[240px]">
            {score.total >= 80 ? "Your profile meets high-tier professional screening standards." : 
             score.total >= 60 ? "Solid foundation, but targeted refinement is recommended." : 
             "Significant structural optimization is required for modern tracking systems."}
          </p>
          <button onClick={onImproveClick} className="w-full group flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-4 px-6 rounded-xl transition-all shadow-lg font-bold text-sm uppercase tracking-wider">
            <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
            Refine Profile
          </button>
        </div>

        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-lg flex flex-col min-h-[300px]">
          <h3 className="text-lg font-bold text-white mb-6">Component Performance</h3>
          <div className="w-full flex-1">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" domain={[0, 30]} hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#71717a', fontWeight: 600 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px'}} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                    {data.map((_, index) => <Cell key={`cell-${index}`} fill="#2563EB" />)}
                    <LabelList dataKey="score" position="right" fill="#a1a1aa" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {aiAnalysis?.categorizedSkills && aiAnalysis.categorizedSkills.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-lg">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Cpu size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Extracted Skills Matrix</h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {aiAnalysis.categorizedSkills.map((cat, i) => (
                <div key={i} className="space-y-3 p-4 rounded-xl bg-zinc-950/30 border border-zinc-800">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                       <BrainCircuit size={14} /> {cat.category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {cat.skills.map((s, si) => (
                            <span key={si} className="text-[10px] px-2 py-1 bg-zinc-800 text-gray-300 rounded border border-zinc-700">{s}</span>
                        ))}
                    </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-lg">
          <h3 className="flex items-center gap-3 text-lg font-bold text-white mb-6">
             <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Wand2 size={20} />
             </div>
             Engine Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Executive Overview</h4>
                <p className="text-gray-400 leading-relaxed text-sm">{aiAnalysis.summary}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Linguistic Check</h4>
                <p className="text-gray-400 text-sm italic">{aiAnalysis.toneCheck}</p>
              </div>
            </div>
            <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Identified Strengths</h4>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                        <CheckCircle size={14} className="mt-1 text-green-500 shrink-0"/>
                        <span>{s}</span>
                    </li>
                  ))}
                </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950/20">
          <h3 className="text-lg font-bold text-white">Screening Optimization Checklist</h3>
        </div>
        <div className="divide-y divide-zinc-800">
          {issues.length === 0 ? (
             <div className="p-12 text-center text-zinc-600 italic">No structural issues detected by the engine.</div>
          ) : (
              issues.map((issue) => (
                <div key={issue.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="mt-1">{getSeverityIcon(issue.severity)}</div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                        <h4 className="text-sm font-bold text-white">{issue.message}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase w-fit ${issue.severity === IssueSeverity.CRITICAL ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-xs leading-relaxed">{issue.remediation}</p>
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
