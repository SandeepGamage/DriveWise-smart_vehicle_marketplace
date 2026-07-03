// Add this import update at the top if needed, or simply append the route below
import express from 'express';
import {
    createAdvertisement,
    getAllAdvertisements,
    getActiveAdvertisements,
    getAdvertisementById,
    getAdvertisementsByUser,
    updateAdvertisement,
    deleteAdvertisement,
    toggleAdvertisementStatus,
} from '../controllers/adveController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import axios from 'axios'; // Import axios here to use in the inline route controller

const advertRoutes = express.Router();

// 🔮 NEW: Dedicated Live Valuation Endpoint (Bypasses MongoDB)
advertRoutes.post('/predict-price', async (req, res) => {
    try {
        const { vehicleName, model, mileage, ManufactureYear, transmission, powerHp } = req.body;

        let PREDICTION_SERVICE_URL = process.env.PREDICTION_SERVICE_URL;
        if (PREDICTION_SERVICE_URL && !PREDICTION_SERVICE_URL.endsWith('/api/predict')) {
            PREDICTION_SERVICE_URL = PREDICTION_SERVICE_URL.replace(/\/$/, '') + '/api/predict';
        }
        const EURO_TO_LKR_RATE = 325.0;

        const predictionPayload = {
            make: vehicleName,           
            model: model,                 
            mileage_km: Number(mileage) || 0,    
            production_year: Number(ManufactureYear) || new Date().getFullYear(),  
            power_hp: Number(powerHp) || 150, 
            transmission: transmission    
        };

        const response = await axios.post(PREDICTION_SERVICE_URL, predictionPayload, { timeout: 5000 });

        if (response.data.success) {
            const priceInEuro = response.data['predicted_price(euro)'];
            const priceInLKR = Math.round(priceInEuro * EURO_TO_LKR_RATE * 1.10);
            
            return res.status(200).json({ success: true, predictedPrice: priceInLKR });
        } else {
            return res.status(400).json({ success: false, message: 'ML Model Service Evaluation Error' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Existing routes below...
advertRoutes.post('/advertisements', verifyToken, createAdvertisement);
advertRoutes.get('/advertisements', getAllAdvertisements);
advertRoutes.get('/advertisements/active', getActiveAdvertisements);
advertRoutes.get('/advertisements/:id', getAdvertisementById);
advertRoutes.get('/advertisements/user/:userId', getAdvertisementsByUser);
advertRoutes.put('/advertisements/:id', verifyToken, updateAdvertisement);
advertRoutes.patch('/advertisements/:id/toggle-status', verifyToken, toggleAdvertisementStatus);
advertRoutes.delete('/advertisements/:id', verifyToken, deleteAdvertisement);

export default advertRoutes;