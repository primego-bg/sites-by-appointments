const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");
const INTEGRATIONS = require("../../enums/integrations.enum");
const { type } = require("jquery");
const moment = require("moment-timezone");

const calendarSchema = mongoose.Schema({
    projectId: {
        type: String,
        required: true,
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
    subCalendars: [{
        name: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    }],
    monthsAhead: {
        type: Number,
        required: false,
    },
    currentAccessToken: {
        type: String,
        required: false,
    },
    emailForTeamUp: {
        type: String,
        required: false,
    },
    passwordForTeamUp: {
        type: String,
        required: false,
    },
});

const Calendar = mongoose.model(DATABASE_MODELS.CALENDAR, calendarSchema);
module.exports = { Calendar }; 