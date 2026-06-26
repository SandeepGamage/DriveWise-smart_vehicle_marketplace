import React, { useState, useEffect } from 'react';
import axios from 'axios';
import brandModelMap from '../../utils/brand_model_map.json';
import sriLankaLocations from '../../utils/sri_lanka_locations.json';
import mediaUpload from '../../utils/mediaUpload.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
import { goeyToast } from 'goey-toast';

const CreateAdvertisement = () => {
    const { user } = useAuth();
    const storedUserId = user?._id || user?.UID || '';

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        vehicleName: '',
        model: '',
        price: '',
        ManufactureYear: '',
        mileage: '',
        fuelType: 'Petrol',
        transmission: 'Manual',
        color: '',
        images: ['https://placehold.co/600x400?text=Vehicle+Image'],
        userId: storedUserId,
        province: '',
        district: '',
        city: ''
    });

    const [loading, setLoading] = useState(false);
    const [predicting, setPredicting] = useState(false);
    const [responseMessage, setResponseMessage] = useState({ type: '', text: '' });
    const [autoPredictedPrice, setAutoPredictedPrice] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [manualUrl, setManualUrl] = useState('');

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            userId: storedUserId
        }));
    }, [storedUserId]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError('');

        try {
            const url = await mediaUpload(file);
            setFormData(prev => {
                const currentImages = prev.images.filter(img => !img.includes('placehold.co'));
                return {
                    ...prev,
                    images: [...currentImages, url]
                };
            });
        } catch (err) {
            setUploadError(err.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => {
            const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
            return {
                ...prev,
                images: updated.length > 0 ? updated : ['https://placehold.co/600x400?text=Vehicle+Image']
            };
        });
    };

    // 🔮 Real-time Background Engine Debouncer
    useEffect(() => {
        const fetchLiveValuation = async () => {
            if (formData.vehicleName && formData.model && formData.mileage && formData.ManufactureYear && formData.transmission) {
                setPredicting(true);
                try {
                    const evaluationPayload = {
                        vehicleName: formData.vehicleName,
                        model: formData.model,
                        ManufactureYear: Number(formData.ManufactureYear),
                        mileage: Number(formData.mileage),
                        transmission: formData.transmission
                    };

                    const res = await axios.post(`${API_BASE_URL}/api/advertisement/predict-price`, evaluationPayload);

                    if (res.data.success) {
                        setAutoPredictedPrice(res.data.predictedPrice);
                    }
                } catch (err) {
                    console.warn("Valuation data matrix processing context awaiting input configuration...");
                } finally {
                    setPredicting(false);
                }
            }
        };

        const typingDelayTimer = setTimeout(() => {
            fetchLiveValuation();
        }, 800);

        return () => clearTimeout(typingDelayTimer);
    }, [formData.vehicleName, formData.model, formData.mileage, formData.ManufactureYear, formData.transmission]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (Number(formData.price) < 0 || Number(formData.mileage) < 0 || Number(formData.ManufactureYear) < 0) {
            goeyToast.error('Validation Warning', {
                description: 'Price, mileage, and manufacture year cannot be negative.'
            });
            setLoading(false);
            return;
        }

        const finalizedPayload = {
            ...formData,
            price: Number(formData.price),
            ManufactureYear: Number(formData.ManufactureYear),
            mileage: Number(formData.mileage),
            predictedPrice: autoPredictedPrice,
            userId: storedUserId || formData.userId
        };

        if (!storedUserId && !formData.userId) {
            setResponseMessage({ type: 'error', text: 'Please sign in before creating a listing.' });
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('drivewise_token');
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const res = await axios.post(`${API_BASE_URL}/api/advertisement/advertisements`, finalizedPayload, {
                headers: authHeaders
            });
            if (res.data.success) {
                goeyToast.success('Advertisement Listed', {
                    description: 'Ad post created live across your vehicle marketplace!'
                });
                setFormData({
                    title: '', description: '', vehicleName: '', model: '', price: '',
                    ManufactureYear: '', mileage: '', fuelType: 'Petrol', transmission: 'Manual',
                    color: '', images: ['https://placehold.co/600x400?text=Vehicle+Image'], userId: storedUserId,
                    province: '', district: '', city: ''
                });
                setAutoPredictedPrice(null);
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.response?.data?.error || 'Database storage failure.';
            goeyToast.error('Publishing Failure', {
                description: errMsg
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-10 transition-colors duration-300 text-warm-dark dark:text-slate-100">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-sand-300/50 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-8 transition-colors duration-300">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-warm-dark dark:text-slate-100 tracking-tight">List New Vehicle For Sale</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Our AI engine will calibrate valuation metrics dynamically while you fill out the details.</p>
                </div>

                {responseMessage.text && (
                    <div className={`p-4 rounded-2xl mb-6 text-xs font-black border uppercase tracking-wider ${
                        responseMessage.type === 'success' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40' 
                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/40'
                    }`}>
                        {responseMessage.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Ad Title *</label>
                            <input 
                                required 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent focus:bg-white focus:dark:bg-slate-950" 
                                placeholder="e.g., Unregistered Petrol Audi A4" 
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Detailed Description *</label>
                            <textarea 
                                required 
                                rows="3" 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-2xl px-4.5 py-3 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent focus:bg-white focus:dark:bg-slate-950" 
                                placeholder="Vehicle condition features..."
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Vehicle Gallery / Images</label>
                            <div className="relative border-2 border-dashed border-sand-300 dark:border-slate-800 hover:border-warm-accent/80 rounded-2xl p-6 transition-all duration-200 bg-sand-100/50 dark:bg-slate-950/40 flex flex-col items-center justify-center text-center group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                />
                                <div className="space-y-2 pointer-events-none">
                                    <div className="text-3xl transition-transform group-hover:scale-110 duration-200">
                                        {uploading ? "⏳" : "📸"}
                                    </div>
                                    <div className="text-sm font-bold text-warm-dark dark:text-slate-200">
                                        {uploading ? "Uploading media asset..." : "Drag & Drop or Click to Upload Image"}
                                    </div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">Supports PNG, JPG, WEBP (Max 5MB)</div>
                                </div>
                            </div>

                            {uploadError && (
                                <p className="text-xs text-rose-600 font-black mt-2">⚠️ {uploadError}</p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                {formData.images.map((imgUrl, idx) => {
                                    const isPlaceholder = imgUrl.includes('placehold.co');
                                    return (
                                        <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden bg-sand-100 dark:bg-slate-950 border border-sand-200 dark:border-slate-800 shadow-sm group">
                                            <img src={imgUrl} alt={`Vehicle preview ${idx + 1}`} className="w-full h-full object-cover" />
                                            {!isPlaceholder && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 cursor-pointer"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-sand-200 dark:border-slate-800 pt-6">
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Location Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Province *</label>
                                <select
                                    required
                                    name="province"
                                    value={formData.province}
                                    onChange={(e) => {
                                        const selectedProvince = e.target.value;
                                        const districts = selectedProvince ? Object.keys(sriLankaLocations[selectedProvince]) : [];
                                        const firstDistrict = districts.length > 0 ? districts[0] : '';
                                        const cities = (selectedProvince && firstDistrict) ? sriLankaLocations[selectedProvince][firstDistrict] : [];
                                        const firstCity = cities.length > 0 ? cities[0] : '';
                                        setFormData(prev => ({
                                            ...prev,
                                            province: selectedProvince,
                                            district: firstDistrict,
                                            city: firstCity
                                        }));
                                    }}
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent cursor-pointer"
                                >
                                    <option value="" className="dark:bg-slate-900 dark:text-slate-300">Select Province</option>
                                    {Object.keys(sriLankaLocations).map((province) => (
                                        <option key={province} value={province} className="dark:bg-slate-900 dark:text-slate-300">{province}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">District *</label>
                                <select
                                    required
                                    name="district"
                                    value={formData.district}
                                    onChange={(e) => {
                                        const selectedDistrict = e.target.value;
                                        const cities = (formData.province && selectedDistrict) ? sriLankaLocations[formData.province][selectedDistrict] : [];
                                        const firstCity = cities.length > 0 ? cities[0] : '';
                                        setFormData(prev => ({
                                            ...prev,
                                            district: selectedDistrict,
                                            city: firstCity
                                        }));
                                    }}
                                    disabled={!formData.province}
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent disabled:opacity-50 cursor-pointer"
                                >
                                    <option value="" className="dark:bg-slate-900 dark:text-slate-300">Select District</option>
                                    {formData.province && Object.keys(sriLankaLocations[formData.province]).map((district) => (
                                        <option key={district} value={district} className="dark:bg-slate-900 dark:text-slate-300">{district}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">City / Location *</label>
                                <select
                                    required
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={!formData.district}
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent disabled:opacity-50 cursor-pointer"
                                >
                                    <option value="" className="dark:bg-slate-900 dark:text-slate-300">Select City</option>
                                    {formData.province && formData.district && sriLankaLocations[formData.province][formData.district].map((city) => (
                                        <option key={city} value={city} className="dark:bg-slate-900 dark:text-slate-300">{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-sand-200 dark:border-slate-800 pt-6">
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Core Specification Matrix</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Brand / Make *</label>
                                <select
                                    required
                                    name="vehicleName"
                                    value={formData.vehicleName}
                                    onChange={(e) => {
                                        const selectedBrand = e.target.value;
                                        const models = brandModelMap[selectedBrand] || [];
                                        setFormData(prev => ({
                                            ...prev,
                                            vehicleName: selectedBrand,
                                            model: models.length > 0 ? models[0] : ''
                                        }));
                                    }}
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent cursor-pointer"
                                >
                                    <option value="" className="dark:bg-slate-900 dark:text-slate-300">Select Brand</option>
                                    {Object.keys(brandModelMap).map((brand) => (
                                        <option key={brand} value={brand} className="dark:bg-slate-900 dark:text-slate-300">{brand}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Model Family *</label>
                                <select
                                    required
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    disabled={!formData.vehicleName}
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent disabled:opacity-50 cursor-pointer"
                                >
                                    <option value="" className="dark:bg-slate-900 dark:text-slate-300">Select Model</option>
                                    {(brandModelMap[formData.vehicleName] || []).map((model) => (
                                        <option key={model} value={model} className="dark:bg-slate-900 dark:text-slate-300">{model}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Year of Manufacture *</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="1900"
                                    name="ManufactureYear" 
                                    value={formData.ManufactureYear} 
                                    onChange={handleChange} 
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent" 
                                    placeholder="e.g., 2021" 
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">True Mileage (km) *</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="0"
                                    name="mileage" 
                                    value={formData.mileage} 
                                    onChange={handleChange} 
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent" 
                                    placeholder="e.g., 32000" 
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Transmission *</label>
                                <select 
                                    name="transmission" 
                                    value={formData.transmission} 
                                    onChange={handleChange} 
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent cursor-pointer"
                                >
                                    <option value="Manual" className="dark:bg-slate-900 dark:text-slate-300">Manual</option>
                                    <option value="Automatic" className="dark:bg-slate-900 dark:text-slate-300">Automatic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Fuel Category *</label>
                                <select 
                                    name="fuelType" 
                                    value={formData.fuelType} 
                                    onChange={handleChange} 
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent cursor-pointer"
                                >
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Electric">Electric</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Exterior Paint Color *</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="color" 
                                    value={formData.color} 
                                    onChange={handleChange} 
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs text-warm-dark dark:text-slate-200 focus:outline-none focus:border-warm-accent" 
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Your Asking Price (LKR) *</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="0"
                                    name="price" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    className="w-full bg-sand-100 dark:bg-slate-950/40 border border-sand-200/50 dark:border-slate-800 rounded-full px-4.5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-450 focus:outline-none focus:border-warm-accent" 
                                    placeholder="Enter target sales price" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* High-Visibility Live Valuation Insight Card (Contrast Dark Container) */}
                    <div className="mt-8 rounded-4xl border border-white/5 bg-warm-dark p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">🔮</span>
                                <div>
                                    <h4 className="text-xs font-black text-warm-accent tracking-widest uppercase">DriveWise AI Valuation Feedback</h4>
                                    <p className="text-[10px] text-slate-400 font-mono">Market-calibrated predictive weights</p>
                                </div>
                            </div>
                            {predicting ? (
                                <span className="text-[10px] font-black uppercase tracking-wider text-warm-accent bg-white/5 border border-white/10 px-3 py-1 rounded-full animate-pulse">Recalculating...</span>
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">Ready</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estimated Value</span>
                                {autoPredictedPrice ? (
                                    <div>
                                        <span className="text-2xl font-black text-emerald-450 tracking-tight block drop-shadow-[0_2px_8px_rgba(52,211,153,0.15)]">
                                            {autoPredictedPrice.toLocaleString()} <span className="text-xs font-bold text-emerald-500">LKR</span>
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-medium text-slate-400 italic block py-2">Awaiting parameters to calculate...</span>
                                )}
                            </div>

                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Your Price Tag</span>
                                <span className="text-2xl font-black text-slate-200 tracking-tight block">
                                    {formData.price ? `${Number(formData.price).toLocaleString()} ` : "0 "}
                                    <span className="text-xs font-bold text-slate-500">LKR</span>
                                </span>
                                {autoPredictedPrice && formData.price && (
                                    <span className={`text-[10px] font-black uppercase tracking-wider block mt-1.5 ${Number(formData.price) > autoPredictedPrice ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {Number(formData.price) > autoPredictedPrice
                                            ? `⚠️ ${(Number(formData.price) - autoPredictedPrice).toLocaleString()} LKR over estimate`
                                            : `✓ ${(autoPredictedPrice - Number(formData.price)).toLocaleString()} LKR under estimate`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark font-black py-4 px-6 rounded-full shadow-sm transition-all text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Publishing Advertisement...' : 'Publish Advertisement Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAdvertisement;