const mongoose = require("mongoose");
const { DATABASE_MODELS } = require("../../global");

const noticeSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

const Notice = mongoose.model(DATABASE_MODELS.NOTICE, noticeSchema);
module.exports = Notice;