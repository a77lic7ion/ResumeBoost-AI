
import React, { useState } from 'react';
// Corrected import name to match generateProfessionalLetter in geminiService.ts
import { generateProfessionalLetter } from '../services/geminiService';
import { PenTool, FileText, Loader2, Copy, Check, Download, CheckCircle2 } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface CoverLetterGeneratorProps {
  resumeText: string;
}

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ resumeText }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Corrected function call to match exported member
      const result = await generateProfessionalLetter(resumeText, jobDescription);
      setCoverLetter(result);
    } catch (error) {
      console.error(error);
      alert("Failed to draft professional letter.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      const element = document.createElement("a");
      const file = new Blob([coverLetter], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "Professional_Cover_Letter.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             <PenTool className="text-primary" /> Professional Letter Drafter
           </h2>
           <p className="text-gray-400 mt-2 text-sm">
             Generate a bespoke professional letter tailored to your CV and the specific requirements of the local job market.
           </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-800">
           {/* Resume Status Badge */}
           <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-bold border border-green-500/20 uppercase tracking-widest">
               <CheckCircle2 size={12} /> CV Content Active
           </div>

           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
             Target Job Description (Optional)
           </label>
           <textarea
             value={jobDescription}
             onChange={(e) => setJobDescription(e.target.value)}
             placeholder="Paste the local job description here to align your drafting specifically to the role's needs..."
             className="w-full h-48 p-4 bg-zinc-950/30 border border-zinc-800 rounded-xl focus:border-primary/50 outline-none resize-none text-white text-sm"
           />
           <button
             onClick={handleGenerate}
             disabled={loading}
             className={`mt-4 w-full py-4 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 
               ${loading ? 'bg-zinc-800 cursor-not-allowed text-zinc-600' : 'bg-primary hover:bg-primary-hover hover:scale-[1.01]'}`}
           >
             {loading ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
             {loading ? "Drafting Document..." : "Generate Professional Letter"}
           </button>
        </div>

        <div className="bg-blue-500/10 p-5 rounded-xl border border-blue-500/20">
            <h4 className="font-bold text-blue-100 mb-1 text-sm">Strategic Drafting</h4>
            <p className="text-xs text-blue-300 leading-relaxed">
                Pasting the specific SA job description helps our engine align your unique experience with the employer's core requirements, significantly increasing your chances of reaching the interview stage.
            </p>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800 flex flex-col h-[600px]">
         <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40 rounded-t-2xl">
             <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bespoke Draft</h3>
             <div className="flex gap-2">
                <button onClick={handleCopy} disabled={!coverLetter} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors" title="Copy Text">
                    {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18} />}
                </button>
                <button onClick={handleDownload} disabled={!coverLetter} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors" title="Download TXT">
                    <Download size={18} />
                </button>
             </div>
         </div>
         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
             {coverLetter ? (
                 <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-serif text-zinc-300">
                     {coverLetter}
                 </div>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                     <FileText size={48} className="mb-4 opacity-20" />
                     <p className="text-xs font-bold uppercase tracking-[2px]">Drafting will appear here</p>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
