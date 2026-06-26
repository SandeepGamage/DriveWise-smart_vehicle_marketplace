import React from 'react';
import Navbar from './Navbar';
import { FaHeart, FaGithub, FaCar, FaShieldAlt } from 'react-icons/fa';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-warm-bg dark:bg-warm-dark text-warm-dark dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
            {/* Navigation Bar */}
            <Navbar />

            {/* Main Application Feed */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Premium Dark Footer */}
            <footer className="bg-warm-dark text-slate-300 border-t border-sand-300/10 mt-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4 col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2.5">
                            <span className="text-2xl">🚗</span>
                            <span className="text-xl font-black bg-gradient-to-r from-warm-accent to-amber-500 bg-clip-text text-transparent tracking-tight">
                                DriveWise
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                            The intelligent, data-driven vehicle marketplace. Get real-time valuation, dynamic pricing calibration, and buy or sell vehicles with AI verification metrics.
                        </p>
                        <div className="flex items-center space-x-1.5 text-slate-500 text-xs">
                            <span>Designed with</span>
                            <FaHeart className="text-rose-500 animate-pulse text-[10px]" />
                            <span>for smart auto enthusiasts.</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Navigation</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li>
                                <a href="/" className="hover:text-warm-accent transition-colors">Home Landing Page</a>
                            </li>
                            <li>
                                <a href="/dashboard" className="hover:text-warm-accent transition-colors">Marketplace Directory</a>
                            </li>
                            <li>
                                <a href="/create-ad" className="hover:text-warm-accent transition-colors">Sell Your Car</a>
                            </li>
                            <li>
                                <span className="text-slate-650 cursor-not-allowed">AI Valuation Engine (Live)</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">System & Security</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li className="flex items-center space-x-1.5">
                                <FaShieldAlt className="text-emerald-500" />
                                <span>SSL Encrypted Data</span>
                            </li>
                            <li className="flex items-center space-x-1.5">
                                <FaCar className="text-warm-accent" />
                                <span>1,200+ Verified Ads</span>
                            </li>
                            <li className="flex items-center space-x-1.5">
                                <FaGithub className="text-slate-450" />
                                <span>Open Source Engine</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto border-t border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
                    <p>&copy; {new Date().getFullYear()} DriveWise Vehicle Marketplace. All rights reserved.</p>
                    <p className="mt-2 sm:mt-0 font-mono">Build v2.1.0-Release (2026-Q2)</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
