const express = require('express');
const crypto = require('crypto');
const DbService = require('../services/db.service');
const { COLLECTIONS } = require('../global');
const { Event } = require('../db/models/Event.model');
const { default: mongoose } = require('mongoose');
const router = express.Router();

router.post('/event', async (req, res, next) => {
    const webhookSecret = 'your_webhook_secret';
    const signature = req.headers['teamup-signature'];
    const payload = JSON.stringify(req.body);

    const hash = crypto.createHmac('sha256', webhookSecret)
                       .update(payload)
                       .digest('hex');

    if (hash === signature) {
        // Do something with the event
        console.log('Event received:', payload);
        const trigger = payload.dispatch.trigger;
        const eventId = payload.dispatch.event.id;
        const event = payload.dispatch.event;

        const subcalendar_ids = event.subcalendar_ids;
        const employee = await DbService.getOne(COLLECTIONS.EMPLOYEES, { teamupSubCalendarId: subcalendar_ids[0] });
        if(!employee) return res.status(404).send('Employee not found');
        const businessId = employee.businessId;
        const business = await DbService.getById(COLLECTIONS.BUSINESSES, { _id: businessId });
        if(!business) return res.status(404).send('Business not found');
        const calendar = await DbService.getOne(COLLECTIONS.CALENDARS, { businessId });
        if(!calendar) return res.status(404).send('Calendar not found');

        switch(trigger) {
            case 'event.created':
                // Do something when an event is created
                const newEvent = new Event({
                    calendarId: new mongoose.Types.ObjectId(calendar._id),
                    teamupSubCalendarIds: event.subcalendar_ids,
                    allDay: event.all_day,
                    rrule: event.rrule,
                    teamupEventId: eventId,
                    start: event.start_dt,
                    end: event.end_dt
                });

                await DbService.create(COLLECTIONS.EVENTS, newEvent);
                break;
            case 'event.modified':
                // Do something when an event is modified
                
                break;
            case 'event.deleted':
                await DbService.delete(COLLECTIONS.EVENTS, { teamupEventId: eventId });
                break;
        }

        res.status(200).send('Event received');
    } else {
        res.status(401).send('Invalid signature');
    }
});

module.exports = router;