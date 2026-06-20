import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaCar, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto transition-all duration-300">
            <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl sm:rounded-full shadow-[0_8px_32px_0_rgba(26,29,32,0.06)] px-6 py-2 transition-all duration-300">
                <div className="flex items-center justify-between h-12">
                    {/* Left: Brand Identity Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <FaCar className="text-warm-dark text-lg group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-xl font-extrabold text-warm-dark tracking-tight">
                                DriveWise
                            </span>
                        </Link>
                    </div>

                    {/* Center: Centered Pill Segmented Controller (hidden on mobile, visible on desktop) */}
                    <nav className="hidden md:flex items-center bg-sand-200/80 border border-sand-300/50 p-1 rounded-full shadow-inner">
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

                    {/* Right: User State, Notifications, and Hamburger Button */}
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

                        {/* Mobile Toggle Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden w-9 h-9 rounded-full bg-white border border-sand-300/60 flex items-center justify-center text-warm-dark hover:bg-sand-100 transition-colors shadow-sm cursor-pointer"
                            title="Toggle Menu"
                        >
                            {isOpen ? <FaTimes className="text-sm" /> : <FaBars className="text-sm" />}
                        </button>
                    </div>
                </div>

                {/* Collapsible Slide Down Menu for Mobile */}
                {isOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-sand-300/40 flex flex-col space-y-2">
                        <NavLink
                            to="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center ${isActive
                                    ? 'bg-warm-dark text-white shadow-sm'
                                    : 'text-warm-dark/80 hover:bg-white/30'
                                }`
                            }
                        >
                            Marketplace
                        </NavLink>
                        <NavLink
                            to="/create-ad"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center ${isActive
                                    ? 'bg-warm-dark text-white shadow-sm'
                                    : 'text-warm-dark/80 hover:bg-white/30'
                                }`
                            }
                        >
                            Sell Car
                        </NavLink>
                        <NavLink
                            to="/valuation"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center ${isActive
                                    ? 'bg-warm-dark text-white shadow-sm'
                                    : 'text-warm-dark/80 hover:bg-white/30'
                                }`
                            }
                        >
                            AI Valuation
                        </NavLink>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
