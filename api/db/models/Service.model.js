const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

const serviceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    priceEur: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true
    },
    timeSlots: {
        type: Number,
        required: true
    },
    businessId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.BUSINESS,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive", "deleted"],
        required: true
    }
});

const Service = mongoose.model(DATABASE_MODELS.SERVICE, serviceSchema);
module.exports = { Service };