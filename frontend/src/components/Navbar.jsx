import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaCar, FaPlus, FaList, FaBrain } from 'react-icons/fa';

const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Brand Identity Logo */}
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center space-x-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-200">
                                <FaCar className="text-white text-base" />
                            </div>
                            <span className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                                DriveWise
                            </span>
                        </Link>
                    </div>

                    {/* Center: Main Route NavLinks */}
                    <nav className="flex items-center space-x-1 sm:space-x-2">
                        <NavLink 
                            to="/dashboard" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center space-x-1.5 ${
                                    isActive 
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                                }`
                            }
                        >
                            <FaList className="text-xs" />
                            <span>Browse Cars</span>
                        </NavLink>

                        <NavLink 
                            to="/create-ad" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center space-x-1.5 ${
                                    isActive 
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                                }`
                            }
                        >
                            <FaPlus className="text-xs" />
                            <span>Sell Car</span>
                        </NavLink>

                        <NavLink 
                            to="/valuation" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center space-x-1.5 ${
                                    isActive 
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                                }`
                            }
                        >
                            <FaBrain className="text-xs" />
                            <span>AI Valuation</span>
                        </NavLink>
                    </nav>

                    {/* Right: Mock User State Profile */}
                    <div className="flex items-center space-x-3.5">
                        <div className="hidden sm:flex flex-col items-end text-[10px]">
                            <span className="font-bold text-slate-300">Savin Gamage</span>
                            <span className="text-emerald-400 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                                <span>Verified Dealer</span>
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-700 hover:border-blue-500 transition-colors duration-200 cursor-pointer overflow-hidden flex items-center justify-center text-xs font-black text-blue-400 shadow-inner">
                            SG
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;