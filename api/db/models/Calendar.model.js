const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");
const INTEGRATIONS = require("../../enums/integrations.enum");
const moment = require("moment-timezone");

const calendarSchema = mongoose.Schema({
    businessId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.BUSINESS,
        required: true,
        unique: true,
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
    teamupSecretCalendarKey: {
        type: String,
        required: function () {
            return this.integration === INTEGRATIONS.TEAMUP;
        }
    },
    timezone: {
        type: String,
        valid: moment.tz.names(),
        required: true,
    },
    // used only for easier data management when creating employees through the admin api
    teamupSubCalendarIds: [{
        id: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }],
    lastSynchronized: {
        type: Date,
        required: false,
        default: null
    },
    status: {
        type: String,
        enum: ["active", "inactive", "deleted"],
        required: true
    }
});

const Calendar = mongoose.model(DATABASE_MODELS.CALENDAR, calendarSchema);
module.exports = { Calendar }; 