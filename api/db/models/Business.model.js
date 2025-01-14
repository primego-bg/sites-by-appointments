const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

const businessHoursSchema = new mongoose.Schema({
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    open: {
      type: String, // Format: "HH:mm" (24-hour time)
      required: function () {
        return !this.isClosed;
      },
    },
    close: {
      type: String, // Format: "HH:mm" (24-hour time)
      required: function () {
        return !this.isClosed;
      },
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
});
  
const specialHoursSchema = new mongoose.Schema({
    date: {
      type: Date,
      required: true,
    },
    open: {
      type: String, // Format: "HH:mm" (24-hour time)
      required: function () {
        return !this.isClosed;
      },
    },
    close: {
      type: String, // Format: "HH:mm" (24-hour time)
      required: function () {
        return !this.isClosed;
      },
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
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
    website: {
        type: String,
        required: false
    },
    socialMedia: {
        type: Object,
        required: false
    },
    workingHours: [businessHoursSchema], 
    specialHours: [specialHoursSchema],
    URLpostfix: {
        type: String,
        required: true,
    },
    // milliseconds
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