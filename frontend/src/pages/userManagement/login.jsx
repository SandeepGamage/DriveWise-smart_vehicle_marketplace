import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
        <main className="login-page">
            <div className="login-gradient" aria-hidden="true" />
            <section className="login-card" aria-label="Login form">
                <p className="login-tag">DriveWise Account</p>
                <h1>Welcome back</h1>
                <p className="login-subtitle">Sign in to continue your smart driving journey.</p>

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                    />

                    <label htmlFor="password">Password</label>
                    <div className="password-wrap">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            disabled={isSubmitting}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword((prev) => !prev)}
                            disabled={isSubmitting}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {error && <p className="login-feedback error">{error}</p>}
                    {successMessage && <p className="login-feedback success">{successMessage}</p>}

                    <button type="submit" className="login-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="login-footer">
                    New to DriveWise? <Link to="/">Go to home</Link>
                </p>
            </section>
        </main>
    );
}