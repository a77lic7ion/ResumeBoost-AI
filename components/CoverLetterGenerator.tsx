
import React, { useState } from 'react';
import { generateCoverLetter } from '../services/geminiService';
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
      const result = await generateCoverLetter(resumeText, jobDescription);
      setCoverLetter(result);
    } catch (error) {
      console.error(error);
      alert("Failed to generate cover letter.");
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
      element.download = "Cover_Letter.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <PenTool className="text-primary" /> Cover Letter Writer
           </h2>
           <p className="text-gray-500 dark:text-gray-400 mt-2">
             One-click generation of a professional cover letter tailored to your uploaded resume and the target job.
           </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
           {/* Resume Status Badge */}
           <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-xs font-bold border border-green-200 dark:border-green-900/30">
               <CheckCircle2 size={14} /> Uploaded Resume Active
           </div>

           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
             Target Job Description (Optional)
           </label>
           <textarea
             value={jobDescription}
             onChange={(e) => setJobDescription(e.target.value)}
             placeholder="Paste the job description here to tailor the letter specifically to the role..."
             className="w-full h-48 p-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-gray-800 dark:text-gray-200 text-sm"
           />
           <button
             onClick={handleGenerate}
             disabled={loading}
             className={`mt-4 w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 
               ${loading ? 'bg-gray-400 cursor-not-allowed' : 'gradient-btn hover:scale-[1.01]'}`}
           >
             {loading ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
             {loading ? "Writing Letter..." : "Generate Cover Letter"}
           </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-1">Pro Tip</h4>
            <p className="text-sm text-blue-600 dark:text-blue-300">
                Pasting the specific job description helps the AI align your experience with the company's requirements, increasing your chances of getting noticed.
            </p>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 flex flex-col h-[600px]">
         <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 rounded-t-2xl">
             <h3 className="font-bold text-gray-700 dark:text-gray-300">Generated Draft</h3>
             <div className="flex gap-2">
                <button onClick={handleCopy} disabled={!coverLetter} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-500 transition-colors" title="Copy Text">
                    {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18} />}
                </button>
                <button onClick={handleDownload} disabled={!coverLetter} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-500 transition-colors" title="Download TXT">
                    <Download size={18} />
                </button>
             </div>
         </div>
         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
             {coverLetter ? (
                 <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-serif">
                     {coverLetter}
                 </div>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                     <FileText size={48} className="mb-4" />
                     <p>Your cover letter will appear here</p>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
