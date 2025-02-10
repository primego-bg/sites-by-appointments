const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

// business hours schema assumes that all non isClosed=true days are closed by default
const businessHoursSchema = new mongoose.Schema({
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    open: {
      type: String, // Format: "HH:mm" (24-hour time)
      required: true,
    },
    close: {
      type: String, // Format: "HH:mm" (24-hour time)
      required: true,
    }
});

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
    workingHours: [businessHoursSchema], 
    status: {
        type: String,
        enum: ["active", "inactive", "deleted"],
        required: true
    }
});

const Location = mongoose.model(DATABASE_MODELS.LOCATION, locationSchema);
module.exports = { Location };