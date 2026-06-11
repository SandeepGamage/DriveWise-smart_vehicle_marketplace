import mongoose from 'mongoose';
import generateID from '../utils/idGenerator.js';

const advertSchema = new mongoose.Schema({
    addId:{
        type: String,
        required: true,
        unique: true,
        default : function () {
        return "Addverticement_" + generateID()
    }
},
    title: {
        type: String,
        required: true  
    },
    description: {
        type: String,
        required: true
    },
    vehicleName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    ManufactureYear: {
        type: Number,
        required: true
    },
    mileage: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        required: true
    },
    transmission: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    model: {
        type: String,
        required: true
    },
    predictedPrice: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }

})

const Advert = mongoose.model('Advert', advertSchema);
export default Advert;
