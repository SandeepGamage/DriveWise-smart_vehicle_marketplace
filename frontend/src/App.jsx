import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateAdvertisement from './pages/advertisement/CreateAdvertisement.jsx';


// Mock components for path visualization - replace with your actual pages later!
const Dashboard = () => (
    <div className="p-10 bg-slate-900 text-white min-h-screen">
        <h1 className="text-2xl font-bold text-blue-500">Vehicle Marketplace Dashboard</h1>
        <p className="text-slate-400 mt-2">Active browse listings will load here.</p>
    </div>
);

function App() {
    return (
        <Router>
            <Routes>
                {/* Home / Default route redirection */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Main Marketplace browsing feed */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Form to list vehicles and run ML predictive logic */}
                <Route path="/create-ad" element={<CreateAdvertisement />} />

                {/* Fallback 404 Route for unmatched paths */}
                <Route path="*" element={
                    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
                        <h1 className="text-4xl font-black text-rose-500">404</h1>
                        <p className="text-slate-400 mt-2">The route configuration path does not exist.</p>
                    </div>
                } />
            </Routes>
        </Router>
    );
}

export default App;