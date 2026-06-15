import axios from 'axios';
import Advert from '../models/advertModel.js';

// The URL of your Python Flask microservice (now on Port 5000)
const PREDICTION_SERVICE_URL = process.env.PREDICTION_SERVICE_URL ||  'http://127.0.0.1:5000/api/predict';

// Define a stable standard exchange rate conversion factor (1 Euro ≈ 325 LKR)
// You can adjust this value based on current central bank metrics
const EURO_TO_LKR_RATE = 325.0; 

const getPredictedPrice = async (vehicleData) => {
    try {
        // Map your form fields to what your Python pipeline expects
        const predictionPayload = {
            make: vehicleData.vehicleName,           
            model: vehicleData.model,                 
            mileage_km: Number(vehicleData.mileage) || 0,    
            production_year: Number(vehicleData.ManufactureYear) || new Date().getFullYear(),  
            power_hp: 150, // Default baseline power used during model training
            transmission: vehicleData.transmission    
        };

        // Call your Python Flask Service
        const response = await axios.post(PREDICTION_SERVICE_URL, predictionPayload, {
            timeout: 5000  
        });

        if (response.data.success) {
            // 1. Extract the raw Euro valuation from Python
            const priceInEuro = response.data['predicted_price(euro)'];

            // 2. Convert it directly to LKR and add a 10% market adjustment markup
            const priceInLKR = priceInEuro * EURO_TO_LKR_RATE * 1.10;

            // 3. Return the clean rounded value
            return Math.round(priceInLKR);  
        } else {
            console.warn('Prediction service returned success: false');
            return null;
        }
    } catch (error) {
        console.warn('Error calling prediction service:', error.message);
        return null;
    }
};

export const createAdvertisement = async (req, res) => {
    try {
        const {
            title,
            description,
            vehicleName,
            price,
            ManufactureYear,
            mileage,
            fuelType,
            transmission,
            color,
            images,
            model,
            predictedPrice,
            userId
        } = req.body;

        // Validation guard clause
        if (!title || !description || !vehicleName || !price || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        let finalPredictedPrice = predictedPrice;

        // If a prediction hasn't been cached yet, fetch it now
        if (!finalPredictedPrice) {
            console.log('🔮 Fetching and converting predicted price from ML service...');
            finalPredictedPrice = await getPredictedPrice({
                vehicleName,
                model,
                mileage,
                ManufactureYear,
                transmission
            });

            // Fallback: If Python server is offline, use the user's asking price + 5% safety margin
            finalPredictedPrice = finalPredictedPrice || Math.round(price * 1.05);
        }

        // Create document instance matching your Mongoose Schema structure
        const newAdvert = new Advert({
            title,
            description,
            vehicleName,
            price, // Stored in LKR as entered by user
            ManufactureYear,
            mileage,
            fuelType,
            transmission,
            color,
            images,
            model,
            predictedPrice: finalPredictedPrice, // Now safely saved in LKR!
            userId,
            isActive: true
        });

        const savedAdvert = await newAdvert.save();

        res.status(201).json({
            success: true,
            message: 'Advertisement created successfully (Predicted price converted to LKR)',
            data: savedAdvert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating advertisement',
            error: error.message
        });
    }
};

// READ - Get all advertisements
export const getAllAdvertisements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const advertisements = await Advert.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Advert.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Advertisements retrieved successfully',
            data: advertisements,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching advertisements',
            error: error.message
        });
    }
};

// READ - Get only active advertisements
export const getActiveAdvertisements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const advertisements = await Advert.find({ isActive: true })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Advert.countDocuments({ isActive: true });

        res.status(200).json({
            success: true,
            message: 'Active advertisements retrieved successfully',
            data: advertisements,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active advertisements',
            error: error.message
        });
    }
};

// READ - Get single advertisement by ID
export const getAdvertisementById = async (req, res) => {
    try {
        const { id } = req.params;

        const advertisement = await Advert.findById(id);

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Advertisement retrieved successfully',
            data: advertisement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching advertisement',
            error: error.message
        });
    }
};

// READ - Get advertisements by user ID
export const getAdvertisementsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const advertisements = await Advert.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Advert.countDocuments({ userId });

        res.status(200).json({
            success: true,
            message: 'User advertisements retrieved successfully',
            data: advertisements,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user advertisements',
            error: error.message
        });
    }
};

// UPDATE - Update advertisement
export const updateAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Don't allow updating isActive directly in this endpoint
        delete updateData.isActive;

        // Check if vehicle specs changed (which would affect predicted price)
        const vehicleSpecsChanged = updateData.vehicleName || updateData.model || 
                                    updateData.mileage || updateData.ManufactureYear || 
                                    updateData.transmission;

        // ⭐ AUTO-RECALCULATE PREDICTED PRICE if specs changed
        if (vehicleSpecsChanged && !updateData.predictedPrice) {
            const currentAd = await Advert.findById(id);
            if (currentAd) {
                console.log('🔄 Vehicle specs changed - recalculating predicted price...');
                const newPredictedPrice = await getPredictedPrice({
                    vehicleName: updateData.vehicleName || currentAd.vehicleName,
                    model: updateData.model || currentAd.model,
                    mileage: updateData.mileage || currentAd.mileage,
                    ManufactureYear: updateData.ManufactureYear || currentAd.ManufactureYear,
                    transmission: updateData.transmission || currentAd.transmission
                });

                updateData.predictedPrice = newPredictedPrice || Math.round(
                    (updateData.price || currentAd.price) * 1.05
                );
            }
        }

        updateData.updatedAt = new Date();

        const updatedAdvert = await Advert.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedAdvert) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Advertisement updated successfully' + (vehicleSpecsChanged ? ' (predicted price recalculated)' : ''),
            data: updatedAdvert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating advertisement',
            error: error.message
        });
    }
};

// DELETE - Delete advertisement
export const deleteAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAdvert = await Advert.findByIdAndDelete(id);

        if (!deletedAdvert) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        // Also delete related bookings
        await Booking.deleteMany({ advertisementId: deletedAdvert.addId });

        res.status(200).json({
            success: true,
            message: 'Advertisement deleted successfully',
            data: deletedAdvert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting advertisement',
            error: error.message
        });
    }
};

// UPDATE - Toggle advertisement status (activate/deactivate)
export const toggleAdvertisementStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const advertisement = await Advert.findById(id);

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        advertisement.isActive = !advertisement.isActive;
        advertisement.updatedAt = new Date();

        const updatedAdvert = await advertisement.save();

        res.status(200).json({
            success: true,
            message: `Advertisement ${updatedAdvert.isActive ? 'activated' : 'deactivated'} successfully`,
            data: updatedAdvert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling advertisement status',
            error: error.message
        });
    }
};


