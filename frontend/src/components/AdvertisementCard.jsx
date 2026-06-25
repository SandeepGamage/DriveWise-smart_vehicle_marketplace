import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaRoad,
    FaCog,
    FaRegBookmark,
    FaBookmark,
    FaTrashAlt
} from 'react-icons/fa';

const AdvertisementCard = ({ ad, onDelete, onToggleStatus }) => {
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const images = ad.images && ad.images.length > 0
        ? ad.images
        : ['https://placehold.co/600x400?text=No+Vehicle+Image'];

    const nextImage = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentImgIdx((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
    };

    // 🔮 DriveWise AI Valuation Comparison Logic
    const askingPrice = ad.price || 0;
    const aiPrice = ad.predictedPrice || 0;
    const delta = aiPrice - askingPrice;
    const percentDiff = aiPrice > 0 ? (delta / aiPrice) * 100 : 0;

    let valuationLabel = 'Fair Value';
    let valuationColor = 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30';

    if (aiPrice > 0) {
        if (percentDiff >= 8) {
            valuationLabel = 'Great Deal';
            valuationColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/30';
        } else if (percentDiff <= -8) {
            valuationLabel = 'Premium';
            valuationColor = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/30';
        }
    }

    const adId = ad._id || ad.id || ad.addId;

    return (
        <div className="group bg-white dark:bg-slate-800 border border-sand-200 dark:border-slate-700 rounded-[2rem] overflow-hidden hover:shadow-[0_15px_30px_rgba(26,29,32,0.06)] dark:hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col h-full relative">
            {/* Visuals Box */}
            <div className="relative aspect-[4/3] overflow-hidden bg-sand-100 dark:bg-slate-900 group-hover:subpixel-antialiased">
                <Link to={`/advertisement/${adId}`}>
                    <img
                        src={images[currentImgIdx]}
                        alt={`${ad.vehicleName} ${ad.model}`}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                    />
                </Link>

                {/* Floating Bookmark & Status Indicators */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-auto z-10">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-black tracking-wider px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-sand-300/30 dark:border-slate-700/30 text-warm-dark dark:text-slate-200 shadow-sm">
                            {ad.ManufactureYear}
                        </span>
                        {/* Status Badge */}
                        {onToggleStatus && (
                            <span className={`text-[8px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full shadow-sm border backdrop-blur-md font-sans ${
                                ad.isActive
                                    ? 'bg-emerald-500/90 border-emerald-600/30 text-white'
                                    : 'bg-amber-500/90 border-amber-600/30 text-white'
                            }`}>
                                {ad.isActive ? 'Live' : 'Unpublished'}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setIsBookmarked(!isBookmarked);
                        }}
                        className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-sand-300/30 dark:border-slate-700/30 flex items-center justify-center text-warm-dark dark:text-slate-200 hover:text-rose-500 hover:scale-105 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
                    >
                        {isBookmarked ? <FaBookmark className="text-rose-500 text-xs animate-ping-once" /> : <FaRegBookmark className="text-xs" />}
                    </button>
                </div>

                {/* Gallery Slideshow Arrows */}
                {images.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                        <button
                            onClick={prevImage}
                            className="w-6 h-6 rounded-full bg-white/90 dark:bg-slate-850/90 border border-sand-300/30 dark:border-slate-700/35 text-warm-dark dark:text-slate-200 flex items-center justify-center text-[10px] hover:bg-warm-dark dark:hover:bg-warm-accent hover:text-white dark:hover:text-warm-dark transition-all shadow-sm"
                        >
                            🗙
                        </button>
                        <button
                            onClick={nextImage}
                            className="w-6 h-6 rounded-full bg-white/90 dark:bg-slate-850/90 border border-sand-300/30 dark:border-slate-700/35 text-warm-dark dark:text-slate-200 flex items-center justify-center text-[10px] hover:bg-warm-dark dark:hover:bg-warm-accent hover:text-white dark:hover:text-warm-dark transition-all shadow-sm"
                        >
                            🗚
                        </button>
                    </div>
                )}

                {/* Image Dots Indicator */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                        {images.map((_, idx) => (
                            <span
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIdx ? 'bg-warm-dark dark:bg-warm-accent w-3' : 'bg-sand-400/50 dark:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    {/* Header: Title */}
                    <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-black text-warm-dark dark:text-slate-100 text-base tracking-tight truncate max-w-[85%]">
                            <Link to={`/advertisement/${adId}`} className="hover:text-warm-accent transition-colors">
                                {ad.vehicleName} <span className="font-semibold text-slate-450 dark:text-slate-400">{ad.model}</span>
                            </Link>
                        </h3>
                    </div>

                    {/* Ratings & Deal Indicator */}
                    <div className="flex items-center space-x-2 mb-2 text-[10px] font-bold">
                        <span className="text-warm-accent">★ 4.96</span>
                        <span className="text-slate-400 dark:text-slate-550 font-medium">(141 trips)</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border tracking-wider ${valuationColor}`}>
                            {valuationLabel}
                        </span>
                    </div>

                    {/* Location Tag */}
                    {ad.city && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-450 dark:text-slate-400 mb-2 uppercase tracking-wide">
                            <span>📍</span>
                            <span>{ad.city}, {ad.district}</span>
                        </div>
                    )}

                    <p className="text-[11px] text-slate-550 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {ad.description || "No description provided."}
                    </p>

                    {/* Specs Row */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        <div className="flex items-center space-x-1 px-2.5 py-1 bg-sand-100 dark:bg-slate-700 border border-sand-200/50 dark:border-slate-600/50 rounded-full text-[9px] font-black text-warm-dark/80 dark:text-slate-200">
                            <FaRoad className="text-slate-450 dark:text-slate-500 text-[9px]" />
                            <span>{ad.mileage?.toLocaleString() || 0} km</span>
                        </div>
                        <div className="flex items-center space-x-1 px-2.5 py-1 bg-sand-100 dark:bg-slate-700 border border-sand-200/50 dark:border-slate-600/50 rounded-full text-[9px] font-black text-warm-dark/80 dark:text-slate-200">
                            <FaCog className="text-slate-450 dark:text-slate-500 text-[9px]" />
                            <span>{ad.transmission}</span>
                        </div>
                        <div className="flex items-center space-x-1 px-2.5 py-1 bg-sand-100 dark:bg-slate-700 border border-sand-200/50 dark:border-slate-600/50 rounded-full text-[9px] font-black text-warm-dark/80 dark:text-slate-200">
                            <span>⛽ {ad.fuelType}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="border-t border-sand-200/60 dark:border-slate-700/65 pt-4 mt-auto">
                    <div className="flex items-baseline justify-between mb-4">
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Price</span>
                            <span className="text-base font-black text-warm-dark dark:text-slate-100 tracking-tight">
                                {askingPrice.toLocaleString()} <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500">LKR</span>
                            </span>
                        </div>
                        {aiPrice > 0 && (
                            <div className="text-right">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">AI Estimate</span>
                                <span className="text-xs font-bold text-slate-450 dark:text-slate-400">
                                    {aiPrice.toLocaleString()} <span className="text-[9px]">LKR</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex gap-1.5 items-center">
                        <Link
                            to={`/advertisement/${adId}`}
                            className="flex-1 bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark font-black py-2.5 rounded-full transition-all flex items-center justify-center space-x-1.5 text-[9px] shadow-sm text-center uppercase tracking-wider"
                        >
                            <span>Details</span>
                        </Link>
                        {onToggleStatus && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onToggleStatus(adId);
                                }}
                                className={`flex-1 font-black py-2.5 rounded-full transition-all flex items-center justify-center text-[9px] shadow-sm uppercase tracking-wider border cursor-pointer ${
                                    ad.isActive
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-550 dark:text-amber-400 hover:bg-amber-500/20'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                                }`}
                            >
                                <span>{ad.isActive ? 'Unpublish' : 'Publish'}</span>
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onDelete(adId);
                                }}
                                className="w-9 h-9 bg-rose-550/10 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-455 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0"
                                title="Delete Listing"
                            >
                                <FaTrashAlt className="text-xs" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvertisementCard;
