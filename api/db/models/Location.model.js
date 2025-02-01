const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

const locationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    addressName: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        min: -90,
        max: 90,
        required: true
    },
    lon: {
        type: Number,
        min: -180,
        max: 180,
        required: true
    },
    phone: {
        type: String,
        required: true,
    },
    businessId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.BUSINESS,
        required: true
    },
    employees: [{
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.EMPLOYEE
    }],
    status: {
        type: String,
        enum: ["active", "inactive", "deleted"],
        required: true
    }
});

const Location = mongoose.model(DATABASE_MODELS.LOCATION, locationSchema);
module.exports = { Location };