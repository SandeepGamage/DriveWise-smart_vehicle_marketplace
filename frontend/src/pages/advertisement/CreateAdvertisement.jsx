import React, { useState, useEffect } from 'react';
import axios from 'axios';
import brandModelMap from '../../utils/brand_model_map.json';
import mediaUpload from '../../utils/mediaUpload.jsx';



const CreateAdvertisement = () => {
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
        userId: 'User_Savin_2026'
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
                    // Construct a targeted payload explicitly for real-time calculation
                    const evaluationPayload = {
                        vehicleName: formData.vehicleName,
                        model: formData.model,
                        ManufactureYear: Number(formData.ManufactureYear),
                        mileage: Number(formData.mileage),
                        transmission: formData.transmission
                    };

                    // Hits the clean proxy route to avoid schema checks and MongoDB writes while typing
                    const res = await axios.post('http://localhost:3000/api/advertisement/predict-price', evaluationPayload);
                    
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
        setResponseMessage({ type: '', text: '' });

        const finalizedPayload = {
            ...formData,
            price: Number(formData.price),
            ManufactureYear: Number(formData.ManufactureYear),
            mileage: Number(formData.mileage),
            predictedPrice: autoPredictedPrice
        };

        try {
            const res = await axios.post('http://localhost:3000/api/advertisement/advertisements', finalizedPayload);
            if (res.data.success) {
                setResponseMessage({ type: 'success', text: 'Ad post created live across your vehicle marketplace!' });
                setFormData({
                    title: '', description: '', vehicleName: '', model: '', price: '',
                    ManufactureYear: '', mileage: '', fuelType: 'Petrol', transmission: 'Manual',
                    color: '', images: ['https://placehold.co/600x400?text=Vehicle+Image'], userId: 'User_Savin_2026'
                });
                setAutoPredictedPrice(null);
            }
        } catch (err) {
            setResponseMessage({ type: 'error', text: err.response?.data?.message || err.response?.data?.error || 'Database storage failure.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4">
            <div className="max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700/80">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-blue-500 tracking-tight">List New Vehicle For Sale</h1>
                    <p className="text-slate-400 text-sm mt-1">Our data metrics engine will evaluate market weights dynamically while you type.</p>
                </div>

                {responseMessage.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold border ${
                        responseMessage.type === 'success' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' : 'bg-rose-950/40 text-rose-400 border-rose-800'
                    }`}>{responseMessage.text}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Ad Title *</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g., Unregistered Petrol Audi A4" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Detailed Description *</label>
                            <textarea required rows="3" name="description" value={formData.description} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="Vehicle condition features..."></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Vehicle Gallery / Images</label>
                            <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-2xl p-6 transition-all duration-200 bg-slate-900/50 flex flex-col items-center justify-center text-center group">
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
                                    <div className="text-sm font-bold text-slate-300">
                                        {uploading ? "Uploading media asset to cloud..." : "Drag & Drop or Click to Upload Image"}
                                    </div>
                                    <div className="text-xs text-slate-500">Supports PNG, JPG, WEBP (Max 5MB)</div>
                                </div>
                            </div>

                            {uploadError && (
                                <p className="text-xs text-rose-400 font-bold mt-2">⚠️ {uploadError}</p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                {formData.images.map((imgUrl, idx) => {
                                    const isPlaceholder = imgUrl.includes('placehold.co');
                                    return (
                                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group shadow-md">
                                            <img src={imgUrl} alt={`Vehicle preview ${idx + 1}`} className="w-full h-full object-cover" />
                                            {!isPlaceholder && (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 text-xs shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
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

                    <div className="border-t border-slate-700/60 pt-6">
                        <h3 className="text-base font-extrabold text-slate-300 mb-4">Core Specification Matrix</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Brand / Make *</label>
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
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                                >
                                    <option value="">Select Brand</option>
                                    {Object.keys(brandModelMap).map((brand) => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Model Family *</label>
                                <select 
                                    required 
                                    name="model" 
                                    value={formData.model} 
                                    onChange={handleChange} 
                                    disabled={!formData.vehicleName}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
                                >
                                    <option value="">Select Model</option>
                                    {(brandModelMap[formData.vehicleName] || []).map((model) => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Year of Manufacture *</label>
                                <input required type="number" name="ManufactureYear" value={formData.ManufactureYear} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g., 2021" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">True Mileage (km) *</label>
                                <input required type="number" name="mileage" value={formData.mileage} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g., 32000" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Transmission *</label>
                                <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm">
                                    <option value="Manual">Manual</option>
                                    <option value="Automatic">Automatic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Fuel Category *</label>
                                <input required type="text" name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Exterior Paint Color *</label>
                                <input required type="text" name="color" value={formData.color} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Your Asking Price (LKR) *</label>
                                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="Enter target sales price" />
                            </div>
                        </div>
                    </div>

                    {/* High-Visibility Live Valuation Insight Card */}
                    <div className="mt-8 bg-slate-900/90 border-2 border-blue-500/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl animate-pulse">🔮</span>
                                <div>
                                    <h4 className="text-sm font-black text-blue-400 tracking-wide uppercase">DriveWise AI Valuation Feedback</h4>
                                    <p className="text-xs text-slate-500">Market-calibrated predictive calculation arrays</p>
                                </div>
                            </div>
                            {predicting ? (
                                <span className="text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full animate-pulse">Recalculating...</span>
                            ) : (
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1 rounded-full">Ready</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estimated Value</span>
                                {autoPredictedPrice ? (
                                    <div>
                                        <span className="text-2xl font-black text-emerald-400 tracking-tight block drop-shadow-[0_2px_8px_rgba(52,211,153,0.2)]">
                                            {autoPredictedPrice.toLocaleString()} <span className="text-sm font-bold text-emerald-500">LKR</span>
                                        </span>
                                        <span className="text-[10px] text-slate-500 block mt-1">* Converted value from base pipeline matrix models</span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-medium text-slate-500 italic block py-2">Awaiting dynamic input values...</span>
                                )}
                            </div>

                            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Your Price Tag</span>
                                <span className="text-2xl font-black text-slate-200 tracking-tight block">
                                    {formData.price ? `${Number(formData.price).toLocaleString()} ` : "0 "}
                                    <span className="text-sm font-bold text-slate-500">LKR</span>
                                </span>
                                {autoPredictedPrice && formData.price && (
                                    <span className={`text-[10px] font-bold block mt-1 ${Number(formData.price) > autoPredictedPrice ? 'text-amber-400' : 'text-sky-400'}`}>
                                        {Number(formData.price) > autoPredictedPrice 
                                            ? `⚠️ ${(Number(formData.price) - autoPredictedPrice).toLocaleString()} LKR over market evaluation`
                                            : `✓ ${(autoPredictedPrice - Number(formData.price)).toLocaleString()} LKR under market evaluation`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all text-sm tracking-wide disabled:opacity-50">
                        {loading ? 'Committing Document to Cluster...' : 'Publish Advertisement Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAdvertisement;