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
                <div className="w-12 h-12 border-4 border-warm-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-bold animate-pulse">Synchronizing listing specifications matrix...</p>
            </div>
        );
    }

    if (errorMsg || !ad) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
                <span className="text-5xl animate-bounce">📁</span>
                <h2 className="text-xl font-black text-rose-600">Listing Unreachable</h2>
                <p className="text-slate-500 text-xs leading-relaxed">
                    {errorMsg || "The selected vehicle advertisement could not be loaded. It may have been sold or removed."}
                </p>
                <Link to="/dashboard" className="bg-warm-dark border border-transparent hover:bg-warm-dark-card px-6 py-3 rounded-full text-xs font-black text-white transition-all uppercase tracking-widest shadow-sm flex items-center gap-2">
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
    let valuationColor = 'text-blue-400 bg-white/5 border-white/10';
    let valuationBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    let valuationText = 'Priced around standard market rate.';

    if (aiPrice > 0) {
        if (percentDiff >= 8) {
            valuationLabel = 'Great Value';
            valuationColor = 'text-emerald-400 bg-white/5 border-white/10';
            valuationBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            valuationText = `Dynamic ML engine marks this listing ${Math.round(percentDiff)}% under market value.`;
        } else if (percentDiff <= -8) {
            valuationLabel = 'Premium Price';
            valuationColor = 'text-amber-400 bg-white/5 border-white/10';
            valuationBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            valuationText = `Dynamic ML engine marks this listing ${Math.round(Math.abs(percentDiff))}% over market value.`;
        }
    }

    return (
        <div className="space-y-8 pb-16 transition-colors duration-300">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between">
                <Link to="/dashboard" className="text-warm-dark/70 hover:text-warm-dark text-xs font-black uppercase tracking-wider flex items-center gap-2 group transition-colors">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Marketplace</span>
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className="bg-white hover:bg-sand-100 text-warm-dark border border-sand-300/60 font-bold px-4 py-2.5 rounded-full transition-all shadow-sm flex items-center gap-2 text-xs cursor-pointer"
                    >
                        {isBookmarked ? <FaBookmark className="text-rose-500" /> : <FaRegBookmark />}
                        <span>{isBookmarked ? 'Bookmarked' : 'Save ad'}</span>
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                        }}
                        className="bg-white hover:bg-sand-100 text-warm-dark border border-sand-300/60 font-bold px-4 py-2.5 rounded-full transition-all shadow-sm flex items-center gap-2 text-xs cursor-pointer"
                    >
                        <FaShareAlt />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* Core Listing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Side: Images Gallery Showcase */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Active main view */}
                    <div className="aspect-[16/10] rounded-[2rem] overflow-hidden bg-white border border-sand-300/35 relative shadow-sm">
                        <img
                            src={images[activeImgIdx]}
                            alt={`${ad.vehicleName} ${ad.model}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[9px] font-mono text-slate-350 shadow-sm">
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
                                    className={`aspect-video rounded-2xl overflow-hidden border bg-white transition-all shadow-sm ${idx === activeImgIdx
                                            ? 'border-warm-dark ring-2 ring-warm-dark/10 scale-95'
                                            : 'border-sand-300 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Detailed Specifications Checklist Card */}
                    <div className="bg-white border border-sand-300/60 rounded-[2rem] p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-sand-200">
                                Vehicle Technical Specifications
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-sand-100 border border-sand-200/50 rounded-2xl flex items-center gap-3">
                                <FaRoad className="text-slate-400 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">True Mileage</span>
                                    <span className="text-xs font-black text-warm-dark">{ad.mileage?.toLocaleString() || 0} km</span>
                                </div>
                            </div>

                            <div className="p-3 bg-sand-100 border border-sand-200/50 rounded-2xl flex items-center gap-3">
                                <FaCog className="text-slate-400 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Transmission</span>
                                    <span className="text-xs font-black text-warm-dark">{ad.transmission}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-sand-100 border border-sand-200/50 rounded-2xl flex items-center gap-3">
                                <FaGasPump className="text-slate-400 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Fuel Type</span>
                                    <span className="text-xs font-black text-warm-dark">{ad.fuelType}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-sand-100 border border-sand-200/50 rounded-2xl flex items-center gap-3">
                                <FaPalette className="text-slate-400 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Exterior Color</span>
                                    <span className="text-xs font-black text-warm-dark">{ad.color}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-sand-100 border border-sand-200/50 rounded-2xl flex items-center gap-3">
                                <FaCalendarAlt className="text-slate-400 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Manufacture Year</span>
                                    <span className="text-xs font-black text-warm-dark">{ad.ManufactureYear}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-sand-100 border border-sand-200/50 rounded-2xl flex items-center gap-3">
                                <FaUser className="text-slate-400 text-sm" />
                                <div>
                                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Dealer ID</span>
                                    <span className="text-xs font-black text-warm-dark truncate max-w-[80px]" title={ad.userId}>{ad.userId}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Text */}
                        <div className="space-y-2 pt-2">
                            <h4 className="text-xs font-black text-warm-dark uppercase tracking-wider">Seller Remarks & Notes</h4>
                            <p className="text-slate-600 text-xs leading-relaxed font-normal whitespace-pre-line bg-sand-100/50 p-4 border border-sand-200/40 rounded-2xl">
                                {ad.description || "No seller notes available."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Price Details & Booking Form (Contrast Dark Container) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Primary Listing Details Box */}
                    <div className="bg-warm-dark text-white rounded-[2.5rem] p-8 shadow-xl space-y-6 border border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-black tracking-widest px-3 py-1 bg-white/10 border border-white/10 rounded-full text-slate-350">
                                {ad.vehicleName}
                            </span>
                            <span className="text-slate-400 text-[9px] font-mono">
                                Listed: {new Date(ad.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <h2 className="text-3xl font-black tracking-tight leading-tight">
                            {ad.ManufactureYear} {ad.vehicleName} {ad.model}
                        </h2>

                        <p className="text-xs text-slate-400 leading-relaxed">
                            {ad.title}
                        </p>

                        <div className="flex items-baseline justify-between border-t border-b border-white/10 py-6">
                            <div>
                                <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block mb-1">Asking Price</span>
                                <span className="text-2xl font-black text-warm-accent tracking-tight">
                                    {askingPrice.toLocaleString()} <span className="text-sm font-black">LKR</span>
                                </span>
                            </div>
                            {aiPrice > 0 && (
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block mb-1 font-mono">AI Prediction</span>
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
                                    <span className="font-black flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                                        <FaBrain className="text-[10px]" />
                                        <span>DriveWise AI Index</span>
                                    </span>
                                    <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border ${valuationBadge}`}>
                                        {valuationLabel}
                                    </span>
                                </div>
                                <p className="text-[10px] opacity-80 leading-snug">{valuationText}</p>

                                {/* Graph Slider */}
                                <div className="space-y-1 pt-1.5">
                                    <div className="w-full h-1 rounded-full bg-white/10 relative overflow-hidden flex">
                                        <div className="w-1/3 h-full bg-emerald-500/30" />
                                        <div className="w-1/3 h-full bg-blue-500/30" />
                                        <div className="w-1/3 h-full bg-amber-500/30" />

                                        <div
                                            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all"
                                            style={{
                                                left: `${Math.min(95, Math.max(5,
                                                    50 + ((askingPrice - aiPrice) / aiPrice) * 150
                                                ))}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[7px] text-slate-500 font-black uppercase tracking-wider pt-0.5">
                                        <span>Bargain</span>
                                        <span>Average</span>
                                        <span>Premium</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Booking Form Card */}
                    <div className="bg-warm-dark text-white rounded-[2.5rem] p-8 shadow-xl space-y-6 border border-white/5">
                        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                            <FaShieldAlt className="text-warm-accent text-sm" />
                            <h3 className="text-xs font-black uppercase tracking-wider">
                                Schedule Inspection
                            </h3>
                        </div>

                        {bookingSuccess ? (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-450 text-xs font-black rounded-2xl animate-fade-in leading-relaxed">
                                {bookingSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleBookingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-450 mb-1.5">Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={bookingForm.name}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-full px-4.5 py-2.5 text-xs text-white focus:outline-none focus:border-warm-accent"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-450 mb-1.5">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={bookingForm.phone}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-full px-4.5 py-2.5 text-xs text-white focus:outline-none focus:border-warm-accent"
                                        placeholder="e.g. +94 77 123 4567"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-450 mb-1.5">Target Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={bookingForm.date}
                                            onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-full px-4.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-warm-accent cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-450 mb-1.5">Target Time</label>
                                        <input
                                            required
                                            type="time"
                                            value={bookingForm.time}
                                            onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-full px-4.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-warm-accent cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-warm-accent hover:bg-warm-accent-hover text-warm-dark font-black py-4 px-6 rounded-full shadow-md transition-all text-[10px] uppercase tracking-widest cursor-pointer mt-2"
                                >
                                    Book Now
                                </button>
                            </form>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-white/10">
                            <a
                                href={`mailto:dealer@drivewise.com?subject=Inquiry: ${ad.ManufactureYear} ${ad.vehicleName} ${ad.model}`}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-black py-3 rounded-full text-[10px] transition-colors flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider"
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
