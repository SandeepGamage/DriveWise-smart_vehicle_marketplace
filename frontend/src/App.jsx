import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import CreateAdvertisement from './pages/advertisement/CreateAdvertisement.jsx';
import Dashboard from './pages/dashboard/MarketPlace.jsx';
import UserDashboard from './pages/dashboard/userDashboard.jsx';
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';
import AdvertisementDetails from './pages/advertisement/AdvertisementDetails.jsx';
import ValuationCalculator from './pages/valuation/ValuationCalculator.jsx';
import LandingPage from './pages/landing/LandingPage.jsx';
import Layout from './components/Layout.jsx';
import { Login } from './pages/login.jsx'
import { Register } from './pages/register.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { GoeyToaster } from 'goey-toast';
import 'goey-toast/styles.css';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
            <GoeyToaster position="top-right" />
            <Layout>
                <Routes>
                    {/* Home / Landing Page */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Main Marketplace browsing feed */}
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Personal account dashboard */}
                    <Route path="/user-dashboard" element={<UserDashboard />} />

                    {/* Admin management console */}
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />

                    {/* Form to list vehicles and run ML predictive logic */}
                    <Route path="/create-ad" element={<CreateAdvertisement />} />

                    {/* Dedicated Details page route */}
                    <Route path="/advertisement/:id" element={<AdvertisementDetails />} />

                    {/* Standalone AI Valuation Tool route */}
                    <Route path="/valuation" element={<ValuationCalculator />} />

                    <Route path="/login" element={<Login />} />

                    <Route path="/register" element={<Register />} />
    

                    {/* Fallback 404 Route for unmatched paths */}
                    <Route path="*" element={
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-white text-center py-16">
                            <h1 className="text-6xl font-black text-rose-500 tracking-wider">404</h1>
                            <p className="text-slate-400 mt-3 text-sm font-bold">The route configuration path does not exist.</p>
                            <Link to="/dashboard" className="mt-6 bg-slate-900 border border-slate-800 hover:border-slate-700 px-5 py-2.5 rounded-xl hover:text-blue-400 text-xs font-black uppercase tracking-wider transition-all shadow-md">
                                Return to Marketplace
                            </Link>
                        </div>
                    } />
                </Routes>
            </Layout>
        </Router>
        </AuthProvider>
        </ThemeProvider>
    );
}

export default App;