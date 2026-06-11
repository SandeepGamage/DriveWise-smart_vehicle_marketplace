import Advert from '../models/advertModel.js';


// CREATE - Add new advertisement
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

        // Validate required fields
        if (!title || !description || !vehicleName || !price || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
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
            predictedPrice,
            userId,
            isActive: true
        });

        const savedAdvert = await newAdvert.save();

        res.status(201).json({
            success: true,
            message: 'Advertisement created successfully',
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
            message: 'Advertisement updated successfully',
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


