import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandModelMap from '../../utils/brand_model_map.json';
import AdvertisementCard from '../../components/AdvertisementCard';
import {
    FaSearch,
    FaSlidersH,
    FaSync,
    FaPlus,
    FaCar,
    FaDollarSign,
    FaBrain,
    FaTags,
    FaArrowLeft,
    FaArrowRight,
    FaGasPump,
    FaCog,
    FaRoad,
    FaPalette,
    FaTimes,
    FaUser,
    FaInfoCircle
} from 'react-icons/fa';

const Dashboard = () => {
    // List & Pagination State
    const [ads, setAds] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedFuel, setSelectedFuel] = useState('');
    const [selectedTransmission, setSelectedTransmission] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Stats variables
    const [stats, setStats] = useState({
        totalListed: 0,
        avgPrice: 0,
        goodDeals: 0,
        sellers: 0
    });

    // Fetch advertisements handler
    const fetchAdvertisements = async (page = 1) => {
        setLoading(true);
        setErrorMsg('');
        try {
            // Fetch from backend (we request 20 items internally to filter, but let's stick to standard API page & limit)
            const res = await axios.get(`http://localhost:3000/api/advertisement/advertisements`, {
                params: {
                    page: page,
                    limit: 100 // Fetch a larger batch to support robust client-side searching & stats
                }
            });

            if (res.data.success) {
                const fetchedAds = res.data.data || [];
                setAds(fetchedAds);

                // Calculate dynamic marketplace statistics based on complete dataset
                if (fetchedAds.length > 0) {
                    const total = fetchedAds.length;
                    const sum = fetchedAds.reduce((acc, curr) => acc + (curr.price || 0), 0);
                    const avg = Math.round(sum / total);
                    const bargains = fetchedAds.filter(curr => curr.predictedPrice && (curr.predictedPrice - curr.price) / curr.predictedPrice >= 0.08).length;
                    const uniqueSellers = new Set(fetchedAds.map(curr => curr.userId)).size;

                    setStats({
                        totalListed: res.data.pagination?.total || total,
                        avgPrice: avg,
                        goodDeals: bargains,
                        sellers: uniqueSellers
                    });
                } else {
                    setStats({ totalListed: 0, avgPrice: 0, goodDeals: 0, sellers: 0 });
                }
            } else {
                setErrorMsg("Backend api failed to fetch marketplace entries.");
            }
        } catch (err) {
            setErrorMsg("Could not connect to backend server. Make sure node backend is running.");
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAdvertisements(1);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAdvertisements(1);
    };

    // Client-side search, filtering and sorting logic
    const filteredAds = ads.filter(ad => {
        const titleMatch = ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.model?.toLowerCase().includes(searchQuery.toLowerCase());
        const brandMatch = selectedBrand ? ad.vehicleName === selectedBrand : true;
        const fuelMatch = selectedFuel ? ad.fuelType?.toLowerCase() === selectedFuel.toLowerCase() : true;
        const transmissionMatch = selectedTransmission ? ad.transmission === selectedTransmission : true;

        return titleMatch && brandMatch && fuelMatch && transmissionMatch;
    });

    const sortedAds = [...filteredAds].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'mileage-asc') return a.mileage - b.mileage;
        if (sortBy === 'year-desc') return b.ManufactureYear - a.ManufactureYear;
        // Default: newest listed
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    // Pagination for sorted and filtered list
    const itemsPerPage = 8;
    const totalFiltered = sortedAds.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
    const currentPage = Math.min(pagination.page, totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAds = sortedAds.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    // Reset all filters
    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedBrand('');
        setSelectedFuel('');
        setSelectedTransmission('');
        setSortBy('newest');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Delete listing handler
    const handleDeleteAd = async (id) => {
        try {
            const res = await axios.delete(`http://localhost:3000/api/advertisement/advertisements/${id}`);
            if (res.data.success) {
                // Remove listing locally & refresh stats
                setAds(prev => prev.filter(ad => (ad._id || ad.id || ad.addId) !== id));

                alert('Listing removed successfully.');
                fetchAdvertisements(1);
            }
        } catch (err) {
            alert('Failed to delete listing: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="space-y-8 min-h-screen pb-16">
            {/* Header / Intro section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                        <span>Vehicle Marketplace</span>
                        <span className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold uppercase tracking-wider">Live Feed</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Browse, evaluate, and acquire vehicles certified through live machine learning algorithms.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold p-3 rounded-2xl transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-50"
                        title="Refresh database feed"
                    >
                        <FaSync className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        to="/create-ad"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg transition-all text-sm tracking-wide flex items-center gap-2 cursor-pointer border border-blue-500/30"
                    >
                        <FaPlus className="text-xs" />
                        <span>Sell Your Vehicle</span>
                    </Link>
                </div>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
                <div className="bg-rose-950/40 border border-rose-800 text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-md">
                    <span className="text-lg">⚠️</span>
                    <p>{errorMsg}</p>
                </div>
            )}

            {/* Statistics Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shadow-inner">
                        <FaCar className="text-lg" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Market Listings</span>
                        <span className="text-xl font-black text-slate-200 tracking-tight">{stats.totalListed}</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-inner">
                        <FaDollarSign className="text-lg" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Average Pricing</span>
                        <span className="text-xl font-black text-slate-200 tracking-tight">{stats.avgPrice.toLocaleString()} <span className="text-xs font-bold text-slate-400">LKR</span></span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-inner">
                        <FaBrain className="text-lg animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">AI-Valued bargains</span>
                        <span className="text-xl font-black text-slate-200 tracking-tight">{stats.goodDeals} listings</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shadow-inner">
                        <FaTags className="text-lg" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Unique Sellers</span>
                        <span className="text-xl font-black text-slate-200 tracking-tight">{stats.sellers} dealers</span>
                    </div>
                </div>
            </div>

            {/* Filter Section Bar */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-md space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <FaSlidersH className="text-blue-400 text-xs" />
                    <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Filter & Search Engine</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Search Field */}
                    <div className="relative lg:col-span-2">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all"
                            placeholder="Search Make, Model, or Ad Title..."
                        />
                    </div>

                    {/* Brand Filter */}
                    <div>
                        <select
                            value={selectedBrand}
                            onChange={(e) => {
                                setSelectedBrand(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                        >
                            <option value="">All Brands / Makes</option>
                            {Object.keys(brandModelMap).map((brand) => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fuel Filter */}
                    <div>
                        <select
                            value={selectedFuel}
                            onChange={(e) => {
                                setSelectedFuel(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                        >
                            <option value="">All Fuel Categories</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Electric">Electric</option>
                        </select>
                    </div>

                    {/* Sorting Filter */}
                    <div>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer font-bold text-blue-400"
                        >
                            <option value="newest">Sort: Newest Listed</option>
                            <option value="price-asc">Sort: Price (Low → High)</option>
                            <option value="price-desc">Sort: Price (High → Low)</option>
                            <option value="mileage-asc">Sort: Mileage (Low → High)</option>
                            <option value="year-desc">Sort: Year (Newest → Old)</option>
                        </select>
                    </div>
                </div>

                {/* Additional controls row */}
                {(searchQuery || selectedBrand || selectedFuel || selectedTransmission || sortBy !== 'newest') && (
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-500 font-bold">
                            Showing {totalFiltered} of {ads.length} listings match filters.
                        </span>
                        <button
                            onClick={handleClearFilters}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest cursor-pointer"
                        >
                            ✕ Clear All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Main Listings Grid */}
            {loading ? (
                /* Skeleton Loaders */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden animate-pulse h-[420px] flex flex-col justify-between p-5">
                            <div className="space-y-4">
                                <div className="aspect-video bg-slate-800 rounded-2xl" />
                                <div className="h-4 bg-slate-800 rounded w-2/3" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-800 rounded" />
                                    <div className="h-3 bg-slate-800 rounded w-5/6" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-3 bg-slate-800 rounded w-1/2" />
                                <div className="h-8 bg-slate-800 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : paginatedAds.length > 0 ? (
                /* Actual Cards Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedAds.map((ad) => (
                        <AdvertisementCard
                            key={ad._id || ad.id || ad.addId}
                            ad={ad}
                            onDelete={handleDeleteAd}
                        />
                    ))}
                </div>
            ) : (
                /* Empty state */
                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-5">
                    <span className="text-5xl block animate-bounce">🚗</span>
                    <h3 className="text-lg font-extrabold text-slate-300">No Vehicles Found</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                        We couldn't locate any advertisements matching your custom search queries and filters. Clear filters or list a new car in our database system.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleClearFilters}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                        >
                            Reset Filter Settings
                        </button>
                        <Link
                            to="/create-ad"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                        >
                            List A Car
                        </Link>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <FaArrowLeft className="text-xs" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer ${pageNum === currentPage
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <FaArrowRight className="text-xs" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
