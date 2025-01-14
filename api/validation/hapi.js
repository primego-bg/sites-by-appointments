const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const servicePostValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        price: Joi.number().min(0).required(),
        currency: Joi.string().length(3).required(),
        timeSlots: Joi.number().min(1).max(24).required(),
        businessId: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }).required(),
        status: Joi.string().valid('active', 'inactive', 'deleted').required()
    });

    return schema.validate(data);
}

const servicePutValidation = (data) => {
    const schema = Joi.object({
        price: Joi.number().min(0).required(),
        timeSlots: Joi.number().min(1).max(24).required(),
        status: Joi.string().valid('active', 'inactive', 'deleted').required()
    });

    return schema.validate(data);
}

const employeePostValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        teamupSubcalendarId: Joi.string().required(),
        services: Joi.array().items(Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })).required(),
        businessId: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }).required(),
        status: Joi.string().valid('active', 'inactive', 'deleted').required()
    });

    return schema.validate(data);
}

const employeePutValidation = (data) => {
    const schema = Joi.object({
        teamupSubcalendarId: Joi.string().required(),
        services: Joi.array().items(Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })).required(),
        status: Joi.string().valid('active', 'inactive', 'deleted').required()
    });

    return schema.validate(data);
}

const locationPostValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        addressName: Joi.string().min(3).max(100).required(),
        lat: Joi.number().min(-90).max(90).required(),
        lon: Joi.number().min(-180).max(180).required(),
        businessId: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }).required(),
        employees: Joi.array().items(Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })),
        status: Joi.string().valid('active', 'inactive', 'deleted').required()
    });

    return schema.validate(data);
}

const locationPutValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        employees: Joi.array().items(Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })),
        status: Joi.string().valid('active', 'inactive', 'deleted').required()
    });

    return schema.validate(data);
}

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
    eventPostValidation,
    servicePostValidation,
    servicePutValidation,
    employeePostValidation,
    employeePutValidation,
    locationPostValidation,
    locationPutValidation
}
