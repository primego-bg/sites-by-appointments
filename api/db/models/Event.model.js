const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

const eventSchema = mongoose.Schema({
    calendarId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.CALENDAR,
        required: true
    },
    teamupSubCalendarId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    originalObject: {
        type: Object,
        required: false,
    },
});

const Event = mongoose.model(DATABASE_MODELS.EVENT, eventSchema);
module.exports = { Event };