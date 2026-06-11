import express from 'express';
import {createAdvertisement,
    getAllAdvertisements,
    getActiveAdvertisements,
    getAdvertisementById,
    getAdvertisementsByUser,
    updateAdvertisement,
    deleteAdvertisement,
    toggleAdvertisementStatus,
} from '../controllers/adveController.js';

const router = express.Router();

router.post('/advertisements', createAdvertisement);
router.get('/advertisements', getAllAdvertisements);
router.get('/advertisements/active', getActiveAdvertisements);
router.get('/advertisements/:id', getAdvertisementById);
router.get('/advertisements/user/:userId', getAdvertisementsByUser);
router.put('/advertisements/:id', updateAdvertisement);
router.patch('/advertisements/:id/toggle-status', toggleAdvertisementStatus);
router.delete('/advertisements/:id', deleteAdvertisement);

export default router;