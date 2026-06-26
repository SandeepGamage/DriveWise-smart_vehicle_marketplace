import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaCar, FaUserPlus, FaExclamationTriangle, FaCheckCircle, FaImage } from 'react-icons/fa';
import { goeyToast } from 'goey-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

        if (!userName.trim() || !email.trim() || !password.trim() || !phoneNum.trim()) {
            const msg = 'All required fields must be provided.';
            goeyToast.error('Validation Warning', { description: msg });
            setError(msg);
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            const msg = 'Invalid email format.';
            goeyToast.error('Validation Warning', { description: msg });
            setError(msg);
            return false;
        }

        if (password.length < 6) {
            const msg = 'Password must be at least 6 characters long.';
            goeyToast.error('Validation Warning', { description: msg });
            setError(msg);
            return false;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNum.trim())) {
            const msg = 'Invalid phone number format. Use exactly 10 digits.';
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
            const payload = new FormData();
            payload.append('userName', formData.userName.trim());
            payload.append('email', formData.email.trim());
            payload.append('password', formData.password);
            payload.append('phoneNum', formData.phoneNum.trim());
            if (profilePic) {
                payload.append('profilePic', profilePic);
            }

            const response = await axios.post(`${API_BASE_URL}/api/user/register`, payload);
            const successMsg = response.data?.message || 'Registered successfully!';
            goeyToast.success('Registered Successfully', {
                description: successMsg
            });
            setSuccessMessage(successMsg + ' Redirecting to login...');

            setTimeout(() => {
                navigate('/login');
            }, 700);
        } catch (requestError) {
            const serverMessage = requestError?.response?.data?.message;
            const errMsg = serverMessage || 'Unable to register. Please try again.';
            goeyToast.error('Registration Failed', {
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

            <section className="relative w-full max-w-lg rounded-[2.5rem] border border-sand-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-[0_20px_50px_rgba(26,29,32,0.06)] sm:p-10 z-10 transition-colors duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-dark dark:bg-slate-850 text-warm-accent border dark:border-slate-700 shadow-md mb-4 animate-fade-in">
                        <FaCar size={28} />
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 dark:border-slate-800 bg-sand-100 dark:bg-slate-850 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-warm-accent animate-pulse" />
                        Registration Portal
                    </div>

                    <h1 className="mt-4 text-3xl font-black tracking-tight text-warm-dark dark:text-slate-100 sm:text-4xl">
                        Create Account
                        <span className="text-warm-accent ml-1 font-normal">✴</span>
                    </h1>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
                        Register your driver profile to access the DriveWise smart marketplace and live evaluation models.
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-2">
                        <label htmlFor="userName" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block ml-1">
                            Username
                        </label>
                        <input
                            id="userName"
                            name="userName"
                            type="text"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="Your full name or display name"
                            disabled={isSubmitting}
                            className="w-full rounded-2xl border border-sand-300 dark:border-slate-800 bg-sand-100/50 dark:bg-slate-950/40 px-4 py-3.5 text-sm text-warm-dark dark:text-slate-200 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-650 focus:border-warm-accent focus:bg-white focus:dark:bg-slate-950 focus:ring-2 focus:ring-warm-accent/20 disabled:cursor-not-allowed disabled:opacity-75"
                        />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-550 block ml-1">
                                Email Address
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
                            <label htmlFor="phoneNum" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-550 block ml-1">
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
                                className="w-full rounded-2xl border border-sand-300 dark:border-slate-800 bg-sand-100/50 dark:bg-slate-950/40 px-4 py-3.5 text-sm text-warm-dark dark:text-slate-200 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-650 focus:border-warm-accent focus:bg-white focus:dark:bg-slate-950 focus:ring-2 focus:ring-warm-accent/20 disabled:cursor-not-allowed disabled:opacity-75"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-550 block ml-1">
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
                            className="w-full rounded-2xl border border-sand-300 dark:border-slate-800 bg-sand-100/50 dark:bg-slate-950/40 px-4 py-3.5 text-sm text-warm-dark dark:text-slate-200 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-650 focus:border-warm-accent focus:bg-white focus:dark:bg-slate-950 focus:ring-2 focus:ring-warm-accent/20 disabled:cursor-not-allowed disabled:opacity-75"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-550 block ml-1">
                            Profile Picture
                        </label>
                        <div className="rounded-2xl border border-dashed border-sand-300 dark:border-slate-800 bg-sand-100/50 dark:bg-slate-950/40 px-4 py-4 relative">
                            <input
                                id="profilePic"
                                name="profilePic"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                                className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-warm-dark dark:file:bg-warm-accent file:px-4 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:text-white dark:file:text-warm-dark hover:file:bg-warm-dark-card dark:hover:file:bg-warm-accent-hover cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                            />
                            <p className="mt-2 flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-550">
                                <FaImage className="text-slate-455 shrink-0" />
                                {profilePic ? profilePic.name : 'PNG, JPG, WEBP recommended'}
                            </p>
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark font-black py-4 text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaUserPlus className="text-[10px]" />
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="font-black text-warm-dark dark:text-warm-accent hover:text-warm-accent dark:hover:text-warm-accent-hover transition-colors">
                        Sign in instead
                    </Link>
                </p>
            </section>
        </main>
    );
}
