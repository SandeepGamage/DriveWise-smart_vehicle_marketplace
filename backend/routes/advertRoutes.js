import express from 'express';
import {
    // Advertisement endpoints
    createAdvertisement,
    getAllAdvertisements,
    getActiveAdvertisements,
    getAdvertisementById,
    getAdvertisementsByUser,
    updateAdvertisement,
    deleteAdvertisement,
    toggleAdvertisementStatus,
} from '../controllers/adveController.js';

const advertRoutes = express.Router();

advertRoutes.post('/advertisements', createAdvertisement);

advertRoutes.get('/advertisements', getAllAdvertisements);

advertRoutes.get('/advertisements/active', getActiveAdvertisements);

advertRoutes.get('/advertisements/:id', getAdvertisementById);

advertRoutes.get('/advertisements/user/:userId', getAdvertisementsByUser);

advertRoutes.put('/advertisements/:id', updateAdvertisement);
advertRoutes.patch('/advertisements/:id/toggle-status', toggleAdvertisementStatus);

advertRoutes.delete('/advertisements/:id', deleteAdvertisement);

export default advertRoutes;