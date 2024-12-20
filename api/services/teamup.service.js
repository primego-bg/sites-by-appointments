const axios = require('axios');
const EventService = require('./event.service');
const CalendarModel = require('../models/calendar.model');

const TeamupService = {
    getEvents: async function() {
        const calendar = await CalendarModel.findOne();
        const monthsAhead = calendar.monthsAhead;
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + monthsAhead);

        const events = await EventService.getEvents({
            startDate: new Date(),
            endDate: endDate
        });

        return events;
    }
};

module.exports = TeamupService;