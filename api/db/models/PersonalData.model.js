const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

const personalDataSchema = new mongoose.Schema({
    email: {
        type: String,
        default: undefined,
    },
    phone: {
        type: String,
        default: undefined
    },
    name: {
        type: String,
        default: undefined
    }
});

const PersonalData = mongoose.model(DATABASE_MODELS.PERSONAL_DATA, personalDataSchema);
module.exports = PersonalData;