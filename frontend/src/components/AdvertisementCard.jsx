import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaRoad,
    FaGasPump,
    FaCog,
    FaPalette,
    FaBrain,
    FaArrowLeft,
    FaArrowRight,
    FaEye,
    FaTrashAlt,
    FaRegBookmark,
    FaBookmark
} from 'react-icons/fa';

const AdvertisementCard = ({ ad, onDelete }) => {
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
    let valuationColor = 'text-blue-400 bg-blue-950/60 border-blue-800/60';
    let valuationMsg = 'Priced around market rate';

    if (aiPrice > 0) {
        if (percentDiff >= 8) {
            valuationLabel = 'Great Deal';
            valuationColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
            valuationMsg = `${Math.round(percentDiff)}% under market valuation`;
        } else if (percentDiff <= -8) {
            valuationLabel = 'Premium Priced';
            valuationColor = 'text-amber-400 bg-amber-950/60 border-amber-800/60';
            valuationMsg = `${Math.round(Math.abs(percentDiff))}% over market valuation`;
        }
    }

    const adId = ad._id || ad.id || ad.addId;

    return (
        <div className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700/80 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col h-full relative">
            {/* Visuals Box */}
            <div className="relative aspect-video overflow-hidden bg-slate-950 group-hover:subpixel-antialiased">
                <Link to={`/advertisement/${adId}`}>
                    <img
                        src={images[currentImgIdx]}
                        alt={`${ad.vehicleName} ${ad.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                </Link>

                {/* Floating Bookmark & Status Indicators */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-auto z-10">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md border border-slate-800 text-slate-300">
                        {ad.ManufactureYear}
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setIsBookmarked(!isBookmarked);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-950/70 backdrop-blur-md border border-slate-800 flex items-center justify-center text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition-all"
                    >
                        {isBookmarked ? <FaBookmark className="text-blue-500 text-xs" /> : <FaRegBookmark className="text-xs" />}
                    </button>
                </div>

                {/* Gallery Slideshow Arrows */}
                {images.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={prevImage}
                            className="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-800 text-white flex items-center justify-center text-[10px] hover:bg-blue-600 hover:border-blue-500 transition-colors"
                        >
                            <FaArrowLeft />
                        </button>
                        <button
                            onClick={nextImage}
                            className="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-800 text-white flex items-center justify-center text-[10px] hover:bg-blue-600 hover:border-blue-500 transition-colors"
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                )}

                {/* Image Dots Indicator */}
                {images.length > 1 && (
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
                        {images.map((_, idx) => (
                            <span
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIdx ? 'bg-blue-500 w-3' : 'bg-slate-500/60'
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
                    <div className="flex items-start justify-between mb-1.5">
                        <h3 className="font-extrabold text-slate-200 text-sm tracking-tight truncate max-w-[80%]">
                            <Link to={`/advertisement/${adId}`} className="hover:text-blue-400 transition-colors">
                                {ad.vehicleName} <span className="font-semibold text-slate-400">{ad.model}</span>
                            </Link>
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800/80 border border-slate-700/40 rounded text-slate-400">
                            {ad.fuelType}
                        </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {ad.description || "No description provided."}
                    </p>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center space-x-2 p-2 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                            <FaRoad className="text-slate-500 text-[11px]" />
                            <span className="text-[10px] text-slate-400 font-bold truncate">
                                {ad.mileage?.toLocaleString() || 0} km
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                            <FaCog className="text-slate-500 text-[11px]" />
                            <span className="text-[10px] text-slate-400 font-bold truncate">
                                {ad.transmission}
                            </span>
                        </div>
                    </div>

                    {/* DriveWise AI Index Meter */}
                    <div className={`p-3 rounded-2xl border text-xs mb-4 flex flex-col space-y-1 ${valuationColor}`}>
                        <div className="flex items-center justify-between font-extrabold">
                            <div className="flex items-center space-x-1.5">
                                <FaBrain className="text-[10px]" />
                                <span className="uppercase text-[9px] tracking-wider">DriveWise AI</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 border border-black/10">
                                {valuationLabel}
                            </span>
                        </div>
                        <p className="text-[10px] opacity-80 leading-snug">{valuationMsg}</p>
                    </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="border-t border-slate-800/60 pt-4 mt-auto">
                    <div className="flex items-baseline justify-between mb-3.5">
                        <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Price</span>
                            <span className="text-base font-black text-emerald-400 tracking-tight">
                                {askingPrice.toLocaleString()} <span className="text-[10px] font-bold">LKR</span>
                            </span>
                        </div>
                        {aiPrice > 0 && (
                            <div className="text-right">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">AI Estimate</span>
                                <span className="text-xs font-bold text-slate-400">
                                    {aiPrice.toLocaleString()} <span className="text-[9px]">LKR</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex gap-2">
                        <Link
                            to={`/advertisement/${adId}`}
                            className="flex-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 hover:text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 text-xs shadow-md"
                        >
                            <FaEye className="text-xs" />
                            <span>View Details</span>
                        </Link>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (confirm('Are you sure you want to delete this listing?')) {
                                        onDelete(adId);
                                    }
                                }}
                                className="w-9 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/40 text-rose-400 hover:text-rose-300 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md"
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
