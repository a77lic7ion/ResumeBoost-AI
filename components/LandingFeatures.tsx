import React from 'react';

const LandingFeatures: React.FC = () => {
  return (
    <>
    <section className="py-24 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Why Choose ResumeBoost?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 mb-4">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">psychology</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Parsing</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Parsing AI seamlessly converts your documents into structured data to evaluate your career potential.</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/50 mb-4">
                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">checklist</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ATS Simulation</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Improve your ATS score to land more interviews by aligning with automated screening criteria.</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 mb-4">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">model_training</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Process Scoring</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">We use smart algorithms to enhance examination and training feedback loops.</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/50 mb-4">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">school</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Showing</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Optimize key data points and learn with common optimization strategies.</p>
            </div>
        </div>
        </div>
    </section>

    <section className="py-24 bg-background-dark">
        <div className="container mx-auto px-6">
            <div className="bg-[#12141D] rounded-3xl p-8 md:p-16 border border-zinc-800">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                <div className="bg-[#292244] text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                            THE COMPETITIVE EDGE
                            </div>
                <h2 className="text-4xl font-bold text-white mb-8">
                            Turn "Applied" into "Interviewed"
                            </h2>
                <div className="space-y-8">
                <div>
                <div className="flex items-start gap-4">
                <div className="bg-green-900/50 p-2 rounded-lg border border-green-700/60">
                <span className="material-symbols-outlined text-green-400">text_ad</span>
                </div>
                <div>
                <h3 className="text-lg font-semibold text-white">Keyword Matching</h3>
                <p className="text-gray-400 mt-1">We compare your resume against millions of job descriptions to find exactly what's missing.</p>
                </div>
                </div>
                </div>
                <div>
                <div className="flex items-start gap-4">
                <div className="bg-orange-900/50 p-2 rounded-lg border border-orange-700/60">
                <span className="material-symbols-outlined text-orange-400">monitoring</span>
                </div>
                <div>
                <h3 className="text-lg font-semibold text-white">Metric Injection</h3>
                <p className="text-gray-400 mt-1">Our AI detects vague claims and prompts you to add specific numbers, boosting credibility by 40%.</p>
                </div>
                </div>
                </div>
                </div>
                </div>
                <div className="bg-[#1C2030] p-6 rounded-2xl border border-zinc-800 shadow-2xl shadow-black/30 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-center mb-6">
                <div className="w-1/3 h-2 bg-zinc-700 rounded-full"></div>
                <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-green-400">92</span>
                <span className="text-sm text-gray-400">/100</span>
                </div>
                </div>
                <div className="space-y-4">
                <div className="flex items-center">
                <span className="material-symbols-outlined text-green-400 mr-3">check_circle</span>
                <span className="text-gray-300">ATS Compliant Headers</span>
                </div>
                <div className="flex items-center">
                <span className="material-symbols-outlined text-green-400 mr-3">check_circle</span>
                <span className="text-gray-300">Strong Action Verbs</span>
                </div>
                <div className="flex items-center">
                <span className="material-symbols-outlined text-green-400 mr-3">check_circle</span>
                <span className="text-gray-300">Quantified Results</span>
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