
import React from 'react';

const LandingFeatures: React.FC = () => {
  return (
    <>
    <section className="py-32 bg-[#05070A]">
        <div className="container mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
                <h2 className="text-5xl font-bold text-white tracking-tight">Purpose-Built for the SA Market</h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                    Our intelligent engine is calibrated to mimic the most advanced ATS platforms, giving you a competitive edge in South Africa's professional landscape.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#0A0D14] border border-zinc-900 p-8 rounded-3xl hover:border-primary/30 transition-all group">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-primary group-hover:text-white">psychology</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Neural CV Parsing</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">Advanced models tailored to standard South African CV structures, extracting high-fidelity data points for local screening.</p>
                </div>
                <div className="bg-[#0A0D14] border border-zinc-900 p-8 rounded-3xl hover:border-orange-500/30 transition-all group">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-8 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-orange-500 group-hover:text-white">checklist</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">ATS Synchronisation</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">Simulate screening algorithms used by South Africa's top corporates and international firms to ensure you pass the first hurdle.</p>
                </div>
                <div className="bg-[#0A0D14] border border-zinc-900 p-8 rounded-3xl hover:border-indigo-500/30 transition-all group">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-indigo-500 group-hover:text-white">model_training</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Benchmarked Scoring</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">Algorithmic scoring provides granular feedback based on local industry benchmarks and professional expectations.</p>
                </div>
                <div className="bg-[#0A0D14] border border-zinc-900 p-8 rounded-3xl hover:border-green-500/30 transition-all group">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-8 border border-green-500/20 group-hover:bg-green-500 group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-green-500 group-hover:text-white">school</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Intelligent Support</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">Receive expert suggestions to rephrase bullets and highlight achievements relevant to the South African professional landscape.</p>
                </div>
            </div>
        </div>
    </section>

    <section className="py-32 bg-[#05070A]">
        <div className="container mx-auto px-6">
            <div className="bg-[#0A0D14] rounded-[48px] p-12 md:p-24 border border-zinc-900 relative overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="space-y-10">
                        <div className="inline-flex items-center px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            Recruitment Intelligence
                        </div>
                        <h2 className="text-6xl font-bold text-white tracking-tight leading-[1.1]">
                            Optimise Your Path to the Shortlist
                        </h2>
                        <div className="space-y-12">
                            <div className="flex items-start gap-6">
                                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                                    <span className="material-symbols-outlined text-green-400">text_ad</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Semantic Keyword Mapping</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed font-medium">We look beyond simple words to analyse professional context. Our engine identifies high-value missing skills that SA recruiters prioritise.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                                    <span className="material-symbols-outlined text-orange-400">monitoring</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Professional Impact Metric</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed font-medium">Convert vague job duties into powerful, quantifiable achievements. Our engine helps you prove your professional value to potential employers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <div className="relative bg-[#12141D] p-10 rounded-3xl border border-zinc-800 shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <div className="space-y-2">
                                    <div className="w-24 h-3 bg-zinc-800 rounded-full"></div>
                                    <div className="w-16 h-3 bg-zinc-800/50 rounded-full"></div>
                                </div>
                                <div className="relative">
                                    <svg className="w-20 h-20">
                                        <circle className="text-zinc-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="32" cx="40" cy="40" />
                                        <circle className="text-green-500" strokeWidth="6" strokeDasharray="201.06" strokeDashoffset="16.08" strokeLinecap="round" stroke="currentColor" fill="transparent" r="32" cx="40" cy="40" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-white">92</span>
                                        <span className="text-[8px] font-bold text-gray-500 uppercase">Score</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                        <span className="text-xs font-bold text-gray-300">Format Integrity</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Pass</span>
                                </div>
                                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                        <span className="text-xs font-bold text-gray-300">Keyword Density</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">High</span>
                                </div>
                                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                        <span className="text-xs font-bold text-gray-300">Bullet Strength</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Exc.</span>
                                </div>
                            </div>
                            <div className="mt-8 text-center">
                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[2px]">Optimised in 4.2 Seconds</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    </>
  );
};

export default LandingFeatures;
