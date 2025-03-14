const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

const eventSchema = mongoose.Schema({
    calendarId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.CALENDAR,
        required: true
    },
    teamupSubCalendarIds: [{
        type: Number,
        required: true
    }],
    allDay: {
        type: Boolean,
        default: false,
    },
    rrule: {
        type: String,
        required: false,
        default: undefined
    },
    teamupEventId: {
        type: String,
        required: true,
    },
    // iso string
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