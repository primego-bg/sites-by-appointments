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

const businessSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    logo: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    isEmailSender: {
        type: Boolean,
        default: false
    },
    senderEmail: {
        type: String,
        required: () => this.isEmailSender
    },
    senderPassword: {
        type: String,
        required: () => this.isEmailSender,
    },
    website: {
        type: String,
        required: false,
        unique: true,
    },
    socialMedia: {
        type: Object,
        required: false
    },
    workingHours: [businessHoursSchema], 
    URLpostfix: {
        type: String,
        required: true,
    },
    // minutes
    slotTime: {
        type: Number,
        required: true,
    },
    maximumDaysInFuture: {
        type: Number,
        required: true,
    },
    minimumTimeSlotsInFuture: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        required: true,
    }
});

const Business = mongoose.model(DATABASE_MODELS.BUSINESS, businessSchema);
module.exports = { Business };