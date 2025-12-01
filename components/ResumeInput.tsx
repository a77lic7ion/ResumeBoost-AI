
import React, { useState, useRef, useEffect } from 'react';
import * as mammoth from 'mammoth';
import { extractTextFromMultimodal } from '../services/geminiService';
import { getSessions, deleteSession } from '../utils/storage';
import { SavedSession } from '../types';
import { Loader2, Trash2, AlertCircle } from 'lucide-react';

interface ResumeInputProps {
  onAnalyze: (text: string, image?: string) => void;
  onLoadSession: (session: SavedSession) => void;
  isProcessing: boolean;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ onAnalyze, onLoadSession, isProcessing }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedImage, setExtractedImage] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string>('');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    setExtractedImage(undefined);
    setFileName(file.name);
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
        try {
            const result = await mammoth.extractRawText({ arrayBuffer });
            setText(result.value);
            const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
            const imgMatch = htmlResult.value.match(/<img[^>]+src=["']([^"']+)["']/);
            if (imgMatch && imgMatch[1]) {
                setExtractedImage(imgMatch[1]);
            }
        } catch (docxError) {
            console.error(docxError);
            setError("Error parsing DOCX file. Please try saving as PDF or plain text.");
        }
        setExtracting(false);
      } 
      else if (
        file.type === 'application/pdf' || 
        file.type.startsWith('image/')
      ) {
        const base64 = await fileToBase64(file);
        try {
            const extracted = await extractTextFromMultimodal(base64, file.type);
            setText(extracted);
        } catch (visionError: any) {
            console.error("Multimodal extraction failed", visionError);
            setError(visionError.message || "Failed to extract text. Check API Key permissions.");
        }
        setExtracting(false);
      } 
      else {
        setError("Unsupported file type. Please upload PDF, DOCX, JPG, PNG, or TXT.");
        setExtracting(false);
      }
    } catch (err: any) {
      console.error("File processing error", err);
      setError("Error reading file. Please try a different file or paste text.");
      setExtracting(false);
    }
  };

  const isLoading = isProcessing || extracting;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Optimize Your Resume Now</h2>
        
        {/* Error Banner */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-start gap-3 animate-fade-in-up">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{error}</div>
            </div>
        )}

        {/* Tabs */}
        <div className="flex border border-gray-200 dark:border-zinc-700 rounded-lg p-1 bg-gray-100 dark:bg-zinc-800 mb-6 max-w-sm mx-auto">
            <button 
                onClick={() => setActiveTab('upload')}
                className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all
                ${activeTab === 'upload' 
                    ? 'bg-white dark:bg-zinc-700 text-primary dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
                Upload File
            </button>
            <button 
                onClick={() => setActiveTab('paste')}
                className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all
                ${activeTab === 'paste' 
                    ? 'bg-white dark:bg-zinc-700 text-primary dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
                Paste Text
            </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[250px] flex flex-col">
            {activeTab === 'upload' ? (
                 <div 
                    className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-zinc-800/50 transition-colors cursor-pointer
                    ${dragActive 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-gray-300 dark:border-zinc-700 hover:border-primary/50'
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
                    
                    {extracting ? (
                         <div className="flex flex-col items-center gap-2">
                             <Loader2 className="w-10 h-10 text-primary animate-spin" />
                             <p className="font-semibold text-gray-800 dark:text-gray-200">Extracting Text...</p>
                         </div>
                    ) : fileName && text ? (
                        <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                            <p className="font-semibold mt-2 text-gray-800 dark:text-gray-200">{fileName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{wordCount} words detected</p>
                            <button onClick={(e) => { e.stopPropagation(); setText(''); setFileName(''); setError(null); }} className="text-xs text-red-500 underline mt-2">Remove File</button>
                        </div>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-4xl text-gray-500 dark:text-gray-400">upload_file</span>
                            <p className="font-semibold mt-2 text-gray-800 dark:text-gray-200">Modern drag-and-drop</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Supported: PDF, DOCX, JPG, PNG, TXT</p>
                        </>
                    )}
                 </div>
            ) : (
                <div className="flex-1 relative">
                    <textarea 
                        className="w-full h-full min-h-[250px] p-4 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400 dark:placeholder-zinc-500 text-gray-800 dark:text-gray-200 outline-none transition-all"
                        placeholder="Paste your resume text content here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                    <span className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">{text.length} characters</span>
                </div>
            )}
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
            <button 
                onClick={() => onAnalyze(text, extractedImage)}
                disabled={text.length < 50 || isLoading}
                className={`gradient-btn text-white font-semibold py-3 px-12 rounded-lg w-full max-w-xs transition-opacity
                 ${text.length < 50 || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} /> Processing...
                    </span>
                ) : 'Analyze Resume'}
            </button>
        </div>

        {/* Saved Sessions (Mini) */}
        {savedSessions.length > 0 && (
             <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700">
                 <p className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Recent Sessions</p>
                 <div className="flex flex-wrap gap-2">
                     {savedSessions.slice(0, 3).map(session => (
                         <div key={session.id} 
                              onClick={() => onLoadSession(session)}
                              className="group flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 px-3 py-1.5 rounded-full cursor-pointer hover:border-primary transition-colors">
                             <span className={`w-2 h-2 rounded-full ${session.analysisResult.score.total >= 80 ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                             <span className="text-xs text-gray-600 dark:text-gray-300 max-w-[100px] truncate">{session.name}</span>
                             <button onClick={(e) => handleDeleteSession(e, session.id)} className="text-gray-400 hover:text-red-500 ml-1">
                                <Trash2 size={12} />
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
        )}
    </div>
  );
};

export default ResumeInput;
