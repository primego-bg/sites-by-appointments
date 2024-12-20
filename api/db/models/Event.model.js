const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

const eventSchema = mongoose.Schema({
    calendarId: {
        type: mongoose.Types.ObjectId,
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
    teamupEventId: {
        type: String,
        required: false
    },
    teamupSubCalendarId: {
        type: String,
        required: false
    }
});

const Event = mongoose.model(DATABASE_MODELS.EVENT, eventSchema);
module.exports = { Event };