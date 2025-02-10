const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

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