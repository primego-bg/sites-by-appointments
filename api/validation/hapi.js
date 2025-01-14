const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const eventPostValidation = (data) => {
    const schema = Joi.object({
        calendarId: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }).required(),
        subCalendarId: Joi.string().required(),
        start: Joi.date().required(),
        end: Joi.date().required(),
    });

    return schema.validate(data);
};

module.exports = {
    eventPostValidation
}
