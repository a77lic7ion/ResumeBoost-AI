import React, { useState, useRef } from 'react';
import { Upload, FileText, Clipboard, AlertCircle, FileType } from 'lucide-react';
import * as mammoth from 'mammoth';
import { extractTextFromMultimodal } from '../services/geminiService';

interface ResumeInputProps {
  onAnalyze: (text: string) => void;
  isProcessing: boolean;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ onAnalyze, isProcessing }) => {
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const processFile = async (file: File) => {
    setExtracting(true);
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        // Plain text
        const reader = new FileReader();
        reader.onload = (e) => {
          setText(e.target?.result as string);
          setExtracting(false);
        };
        reader.readAsText(file);
      } 
      else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.endsWith('.docx')
      ) {
        // DOCX via Mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value);
        setExtracting(false);
      } 
      else if (
        file.type === 'application/pdf' || 
        file.type.startsWith('image/')
      ) {
        // PDF or Image via Gemini Vision
        const base64 = await fileToBase64(file);
        const extracted = await extractTextFromMultimodal(base64, file.type);
        setText(extracted);
        setExtracting(false);
      } 
      else {
        alert("Unsupported file type. Please upload PDF, DOCX, JPG, PNG, or TXT.");
        setExtracting(false);
      }
    } catch (error) {
      console.error("File processing error", error);
      alert("Error reading file. Please try pasting text instead.");
      setExtracting(false);
    }
  };

  const isLoading = isProcessing || extracting;

  return (
    <div className="glass-effect border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl shadow-slate-300/20 dark:shadow-black/50 overflow-hidden">
      <div className="p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Optimize Your Resume</h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          Paste your resume text or upload a file to get started.
        </p>

        {/* Upload Area */}
        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out text-center cursor-pointer
            ${dragActive 
              ? 'border-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20 hover:border-primary/50 dark:hover:border-primary/50'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept=".pdf,.docx,.doc,.txt,.md,.jpg,.jpeg,.png"
            onChange={handleChange}
          />
          
          <div className="flex flex-col items-center justify-center gap-3">
            <div className={`p-4 rounded-full transition-all ${extracting ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-primary/10 dark:bg-primary/20 text-primary'}`}>
              {extracting ? <FileType size={32} /> : <Upload size={32} />}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {extracting ? 'Extracting text...' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Supports PDF, DOCX, JPG, PNG, TXT
              </p>
              {!extracting && (
                <span className="mt-2 inline-block text-primary font-medium hover:underline text-sm">
                  or browse files
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Text Area Divider */}
        <div className="flex items-center my-8">
            <hr className="flex-grow border-slate-200 dark:border-slate-700" />
            <span className="mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">OR PASTE TEXT</span>
            <hr className="flex-grow border-slate-200 dark:border-slate-700" />
        </div>

        {/* Text Area */}
        <div className="relative group">
            <div className="absolute top-3 left-3 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary">
                <FileText size={20} />
            </div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-64 pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
        </div>

        {/* Disclaimer */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <AlertCircle size={14} className="shrink-0" />
            <p>Your data is processed locally and via secure AI API. It is not stored on our servers.</p>
        </div>

        {/* Action Button */}
        <button
            onClick={() => onAnalyze(text)}
            disabled={text.length < 50 || isLoading}
            className={`mt-8 w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0
                ${text.length < 50 || isLoading 
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-hover text-white shadow-primary/25'
                }
            `}
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {extracting ? 'Reading File...' : 'Analyzing Resume...'}
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <Clipboard size={20} />
                    Analyze Resume
                </span>
            )}
        </button>
      </div>
    </div>
  );
};

export default ResumeInput;