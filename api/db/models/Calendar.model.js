const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");
const INTEGRATIONS = require("../../enums/integrations.enum");
const moment = require("moment-timezone");

const calendarSchema = mongoose.Schema({
    businessId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.BUSINESS,
        required: true,
    },
    teamupCalendarId: {
        type: String,
        required: function () {
            return this.integration === INTEGRATIONS.TEAMUP;
        }
    },
    integration: {
        type: String,
        enum: Object.values(INTEGRATIONS),
        required: false,
        default: undefined
    },
    teamupApiKey: {
        type: String,
        required: function () {
            return this.integration === INTEGRATIONS.TEAMUP;
        }
    },
    timezone: {
        type: String,
        required: true,
        validate: {
            validator: function (timezone) {
                return moment.tz.names().includes(timezone);
            },
            message: "Invalid timezone"
        }
    },
    lastSynchronized: {
        type: Date,
        required: false,
        default: null
    },
    status: {
        type: String,
        enum: ["active", "deleted"],
        required: true
    }
});

const Calendar = mongoose.model(DATABASE_MODELS.CALENDAR, calendarSchema);
module.exports = { Calendar }; 