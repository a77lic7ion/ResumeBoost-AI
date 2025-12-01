
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Clipboard, AlertCircle, FileType, Clock, Trash2, ArrowRight } from 'lucide-react';
import * as mammoth from 'mammoth';
import { extractTextFromMultimodal } from '../services/geminiService';
import { getSessions, deleteSession } from '../utils/storage';
import { SavedSession } from '../types';

interface ResumeInputProps {
  onAnalyze: (text: string, image?: string) => void;
  onLoadSession: (session: SavedSession) => void;
  isProcessing: boolean;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ onAnalyze, onLoadSession, isProcessing }) => {
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedImage, setExtractedImage] = useState<string | undefined>(undefined);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedSessions(getSessions());
  }, []);

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setSavedSessions(getSessions());
  };

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
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const processFile = async (file: File) => {
    setExtracting(true);
    setExtractedImage(undefined);
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
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
        const arrayBuffer = await file.arrayBuffer();
        
        // Extract Text
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value);

        // Attempt to extract Image (Profile Picture)
        try {
            const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
            // Look for any standard img tag with base64 src
            const imgMatch = htmlResult.value.match(/<img[^>]+src=["']([^"']+)["']/);
            if (imgMatch && imgMatch[1]) {
                setExtractedImage(imgMatch[1]);
            }
        } catch (imgError) {
            console.warn("Could not extract image from DOCX", imgError);
        }

        setExtracting(false);
      } 
      else if (
        file.type === 'application/pdf' || 
        file.type.startsWith('image/')
      ) {
        const base64 = await fileToBase64(file);
        const extracted = await extractTextFromMultimodal(base64, file.type);
        setText(extracted);
        // Note: Extracting profile image from PDF/Image via Gemini Vision is complex and not implemented here.
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
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Upload Area */}
      <div className="lg:col-span-2 glass-effect border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl shadow-slate-300/20 dark:shadow-black/50 overflow-hidden flex flex-col">
        <div className="p-6 sm:p-10 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Optimize Your Resume</h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            Paste your resume text or upload a file to get started.
          </p>

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
              </div>
            </div>
          </div>

          <div className="flex items-center my-6">
              <hr className="flex-grow border-slate-200 dark:border-slate-700" />
              <span className="mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">OR PASTE TEXT</span>
              <hr className="flex-grow border-slate-200 dark:border-slate-700" />
          </div>

          <div className="relative group flex-1 min-h-[150px]">
              <div className="absolute top-3 left-3 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary">
                  <FileText size={20} />
              </div>
              <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  className="w-full h-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
          </div>

          {extractedImage && (
             <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300 animate-fade-in-up">
                 <div className="w-8 h-8 rounded-full overflow-hidden border border-green-300 dark:border-green-700 flex-shrink-0">
                     <img src={extractedImage} alt="Extracted" className="w-full h-full object-cover" />
                 </div>
                 <span>Image found in document! It will be included in the preview.</span>
             </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <AlertCircle size={14} className="shrink-0" />
              <p>Your data is processed locally and via secure AI API. It is not stored on our servers.</p>
          </div>

          <button
              onClick={() => onAnalyze(text, extractedImage)}
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

      {/* Saved Sessions Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white/50 dark:bg-slate-800/50 glass-effect border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 h-full flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-slate-500" />
            Recent Resumes
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {savedSessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                No saved resumes found.<br/>Analyze your first resume to save it!
              </div>
            ) : (
              savedSessions.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => onLoadSession(session)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl cursor-pointer hover:border-primary dark:hover:border-primary transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {session.name}
                    </h4>
                    <button 
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end">
                     <span className={`text-xs font-bold px-2 py-0.5 rounded ${session.analysisResult.score.total >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                        Score: {session.analysisResult.score.total}
                     </span>
                     <span className="text-xs text-slate-400">
                        {new Date(session.timestamp).toLocaleDateString()}
                     </span>
                  </div>
                  {session.profileImage && (
                      <div className="absolute top-4 right-8 w-6 h-6 rounded-full border border-slate-200 overflow-hidden">
                          <img src={session.profileImage} className="w-full h-full object-cover" alt="" />
                      </div>
                  )}
                  <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 scale-95 group-hover:scale-100 group-hover:opacity-100 pointer-events-none transition-all duration-300"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeInput;
