import React from 'react';

const PricingSection: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-zinc-900/50" id="pricing">
        <div className="container mx-auto px-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing & Plans</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Choose the plan that's right for you.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12 justify-center">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 border border-gray-200 dark:border-zinc-800 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Review Standard</h3>
                    <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Quick 1-hour access</p>
                    <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">5.00 ZAR<span className="text-lg font-medium text-gray-500 dark:text-gray-400"> /hour</span></p>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex-grow">Everything necessary to get started.</p>
                    <ul className="mt-6 space-y-4">
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Create Unlimited Resumes & Cover Letters</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">1 Hour Access Time</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">AI-Powered Resume Builder</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Professional Templates</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Instant Download</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Mobile Money Payments</span>
                        </li>
                    </ul>
                    <button className="mt-8 w-full py-3 px-6 border border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
                        Get Started
                    </button>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl dark:shadow-2xl dark:shadow-primary/20 border border-primary relative overflow-hidden flex flex-col">
                    <span className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-lg">Most Popular</span>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Review Plus</h3>
                    <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">3x more time for job applications</p>
                    <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">10.00 ZAR<span className="text-lg font-medium text-gray-500 dark:text-gray-400"> /3 hours</span></p>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex-grow">Everything in Review Standard, plus extended time for multiple resumes.</p>
                    <ul className="mt-6 space-y-4">
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Create Unlimited Resumes & Cover Letters</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">3 Hours Access Time</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">AI-Powered Resume Builder</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Professional Templates</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Instant Download</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Mobile Money Payments</span>
                        </li>
                        <li className="flex items-start">
                        <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Perfect for Job Applications</span>
                        </li>
                    </ul>
                    <button className="mt-8 w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default PricingSection;