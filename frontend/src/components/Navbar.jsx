import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';

const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 bg-warm-bg/90 backdrop-blur-md border-b border-sand-300/50 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Brand Identity Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <FaCar className="text-warm-dark text-lg group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-xl font-extrabold text-warm-dark tracking-tight">
                                DriveWise
                            </span>
                        </Link>
                    </div>

                    {/* Center: Centered Pill Segmented Controller */}
                    <nav className="flex items-center bg-sand-200/80 border border-sand-300/50 p-1 rounded-full shadow-inner">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 ${isActive
                                    ? 'bg-warm-dark text-white shadow-sm'
                                    : 'text-warm-dark/70 hover:text-warm-dark hover:bg-sand-300/40'
                                }`
                            }
                        >
                            <span>Marketplace</span>
                        </NavLink>

                        <NavLink
                            to="/create-ad"
                            className={({ isActive }) =>
                                `px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 ${isActive
                                    ? 'bg-warm-dark text-white shadow-sm'
                                    : 'text-warm-dark/70 hover:text-warm-dark hover:bg-sand-300/40'
                                }`
                            }
                        >
                            <span>Sell Car</span>
                        </NavLink>

                        <NavLink
                            to="/valuation"
                            className={({ isActive }) =>
                                `px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 ${isActive
                                    ? 'bg-warm-dark text-white shadow-sm'
                                    : 'text-warm-dark/70 hover:text-warm-dark hover:bg-sand-300/40'
                                }`
                            }
                        >
                            <span>AI Valuation</span>
                        </NavLink>
                    </nav>

                    {/* Right: Mock User State Profile & Notifications */}
                    <div className="flex items-center space-x-3">
                        {/* Notification Circle Bell */}
                        <button
                            className="relative w-9 h-9 rounded-full bg-white border border-sand-300/60 flex items-center justify-center text-warm-dark hover:bg-sand-100 transition-colors shadow-sm cursor-pointer"
                            title="Notifications"
                        >
                            <span className="text-xs">🔔</span>
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500 border border-white"></span>
                        </button>

                        {/* User Profile avatar */}
                        <div
                            className="w-9 h-9 rounded-full border border-sand-300 hover:border-warm-accent transition-all cursor-pointer overflow-hidden bg-warm-dark text-white flex items-center justify-center text-[10px] font-black shadow-sm"
                            title="Profile Settings"
                        >
                            SG
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
