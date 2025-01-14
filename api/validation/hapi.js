const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const moment = require("moment-timezone");
const INTEGRATIONS = require("../enums/integrations.enum");

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

const timeValidation = Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/);

const workingHoursSchema = Joi.object({
    day: Joi.string()
        .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
        .required(),
    open: timeValidation.when('isClosed', { is: false, then: Joi.required() }),
    close: timeValidation.when('isClosed', { is: false, then: Joi.required() }),
    isClosed: Joi.boolean().default(false),
}).custom((value, helpers) => {
    if (!value.isClosed) {
        const [openHour, openMinute] = value.open.split(':').map(Number);
        const [closeHour, closeMinute] = value.close.split(':').map(Number);

        if (openHour > closeHour || (openHour === closeHour && openMinute >= closeMinute)) {
            return helpers.error('any.invalid', { message: 'Close time must be later than open time.' });
        }
    }
    return value;
}, 'Open and Close Time Validation');

const specialHoursSchema = Joi.object({
    date: Joi.date().required(),
    open: timeValidation.when('isClosed', { is: false, then: Joi.required() }),
    close: timeValidation.when('isClosed', { is: false, then: Joi.required() }),
    isClosed: Joi.boolean().default(false),
}).custom((value, helpers) => {
    if (!value.isClosed) {
        const [openHour, openMinute] = value.open.split(':').map(Number);
        const [closeHour, closeMinute] = value.close.split(':').map(Number);

        if (openHour > closeHour || (openHour === closeHour && openMinute >= closeMinute)) {
            return helpers.error('any.invalid', { message: 'Close time must be later than open time.' });
        }
    }
    return value;
}, 'Open and Close Time Validation');

const businessPostValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional(),
        logo: Joi.string().optional(),
        phone: Joi.string().optional(),
        email: Joi.string().optional(),
        website: Joi.string().optional(),
        socialMedia: Joi.object().optional(),
        workingHours: Joi.array().items(workingHoursSchema).optional(),
        specialHours: Joi.array().items(specialHoursSchema).optional(),
        URLpostfix: Joi.string().required(),
        slotTime: Joi.number().required(),
        maximumDaysInFuture: Joi.number().required(),
        minimumTimeSlotsInFuture: Joi.number().required(),
        status: Joi.string().valid('active', 'inactive', 'deleted').required(),
    });

    return schema.validate(data);
};

const businessPutValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        logo: Joi.string().optional(),
        phone: Joi.string().optional(),
        email: Joi.string().optional(),
        website: Joi.string().optional(),
        socialMedia: Joi.object().optional(),
        workingHours: Joi.array().items(workingHoursSchema).optional(),
        specialHours: Joi.array().items(specialHoursSchema).optional(),
        URLpostfix: Joi.string().optional(),
        slotTime: Joi.number().optional(),
        maximumDaysInFuture: Joi.number().optional(),
        minimumTimeSlotsInFuture: Joi.number().optional(),
        status: Joi.string().valid('active', 'inactive', 'deleted').optional(),
    });

    return schema.validate(data);
};

const objectIdValidation = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid', { message: 'Invalid ObjectId' });
    }
    return value;
});

const timezoneValidation = Joi.string().valid(...moment.tz.names());

const teamupApiKeyValidation = Joi.string().when('integration', {
    is: INTEGRATIONS.TEAMUP,
    then: Joi.required(),
    otherwise: Joi.optional()
});

const calendarPostValidation = (data) => {
    const schema = Joi.object({
        businessId: objectIdValidation.required(),
        integration: Joi.string().valid(...Object.values(INTEGRATIONS)).optional(),
        teamupApiKey: teamupApiKeyValidation,
        timezone: timezoneValidation.required(),
        lastSynchronized: Joi.date().optional().allow(null),
        status: Joi.string().valid('active', 'deleted').required()
    });

    return schema.validate(data);
};

const calendarPutValidation = (data) => {
    const schema = Joi.object({
        businessId: objectIdValidation.optional(),
        integration: Joi.string().valid(...Object.values(INTEGRATIONS)).optional(),
        teamupApiKey: teamupApiKeyValidation,
        timezone: timezoneValidation.optional(),
        lastSynchronized: Joi.date().optional().allow(null),
        status: Joi.string().valid('active', 'deleted').optional()
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
    locationPutValidation,
    businessPostValidation,
    businessPutValidation,
    calendarPostValidation,
    calendarPutValidation
}
