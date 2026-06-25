import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaCar, FaSignInAlt, FaExclamationTriangle, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { goeyToast } from 'goey-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const validateForm = () => {
        const trimmedEmail = formData.email.trim();

        if (!trimmedEmail || !formData.password.trim()) {
            const msg = 'Email and password are required.';
            goeyToast.error('Validation Warning', { description: msg });
            setError(msg);
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmedEmail)) {
            const msg = 'Please enter a valid email address.';
            goeyToast.error('Validation Warning', { description: msg });
            setError(msg);
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/login`, {
                email: formData.email.trim(),
                password: formData.password,
            });

            const { token, user, message } = response.data;

            login(user, token);

            const successMsg = message || 'Welcome back to DriveWise!';
            goeyToast.success('Login Successful', {
                description: successMsg
            });
            setSuccessMessage(successMsg + ' Redirecting...');

            setTimeout(() => {
                if (user.isAdmin) {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/');
                }
            }, 500);
        } catch (requestError) {
            const serverMessage = requestError?.response?.data?.message;
            const errMsg = serverMessage || 'Unable to login. Please try again.';
            goeyToast.error('Login Failed', {
                description: errMsg
            });
            setError(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-[85vh] flex items-center justify-center bg-warm-bg dark:bg-warm-dark px-4 py-12 text-warm-dark dark:text-slate-100 sm:px-8 transition-colors duration-300">
            {/* Background design elements in harmony with main brand */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(235,177,91,0.12),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(26,29,32,0.05),transparent_45%)]"
            />

            <section className="relative w-full max-w-md rounded-[2.5rem] border border-sand-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-[0_20px_50px_rgba(26,29,32,0.06)] sm:p-10 z-10 transition-colors duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-dark dark:bg-slate-850 text-warm-accent border dark:border-slate-700 shadow-md mb-4 animate-fade-in">
                        <FaCar size={28} />
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 dark:border-slate-800 bg-sand-100 dark:bg-slate-850 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-warm-accent animate-pulse" />
                        Account Sign In
                    </div>

                    <h1 className="mt-4 text-3xl font-black tracking-tight text-warm-dark dark:text-slate-100 sm:text-4xl">
                        Welcome back
                        <span className="text-warm-accent ml-1 font-normal">✴</span>
                    </h1>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
                        Sign in to access your smart dashboard, manage your vehicle listings, and view live market valuations.
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block ml-1">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={isSubmitting}
                            className="w-full rounded-2xl border border-sand-300 dark:border-slate-800 bg-sand-100/50 dark:bg-slate-950/40 px-4 py-3.5 text-sm text-warm-dark dark:text-slate-200 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-650 focus:border-warm-accent focus:bg-white focus:dark:bg-slate-950 focus:ring-2 focus:ring-warm-accent/20 disabled:cursor-not-allowed disabled:opacity-75"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-550 block ml-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your account password"
                                autoComplete="current-password"
                                disabled={isSubmitting}
                                className="w-full rounded-2xl border border-sand-300 dark:border-slate-800 bg-sand-100/50 dark:bg-slate-950/40 px-4 py-3.5 pr-12 text-sm text-warm-dark dark:text-slate-200 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-650 focus:border-warm-accent focus:bg-white focus:dark:bg-slate-950 focus:ring-2 focus:ring-warm-accent/20 disabled:cursor-not-allowed disabled:opacity-75"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                disabled={isSubmitting}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-warm-dark dark:hover:text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark font-black py-4 text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaSignInAlt className="text-[10px]" />
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No account yet?{' '}
                    <Link to="/register" className="font-black text-warm-dark dark:text-warm-accent hover:text-warm-accent dark:hover:text-warm-accent-hover transition-colors">
                        Create one now
                    </Link>
                </p>
            </section>
        </main>
    );
}