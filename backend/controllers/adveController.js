import axios from 'axios';
import Advert from '../models/advertModel.js';

const PREDICTION_SERVICE_URL = process.env.PREDICTION_SERVICE_URL ||  'http://127.0.0.1:5000/api/predict';


const EURO_TO_LKR_RATE = 325.0; 

const getPredictedPrice = async (vehicleData) => {
    try {
   
        const predictionPayload = {
            make: vehicleData.vehicleName,           
            model: vehicleData.model,                 
            mileage_km: Number(vehicleData.mileage) || 0,    
            production_year: Number(vehicleData.ManufactureYear) || new Date().getFullYear(),  
            power_hp: 150, // Default baseline power used during model training
            transmission: vehicleData.transmission    
        };

       
        const response = await axios.post(PREDICTION_SERVICE_URL, predictionPayload, {
            timeout: 5000  
        });

        if (response.data.success) {
            
            const priceInEuro = response.data['predicted_price(euro)'];

        
            const priceInLKR = priceInEuro * EURO_TO_LKR_RATE * 1.10;

      
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
            userId,
            province,
            district,
            city
        } = req.body;

        
        if (!title || !description || !vehicleName || !price || !userId || !province || !district || !city) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields, including province, district, and city'
            });
        }

        if (Number(price) < 0 || Number(mileage) < 0 || (ManufactureYear && Number(ManufactureYear) < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Price, mileage, and manufacture year cannot be negative'
            });
        }

        let finalPredictedPrice = predictedPrice;

        
        if (!finalPredictedPrice) {
            console.log('🔮 Fetching and converting predicted price from ML service...');
            finalPredictedPrice = await getPredictedPrice({
                vehicleName,
                model,
                mileage,
                ManufactureYear,
                transmission
            });

            
            finalPredictedPrice = finalPredictedPrice || Math.round(price * 1.05);
        }

       
        const finalUserId = req.user.UID || String(req.user._id);

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
            userId: finalUserId,
            province,
            district,
            city,
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


export const updateAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const advertisement = await Advert.findById(id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        const tokenUserId = req.user.UID || String(req.user._id);
        if (advertisement.userId !== tokenUserId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only modify your own advertisements'
            });
        }

        delete updateData.isActive;

        if ((updateData.price !== undefined && Number(updateData.price) < 0) || 
            (updateData.mileage !== undefined && Number(updateData.mileage) < 0) || 
            (updateData.ManufactureYear !== undefined && Number(updateData.ManufactureYear) < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Price, mileage, and manufacture year cannot be negative'
            });
        }

        const vehicleSpecsChanged = updateData.vehicleName || updateData.model || 
                                    updateData.mileage || updateData.ManufactureYear || 
                                    updateData.transmission;


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


export const deleteAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;

        const advertisement = await Advert.findById(id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

        const tokenUserId = req.user.UID || String(req.user._id);
        const isUserAdmin = req.user.isAdmin === true;
        if (!isUserAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only delete your own advertisements'
            });
        }

        const deletedAdvert = await Advert.findByIdAndDelete(id);

        if (!deletedAdvert) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found'
            });
        }

   
        // await Booking.deleteMany({ advertisementId: deletedAdvert.addId });

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


export const toggleAdvertisementStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Find advertisement
        const advertisement = await Advert.findById(id);

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: "Advertisement not found"
            });
        }

        // Get logged-in user
        const tokenUserId = req.user.UID || String(req.user._id);
        const isUserAdmin = req.user.isAdmin === true;

        // Authorization check
        if (advertisement.userId.toString() !== tokenUserId && !isUserAdmin) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only modify your own advertisements"
            });
        }

        // Toggle active status
        const updatedAdvert = await Advert.findByIdAndUpdate(
            id,
            {
                $set: {
                    isActive: !advertisement.isActive
                }
            },
            {
                new: true
            }
        );

        return res.status(200).json({
            success: true,
            message: `Advertisement ${
                updatedAdvert.isActive ? "activated" : "deactivated"
            } successfully`,
            data: updatedAdvert
        });

    } catch (error) {
        console.error("Toggle Advertisement Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error toggling advertisement status",
            error: error.message
        });
    }
};

