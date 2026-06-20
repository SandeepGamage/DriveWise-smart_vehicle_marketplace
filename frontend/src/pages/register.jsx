import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        phoneNum: '',
    });
    const [profilePic, setProfilePic] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setProfilePic(file);
    };

    const validateForm = () => {
        const { userName, email, password, phoneNum } = formData;

        if (!userName.trim() || !email.trim() || !password.trim() || !phoneNum.trim() || !profilePic) {
            setError('All required fields must be provided.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('Invalid email format.');
            return false;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNum.trim())) {
            setError('Invalid phone number format. Use exactly 10 digits.');
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
            const payload = new FormData();
            payload.append('userName', formData.userName.trim());
            payload.append('email', formData.email.trim());
            payload.append('password', formData.password);
            payload.append('phoneNum', formData.phoneNum.trim());
            payload.append('profilePic', profilePic);

            const response = await axios.post(`${API_BASE_URL}/api/user/register`, payload);
            setSuccessMessage(response.data?.message || 'Registered successfully! Redirecting to login...');

            setTimeout(() => {
                navigate('/login');
            }, 700);
        } catch (requestError) {
            const serverMessage = requestError?.response?.data?.message;
            setError(serverMessage || 'Unable to register. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(34,211,238,0.22),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.18),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.22),transparent_46%)]"
            />

            <section className="relative mx-auto w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-xl sm:p-8">
                <p className="inline-flex rounded-full border border-orange-300/25 bg-orange-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">
                    New DriveWise Account
                </p>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Create account</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Register with your details to start using DriveWise features.
                </p>

                <form className="mt-7 grid gap-5" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-2">
                        <label htmlFor="userName" className="text-sm font-semibold text-slate-200">
                            Username
                        </label>
                        <input
                            id="userName"
                            name="userName"
                            type="text"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="Your name"
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-white/15 bg-slate-800/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
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
                            <label htmlFor="phoneNum" className="text-sm font-semibold text-slate-200">
                                Phone Number
                            </label>
                            <input
                                id="phoneNum"
                                name="phoneNum"
                                type="tel"
                                value={formData.phoneNum}
                                onChange={handleChange}
                                placeholder="0771234567"
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-white/15 bg-slate-800/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-semibold text-slate-200">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 6 characters"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-white/15 bg-slate-800/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="profilePic" className="text-sm font-semibold text-slate-200">
                            Profile Picture
                        </label>
                        <input
                            id="profilePic"
                            name="profilePic"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-white/15 bg-slate-800/70 px-4 py-3 text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-slate-950 hover:file:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                        />
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
                        className="w-full rounded-xl bg-gradient-to-r from-orange-300 to-cyan-300 px-4 py-3 text-sm font-extrabold uppercase tracking-[0.09em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-6 text-sm text-slate-300">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-cyan-300 hover:text-cyan-200">
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}
