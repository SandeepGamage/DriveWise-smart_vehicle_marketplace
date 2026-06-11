import axios from 'axios';
import Advert from '../models/advertModel.js';

const PREDICTION_SERVICE_URL = process.env.PREDICTION_SERVICE_URL || 'http://127.0.0.1:3000/api/predict';

const getPredictedPrice = async (vehicleData) => {
    try {
        // Map advertisement fields to prediction service fields
        const predictionPayload = {
            make: vehicleData.vehicleName,           // Brand/Make (e.g., 'BMW')
            model: vehicleData.model,                 // Model (e.g., '320d')
            mileage_km: vehicleData.mileage || 0,    // Mileage in km
            production_year: vehicleData.ManufactureYear || new Date().getFullYear(),  // Year
            power_hp: vehicleData.power_hp || 150,   // Horsepower (optional, default 150)
            transmission: vehicleData.transmission    // Transmission type
        };

        const response = await axios.post(PREDICTION_SERVICE_URL, predictionPayload, {
            timeout: 5000  // 5 second timeout
        });

        if (response.data.success) {
            return Math.round(response.data['predicted_price(euro)'] * 1.1);  // Convert to local currency with 10% markup
        } else {
            console.warn('Prediction service returned false success');
            return null;
        }
    } catch (error) {
        console.warn('Error calling prediction service:', error.message);
        console.warn('Prediction service URL:', PREDICTION_SERVICE_URL);
        // Return null if prediction fails - user should provide predictedPrice manually
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

  
        if (!title || !description || !vehicleName || !price || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // ⭐ AUTO-GENERATE PREDICTED PRICE if not provided
        let finalPredictedPrice = predictedPrice;

        if (!finalPredictedPrice) {
            console.log('🔮 Fetching predicted price from ML service...');
            finalPredictedPrice = await getPredictedPrice({
                vehicleName,
                model,
                mileage,
                ManufactureYear,
                transmission
            });

            // If prediction fails, use price as fallback
            finalPredictedPrice = finalPredictedPrice || Math.round(price * 1.05);
        }

        const newAdvert = new Advert({
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
            predictedPrice: finalPredictedPrice, 
            userId,
            isActive: true
        });

        const savedAdvert = await newAdvert.save();

        res.status(201).json({
            success: true,
            message: 'Advertisement created successfully (predicted price auto-generated)',
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


