import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowRight,
    FaShieldAlt,
    FaRoad,
    FaCog,
    FaSlidersH,
    FaBrain
} from 'react-icons/fa';

const LandingPage = () => {
    return (
        <div className="pb-20 transition-colors duration-300 text-warm-dark dark:text-slate-100">
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-0 mb-20">
                {/* Hero Text Info */}
                <div className="lg:col-span-6 space-y-6 animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-sand-300/50 dark:border-slate-800 rounded-full px-4.5 py-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-warm-accent animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-warm-dark/80 dark:text-slate-300">AI-Calibrated Marketplace</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-black text-warm-dark dark:text-slate-100 tracking-tight leading-[1.08] font-sans">
                        Smart Vehicle Selection, <br />
                        <span className="bg-linear-to-r from-warm-dark via-warm-dark to-warm-accent dark:from-slate-100 dark:to-warm-accent bg-clip-text text-transparent">Driven by AI</span>
                        <span className="text-warm-accent font-normal inline-block ml-2 text-4xl animate-bounce">✴</span>
                    </h1>

                    <p className="text-slate-550 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg">
                        Evaluate real-time market value, post verified listings instantly, and explore thousands of certified vehicles with our ML calibration engine.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link
                            to="/dashboard"
                            className="bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                        >
                            <span>Explore Marketplace</span>
                            <FaArrowRight className="text-[10px]" />
                        </Link>
                        <Link
                            to="/valuation"
                            className="bg-white dark:bg-slate-900 hover:bg-sand-100 dark:hover:bg-slate-800 text-warm-dark dark:text-slate-200 border border-sand-300/60 dark:border-slate-700/60 font-bold px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-sm"
                        >
                            AI Valuation Engine
                        </Link>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-sand-300/50 dark:border-slate-800/80">
                        <div>
                            <span className="text-2xl font-black text-warm-dark dark:text-slate-100 block">1.2K+</span>
                            <span className="text-[9px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider">Verified Cars</span>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-warm-dark dark:text-slate-100 block">99.4%</span>
                            <span className="text-[9px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider">AI Accuracy</span>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-warm-dark dark:text-slate-100 block">15ms</span>
                            <span className="text-[9px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider">Calibration</span>
                        </div>
                    </div>
                </div>

                {/* Hero Showcase (Interactive Card mockup mapping the reference UI) */}
                <div className="lg:col-span-6 relative">
                    {/* Background blob shadows */}
                    <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-warm-accent/10 dark:bg-warm-accent/5 blur-3xl -z-10"></div>
                    <div className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full bg-warm-dark/5 blur-3xl -z-10"></div>

                    {/* Clean Mockup Container */}
                    <div className="bg-white dark:bg-slate-900 border border-sand-300/50 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm space-y-6 transition-colors duration-300">
                        {/* Title Mock */}
                        <div className="flex items-center justify-between border-b border-sand-200 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-warm-dark dark:bg-slate-800 text-white flex items-center justify-center text-xs font-bold border dark:border-slate-700">L</div>
                                <div>
                                    <span className="text-xs font-black text-warm-dark dark:text-slate-100 block">Lamborghini Urus</span>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">AI Recommended Bargain</span>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-black text-[9px] uppercase tracking-wider">
                                Great Deal
                            </span>
                        </div>

                        {/* Image Showcase mock */}
                        <div className="aspect-16/10 rounded-2xl overflow-hidden bg-sand-100 dark:bg-slate-950 relative">
                            <img
                                src="https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=800"
                                alt="Lamborghini Urus Showcase"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-3 left-3 bg-warm-dark/85 dark:bg-slate-950/85 text-white text-[9px] px-3 py-1 rounded-full font-bold">
                                ★ 4.98 (124 reviews)
                            </div>
                        </div>

                        {/* Split parameters details */}
                        <div className="grid grid-cols-2 gap-3 text-xs text-warm-dark dark:text-slate-200">
                            <div className="p-3 bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-xl flex items-center gap-2">
                                <FaRoad className="text-slate-400 dark:text-slate-550" />
                                <span className="font-bold">24,500 km</span>
                            </div>
                            <div className="p-3 bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-xl flex items-center gap-2">
                                <FaCog className="text-slate-400 dark:text-slate-550" />
                                <span className="font-bold">Automatic</span>
                            </div>
                        </div>

                        {/* Mock Price Indicator */}
                        <div className="flex items-center justify-between border-t border-sand-200 dark:border-slate-800 pt-4">
                            <div>
                                <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Est. Market Value</span>
                                <span className="text-base font-black text-warm-dark dark:text-slate-100">125,000,000 LKR</span>
                            </div>
                            <Link
                                to="/dashboard"
                                className="bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark font-black px-5 py-2.5 rounded-full text-[10px] uppercase tracking-wider transition-all shadow-sm"
                            >
                                Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="space-y-12 mb-20">
                <div className="text-center max-w-xl mx-auto space-y-2">
                    <h2 className="text-3xl font-black text-warm-dark dark:text-slate-100 tracking-tight">How DriveWise Calibrates Your Search</h2>
                    <p className="text-slate-550 dark:text-slate-450 text-sm">We combine a high-utility directory with live predictive pricing services to find authentic deals.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature Card 1 */}
                    <div className="bg-white dark:bg-slate-900 border border-sand-300/50 dark:border-slate-800 p-8 rounded-4xl shadow-sm space-y-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-sand-100 dark:bg-slate-950 border border-sand-200 dark:border-slate-805 text-warm-accent flex items-center justify-center shadow-inner">
                            <FaSlidersH className="text-lg" />
                        </div>
                        <h3 className="text-lg font-black text-warm-dark dark:text-slate-100 tracking-tight">1. Smart Directory Filtering</h3>
                        <p className="text-slate-550 dark:text-slate-450 text-xs leading-relaxed">
                            Search by brand, fuel class, transmission type, and mileage parameters. Dynamic filters automatically update active deal matrices instantly.
                        </p>
                    </div>

                    {/* Feature Card 2 */}
                    <div className="bg-white dark:bg-slate-900 border border-sand-300/50 dark:border-slate-800 p-8 rounded-4xl shadow-sm space-y-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-sand-100 dark:bg-slate-950 border border-sand-200 dark:border-slate-805 text-warm-accent flex items-center justify-center shadow-inner">
                            <FaBrain className="text-lg" />
                        </div>
                        <h3 className="text-lg font-black text-warm-dark dark:text-slate-100 tracking-tight">2. AI Valuation Engines</h3>
                        <p className="text-slate-550 dark:text-slate-455 text-xs leading-relaxed">
                            Query coefficients directly from live scikit-learn models. Type in specifications to compute estimated market pricing offsets within milliseconds.
                        </p>
                    </div>

                    {/* Feature Card 3 */}
                    <div className="bg-white dark:bg-slate-900 border border-sand-300/50 dark:border-slate-800 p-8 rounded-4xl shadow-sm space-y-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-sand-100 dark:bg-slate-950 border border-sand-200 dark:border-slate-805 text-warm-accent flex items-center justify-center shadow-inner">
                            <FaShieldAlt className="text-lg" />
                        </div>
                        <h3 className="text-lg font-black text-warm-dark dark:text-slate-100 tracking-tight">3. Deal Calibration Labels</h3>
                        <p className="text-slate-550 dark:text-slate-455 text-xs leading-relaxed">
                            Spot verified bargain tags. DriveWise evaluates pricing discrepancies and highlights listings priced lower than market calibration models.
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Call-To-Action Banner (Contrast Dark Container) */}
            <div className="bg-warm-dark text-white rounded-[3rem] p-12 text-center space-y-6 shadow-xl border border-white/5 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-warm-accent/5 blur-2xl"></div>

                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight max-w-xl mx-auto">
                    Ready to Calibrate Pricing for Your Vehicle?
                </h2>

                <p className="text-slate-455 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
                    List your vehicle on the DriveWise database. Our automated machine learning pipelines will calibrate estimate values live while you post.
                </p>

                <div className="pt-2">
                    <Link
                        to="/create-ad"
                        className="bg-warm-accent hover:bg-warm-accent-hover text-warm-dark font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-md inline-flex items-center gap-2"
                    >
                        <span>List Your Vehicle Now</span>
                        <FaArrowRight className="text-[10px]" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
