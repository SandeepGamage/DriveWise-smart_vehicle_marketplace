import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import CreateAdvertisement from './pages/advertisement/CreateAdvertisement.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import AdvertisementDetails from './pages/advertisement/AdvertisementDetails.jsx';
import ValuationCalculator from './pages/valuation/ValuationCalculator.jsx';
import Layout from './components/Layout.jsx';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    {/* Home / Default route redirection */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* Main Marketplace browsing feed */}
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Form to list vehicles and run ML predictive logic */}
                    <Route path="/create-ad" element={<CreateAdvertisement />} />

                    {/* Dedicated Details page route */}
                    <Route path="/advertisement/:id" element={<AdvertisementDetails />} />

                    {/* Standalone AI Valuation Tool route */}
                    <Route path="/valuation" element={<ValuationCalculator />} />

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
    );
}

export default App;