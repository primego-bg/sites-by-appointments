const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const calendarPostValidation = Joi.object({
    projectId: Joi.string().required(),
    integration: Joi.string().valid('TEAMUP'),
    teamupApiKey: Joi.string().when('integration', { is: 'TEAMUP', then: Joi.required() }),
    timezone: Joi.string().required(),
    subCalendars: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        color: Joi.string().required(),
        id: Joi.string().required()
    })).required(),
    monthsAhead: Joi.number(),
    currentAccessToken: Joi.string(),
    emailForTeamUp: Joi.string(),
    passwordForTeamUp: Joi.string()
});

module.exports = {
    calendarPostValidation
}
