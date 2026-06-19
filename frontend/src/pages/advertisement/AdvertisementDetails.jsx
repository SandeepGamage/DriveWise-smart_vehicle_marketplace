import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    FaRoad,
    FaGasPump,
    FaCog,
    FaPalette,
    FaBrain,
    FaArrowLeft,
    FaUser,
    FaCalendarAlt,
    FaShieldAlt,
    FaBookmark,
    FaRegBookmark,
    FaShareAlt,
    FaEnvelope
} from 'react-icons/fa';

const AdvertisementDetails = () => {
    const { id } = useParams();
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // Gallery state
    const [activeImgIdx, setActiveImgIdx] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Booking Form state
    const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', time: '' });
    const [bookingSuccess, setBookingSuccess] = useState('');

    useEffect(() => {
        const fetchAdDetails = async () => {
            setLoading(true);
            setErrorMsg('');
            try {
                const res = await axios.get(`http://localhost:3000/api/advertisement/advertisements/${id}`);
                if (res.data.success) {
                    setAd(res.data.data);
                } else {
                    setErrorMsg("Failed to retrieve advertisement details.");
                }
            } catch (err) {
                setErrorMsg("Advertisement details not found or database is unreachable.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdDetails();
    }, [id]);

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        setBookingSuccess(`📅 Booking confirmed! Inspection scheduled for ${bookingForm.date} at ${bookingForm.time}. A DriveWise advisor will reach out to you at ${bookingForm.phone} shortly.`);
        setBookingForm({ name: '', phone: '', date: '', time: '' });
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm font-semibold animate-pulse">Synchronizing listing specifications matrix...</p>
            </div>
        );
    }

    if (errorMsg || !ad) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
                <span className="text-5xl animate-bounce">📁</span>
                <h2 className="text-xl font-extrabold text-rose-500">Listing Unreachable</h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                    {errorMsg || "The selected vehicle advertisement could not be loaded. It may have been sold or removed."}
                </p>
                <Link to="/dashboard" className="bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-2.5 rounded-xl text-xs font-black text-slate-300 hover:text-blue-400 transition-all uppercase tracking-wider shadow-md flex items-center gap-2">
                    <FaArrowLeft />
                    <span>Browse Marketplace</span>
                </Link>
            </div>
        );
    }

    const images = ad.images && ad.images.length > 0
        ? ad.images
        : ['https://placehold.co/600x400?text=No+Vehicle+Image'];

    // 🔮 DriveWise AI Valuation Engine Calibration
    const askingPrice = ad.price || 0;
    const aiPrice = ad.predictedPrice || 0;
    const delta = aiPrice - askingPrice;
    const percentDiff = aiPrice > 0 ? (delta / aiPrice) * 100 : 0;

    let valuationLabel = 'Fair Value';
    let valuationColor = 'text-blue-400 bg-blue-950/40 border-blue-900/40';
    let valuationBadge = 'bg-blue-600/20 text-blue-400 border-blue-800/60';
    let valuationText = 'Priced around standard market rate.';

    if (aiPrice > 0) {
        if (percentDiff >= 8) {
            valuationLabel = 'Great Value';
            valuationColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40';
            valuationBadge = 'bg-emerald-600/20 text-emerald-400 border-emerald-800/60';
            valuationText = `Dynamic ML engine marks this listing ${Math.round(percentDiff)}% under market value.`;
        } else if (percentDiff <= -8) {
            valuationLabel = 'Premium Price';
            valuationColor = 'text-amber-400 bg-amber-950/40 border-amber-900/40';
            valuationBadge = 'bg-amber-600/20 text-amber-400 border-amber-800/60';
            valuationText = `Dynamic ML engine marks this listing ${Math.round(Math.abs(percentDiff))}% over market value.`;
        }
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between">
                <Link to="/dashboard" className="text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 group transition-colors">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Marketplace</span>
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-blue-400 border border-slate-800 hover:border-slate-700 font-bold px-4 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 text-xs cursor-pointer"
                    >
                        {isBookmarked ? <FaBookmark className="text-blue-500" /> : <FaRegBookmark />}
                        <span>{isBookmarked ? 'Bookmarked' : 'Save ad'}</span>
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold px-4 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 text-xs cursor-pointer"
                    >
                        <FaShareAlt />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* Core Listing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Side: Images Gallery Showcase */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Active main view */}
                    <div className="aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-905 relative shadow-xl">
                        <img
                            src={images[activeImgIdx]}
                            alt={`${ad.vehicleName} ${ad.model}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400">
                            Photo {activeImgIdx + 1} of {images.length}
                        </div>
                    </div>

                    {/* Thumbnails row (supports one or more images seamlessly) */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {images.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImgIdx(idx)}
                                    className={`aspect-video rounded-xl overflow-hidden border bg-slate-950 transition-all ${idx === activeImgIdx
                                            ? 'border-blue-500 ring-2 ring-blue-500/20 scale-95'
                                            : 'border-slate-850 hover:border-slate-700 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Detailed Specifications Checklist Card */}
                    <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-md space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-800">
                                Vehicle Technical Specifications
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-950/40 border border-slate-850/50 rounded-2xl flex items-center gap-3">
                                <FaRoad className="text-slate-500 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">True Mileage</span>
                                    <span className="text-xs font-black text-slate-300">{ad.mileage?.toLocaleString() || 0} km</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-950/40 border border-slate-850/50 rounded-2xl flex items-center gap-3">
                                <FaCog className="text-slate-500 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Transmission</span>
                                    <span className="text-xs font-black text-slate-300">{ad.transmission}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-950/40 border border-slate-850/50 rounded-2xl flex items-center gap-3">
                                <FaGasPump className="text-slate-500 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Fuel Type</span>
                                    <span className="text-xs font-black text-slate-300">{ad.fuelType}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-950/40 border border-slate-850/50 rounded-2xl flex items-center gap-3">
                                <FaPalette className="text-slate-500 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Exterior Color</span>
                                    <span className="text-xs font-black text-slate-300">{ad.color}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-950/40 border border-slate-850/50 rounded-2xl flex items-center gap-3">
                                <FaCalendarAlt className="text-slate-500 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Manufacture Year</span>
                                    <span className="text-xs font-black text-slate-300">{ad.ManufactureYear}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-950/40 border border-slate-850/50 rounded-2xl flex items-center gap-3">
                                <FaUser className="text-slate-500 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Dealer ID</span>
                                    <span className="text-xs font-black text-slate-300 truncate max-w-[80px]" title={ad.userId}>{ad.userId}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Text */}
                        <div className="space-y-2 pt-2">
                            <h4 className="text-xs font-bold text-slate-300">Seller Remarks & Notes</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-light whitespace-pre-line bg-slate-950/30 p-4 border border-slate-850/30 rounded-2xl">
                                {ad.description || "No seller notes available."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Price Details & Booking Form */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Primary Listing Details Box */}
                    <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 bg-slate-950 border border-slate-850 rounded-xl text-slate-400">
                                {ad.vehicleName}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                                <span>Listed: {new Date(ad.createdAt).toLocaleDateString()}</span>
                            </span>
                        </div>

                        <h2 className="text-2xl font-black text-slate-100 tracking-tight leading-tight">
                            {ad.ManufactureYear} {ad.vehicleName} {ad.model}
                        </h2>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {ad.title}
                        </p>

                        <div className="flex items-baseline justify-between border-t border-b border-slate-800/80 py-4">
                            <div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Asking Price</span>
                                <span className="text-2xl font-black text-emerald-400 tracking-tight">
                                    {askingPrice.toLocaleString()} <span className="text-sm font-bold">LKR</span>
                                </span>
                            </div>
                            {aiPrice > 0 && (
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5 font-mono">AI Prediction</span>
                                    <span className="text-lg font-black text-slate-300">
                                        {aiPrice.toLocaleString()} <span className="text-xs font-bold text-slate-400">LKR</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Interactive ML Valuation Gauge */}
                        {aiPrice > 0 && (
                            <div className={`p-4 rounded-2xl border text-xs flex flex-col space-y-2.5 ${valuationColor}`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-extrabold flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                                        <FaBrain className="animate-pulse" />
                                        <span>DriveWise AI Index</span>
                                    </span>
                                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${valuationBadge}`}>
                                        {valuationLabel}
                                    </span>
                                </div>
                                <p className="text-[10px] opacity-90 leading-snug">{valuationText}</p>

                                {/* Graph Slider */}
                                <div className="space-y-1">
                                    <div className="w-full h-1.5 rounded-full bg-slate-950 relative overflow-hidden flex">
                                        <div className="w-1/3 h-full bg-emerald-500/20" />
                                        <div className="w-1/3 h-full bg-blue-500/20" />
                                        <div className="w-1/3 h-full bg-amber-500/20" />

                                        <div
                                            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all"
                                            style={{
                                                left: `${Math.min(95, Math.max(5,
                                                    50 + ((askingPrice - aiPrice) / aiPrice) * 150
                                                ))}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[8px] text-slate-500/80 font-bold uppercase">
                                        <span>Bargain</span>
                                        <span>Market Avg</span>
                                        <span>Premium</span>
                                    </div>
                                </div>

                                <div className="text-[9px] opacity-60 text-slate-500 italic block pt-1 text-center font-mono">
                                    * Realtime pipeline calibration matching brand '{ad.vehicleName}', model '{ad.model}', mileage '{ad.mileage}km' & year '{ad.ManufactureYear}'.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Booking Form Card */}
                    <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-md space-y-4">
                        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                            <FaShieldAlt className="text-blue-400 text-sm" />
                            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                Inspection & Inspection Booking
                            </h3>
                        </div>

                        {bookingSuccess ? (
                            <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs font-bold rounded-2xl animate-fade-in leading-relaxed">
                                {bookingSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={bookingForm.name}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={bookingForm.phone}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. +94 77 123 4567"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={bookingForm.date}
                                            onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target Time</label>
                                        <input
                                            required
                                            type="time"
                                            value={bookingForm.time}
                                            onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-xs tracking-wider cursor-pointer border border-blue-500/25"
                                >
                                    Instantly Request Inspection Slot
                                </button>
                            </form>
                        )}

                        <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                            <a
                                href={`mailto:dealer@drivewise.com?subject=Inquiry: ${ad.ManufactureYear} ${ad.vehicleName} ${ad.model}`}
                                className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <FaEnvelope className="text-[10px]" />
                                <span>Message Dealer</span>
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdvertisementDetails;
