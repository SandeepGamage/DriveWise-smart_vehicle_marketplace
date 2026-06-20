import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandModelMap from '../../utils/brand_model_map.json';
import { 
    FaBrain, 
    FaSync, 
    FaRoad, 
    FaCog, 
    FaChevronRight, 
    FaSlidersH,
    FaInfoCircle,
    FaCoins
} from 'react-icons/fa';

const ValuationCalculator = () => {
    // Inputs State
    const [calcData, setCalcData] = useState({
        vehicleName: '',
        model: '',
        ManufactureYear: '2020',
        mileage: '45000',
        transmission: 'Manual',
        powerHp: '150'
    });

    const [predicting, setPredicting] = useState(false);
    const [predictedPrice, setPredictedPrice] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCalcData(prev => ({ ...prev, [name]: value }));
    };

    // Live debounced calibration caller
    useEffect(() => {
        const fetchValuation = async () => {
            if (!calcData.vehicleName || !calcData.model || !calcData.mileage || !calcData.ManufactureYear || !calcData.powerHp) {
                setPredictedPrice(null);
                return;
            }

            setPredicting(true);
            setErrorMsg('');
            try {
                const payload = {
                    vehicleName: calcData.vehicleName,
                    model: calcData.model,
                    mileage: Number(calcData.mileage),
                    ManufactureYear: Number(calcData.ManufactureYear),
                    transmission: calcData.transmission,
                    powerHp: Number(calcData.powerHp)
                };

                const res = await axios.post('http://localhost:3000/api/advertisement/predict-price', payload);
                if (res.data.success) {
                    setPredictedPrice(res.data.predictedPrice);
                } else {
                    setErrorMsg("Evaluation matrix error.");
                }
            } catch (err) {
                setErrorMsg("Backend service did not respond. Check connection.");
                console.warn(err);
            } finally {
                setPredicting(false);
            }
        };

        const debouncer = setTimeout(() => {
            fetchValuation();
        }, 500);

        return () => clearTimeout(debouncer);
    }, [calcData.vehicleName, calcData.model, calcData.mileage, calcData.ManufactureYear, calcData.transmission, calcData.powerHp]);

    // Derived statistics calculations
    const priceLKR = predictedPrice || 0;
    // Standard conversion rate: Euro * 325.0 * 1.10 = LKR -> Euro = LKR / 357.5
    const priceEUR = Math.round(priceLKR / 357.5);
    
    // Interactive depreciation factors logic
    const baseMileage = 50000;
    const mileageDiff = (Number(calcData.mileage) || 0) - baseMileage;
    const mileageImpact = mileageDiff > 0 
        ? `⚠️ High wear penalty: -${(mileageDiff * 0.12).toLocaleString()} LKR estimated`
        : `✓ Low mileage credit: +${(Math.abs(mileageDiff) * 0.12).toLocaleString()} LKR estimated`;

    const ageDiff = new Date().getFullYear() - (Number(calcData.ManufactureYear) || 2020);
    const ageImpact = ageDiff > 0
        ? `⚠️ ${ageDiff}-year age factor: -${(ageDiff * 380000).toLocaleString()} LKR offset`
        : `✓ Showroom premium: +250,000 LKR offset`;

    const powerFactor = (Number(calcData.powerHp) || 150) - 150;
    const powerImpact = powerFactor > 0
        ? `✓ High output bonus (+${powerFactor}hp): +${(powerFactor * 14000).toLocaleString()} LKR`
        : powerFactor < 0
            ? `⚠️ Low output offset (${powerFactor}hp): -${(Math.abs(powerFactor) * 14000).toLocaleString()} LKR`
            : `✓ Standard engine output model baseline`;

    return (
        <div className="space-y-8 pb-16">
            {/* Header Title Section */}
            <div className="pb-6 border-b border-slate-800/80">
                <h1 className="text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/15">
                        <FaBrain />
                    </span>
                    <span>AI Valuation Engine</span>
                    <span className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-bold uppercase tracking-wider">Predictive</span>
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                    Enter vehicle characteristics to query raw scikit-learn pipeline weights live and calibrate pricing models dynamically.
                </p>
            </div>

            {/* Split Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Input parameters Form */}
                <div className="lg:col-span-6 bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-md space-y-6">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                        <FaSlidersH className="text-blue-400 text-xs" />
                        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Calibration Input Panel</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Brand / Make *</label>
                            <select 
                                required 
                                name="vehicleName" 
                                value={calcData.vehicleName} 
                                onChange={(e) => {
                                    const selectedBrand = e.target.value;
                                    const models = brandModelMap[selectedBrand] || [];
                                    setCalcData(prev => ({ 
                                        ...prev, 
                                        vehicleName: selectedBrand, 
                                        model: models.length > 0 ? models[0] : '' 
                                    }));
                                }} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            >
                                <option value="">Select Brand</option>
                                {Object.keys(brandModelMap).map((brand) => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Model Family *</label>
                            <select 
                                required 
                                name="model" 
                                value={calcData.model} 
                                onChange={handleChange} 
                                disabled={!calcData.vehicleName}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <option value="">Select Model</option>
                                {(brandModelMap[calcData.vehicleName] || []).map((model) => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Manufacture Year *</label>
                            <input 
                                required 
                                type="number" 
                                name="ManufactureYear" 
                                value={calcData.ManufactureYear} 
                                onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. 2020" 
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">True Mileage (km) *</label>
                            <input 
                                required 
                                type="number" 
                                name="mileage" 
                                value={calcData.mileage} 
                                onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. 45000" 
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Transmission Type *</label>
                            <select 
                                name="transmission" 
                                value={calcData.transmission} 
                                onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            >
                                <option value="Manual">Manual</option>
                                <option value="Automatic">Automatic</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Horsepower (power_hp) *</label>
                            <input 
                                required 
                                type="number" 
                                name="powerHp" 
                                value={calcData.powerHp} 
                                onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. 150" 
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-950/40 border border-slate-850/50 rounded-2xl text-[11px] text-slate-500 leading-relaxed flex items-start gap-2.5">
                        <FaInfoCircle className="text-blue-400 text-sm mt-0.5 shrink-0" />
                        <p>
                            Predictions are calibrated instantly in the background. Changing parameters triggers asynchronous requests to the Flask server, returning the calculated results using Euro-LKR rates.
                        </p>
                    </div>
                </div>

                {/* Right Side: Dynamic Outputs display card */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Glowing main output card */}
                    <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                        
                        {/* Interactive overlay loader */}
                        {predicting && (
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-15">
                                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
                                    <FaSync className="text-indigo-400 animate-spin text-xs" />
                                    <span className="text-xs font-bold text-slate-300">Recalculating weights...</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-black tracking-widest px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                                    DriveWise Valuation Report
                                </span>
                                <span className="text-slate-500 text-[10px] font-mono">Status: Ready</span>
                            </div>

                            {predictedPrice ? (
                                <div className="space-y-2 py-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Estimated Market Value</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-black text-emerald-400 tracking-tight drop-shadow-[0_2px_10px_rgba(52,211,153,0.15)]">
                                            {priceLKR.toLocaleString()}
                                        </span>
                                        <span className="text-lg font-bold text-emerald-500">LKR</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                                        <FaCoins className="text-[10px] text-slate-500" />
                                        <span>Approx. {priceEUR.toLocaleString()} EUR equivalent</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-2">
                                    <span className="text-3xl block">🔮</span>
                                    <p className="text-slate-500 text-xs italic">Awaiting dynamic specs parameters to compute valuation...</p>
                                </div>
                            )}
                        </div>

                        {predictedPrice && (
                            <div className="border-t border-slate-800/80 pt-6 mt-4 space-y-3 text-[11px] text-slate-400">
                                <h4 className="font-bold text-slate-300 uppercase tracking-wide text-[10px]">Depreciation Breakdown</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-center justify-between">
                                        <span>Wear Parameter ({calcData.mileage} km)</span>
                                        <span className="font-semibold text-slate-300">{mileageImpact}</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span>Age Parameter (Mfg {calcData.ManufactureYear})</span>
                                        <span className="font-semibold text-slate-300">{ageImpact}</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span>Power Parameter ({calcData.powerHp} hp)</span>
                                        <span className="font-semibold text-slate-300">{powerImpact}</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Model Parameter Insights */}
                    <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <FaInfoCircle className="text-indigo-400 text-xs" />
                            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">How to Change live valuation logic?</h3>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed font-light">
                            The live valuation model runs on a Python scikit-learn pipeline located under <code>/prediction-service</code>. To change the coefficients or support more features (like fuel categories or color weighting), follow the instructions in the model training file.
                        </p>
                        <div className="flex gap-2">
                            <Link 
                                to="/create-ad" 
                                className="flex-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 hover:text-white font-bold py-2 rounded-xl text-center text-xs transition-colors"
                            >
                                Sell Vehicle with AI Tags
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValuationCalculator;
