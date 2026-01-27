
import React from 'react';

const PricingSection: React.FC = () => {
  return (
    <section className="py-32 bg-[#05070A]" id="pricing">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-5xl font-bold text-white tracking-tight">Transparent Professional Pricing</h2>
                <p className="text-gray-500 font-medium">Invest in your professional future with zero recurring fees.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
                {/* Standard Plan */}
                <div className="bg-[#0A0D14] p-12 rounded-[40px] border border-zinc-900 flex flex-col hover:border-zinc-800 transition-colors">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-white">Basic Review</h3>
                        <p className="text-sm text-gray-500 font-medium">Quick analysis for single career applications</p>
                    </div>
                    
                    <div className="mt-10 mb-10">
                        <p className="text-6xl font-bold text-white tracking-tight">5.00 <span className="text-xl font-medium text-gray-600 tracking-normal uppercase ml-1">ZAR</span><span className="text-sm font-medium text-gray-700 tracking-normal normal-case ml-2">/ 1 hour</span></p>
                    </div>
                    
                    <ul className="space-y-6 flex-grow">
                        <li className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-sm font-bold text-gray-300">Unlimited CV Scoring</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-sm font-bold text-gray-300">1 Hour Service Access</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-sm font-bold text-gray-300">Standard Professional Templates</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-sm font-bold text-gray-300">Instant PDF Export</span>
                        </li>
                    </ul>
                    
                    <button className="mt-12 w-full py-5 px-6 border border-zinc-800 text-white text-xs font-extrabold uppercase tracking-[2px] rounded-2xl hover:bg-zinc-800 transition-all">
                        Get Started
                    </button>
                </div>

                {/* Plus Plan */}
                <div className="bg-[#0A0D14] p-12 rounded-[40px] border-2 border-primary relative overflow-hidden flex flex-col shadow-[0_0_50px_rgba(37,99,235,0.15)]">
                    <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-6 py-2 uppercase tracking-[2px] transform rotate-45 translate-x-12 translate-y-4">
                        Most Popular
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-white">Full Access</h3>
                        <p className="text-sm text-gray-500 font-medium">Extended support for thorough career hunters</p>
                    </div>
                    
                    <div className="mt-10 mb-10">
                        <p className="text-6xl font-bold text-white tracking-tight">10.00 <span className="text-xl font-medium text-gray-600 tracking-normal uppercase ml-1">ZAR</span><span className="text-sm font-medium text-gray-700 tracking-normal normal-case ml-2">/ 3 hours</span></p>
                    </div>
                    
                    <ul className="space-y-6 flex-grow">
                        <li className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-sm font-bold text-gray-100">Full Scoring Toolkit</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-sm font-bold text-gray-100">3 Hours Service Access</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-sm font-bold text-gray-100">Bespoke Intelligent Templates</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-sm font-bold text-gray-100">Priority Engine Processing</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-sm font-bold text-gray-100">Expert Letter Drafter</span>
                        </li>
                    </ul>
                    
                    <button className="mt-12 w-full bg-primary text-white text-xs font-extrabold uppercase tracking-[2px] py-5 px-6 rounded-2xl hover:opacity-90 transition-opacity shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
                        Select Plus
                    </button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default PricingSection;
