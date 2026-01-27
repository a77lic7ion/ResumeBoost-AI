
import React, { useState, useRef, useEffect } from 'react';
import * as mammoth from 'mammoth';
import { extractTextFromMultimodal } from '../services/geminiService';
import { getSessions, deleteSession } from '../utils/storage';
import { SavedSession } from '../types';
import { Loader2, Trash2, AlertCircle, Camera, Link as LinkIcon, CheckCircle2, HelpCircle } from 'lucide-react';

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
  const [manualImage, setManualImage] = useState<string | undefined>(undefined);
  
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
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
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setManualImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processFile = async (file: File) => {
    setExtracting(true);
    setError(null);
    setExtractedImage(undefined);
    setFileName(file.name);
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => { setText(e.target?.result as string); setExtracting(false); };
        reader.readAsText(file);
      } 
      else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value);
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        const imgMatch = htmlResult.value.match(/<img[^>]+src=["']([^"']+)["']/);
        if (imgMatch) setExtractedImage(imgMatch[1]);
        setExtracting(false);
      } 
      else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            try {
                const extracted = await extractTextFromMultimodal(base64Data, file.type);
                setText(extracted);
            } catch (visionError: any) {
                setError("Service extraction failed. Please check connection.");
            }
            setExtracting(false);
        };
        reader.readAsDataURL(file);
      } 
      else {
        setError("Unsupported file format.");
        setExtracting(false);
      }
    } catch (err: any) {
      setError("Error reading file.");
      setExtracting(false);
    }
  };

  const handleAnalyzeClick = () => {
      onAnalyze(text, manualImage || extractedImage);
  };

  const isLoading = isProcessing || extracting;

  return (
    <div className="w-full max-w-[540px] glass-effect p-10 rounded-[32px] shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-10">Optimise Your CV Now</h2>
        
        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-red-400">{error}</div>
            </div>
        )}

        <div className="grid grid-cols-[auto,1fr] gap-8 mb-10">
            <div className="flex flex-col items-center gap-3">
                <div 
                    onClick={() => photoInputRef.current?.click()}
                    className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-800 hover:border-primary cursor-pointer flex items-center justify-center overflow-hidden bg-zinc-900 transition-colors"
                >
                    {(manualImage || extractedImage) ? (
                        <img src={manualImage || extractedImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <Camera className="text-zinc-700" size={20} />
                    )}
                </div>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest text-center leading-tight">Add Photo</span>
                <input ref={photoInputRef} type="file" accept="image/png, image/jpeg" className="hidden" onChange={handlePhotoUpload} />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">LinkedIn Profile (Optional)</label>
                    <div className="flex items-center gap-1 cursor-help">
                        <HelpCircle size={10} className="text-primary" />
                        <span className="text-[9px] text-primary font-bold hover:underline">How to find URL?</span>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <LinkIcon size={12} className="text-zinc-700" />
                    </div>
                    <input 
                        type="text" 
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="w-full pl-9 pr-4 py-3 bg-white/5 border border-zinc-800/50 rounded-xl outline-none text-xs text-white placeholder:text-zinc-700 focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>
        </div>

        <div className="flex bg-zinc-900/50 rounded-xl p-1 mb-8">
            <button onClick={() => setActiveTab('upload')} className={`flex-1 py-3.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'upload' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}>Upload File</button>
            <button onClick={() => setActiveTab('paste')} className={`flex-1 py-3.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'paste' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}>Paste Text</button>
        </div>

        <div className="min-h-[220px] flex flex-col mb-8">
            {activeTab === 'upload' ? (
                 <div 
                    className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-10 text-center transition-all cursor-pointer ${dragActive ? 'border-primary bg-primary/5' : 'border-zinc-800 bg-zinc-950/30'}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                 >
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.txt,.md,.jpg,.png" onChange={handleChange} />
                    {extracting ? (
                         <div className="flex flex-col items-center gap-4">
                             <Loader2 className="w-10 h-10 text-primary animate-spin" />
                             <p className="text-xs font-bold text-white uppercase tracking-widest">Analysing...</p>
                         </div>
                    ) : fileName && text ? (
                        <div className="flex flex-col items-center gap-3">
                            <CheckCircle2 className="text-green-500" size={32} />
                            <p className="text-sm font-bold text-white">{fileName}</p>
                            <button onClick={(e) => {e.stopPropagation(); setText(''); setFileName('');}} className="text-[10px] text-zinc-500 hover:text-white underline">Remove</button>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 border border-primary/20">
                                <span className="material-symbols-outlined text-primary">cloud_upload</span>
                            </div>
                            <p className="text-base font-bold text-white mb-2">Drop your CV here</p>
                            <p className="text-xs text-gray-500">PDF, DOCX, or Image (Max 10MB)</p>
                        </>
                    )}
                 </div>
            ) : (
                <textarea 
                    className="w-full h-full min-h-[220px] p-6 bg-zinc-950/30 border border-zinc-800 rounded-3xl resize-none outline-none text-white text-sm placeholder:text-zinc-800 focus:border-primary/50 transition-colors"
                    placeholder="Paste your CV content here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                ></textarea>
            )}
        </div>

        <button 
            onClick={handleAnalyzeClick}
            disabled={text.length < 50 || isLoading}
            className={`w-full bg-white text-black font-extrabold py-4 rounded-xl text-xs uppercase tracking-[2px] transition-all ${text.length < 50 || isLoading ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
        >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Analyse CV'}
        </button>
    </div>
  );
};

export default ResumeInput;
