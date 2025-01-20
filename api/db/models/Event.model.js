const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

const eventSchema = mongoose.Schema({
    calendarId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.CALENDAR,
        required: true
    },
    teamupSubCalendarIds: [{
        type: String,
        required: true
    }],
    teamupEventId: {
        type: String,
        required: true,
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
});

const Event = mongoose.model(DATABASE_MODELS.EVENT, eventSchema);
module.exports = { Event };