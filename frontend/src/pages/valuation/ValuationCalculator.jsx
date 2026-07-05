import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandModelMap from '../../utils/brand_model_map.json';
import { 
    FaBrain, 
    FaSync, 
    FaRoad, 
    FaCog, 
    FaSlidersH,
    FaInfoCircle,
    FaCoins
} from 'react-icons/fa';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

                const res = await axios.post(`${API_BASE_URL}/api/advertisement/predict-price`, payload);
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
        ? `Penalty: -${(mileageDiff * 0.12).toLocaleString()} LKR`
        : `Credit: +${(Math.abs(mileageDiff) * 0.12).toLocaleString()} LKR`;

    const ageDiff = new Date().getFullYear() - (Number(calcData.ManufactureYear) || 2020);
    const ageImpact = ageDiff > 0
        ? `Age: -${(ageDiff * 380000).toLocaleString()} LKR`
        : `Premium: +250,000 LKR`;

    const powerFactor = (Number(calcData.powerHp) || 150) - 150;
    const powerImpact = powerFactor > 0
        ? `Bonus: +${(powerFactor * 14000).toLocaleString()} LKR`
        : powerFactor < 0
            ? `Offset: -${(Math.abs(powerFactor) * 14000).toLocaleString()} LKR`
            : `Standard output`;

    return (
        <div className="space-y-8 pb-16 transition-colors duration-300">
            {/* Header Title Section */}
            <div className="pb-6 border-b border-sand-300/50 dark:border-slate-800/80">
                <h1 className="text-4xl font-black text-warm-dark dark:text-slate-100 tracking-tight flex items-center gap-2.5 font-sans">
                    <span className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-sand-300/60 dark:border-slate-700/60 text-warm-accent flex items-center justify-center shadow-sm">
                        <FaBrain className="text-lg" />
                    </span>
                    <span>AI Valuation Engine</span>
                    <span className="text-[10px] px-2.5 py-1 bg-warm-dark dark:bg-warm-accent text-white dark:text-warm-dark rounded-full font-black uppercase tracking-wider">Predictive</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                    Enter vehicle characteristics to query raw scikit-learn pipeline weights live and calibrate pricing models dynamically.
                </p>
            </div>

            {/* Split Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Input parameters Form */}
                <div className="lg:col-span-6 bg-white dark:bg-slate-800 border border-sand-300/50 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-sm space-y-6">
                    <div className="flex items-center gap-2 pb-3 border-b border-sand-200 dark:border-slate-700">
                        <FaSlidersH className="text-warm-accent text-xs" />
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Calibration Input Panel</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1.5">Brand / Make *</label>
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
                                className="w-full bg-sand-100 dark:bg-slate-900 border border-sand-200/50 dark:border-slate-800 text-warm-dark dark:text-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-warm-accent transition-colors cursor-pointer"
                            >
                                <option value="" className="dark:bg-slate-800 dark:text-slate-300">Select Brand</option>
                                {Object.keys(brandModelMap).map((brand) => (
                                    <option key={brand} value={brand} className="dark:bg-slate-800 dark:text-slate-350">{brand}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1.5">Model Family *</label>
                            <select 
                                required 
                                name="model" 
                                value={calcData.model} 
                                onChange={handleChange} 
                                disabled={!calcData.vehicleName}
                                className="w-full bg-sand-100 dark:bg-slate-900 border border-sand-200/50 dark:border-slate-800 text-warm-dark dark:text-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-warm-accent transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <option value="" className="dark:bg-slate-800 dark:text-slate-300">Select Model</option>
                                {(brandModelMap[calcData.vehicleName] || []).map((model) => (
                                    <option key={model} value={model} className="dark:bg-slate-800 dark:text-slate-350">{model}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1.5">Manufacture Year *</label>
                            <input 
                                required 
                                type="number" 
                                min="1900"
                                name="ManufactureYear" 
                                value={calcData.ManufactureYear} 
                                onChange={handleChange} 
                                className="w-full bg-sand-100 dark:bg-slate-900 border border-sand-200/50 dark:border-slate-800 text-warm-dark dark:text-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-warm-accent transition-colors"
                                placeholder="e.g. 2020" 
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1.5">True Mileage (km) *</label>
                            <input 
                                required 
                                type="number" 
                                min="0"
                                name="mileage" 
                                value={calcData.mileage} 
                                onChange={handleChange} 
                                className="w-full bg-sand-100 dark:bg-slate-900 border border-sand-200/50 dark:border-slate-800 text-warm-dark dark:text-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-warm-accent transition-colors"
                                placeholder="e.g. 45000" 
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1.5">Transmission Type *</label>
                            <select 
                                name="transmission" 
                                value={calcData.transmission} 
                                onChange={handleChange} 
                                className="w-full bg-sand-100 dark:bg-slate-900 border border-sand-200/50 dark:border-slate-800 text-warm-dark dark:text-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-warm-accent transition-colors cursor-pointer"
                            >
                                <option value="Manual" className="dark:bg-slate-800 dark:text-slate-350">Manual</option>
                                <option value="Automatic" className="dark:bg-slate-800 dark:text-slate-350">Automatic</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1.5">Horsepower (HP) *</label>
                            <input 
                                required 
                                type="number" 
                                min="1"
                                name="powerHp" 
                                value={calcData.powerHp} 
                                onChange={handleChange} 
                                className="w-full bg-sand-100 dark:bg-slate-900 border border-sand-200/50 dark:border-slate-800 text-warm-dark dark:text-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-warm-accent transition-colors"
                                placeholder="e.g. 150" 
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-sand-100 dark:bg-slate-900 border border-sand-200/50 dark:border-slate-800/80 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2.5">
                        <FaInfoCircle className="text-warm-accent text-sm mt-0.5 shrink-0" />
                        <p>
                            Predictions are calibrated instantly in the background. Changing parameters triggers asynchronous requests to the server, returning the calculated results using Euro-LKR rates.
                        </p>
                    </div>
                </div>

                {/* Right Side: Dynamic Outputs display card (Contrast Dark Container) */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Glowing main output card */}
                    <div className="bg-warm-dark text-white rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between min-h-[300px] relative overflow-hidden border border-white/5">
                        
                        {/* Interactive overlay loader */}
                        {predicting && (
                            <div className="absolute inset-0 bg-warm-dark/75 backdrop-blur-sm flex items-center justify-center z-15">
                                <div className="flex items-center gap-2 bg-warm-dark-card border border-white/10 px-4 py-2.5 rounded-full">
                                    <FaSync className="text-warm-accent animate-spin text-xs" />
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">Recalculating...</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-black tracking-widest px-3 py-1 bg-white/10 text-slate-300 border border-white/10 rounded-full">
                                    DriveWise Valuation Report
                                </span>
                                <span className="text-slate-400 text-[10px] font-mono">Status: Ready</span>
                            </div>

                            {predictedPrice ? (
                                <div className="space-y-2 py-4">
                                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Estimated Market Value</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-black text-emerald-450 tracking-tight block drop-shadow-[0_2px_10px_rgba(52,211,153,0.15)]">
                                            {priceLKR.toLocaleString()}
                                        </span>
                                        <span className="text-lg font-black text-emerald-500">LKR</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                        <FaCoins className="text-[10px] text-slate-500" />
                                        <span>Approx. {priceEUR.toLocaleString()} EUR equivalent</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-2">
                                    <span className="text-3xl block">🔮</span>
                                    <p className="text-slate-400 text-xs italic">Awaiting dynamic specs parameters to compute valuation...</p>
                                </div>
                            )}
                        </div>

                        {predictedPrice && (
                            <div className="border-t border-white/10 pt-6 mt-4 space-y-3 text-[11px] text-slate-400">
                                <h4 className="font-black text-slate-300 uppercase tracking-widest text-[9px]">Depreciation Breakdown</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-center justify-between">
                                        <span>Wear Parameter ({calcData.mileage} km)</span>
                                        <span className={`font-bold ${calcData.mileage > 50000 ? 'text-amber-400' : 'text-emerald-400'}`}>{mileageImpact}</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span>Age Parameter (Mfg {calcData.ManufactureYear})</span>
                                        <span className={`font-bold ${new Date().getFullYear() - calcData.ManufactureYear > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{ageImpact}</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span>Power Parameter ({calcData.powerHp} hp)</span>
                                        <span className={`font-bold ${calcData.powerHp > 150 ? 'text-emerald-400' : calcData.powerHp < 150 ? 'text-amber-400' : 'text-slate-400'}`}>{powerImpact}</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Model Parameter Insights */}
                    <div className="bg-warm-dark text-white rounded-[2.5rem] p-8 shadow-xl space-y-6 border border-white/5">
                        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                            <FaInfoCircle className="text-warm-accent text-sm" />
                            <h3 className="text-xs font-black uppercase tracking-wider">Calibration Architecture</h3>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed font-light">
                            The live valuation model runs on a Python scikit-learn pipeline. To update coefficients or import additional features, configure the matrix calibration arrays inside the prediction service.
                        </p>
                        <div className="flex gap-2 pt-2">
                            <Link 
                                to="/create-ad" 
                                className="flex-1 bg-warm-accent hover:bg-warm-accent-hover text-warm-dark font-black py-3 rounded-full text-center text-xs transition-colors uppercase tracking-widest shadow-md"
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
