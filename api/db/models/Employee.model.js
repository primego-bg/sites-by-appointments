const mongoose = require("mongoose");

const { DATABASE_MODELS } = require("../../global");

const employeeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teamupSubCalendarId: {
        type: String,
        required: false
    },
    businessId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.BUSINESS,
        required: true
    },
    services: [{
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.SERVICE
    }],
    status: {
        type: String,
        enum: ["active", "inactive", "deleted"],
        required: true
    }
});

const Employee = mongoose.model(DATABASE_MODELS.EMPLOYEE, employeeSchema);
module.exports = { Employee };