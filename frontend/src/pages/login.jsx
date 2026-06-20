import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function Login() {
    const navigate = useNavigate();
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
            setError('Email and password are required.');
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmedEmail)) {
            setError('Please enter a valid email address.');
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

            localStorage.setItem('drivewise_token', token);
            localStorage.setItem('drivewise_user', JSON.stringify(user));

            setSuccessMessage(message || 'Login successful. Redirecting...');

            setTimeout(() => {
                navigate('/');
            }, 500);
        } catch (requestError) {
            const serverMessage = requestError?.response?.data?.message;
            setError(serverMessage || 'Unable to login. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(56,189,248,0.26),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.2),transparent_42%)]"
            />

            <section className="relative mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-xl sm:p-8">
                <p className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                    DriveWise Account
                </p>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Welcome back</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Sign in to access your dashboard and continue your smart driving journey.
                </p>

                <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-slate-200">
                            Email
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
                            className="w-full rounded-xl border border-white/15 bg-slate-800/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-semibold text-slate-200">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-white/15 bg-slate-800/70 px-4 py-3 pr-20 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                disabled={isSubmitting}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-300 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm font-medium text-red-200">
                            {error}
                        </p>
                    )}

                    {successMessage && (
                        <p className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-200">
                            {successMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-extrabold uppercase tracking-[0.09em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-sm text-slate-300">
                    No account yet?{' '}
                    <Link to="/register" className="font-bold text-cyan-300 hover:text-cyan-200">
                        Create one
                    </Link>
                </p>
            </section>
        </main>
    );
}