import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaCar, FaSignOutAlt, FaSignInAlt, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-warm-bg/90 dark:bg-warm-dark/90 backdrop-blur-md border-b border-sand-300/50 dark:border-slate-800/80 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Brand Identity Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <FaCar className="text-warm-dark dark:text-slate-300 text-lg group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-xl font-extrabold text-warm-dark dark:text-slate-100 tracking-tight">
                                DriveWise
                            </span>
                        </Link>
                    </div>

                    {/* Center: Centered Pill Segmented Controller */}
                    <nav className="flex items-center bg-sand-200/80 dark:bg-slate-800/80 border border-sand-300/50 dark:border-slate-700/50 p-1 rounded-full shadow-inner">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 ${isActive
                                    ? 'bg-warm-dark dark:bg-warm-accent text-white dark:text-warm-dark shadow-sm'
                                    : 'text-warm-dark/70 dark:text-slate-300 hover:text-warm-dark dark:hover:text-white hover:bg-sand-300/40 dark:hover:bg-slate-700/40'
                                }`
                            }
                        >
                            <span>Marketplace</span>
                        </NavLink>

                        <NavLink
                            to="/create-ad"
                            className={({ isActive }) =>
                                `px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 ${isActive
                                    ? 'bg-warm-dark dark:bg-warm-accent text-white dark:text-warm-dark shadow-sm'
                                    : 'text-warm-dark/70 dark:text-slate-300 hover:text-warm-dark dark:hover:text-white hover:bg-sand-300/40 dark:hover:bg-slate-700/40'
                                }`
                            }
                        >
                            <span>Sell Car</span>
                        </NavLink>

                        <NavLink
                            to="/valuation"
                            className={({ isActive }) =>
                                `px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 ${isActive
                                    ? 'bg-warm-dark dark:bg-warm-accent text-white dark:text-warm-dark shadow-sm'
                                    : 'text-warm-dark/70 dark:text-slate-300 hover:text-warm-dark dark:hover:text-white hover:bg-sand-300/40 dark:hover:bg-slate-700/40'
                                }`
                            }
                        >
                            <span>AI Valuation</span>
                        </NavLink>
                    </nav>

                    {/* Right: Dynamic User State Profile & Notifications */}
                    <div className="flex items-center space-x-3">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-full bg-white dark:bg-warm-dark-card border border-sand-300/60 dark:border-slate-700/60 flex items-center justify-center text-warm-dark dark:text-slate-300 hover:bg-sand-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDark ? <FaSun className="text-amber-450 text-xs" /> : <FaMoon className="text-slate-500 text-xs" />}
                        </button>

                        {user ? (
                            <>
                                {/* User Profile avatar */}

                                <Link
                                    to="/user-dashboard"
                                    className="w-9 h-9 rounded-full border border-sand-300 dark:border-slate-700 hover:border-warm-accent dark:hover:border-warm-accent transition-all cursor-pointer overflow-hidden bg-warm-dark text-white flex items-center justify-center text-[10px] font-black shadow-sm"
                                    title="Open user dashboard"
                                >
                                    {user.profilePic ? (
                                        <img src={user.profilePic} alt={user.userName || 'Profile'} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{user.userName?.slice(0, 2)?.toUpperCase() || 'U'}</span>
                                    )}
                                </Link>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-transparent text-warm-dark dark:text-slate-300 border border-sand-300/60 dark:border-slate-700/60 hover:bg-sand-100 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-455 transition-all duration-300 cursor-pointer shadow-sm flex items-center space-x-1"
                                    title="Logout"
                                >
                                    <FaSignOutAlt className="text-[10px]" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-warm-dark dark:bg-warm-accent text-white dark:text-warm-dark hover:bg-warm-accent hover:text-warm-dark dark:hover:bg-warm-accent-hover transition-all duration-300 shadow-md flex items-center space-x-1.5"
                            >
                                <FaSignInAlt className="text-[10px]" />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
