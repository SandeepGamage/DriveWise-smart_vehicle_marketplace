import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandModelMap from '../../utils/brand_model_map.json';
import AdvertisementCard from '../../components/AdvertisementCard';
import ConfirmationDialog from '../../components/confirmationBox.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
    FaSearch,
    FaSync,
    FaPlus,
    FaCar,
    FaDollarSign,
    FaBrain,
    FaTags,
    FaRoad,
    FaCog
} from 'react-icons/fa';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
    const { isDark } = useTheme();
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
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Stats variables
    const [stats, setStats] = useState({
        totalListed: 0,
        avgPrice: 0,
        goodDeals: 0,
        sellers: 0
    });

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: null,
    });
    const [confirmLoading, setConfirmLoading] = useState(false);

    // Fetch advertisements handler
    const fetchAdvertisements = async (page = 1) => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.get(`${API_BASE_URL}/api/advertisement/advertisements/active`, {
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
            ad.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.province?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.city?.toLowerCase().includes(searchQuery.toLowerCase());
        const brandMatch = selectedBrand ? ad.vehicleName === selectedBrand : true;
        const fuelMatch = selectedFuel ? ad.fuelType?.toLowerCase() === selectedFuel.toLowerCase() : true;
        const transmissionMatch = selectedTransmission ? ad.transmission === selectedTransmission : true;
        const districtMatch = selectedDistrict ? ad.district === selectedDistrict : true;

        return titleMatch && brandMatch && fuelMatch && transmissionMatch && districtMatch;
    });

    const uniqueDistricts = [...new Set(ads.map(ad => ad.district).filter(Boolean))].sort();

    const sortedAds = [...filteredAds].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'mileage-asc') return a.mileage - b.mileage;
        if (sortBy === 'year-desc') return b.ManufactureYear - a.ManufactureYear;
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

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedBrand('');
        setSelectedFuel('');
        setSelectedTransmission('');
        setSelectedDistrict('');
        setSortBy('newest');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDeleteAd = (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Remove Listing',
            message: 'Are you sure you want to remove this listing from your account?',
            confirmText: 'Delete Listing',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                setConfirmLoading(true);
                try {
                    const res = await axios.delete(`${API_BASE_URL}/api/advertisement/advertisements/${id}`);
                    if (res.data.success) {
                        setAds(prev => prev.filter(ad => (ad._id || ad.id || ad.addId) !== id));
                        fetchAdvertisements(1);
                    }
                } catch (err) {
                    alert('Failed to delete listing: ' + (err.response?.data?.message || err.message));
                } finally {
                    setConfirmLoading(false);
                }
            }
        });
    };

    return (
        <div className="space-y-8 min-h-screen pb-16 transition-colors duration-300">
            {/* Header / Intro section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-sand-300/50 dark:border-slate-800/80">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-warm-dark dark:text-slate-100 tracking-tight flex items-center gap-1.5 font-sans">
                        <span>Search Your Car</span>
                        <span className="text-warm-accent font-normal text-3xl animate-pulse">✴</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Browse, evaluate, and acquire vehicles certified through live machine learning algorithms.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-white dark:bg-slate-800 hover:bg-sand-100 dark:hover:bg-slate-700 text-warm-dark dark:text-slate-300 border border-sand-300/60 dark:border-slate-700/60 font-bold p-3.5 rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
                        title="Refresh database feed"
                    >
                        <FaSync className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        to="/create-ad"
                        className="bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark font-black px-6 py-3.5 rounded-2xl shadow-sm transition-all text-xs tracking-wider flex items-center gap-2 cursor-pointer border border-transparent uppercase"
                    >
                        <FaPlus className="text-[10px]" />
                        <span>Sell Your Vehicle</span>
                    </Link>
                </div>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm">
                    <span className="text-lg">⚠️</span>
                    <p>{errorMsg}</p>
                </div>
            )}

            {/* Combined Search & Filter Pill Deck */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Unified Main Search-Location Pill */}
                    <div className="w-full md:flex-1 bg-white dark:bg-slate-800 border border-sand-300/60 dark:border-slate-700/60 rounded-full p-2 pl-6 pr-2 shadow-sm flex items-center justify-between gap-4">
                        {/* Search Input Part */}
                        <div className="flex-1 flex items-center gap-2.5">
                            <FaSearch className="text-slate-400 dark:text-slate-500 text-xs shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full bg-transparent border-none focus:outline-none text-warm-dark dark:text-slate-100 text-xs placeholder-slate-450 dark:placeholder-slate-500 font-bold"
                                placeholder="Search Car or Model"
                            />
                        </div>

                        {/* Split Divider line */}
                        <div className="hidden sm:block w-px h-6 bg-sand-300 dark:bg-slate-700"></div>

                        {/* Brand Quick select */}
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                            <span className="text-slate-450 text-xs">🏷️</span>
                            <select
                                value={selectedBrand}
                                onChange={(e) => {
                                    setSelectedBrand(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="bg-transparent border-none focus:outline-none text-warm-dark dark:text-slate-300 font-black text-[10px] uppercase tracking-wider cursor-pointer pr-4"
                            >
                                <option value="" className="dark:bg-slate-800 dark:text-slate-300">Select Brand</option>
                                {Object.keys(brandModelMap).map((brand) => (
                                    <option key={brand} value={brand} className="dark:bg-slate-800 dark:text-slate-350">{brand}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Action trigger button */}
                        <button
                            onClick={handleRefresh}
                            className="w-10 h-10 rounded-full bg-warm-dark dark:bg-warm-accent text-white dark:text-warm-dark flex items-center justify-center hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover transition-colors cursor-pointer shadow-sm shrink-0"
                        >
                            <FaSearch className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* Sub Filter Pill Selector deck */}
                <div className="flex flex-wrap gap-2 items-center">
                    <select
                        value={selectedFuel}
                        onChange={(e) => {
                            setSelectedFuel(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="bg-white dark:bg-slate-800 border border-sand-300/60 dark:border-slate-700/60 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-wider text-warm-dark dark:text-slate-300 hover:bg-sand-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
                    >
                        <option value="" className="dark:bg-slate-800 dark:text-slate-300">All Fuel Categories</option>
                        <option value="Petrol" className="dark:bg-slate-800 dark:text-slate-300">Petrol</option>
                        <option value="Diesel" className="dark:bg-slate-800 dark:text-slate-300">Diesel</option>
                        <option value="Hybrid" className="dark:bg-slate-800 dark:text-slate-300">Hybrid</option>
                        <option value="Electric" className="dark:bg-slate-800 dark:text-slate-300">Electric</option>
                    </select>

                    <select
                        value={selectedTransmission}
                        onChange={(e) => {
                            setSelectedTransmission(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="bg-white dark:bg-slate-800 border border-sand-300/60 dark:border-slate-700/60 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-wider text-warm-dark dark:text-slate-300 hover:bg-sand-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
                    >
                        <option value="" className="dark:bg-slate-800 dark:text-slate-300">All Transmissions</option>
                        <option value="Manual" className="dark:bg-slate-800 dark:text-slate-300">Manual</option>
                        <option value="Automatic" className="dark:bg-slate-800 dark:text-slate-300">Automatic</option>
                    </select>

                    <select
                        value={selectedDistrict}
                        onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="bg-white dark:bg-slate-800 border border-sand-300/60 dark:border-slate-700/60 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-wider text-warm-dark dark:text-slate-300 hover:bg-sand-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
                    >
                        <option value="" className="dark:bg-slate-800 dark:text-slate-300">All Districts</option>
                        {uniqueDistricts.map(dist => (
                            <option key={dist} value={dist} className="dark:bg-slate-800 dark:text-slate-300">{dist}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="bg-white dark:bg-slate-800 border border-sand-300/60 dark:border-slate-700/60 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-wider text-warm-accent dark:text-warm-accent hover:bg-sand-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
                    >
                        <option value="newest" className="dark:bg-slate-800 dark:text-slate-300">Sort: Newest Listed</option>
                        <option value="price-asc" className="dark:bg-slate-800 dark:text-slate-300">Sort: Price (Low → High)</option>
                        <option value="price-desc" className="dark:bg-slate-800 dark:text-slate-300">Sort: Price (High → Low)</option>
                        <option value="mileage-asc" className="dark:bg-slate-800 dark:text-slate-300">Sort: Mileage (Low → High)</option>
                        <option value="year-desc" className="dark:bg-slate-800 dark:text-slate-300">Sort: Year (Newest → Old)</option>
                    </select>

                    {/* Active tags visual list */}
                    {(searchQuery || selectedBrand || selectedFuel || selectedTransmission || selectedDistrict || sortBy !== 'newest') && (
                        <button
                            onClick={handleClearFilters}
                            className="bg-rose-550/10 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-455 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-rose-100/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer shadow-sm"
                        >
                            ✕ Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Statistics Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 border border-sand-300/50 dark:border-slate-700/50 p-5 rounded-[1.8rem] shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-11 h-11 rounded-2xl bg-sand-100 dark:bg-slate-750 border border-sand-200/60 dark:border-slate-650 text-warm-accent flex items-center justify-center shadow-inner">
                        <FaCar className="text-lg" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Market Listings</span>
                        <span className="text-xl font-black text-warm-dark dark:text-slate-100 tracking-tight">{stats.totalListed}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-sand-300/50 dark:border-slate-700/50 p-5 rounded-[1.8rem] shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-11 h-11 rounded-2xl bg-sand-100 dark:bg-slate-750 border border-sand-200/60 dark:border-slate-650 text-warm-accent flex items-center justify-center shadow-inner">
                        <FaDollarSign className="text-lg" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Average Pricing</span>
                        <span className="text-xl font-black text-warm-dark dark:text-slate-100 tracking-tight">{stats.avgPrice.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-sans">LKR</span></span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-sand-300/50 dark:border-slate-700/50 p-5 rounded-[1.8rem] shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-11 h-11 rounded-2xl bg-sand-100 dark:bg-slate-750 border border-sand-200/60 dark:border-slate-650 text-warm-accent flex items-center justify-center shadow-inner">
                        <FaBrain className="text-lg animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">AI bargains</span>
                        <span className="text-xl font-black text-warm-dark dark:text-slate-100 tracking-tight">{stats.goodDeals} listings</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-sand-300/50 dark:border-slate-700/50 p-5 rounded-[1.8rem] shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-11 h-11 rounded-2xl bg-sand-100 dark:bg-slate-750 border border-sand-200/60 dark:border-slate-650 text-warm-accent flex items-center justify-center shadow-inner">
                        <FaTags className="text-lg" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Unique Sellers</span>
                        <span className="text-xl font-black text-warm-dark dark:text-slate-100 tracking-tight">{stats.sellers} dealers</span>
                    </div>
                </div>
            </div>

            {/* List Header Counters */}
            <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-black text-warm-dark dark:text-slate-200 uppercase tracking-widest">
                    {totalFiltered} Vehicles for Rent & Buy
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    Closest to me 🗙
                </span>
            </div>

            {/* Main Listings Grid */}
            {loading ? (
                /* Skeleton Loaders */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 border border-sand-200 dark:border-slate-700/80 rounded-[2rem] overflow-hidden animate-pulse h-[400px] flex flex-col justify-between p-5">
                            <div className="space-y-4">
                                <div className="aspect-[4/3] bg-sand-100 dark:bg-slate-700 rounded-[1.5rem]" />
                                <div className="h-4 bg-sand-100 dark:bg-slate-700 rounded w-2/3" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-sand-100 dark:bg-slate-700 rounded" />
                                    <div className="h-3 bg-sand-100 dark:bg-slate-700 rounded w-5/6" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-3 bg-sand-100 dark:bg-slate-700 rounded w-1/2" />
                                <div className="h-8 bg-sand-100 dark:bg-slate-700 rounded-full" />
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
                        />
                    ))}
                </div>
            ) : (
                /* Empty state */
                <div className="bg-white dark:bg-slate-800 border border-sand-300/50 dark:border-slate-700/50 rounded-[2rem] p-12 text-center max-w-xl mx-auto space-y-5 shadow-sm">
                    <span className="text-5xl block animate-bounce">🚗</span>
                    <h3 className="text-lg font-black text-warm-dark dark:text-slate-100">No Vehicles Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                        We couldn't locate any advertisements matching your custom search queries and filters. Clear filters or list a new car in our database system.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleClearFilters}
                            className="bg-sand-100 dark:bg-slate-700 hover:bg-sand-200 dark:hover:bg-slate-650 border border-sand-300 dark:border-slate-600 text-warm-dark dark:text-slate-200 text-xs font-black px-5 py-2.5 rounded-full transition-all cursor-pointer"
                        >
                            Reset Filter Settings
                        </button>
                        <Link
                            to="/create-ad"
                            className="bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark text-xs font-black px-5 py-2.5 rounded-full transition-all cursor-pointer"
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
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-sand-300/60 dark:border-slate-700/60 text-warm-dark dark:text-slate-300 hover:bg-warm-dark dark:hover:bg-warm-accent hover:text-white dark:hover:text-warm-dark flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                        🗙
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-full border text-xs font-black transition-all cursor-pointer shadow-sm ${pageNum === currentPage
                                    ? 'bg-warm-dark dark:bg-warm-accent border-warm-dark dark:border-warm-accent text-white dark:text-warm-dark'
                                    : 'bg-white dark:bg-slate-800 border-sand-300/60 dark:border-slate-700/60 text-warm-dark dark:text-slate-300 hover:bg-sand-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-sand-300/60 dark:border-slate-700/60 text-warm-dark dark:text-slate-300 hover:bg-warm-dark dark:hover:bg-warm-accent hover:text-white dark:hover:text-warm-dark flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                        🗚
                    </button>
                </div>
            )}

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
                type={confirmDialog.type}
                isDarkMode={isDark}
                loading={confirmLoading}
            />
        </div>
    );
};

export default Dashboard;
